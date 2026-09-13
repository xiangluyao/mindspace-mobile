/* Progressive phone layout; React remains the owner of scene data and controls. */
(() => {
  'use strict';
  const media = matchMedia('(max-width: 1023px)');
  const html = document.documentElement;
  const originalViews = new Map();
  let nav, workspace, panel = 'scene', kind = '', timer;
  const options = {
    model: [['scene', '三维场景'], ['library', '模型库'], ['tree', '场景树'], ['properties', '物件属性']],
    scene: [['scene', '三维场景'], ['library', '场景内容'], ['properties', '场景属性']],
    human: [['scene', '三维场景'], ['library', '人物与层级'], ['properties', '人物属性']],
    'human-library': [['overview', '返回人因场景']],
    rl: []
  };
  const schedule = () => {
    if (!timer) timer = setTimeout(() => { timer = undefined; refresh(); }, 90);
  };
  function setPanel(next, focus = false) {
    panel = next;
    if (workspace) workspace.dataset.mobilePanel = next;
    if (!nav) return;
    for (const button of nav.querySelectorAll('button[data-panel]')) {
      button.setAttribute('aria-pressed', String(button.dataset.panel === next));
    }
    if (focus) nav.querySelector(`[data-panel="${next}"]`)?.focus();
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }
  function setMenu(open) {
    html.classList.toggle('ms-scene-menu-open', open);
    nav?.querySelector('[data-mobile-menu]')?.setAttribute('aria-expanded', String(open));
  }
  function buildNav(nextKind) {
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'mobile-scene-nav';
      nav.setAttribute('aria-label', '工作区面板');
      nav.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-panel]');
        if (event.target.closest('[data-mobile-menu]')) {
          setMenu(!html.classList.contains('ms-scene-menu-open'));
        } else if (button?.dataset.panel === 'overview') {
          [...document.querySelectorAll('.human-page-tabs button')].find(item => item.textContent.trim() === '总览')?.click();
          setPanel('scene');
          setMenu(false);
        } else if (button) { setPanel(button.dataset.panel); setMenu(false); }
      });
      nav.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const buttons = [...nav.querySelectorAll('button[data-panel]')];
        const at = buttons.indexOf(document.activeElement);
        if (at < 0) return;
        event.preventDefault();
        const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
          (at + (event.key === 'ArrowLeft' ? -1 : 1) + buttons.length) % buttons.length;
        setPanel(buttons[index].dataset.panel, true);
      });
      document.body.append(nav);
    }
    if (kind !== nextKind) {
      kind = nextKind;
      const directory = document.createElement('button');
      directory.type = 'button';
      directory.dataset.mobileMenu = '';
      directory.textContent = '功能目录';
      directory.setAttribute('aria-controls', 'mobile-studio-directory');
      directory.setAttribute('aria-expanded', 'false');
      nav.replaceChildren(...options[kind].map(([value, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.panel = value;
        button.textContent = label;
        return button;
      }), directory);
      setPanel('scene');
    }
  }
  function refresh() {
    const root = document.getElementById('root');
    if (!root) return;
    const next = root.querySelector('.workspace-grid:not([hidden])');
    const active = media.matches && !!root.querySelector('.app-shell');
    html.classList.toggle('ms-mobile-studio', active);
    html.classList.toggle('ms-embedded-studio', window.self !== window.top);
    if (!active) {
      if (nav) nav.hidden = true;
      setMenu(false);
      if (workspace) delete workspace.dataset.mobilePanel;
      for (const [grid, wasFourUp] of originalViews) {
        if (wasFourUp && grid.isConnected && grid.classList.contains('maximized')) {
          grid.querySelector('.restore-four-view')?.click();
        }
      }
      originalViews.clear();
      return;
    }
    if (!next) {
      workspace = undefined;
      buildNav('rl');
      nav.hidden = false;
      return;
    }
    if (workspace !== next) {
      workspace = next;
      kind = '';
    }
    const isLibrary = next.classList.contains('original-library-mode');
    const humanHeader = next.querySelector('.original-header');
    if (humanHeader && !humanHeader.querySelector('.mobile-human-tools-toggle')) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mobile-human-tools-toggle';
      toggle.textContent = '场景与视角工具';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.addEventListener('click', () => {
        const open = humanHeader.dataset.mobileTools !== 'open';
        humanHeader.dataset.mobileTools = open ? 'open' : 'closed';
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? '收起场景与视角工具' : '场景与视角工具';
        window.dispatchEvent(new Event('resize'));
      });
      humanHeader.prepend(toggle);
    }
    const nativeNav = root.querySelector('.module-nav');
    if (nativeNav && nativeNav.id !== 'mobile-studio-directory') nativeNav.id = 'mobile-studio-directory';
    const nextKind = isLibrary ? 'human-library' : next.classList.contains('hl-original') ? 'human' :
      next.querySelector('.asset-library') ? 'model' : 'scene';
    buildNav(nextKind);
    nav.hidden = false;
    html.classList.toggle('ms-mobile-library', isLibrary);
    if (workspace.dataset.mobilePanel !== panel) workspace.dataset.mobilePanel = panel;
    for (const grid of next.querySelectorAll('.model-view-grid')) {
      if (originalViews.has(grid)) continue;
      const fourUp = grid.classList.contains('four-up');
      originalViews.set(grid, fourUp);
      if (fourUp) {
        // Use the application's own maximise handler so its renderer and cameras agree.
        grid.querySelector('[data-view="perspective"]')?.dispatchEvent(
          new MouseEvent('dblclick', { bubbles: true })
        );
      }
    }
  }
  function init() {
    const root = document.getElementById('root');
    if (!root) return;
    new MutationObserver(schedule).observe(root, {
      subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden']
    });
    root.addEventListener('click', (event) => {
      if (!media.matches) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const directoryButton = target.closest('.module-nav button');
      if (directoryButton && !directoryButton.hasAttribute('aria-controls')) {
        setMenu(false);
        setPanel('scene');
      } else if (target.closest('.scene-preset-dialog footer .primary, .human-model-catalog button[title^="P"], .human-model-catalog button[aria-label^="放置人物"]')) {
        if (!target.closest('button:disabled')) setPanel('scene');
      } else if (target.closest('.tree-row, .module-object-row') && !target.closest('.tree-visibility, [aria-label^="隐藏"], [aria-label^="显示"]')) {
        setPanel('properties');
      } else if (target.closest('#layer-list button')) {
        setPanel('properties');
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && html.classList.contains('ms-scene-menu-open')) {
        setMenu(false);
        nav?.querySelector('[data-mobile-menu]')?.focus();
      }
    });
    media.addEventListener('change', refresh);
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
