/* Hosted browser edition. Keep source aliases stable across project subpaths. */
(() => {
  const base='/mindspace-mobile';
  const nativeFetch=window.fetch.bind(window);
  const canonical=pathname=>pathname===base?'/':pathname.startsWith(base+'/')?pathname.slice(base.length):pathname;
  const hosted=pathname=>pathname.startsWith(base+'/')?pathname:base+(pathname.startsWith('/')?'':'/')+pathname;
  window.fetch=(input,options)=>{
    const url=new URL(input instanceof Request?input.url:String(input),location.href);
    if(url.origin!==location.origin)return nativeFetch(input,options);
    const path=canonical(url.pathname);
    if(path.startsWith('/api/capture/'))return Promise.resolve(new Response(JSON.stringify({error:'手机浏览版不支持保存到电脑目录，请在本地完整版中进行采集与回放。'}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8'}}));
    const target=path==='/__mindspace/session'?'/__mindspace/session.json':path==='/__mindspace/library'?'/__mindspace/library.json':window.MINDSPACE_ONLINE_ROUTES?.[decodeURIComponent(path)];
    if(target)url.pathname=hosted(target);else url.pathname=hosted(path);
    return nativeFetch(input instanceof Request?new Request(url,input):url,options);
  };
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(link&&/\.blend(?:$|[?#])/i.test(link.getAttribute('href'))){event.preventDefault();alert('Blender 源工程在本地完整安装包中；手机浏览版保留可浏览的三维模型。');}
    else if(link){const url=new URL(link.href,location.href);if(url.origin===location.origin){const target=window.MINDSPACE_ONLINE_ROUTES?.[decodeURIComponent(canonical(url.pathname))];if(target)link.href=hosted(target);}}
  },true);
})();
