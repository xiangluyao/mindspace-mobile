/* Ensure nested workspaces get the mobile layer even if a browser cached their HTML. */
(() => {
  const frames = new WeakSet();
  const documents = new WeakSet();
  const base = '/mindspace-mobile/';
  function wire(frame) {
    if (frames.has(frame)) return;
    frames.add(frame);
    const loaded = () => {
      try { if (frame.contentDocument?.readyState !== 'loading') enhance(frame.contentDocument); } catch { /* Only same-origin workspaces. */ }
    };
    frame.addEventListener('load', loaded);
    loaded();
  }
  function enhance(doc) {
    if (!doc || !doc.body || documents.has(doc)) return;
    documents.add(doc);
    const path = doc.location.pathname;
    const layer = path.endsWith('/studio.html') ? 'scene' : path.endsWith('/rl-studio.html') ? 'rl' : /\/(training|human-layer)\.html$/.test(path) ? 'training' : null;
    if (layer) {
      const name = `mobile-${layer}`;
      if (!doc.querySelector(`link[href*="/${name}.css"]`)) {
        const link = doc.createElement('link'); link.rel = 'stylesheet'; link.href = `${base}${name}.css?v=2`; doc.head.append(link);
      }
      if (!doc.querySelector(`script[src*="/${name}.js"]`)) {
        const script = doc.createElement('script'); script.src = `${base}${name}.js?v=2`; doc.head.append(script);
      }
    }
    doc.querySelectorAll('iframe').forEach(wire);
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'IFRAME') wire(node);
        node.querySelectorAll('iframe').forEach(wire);
      }));
    }).observe(doc.body, {childList:true, subtree:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhance(document), {once:true});
  else enhance(document);
})();
