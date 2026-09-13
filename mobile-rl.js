/* Mobile navigation for the existing RL workspace. All values and actions stay in the original app. */
(() => {
  'use strict';
  if (window.__mindspaceMobileRL) return;
  window.__mindspaceMobileRL = true;
  const phone = matchMedia('(max-width: 1023px)');
  const selection = { algorithm: 'nodes', evaluation: 'charts' };
  let scheduled = false;
  let nodeSignature = '';
  const folded = new Set();

  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function tabBar(kind, entries, current) {
    const nav = element('nav', 'mrl-tabs');
    nav.setAttribute('aria-label', kind === 'algorithm' ? '算法工作区分区' : '评测工作区分区');
    entries.forEach(([key, label]) => {
      const button = element('button', '', label);
      button.type = 'button';
      button.dataset.mrlTab = key;
      button.dataset.mrlKind = kind;
      button.setAttribute('aria-pressed', String(key === current));
      nav.append(button);
    });
    return nav;
  }

  function setTab(host, kind, value, focus = false) {
    if (!host) return;
    selection[kind] = value;
    host.dataset.mrlPanel = value;
    host.querySelectorAll(':scope > .mrl-tabs button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mrlTab === value));
    });
    if (focus) {
      const scroller = document.querySelector('.studio-body');
      if (scroller) scroller.scrollTop = 0;
    }
    // The renderer watches canvas/container sizes when a panel becomes visible.
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      if (kind === 'algorithm' && value === 'graph' && !host.dataset.mrlGraphShown) {
        host.dataset.mrlGraphShown = 'true';
        host.querySelector('[data-ne-action=fit]')?.click();
      }
    });
  }

  function syncNodes(editor) {
    const nodes = [...editor.querySelectorAll('.ne-nodes > .ne-node[data-node-id]')];
    const data = nodes.map(node => {
      const heading = node.querySelector(':scope > header > span');
      const title = heading ? [...heading.childNodes].filter(child => child.nodeType === Node.TEXT_NODE).map(child => child.textContent).join('').trim() : node.dataset.nodeId;
      const detail = heading?.querySelector('small')?.textContent?.trim() || '';
      return { id: node.dataset.nodeId, title, detail, color: node.style.getPropertyValue('--node-color') };
    });
    const signature = JSON.stringify(data);
    const list = editor.querySelector('.mrl-node-list');
    if (!list || signature === nodeSignature && list.children.length) return;
    nodeSignature = signature;
    const fragment = document.createDocumentFragment();
    data.forEach(node => {
      const button = element('button', 'mrl-node-card');
      button.type = 'button';
      // The original editor delegates data-inspect clicks; no copied app state or synthetic model.
      button.dataset.inspect = node.id;
      if (node.color) button.style.setProperty('--node-color', node.color);
      const text = element('span');
      text.append(element('strong', '', node.title), element('small', '', node.detail || node.id));
      const arrow = element('span', 'mrl-node-arrow', '查看 ›');
      button.append(text, arrow);
      fragment.append(button);
    });
    list.replaceChildren(fragment);
    const count = editor.querySelector('[data-mrl-node-count]');
    if (count) count.textContent = `${data.length} 个当前节点`;
  }

  function enhanceAlgorithm(editor) {
    if (!editor.dataset.mrlReady) {
      editor.dataset.mrlReady = 'true';
      editor.prepend(tabBar('algorithm', [['nodes', '节点'], ['graph', '连接图'], ['inspector', '参数'], ['preview', '预览'], ['library', '电池库']], selection.algorithm));
      const catalog = element('section', 'mrl-node-catalog');
      const heading = element('div', 'mrl-catalog-heading');
      heading.append(element('h2', '', '算法节点'));
      const count = element('span');
      count.dataset.mrlNodeCount = '';
      heading.append(count);
      catalog.append(heading, element('p', 'mrl-help', '点选节点，查看说明并调整参数。完整连线可在“连接图”中查看。'), element('div', 'mrl-node-list'));
      editor.insertBefore(catalog, editor.querySelector('.ne-library'));
      const toolbar = editor.querySelector('.ne-canvas-toolbar');
      if (toolbar) toolbar.append(element('p', 'mrl-help mrl-canvas-hint', '拖动空白处平移，用 ＋ / − 缩放；在“节点”中可直接选择并阅读参数。'));
      const inspector = editor.querySelector('.ne-inspector');
      if (inspector) {
        const back = element('button', 'mrl-back', '‹ 返回节点列表');
        back.type = 'button';
        back.dataset.mrlKind = 'algorithm';
        back.dataset.mrlTab = 'nodes';
        inspector.prepend(back);
      }
      setTab(editor, 'algorithm', selection.algorithm);
      nodeSignature = '';
    }
    syncNodes(editor);
  }

  function enhanceEvaluation(lab) {
    if (lab.dataset.mrlReady) return;
    lab.dataset.mrlReady = 'true';
    const nav = tabBar('evaluation', [['charts', '图表与结果'], ['settings', '实验与指标']], selection.evaluation);
    lab.insertBefore(nav, lab.querySelector('.el-layout'));
    setTab(lab, 'evaluation', selection.evaluation);
  }

  function enhanceTables() {
    document.querySelectorAll('.compare-table').forEach(table => {
      if (table.parentElement.classList.contains('mrl-table-scroll')) return;
      const wrap = element('div', 'mrl-table-scroll');
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', '对照数据表，可左右滑动');
      table.before(wrap);
      wrap.append(table);
    });
  }

  function foldControls(container, nodes, title, key) {
    if (!container || !nodes.length || container.querySelector(`:scope > .mrl-fold[data-mrl-fold="${key}"]`)) return;
    const details = element('details', `mrl-fold mrl-fold-${key}`);
    details.dataset.mrlFold = key;
    const summary = element('summary', '', title);
    const body = element('div', 'mrl-fold-body');
    const positions = nodes.map(node => {
      const anchor = document.createComment('mobile-layout-original-position');
      node.before(anchor);
      body.append(node);
      return { node, anchor };
    });
    details.append(summary, body);
    if (key === 'chart') positions[0].anchor.before(details);
    else container.append(details);
    folded.add({ details, positions });
  }

  function enhanceChrome() {
    for (const record of folded) if (!record.details.isConnected) folded.delete(record);
    document.querySelectorAll('.studio-head').forEach(head => {
      const nodes = [head.querySelector('.studio-title p'), head.querySelector(':scope > .head-actions')].filter(Boolean);
      // Nodes already inside the folding body must not be wrapped a second time.
      foldControls(head, nodes, '工作区说明', 'info');
    });
    document.querySelectorAll('.algorithm-layout > .toolbar').forEach(toolbar => {
      const nodes = [...toolbar.querySelectorAll(':scope > [data-action="validate-schema"], :scope > [data-action="download-adapter"], :scope > [data-action="reset-config"], :scope > .toolbar-note')];
      foldControls(toolbar, nodes, '更多工具', 'tools');
    });
    document.querySelectorAll('.el-main').forEach(main => {
      foldControls(main, [...main.querySelectorAll(':scope > .el-controls')], '图表选项', 'chart');
    });
    document.querySelectorAll('.el-actions').forEach(actions => {
      const nodes = [...actions.querySelectorAll(':scope > [data-eval-action="template"], :scope > [data-eval-action="import"], :scope > [data-eval-action="export"]')];
      foldControls(actions, nodes, '导入与导出', 'transfer');
    });
  }

  function restoreChrome() {
    for (const { details, positions } of folded) {
      if (!details.isConnected) continue;
      for (const { node, anchor } of positions) {
        if (anchor.isConnected) { anchor.before(node); anchor.remove(); }
      }
      details.remove();
    }
    folded.clear();
  }

  function enhance() {
    scheduled = false;
    document.documentElement.toggleAttribute('data-mobile-rl', phone.matches);
    if (!phone.matches) { restoreChrome(); return; }
    enhanceChrome();
    const editor = document.querySelector('.node-editor');
    if (editor) enhanceAlgorithm(editor);
    const lab = document.querySelector('.evaluation-lab');
    if (lab) enhanceEvaluation(lab);
    enhanceTables();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(enhance);
  }

  document.addEventListener('click', event => {
    if (!phone.matches) return;
    const button = event.target.closest('[data-mrl-tab]');
    if (button) {
      const kind = button.dataset.mrlKind;
      setTab(button.closest(kind === 'algorithm' ? '.node-editor' : '.evaluation-lab'), kind, button.dataset.mrlTab, true);
      return;
    }
    const editor = event.target.closest('.node-editor');
    if (!editor) return;
    const action = event.target.closest('[data-ne-action]')?.dataset.neAction;
    if (event.target.closest('[data-inspect]') || ['show-inspector', 'focus-transformer', 'manage-feedback', 'scene-task'].includes(action)) {
      setTab(editor, 'algorithm', 'inspector', true);
    } else if (action === 'close-inspector') {
      setTab(editor, 'algorithm', 'nodes', true);
    } else if (action === 'add-menu') {
      setTab(editor, 'algorithm', 'graph', true);
    } else if (event.target.closest('[data-add]')) {
      setTab(editor, 'algorithm', 'inspector', true);
    } else if (action?.startsWith('scope:')) {
      setTab(editor, 'algorithm', 'nodes', true);
    }
    schedule();
  });

  function start() {
    const host = document.getElementById('rl-studio');
    if (!host) return;
    // Only structural changes: continuously animated metric text/attributes are deliberately ignored.
    new MutationObserver(records => {
      if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === Node.ELEMENT_NODE))) schedule();
    }).observe(host, { childList: true, subtree: true });
    phone.addEventListener('change', schedule);
    enhance();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
