const modules = {
  algorithm: { title: '算法', url: '/mindspace-mobile/rl-platform/rl-studio.html?view=algorithm', kind: 'rl' },
  training: { title: '训练', url: '/mindspace-mobile/rl-platform/rl-studio.html?view=training', kind: 'rl' },
  evaluation: { title: '评测', url: '/mindspace-mobile/rl-platform/rl-studio.html?view=replay', kind: 'rl' },
  deployment: { title: '部署', url: '/mindspace-mobile/rl-platform/rl-studio.html?view=deployment', kind: 'rl' },
  model: { title: '场景与模型', url: '/mindspace-mobile/studio.html?view=model', kind: 'scene' },
  human: { title: '人因仿真', url: '/mindspace-mobile/studio.html?view=human', kind: 'scene' },
};
const home=document.querySelector('.home'),viewer=document.querySelector('.viewer'),stage=document.querySelector('.stage'),space=document.querySelector('.frame-space'),select=document.querySelector('#module-select'),loading=document.querySelector('.loading');
let frame=null,current=null,scale=1,fit=true,pan=true,loadTimer;
const baseWidth=1280,baseHeight=900;
function resize(){
  if(!frame)return;
  if(fit)scale=Math.min(1,stage.clientWidth/baseWidth);
  frame.style.width=baseWidth+'px';frame.style.height=baseHeight+'px';frame.style.transform=`scale(${scale})`;
  space.style.width=baseWidth*scale+'px';space.style.height=baseHeight*scale+'px';
  document.querySelector('.zoom-value').textContent=Math.round(scale*100)+'%';
}
function clearFrame(){clearTimeout(loadTimer);if(frame){frame.remove();frame=null;}space.replaceChildren();}
function setView(key,push=true){
  if(!modules[key])key=null;
  current=key;home.hidden=!!key;viewer.hidden=!key;
  if(push)history.pushState({},'',key?`/mindspace-mobile/?module=${key}`:'/mindspace-mobile/');
  document.title=key?`${modules[key].title} · MindSpace 手机浏览版`:'MindSpace · 仿真平台 4';
  clearFrame();if(!key)return;
  select.value=key;fit=true;pan=true;document.querySelector('#interact').setAttribute('aria-pressed','false');document.querySelector('#interact').textContent='启用操作';stage.classList.add('pan-mode');stage.scrollTo(0,0);
  loading.hidden=false;document.querySelector('#load-status').textContent='正在打开'+modules[key].title+'…';
  frame=document.createElement('iframe');frame.className='platform-frame';frame.title=modules[key].title+'工作区';frame.allow='fullscreen';frame.src=modules[key].url;space.append(frame);resize();
  frame.addEventListener('load',()=>{clearTimeout(loadTimer);loading.hidden=true;},{once:true});
  loadTimer=setTimeout(()=>{document.querySelector('#load-status').textContent='资源仍在加载，可返回入口后重试。';},45000);
}
document.querySelectorAll('[data-module]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();setView(a.dataset.module);}));
select.addEventListener('change',()=>setView(select.value));
document.querySelectorAll('[data-home]').forEach(b=>b.addEventListener('click',()=>setView(null)));
document.querySelector('#fit').addEventListener('click',()=>{fit=true;resize();stage.scrollTo(0,0);});
document.querySelector('#zoom-in').addEventListener('click',()=>{fit=false;scale=Math.min(1.5,scale+.2);resize();});
document.querySelector('#zoom-out').addEventListener('click',()=>{fit=false;scale=Math.max(.25,scale-.2);resize();});
document.querySelector('#interact').addEventListener('click',e=>{pan=!pan;stage.classList.toggle('pan-mode',pan);e.currentTarget.setAttribute('aria-pressed',String(!pan));e.currentTarget.textContent=pan?'启用操作':'返回浏览';document.querySelector('.viewer-hint').textContent=pan?'放大后滑动查看，横屏更清楚':'可点击控件；滑动浏览请点“返回浏览”';});
window.addEventListener('resize',resize);
window.addEventListener('popstate',()=>setView(new URLSearchParams(location.search).get('module'),false));
window.addEventListener('message',e=>{
  if(e.origin!==location.origin||!frame||e.source!==frame.contentWindow||!current)return;
  if(e.data?.type==='rl-studio-navigate'){
    const key=e.data.view==='replay'?'evaluation':e.data.view;
    if(modules[key]?.kind==='rl'){current=key;select.value=key;history.replaceState({},'',`/mindspace-mobile/?module=${key}`);document.title=modules[key].title+' · MindSpace 手机浏览版';}
  }
});
setView(new URLSearchParams(location.search).get('module'),false);
