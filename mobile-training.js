/* Presentation-only mobile adaptation. Every app action still runs through
   the original control / handler; desktop layout restores at 1024 px. */
(() => {
  'use strict';
  const mobile = window.matchMedia('(max-width: 1023px)');
  let nav, kind, mounted = false, pane = 'scene', signalPlacement;
  const training = document.getElementById('training-app');
  const human = document.getElementById('human-app');
  if (!training && !human) return;

  function resizeScene() {
    requestAnimationFrame(() => {
      const viewport = document.getElementById('viewport');
      if (!viewport || (viewport.clientWidth > 0 && viewport.clientHeight > 0)) {
        window.dispatchEvent(new Event('resize'));
      }
      const frame = document.getElementById('training-expert-frame');
      try { if (frame?.clientWidth > 0 && frame?.clientHeight > 0) frame.contentWindow?.dispatchEvent(new Event('resize')); } catch (_) { /* independent iframe */ }
    });
  }

  function protectCoveredFrame() {
    const host = document.getElementById('expert-frame-host');
    if (!host) return;
    const covered = mobile.matches && pane === 'config';
    host.inert = covered;
    if (covered) host.setAttribute('aria-hidden', 'true'); else host.removeAttribute('aria-hidden');
  }

  function activate(next) {
    pane = next;
    if (training) training.classList.toggle('ms-config-open', next === 'config');
    else {
      document.body.dataset.msPane = next;
      // Library pages have an existing page selector. Use it to return without
      // reloading the 3D scene or bypassing the app's own state transitions.
      if (['personas', 'actions', 'events'].includes(document.body.dataset.humanSection)) {
        const select = document.querySelector('[data-workspace-section]');
        if (select) { select.value = 'overview'; select.dispatchEvent(new Event('change', { bubbles: true })); }
      }
    }
    nav?.querySelectorAll('button').forEach(button => {
      const selected = button.dataset.msTab === pane;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    protectCoveredFrame();
    if (mobile.matches) window.scrollTo({ top: 0, behavior: 'instant' });
    resizeScene();
  }

  function buildTabs() {
    const expert = human && (document.body.classList.contains('human-expert-layout') || new URLSearchParams(location.search).get('section') === 'expert');
    const nextKind = training ? 'training' : expert ? 'expert' : 'human';
    if (kind === nextKind && nav) return;
    kind = nextKind;
    nav?.remove();
    nav = document.createElement('nav');
    nav.className = 'ms-workspace-tabs';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', training ? '训练工作区' : expert ? '场景与示范面板' : '人物场景面板');
    const tabs = training ? [['scene', '训练视窗'], ['config', '训练设置']]
      : expert ? [['scene', '场景'], ['controls', '示范控制'], ['signals', '信号']]
      : [['scene', '场景'], ['people', '人物与层级'], ['controls', '详情']];
    if (!tabs.some(([value]) => value === pane)) pane = 'scene';
    for (const [value, label] of tabs) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label; button.dataset.msTab = value;
      button.setAttribute('role', 'tab'); button.setAttribute('aria-selected', String(value === pane));
      button.tabIndex = value === pane ? 0 : -1;
      button.addEventListener('click', () => activate(value));
      nav.append(button);
    }
    nav.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      const buttons = [...nav.querySelectorAll('button')];
      const i = buttons.indexOf(document.activeElement);
      if (i < 0) return;
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
        : (i + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[index].focus(); buttons[index].click();
    });
    if (training) training.prepend(nav); else human.before(nav);
    if (!tabs.some(([value]) => value === pane)) pane = 'scene';
    document.body.dataset.msPane = pane;
  }

  function placeSignals() {
    const controls = document.querySelector('.robot-signal-controls');
    const dock = document.getElementById('neuro-dashboard-dock');
    if (!controls || !dock) return;
    if (mobile.matches && !signalPlacement) {
      const placeholder = document.createComment('mobile-signal-controls-original-position');
      controls.before(placeholder);
      signalPlacement = { controls, placeholder };
      dock.before(controls);
    } else if (!mobile.matches && signalPlacement) {
      signalPlacement.placeholder.replaceWith(signalPlacement.controls);
      signalPlacement = null;
    }
  }

  function apply() {
    document.documentElement.classList.toggle('ms-touch', mobile.matches);
    buildTabs();
    placeSignals();
    protectCoveredFrame();
    resizeScene();
  }

  function enhance() {
    buildTabs(); placeSignals();
    // Replace the mouse-only hint only for touch layouts, preserving desktop copy.
    const hint = document.querySelector('.view-hint');
    if (hint && mobile.matches && !hint.dataset.msHint) {
      hint.dataset.msHint = hint.textContent;
      hint.textContent = '单指旋转 · 双指缩放 · 在顶部切换面板';
    }
    if (hint && !mobile.matches && hint.dataset.msHint) {
      hint.textContent = hint.dataset.msHint; delete hint.dataset.msHint;
    }
  }

  function init() {
    if (mounted) return;
    mounted = true;
    apply(); enhance();
    const viewport = document.getElementById('viewport');
    if (viewport && typeof ResizeObserver === 'function') {
      const sceneSize = new ResizeObserver(() => {
        if (viewport.clientWidth > 0 && viewport.clientHeight > 0) resizeScene();
      });
      sceneSize.observe(viewport);
    }
    const observer = new MutationObserver(() => { buildTabs(); });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-human-section'] });
    // Runtime adds controls after loading assets. Stop polling once they exist;
    // dynamic values thereafter remain the original application's responsibility.
    let attempts = 0;
    const pending = window.setInterval(() => {
      enhance();
      const ready = training ? document.getElementById('training-expert-frame')
        : document.getElementById('expert-layout-tools') && document.getElementById('neuro-dashboard-dock') && document.body.dataset.humanSection
          && (new URLSearchParams(location.search).get('trainingShell') !== '1' || document.querySelector('.robot-signal-controls'));
      if (ready || ++attempts > 120) window.clearInterval(pending);
    }, 500);
    mobile.addEventListener('change', () => { apply(); enhance(); });
    window.addEventListener('pagehide', () => window.clearInterval(pending), { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
