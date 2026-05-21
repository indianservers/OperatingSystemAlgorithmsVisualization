(function () {
  const modules = [
    { href: 'index.html', title: 'Home', group: 'Core', difficulty: 'Beginner' },
    { href: 'cpu-scheduling.html', title: 'CPU Scheduling', group: 'Scheduling', difficulty: 'Intermediate' },
    { href: 'page-replacement.html', title: 'Page Replacement', group: 'Memory', difficulty: 'Intermediate' },
    { href: 'disk-scheduling.html', title: 'Disk Scheduling', group: 'Storage', difficulty: 'Intermediate' },
    { href: 'deadlock.html', title: 'Deadlock', group: 'Concurrency', difficulty: 'Advanced' },
    { href: 'memory-allocation.html', title: 'Memory Allocation', group: 'Memory', difficulty: 'Beginner' },
    { href: 'synchronization.html', title: 'Synchronization', group: 'Concurrency', difficulty: 'Advanced' },
    { href: 'file-allocation.html', title: 'File Allocation', group: 'Storage', difficulty: 'Beginner' },
    { href: 'paging.html', title: 'Paging', group: 'Memory', difficulty: 'Intermediate' },
    { href: 'io-scheduling.html', title: 'I/O Concepts', group: 'I/O', difficulty: 'Beginner' }
  ];

  const glossary = {
    frame: 'A fixed-size physical memory slot that can hold one page.',
    semaphore: 'A synchronization counter used with wait and signal operations.',
    'seek time': 'Time taken by a disk head to move to the requested cylinder.',
    'safe state': 'A state where at least one process completion order can avoid deadlock.',
    'page fault': 'An event where a referenced page is not currently loaded in a frame.',
    starvation: 'A condition where a process waits indefinitely because others keep being chosen.',
    fragmentation: 'Wasted memory caused by free or allocated space being split inefficiently.',
    thrashing: 'Excessive paging where the system spends more time swapping than executing.'
  };

  const presets = {
    starvation: 'Priority scheduling, SSTF, and writer-unfair reader-writer examples show long waiting.',
    fragmentation: 'Memory allocation, paging, buddy system, and compaction examples show wasted space.',
    thrashing: 'Page replacement presets show too few frames and repeated page faults.',
    deadlock: 'Banker, RAG, dining philosophers, and semaphore examples show circular wait risks.'
  };

  function pageName() {
    const raw = location.pathname.split('/').pop() || 'index.html';
    return raw || 'index.html';
  }

  function currentModule() {
    return modules.find(m => m.href === pageName()) || modules[0];
  }

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function activeAlgoLabel() {
    const active = document.querySelector('.algo-tab.active, .algo-option.selected');
    return active ? active.textContent.trim() : currentModule().title;
  }

  function setTheme(mode) {
    const resolved = mode === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.dataset.themeChoice = mode;
    localStorage.setItem('os-theme-choice', mode);
    localStorage.setItem('os-theme', resolved);
  }

  function initTheme() {
    const choice = localStorage.getItem('os-theme-choice') || localStorage.getItem('os-theme') || 'light';
    setTheme(choice);
    document.querySelectorAll('#themeBtn').forEach(btn => {
      btn.title = 'Theme settings are in the global sidebar';
      btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? 'Light' : 'Dark';
    });
  }

  function initModeSwitch(shell) {
    const saved = localStorage.getItem('os-learning-mode') || 'learn';
    const wrap = el('div', 'global-mode');
    ['learn', 'practice', 'compare'].forEach(mode => {
      const b = el('button', saved === mode ? 'active' : '', mode[0].toUpperCase() + mode.slice(1));
      b.type = 'button';
      b.onclick = () => {
        localStorage.setItem('os-learning-mode', mode);
        wrap.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
        document.body.dataset.learningMode = mode;
        if (mode === 'compare') document.getElementById('compareBtn')?.click();
        if (mode === 'practice') document.getElementById('quizBtn')?.click();
      };
      wrap.appendChild(b);
    });
    document.body.dataset.learningMode = saved;
    shell.appendChild(section('Learning Mode', wrap));
  }

  function section(title, content) {
    const box = el('div', 'global-sidebar-section');
    box.appendChild(el('div', 'global-sidebar-title', title));
    box.appendChild(content);
    return box;
  }

  function initSidebar() {
    const sidebar = el('aside', 'global-sidebar');
    sidebar.appendChild(el('div', 'global-sidebar-brand', '<strong>OS Learning Suite</strong><span>Unified controls</span>'));
    initModeSwitch(sidebar);

    const nav = el('div', 'global-module-list');
    modules.filter(m => m.href !== 'index.html').forEach(m => {
      const a = el('a', m.href === pageName() ? 'active' : '', `<span>${m.title}</span><small>${m.group}</small>`);
      a.href = m.href;
      nav.appendChild(a);
    });
    sidebar.appendChild(section('Modules', nav));

    const theme = el('div', 'global-setting-stack');
    const select = el('select');
    select.innerHTML = '<option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>';
    select.value = localStorage.getItem('os-theme-choice') || localStorage.getItem('os-theme') || 'light';
    select.onchange = () => setTheme(select.value);
    const colorblind = el('label', 'global-check', '<input type="checkbox" id="colorblindToggle"> Colorblind-safe palette');
    theme.append(select, colorblind);
    sidebar.appendChild(section('Display', theme));

    const scenarioList = el('div', 'scenario-list');
    Object.entries(presets).forEach(([name, text]) => {
      const item = el('button', '', `<strong>${name}</strong><span>${text}</span>`);
      item.type = 'button';
      item.onclick = () => showToast(`Scenario focus: ${text}`);
      scenarioList.appendChild(item);
    });
    sidebar.appendChild(section('Scenario Groups', scenarioList));

    const progress = el('div', 'coverage-panel');
    sidebar.appendChild(section('Coverage', progress));

    document.body.prepend(sidebar);
    document.body.classList.add('has-global-sidebar');

    const toggle = el('button', 'global-sidebar-toggle', 'Menu');
    toggle.type = 'button';
    toggle.onclick = () => document.body.classList.toggle('sidebar-open');
    document.body.appendChild(toggle);

    const cb = document.getElementById('colorblindToggle');
    cb.checked = localStorage.getItem('os-colorblind') === '1';
    document.documentElement.classList.toggle('colorblind-safe', cb.checked);
    cb.onchange = () => {
      localStorage.setItem('os-colorblind', cb.checked ? '1' : '0');
      document.documentElement.classList.toggle('colorblind-safe', cb.checked);
    };

    renderCoverage(progress);
  }

  function initBreadcrumbs() {
    if (pageName() === 'index.html') return;
    const crumb = el('div', 'breadcrumb-bar', `<a href="index.html">Home</a><span>/</span><span>${currentModule().title}</span><span>/</span><strong id="crumbAlgo">${activeAlgoLabel()}</strong>`);
    const nav = document.querySelector('.top-nav');
    nav?.insertAdjacentElement('afterend', crumb);
    document.addEventListener('click', e => {
      if (e.target.closest('.algo-tab, .algo-option')) {
        setTimeout(() => {
          const c = document.getElementById('crumbAlgo');
          if (c) c.textContent = activeAlgoLabel();
          markProgress();
        }, 30);
      }
    });
  }

  function initHomeSearch() {
    if (pageName() !== 'index.html') return;
    const hero = document.querySelector('.hero');
    const panel = el('div', 'algorithm-index-panel');
    panel.innerHTML = `
      <div class="algorithm-search-row">
        <input id="algorithmSearch" type="text" placeholder="Search algorithms, topics, or concepts">
        <span id="algorithmCount"></span>
      </div>
      <div id="algorithmIndex" class="algorithm-index"></div>`;
    hero?.insertAdjacentElement('afterend', panel);
    const records = [];
    document.querySelectorAll('.algo-card').forEach(card => {
      const title = card.querySelector('.algo-card-title')?.textContent.trim() || '';
      const tags = [...card.querySelectorAll('.tag')].map(t => t.textContent.trim());
      records.push({ title, href: card.getAttribute('href'), tags, text: `${title} ${tags.join(' ')}`.toLowerCase() });
    });
    const render = (q = '') => {
      const hits = records.filter(r => r.text.includes(q.toLowerCase()));
      document.getElementById('algorithmCount').textContent = `${hits.length} modules`;
      document.getElementById('algorithmIndex').innerHTML = hits.map(r => `<a href="${r.href}"><strong>${r.title}</strong><span>${r.tags.join(' · ')}</span></a>`).join('');
      document.querySelectorAll('.algo-card').forEach(card => {
        const t = card.textContent.toLowerCase();
        card.style.display = t.includes(q.toLowerCase()) ? '' : 'none';
      });
    };
    document.getElementById('algorithmSearch').oninput = e => render(e.target.value);
    render();
  }

  function initBadges() {
    const difficulty = currentModule().difficulty;
    document.querySelectorAll('.algo-card, .card').forEach((card, idx) => {
      if (card.querySelector('.ui-badge-row')) return;
      const row = el('div', 'ui-badge-row');
      row.innerHTML = `<span class="difficulty ${difficulty.toLowerCase()}">${difficulty}</span><span class="best-badge">Best: teaching step-by-step</span><span class="watch-badge">Watch: edge cases</span>`;
      const title = card.querySelector('.algo-card-title, .panel-title, .card-title');
      if (title && idx < 14) title.insertAdjacentElement('afterend', row);
    });
  }

  function initOnboarding() {
    if (localStorage.getItem('os-onboarding-seen')) return;
    const tip = el('div', 'onboarding-tip', '<strong>Start here</strong><span>Choose Learn, Practice, or Compare from the sidebar. Use Space to play/pause and arrow keys to step.</span><button type="button">Got it</button>');
    tip.querySelector('button').onclick = () => {
      localStorage.setItem('os-onboarding-seen', '1');
      tip.remove();
    };
    document.body.appendChild(tip);
  }

  function initExplanationPanel() {
    if (document.getElementById('globalExplainPanel')) return;
    const panel = el('div', 'global-explain-panel');
    panel.id = 'globalExplainPanel';
    panel.innerHTML = '<div class="section-title">Why This Step Happened</div><div id="globalExplainText">Run or step through a visualization. The current decision explanation will appear here.</div>';
    const target = document.querySelector('.viz-panel') || document.body;
    target.appendChild(panel);
    setInterval(() => {
      const source = document.querySelector('#decisionBox, .step-entry.current, .safety-step.current, #algoCard, #algoInfoCard');
      const txt = source?.textContent?.trim();
      if (txt) document.getElementById('globalExplainText').textContent = txt.replace(/\s+/g, ' ');
    }, 800);
  }

  function initGlobalScrubber() {
    if (document.getElementById('globalTimeline')) return;
    const bar = el('div', 'global-timeline');
    bar.id = 'globalTimeline';
    bar.innerHTML = '<button type="button" id="globalBack">Back</button><input id="globalScrub" type="range" min="0" max="100" value="0"><button type="button" id="globalForward">Next</button><select id="globalSpeed"><option value="2">0.5x</option><option value="1" selected>1x</option><option value="0.5">2x</option><option value="0.25">4x</option></select>';
    document.body.appendChild(bar);
    document.getElementById('globalBack').onclick = () => document.getElementById('stepBackBtn')?.click();
    document.getElementById('globalForward').onclick = () => document.getElementById('stepFwdBtn')?.click();
    document.getElementById('globalSpeed').onchange = e => {
      const match = [...document.querySelectorAll('.speed-btn')].find(b => b.dataset.spd === e.target.value);
      match?.click();
    };
    document.getElementById('globalScrub').oninput = e => {
      const local = document.querySelector('#scrubber, #stepSlider');
      if (local) {
        local.value = Math.round((+e.target.value / 100) * (+local.max || 100));
        local.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    setInterval(() => {
      const local = document.querySelector('#scrubber, #stepSlider');
      if (!local || !local.max) return;
      document.getElementById('globalScrub').value = (+local.value / +local.max) * 100;
    }, 500);
  }

  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); document.getElementById('playBtn')?.click(); }
      if (e.key === 'ArrowLeft') document.getElementById('stepBackBtn')?.click();
      if (e.key === 'ArrowRight') document.getElementById('stepFwdBtn')?.click();
    });
  }

  function initUtilityActions() {
    const actions = el('div', 'global-actions');
    actions.innerHTML = `
      <button type="button" id="exportPngBtn">PNG</button>
      <button type="button" id="exportCsvBtn">CSV</button>
      <button type="button" id="exportJsonBtn">JSON</button>
      <button type="button" id="shareStateBtn">Share URL</button>
      <button type="button" id="printReportBtn">Lesson Report</button>`;
    document.body.appendChild(actions);
    document.getElementById('exportPngBtn').onclick = () => exportSummaryPng();
    document.getElementById('exportCsvBtn').onclick = () => download('lesson-data.csv', collectRows());
    document.getElementById('exportJsonBtn').onclick = () => download('lesson-state.json', JSON.stringify(collectState(), null, 2));
    document.getElementById('shareStateBtn').onclick = () => {
      const url = new URL(location.href);
      url.searchParams.set('algo', activeAlgoLabel());
      url.searchParams.set('mode', document.body.dataset.learningMode || 'learn');
      url.hash = btoa(unescape(encodeURIComponent(JSON.stringify(collectState())))).slice(0, 1200);
      navigator.clipboard?.writeText(url.toString());
      showToast('Shareable URL copied with current algorithm and mode.');
    };
    document.getElementById('printReportBtn').onclick = () => {
      document.body.classList.add('print-report');
      setTimeout(() => window.print(), 50);
    };
    addEventListener('afterprint', () => document.body.classList.remove('print-report'));
  }

  function collectState() {
    const inputs = {};
    document.querySelectorAll('input, select, textarea').forEach(x => {
      if (x.id) inputs[x.id] = x.type === 'checkbox' ? x.checked : x.value;
    });
    return { module: currentModule().title, algorithm: activeAlgoLabel(), mode: document.body.dataset.learningMode, inputs };
  }

  function collectRows() {
    const rows = [['module', 'algorithm', 'field', 'value']];
    const state = collectState();
    Object.entries(state.inputs).forEach(([k, v]) => rows.push([state.module, state.algorithm, k, String(v)]));
    return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  function download(name, content) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportSummaryPng() {
    const state = collectState();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#edf4fb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#14212f';
    ctx.font = '700 42px Inter, Arial';
    ctx.fillText('OS Algorithm Lesson Snapshot', 56, 84);
    ctx.font = '700 28px Inter, Arial';
    ctx.fillText(state.module, 56, 146);
    ctx.font = '500 24px Inter, Arial';
    ctx.fillText(`Algorithm: ${state.algorithm}`, 56, 194);
    ctx.fillText(`Mode: ${state.mode || 'learn'}`, 56, 236);
    ctx.font = '600 20px Inter, Arial';
    ctx.fillText('Current Inputs', 56, 304);
    ctx.font = '500 18px Inter, Arial';
    Object.entries(state.inputs).slice(0, 14).forEach(([k, v], i) => {
      ctx.fillText(`${k}: ${v}`, 76, 344 + i * 28);
    });
    ctx.fillStyle = '#1673c7';
    ctx.fillRect(56, 650, 1088, 6);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'lesson-snapshot.png';
    a.click();
  }

  function initTeacherSummary() {
    const summary = el('div', 'teacher-summary');
    summary.innerHTML = '<strong>Teacher Summary</strong><span>Run a simulation to generate a compact classroom recap.</span>';
    (document.querySelector('.viz-panel') || document.body).appendChild(summary);
    document.getElementById('runBtn')?.addEventListener('click', () => {
      setTimeout(() => {
        summary.innerHTML = `<strong>Teacher Summary</strong><span>${currentModule().title}: ${activeAlgoLabel()} explored in ${document.body.dataset.learningMode || 'learn'} mode. Key takeaway: inspect each highlighted decision and compare the final metrics or state changes.</span>`;
        markProgress();
      }, 500);
    });
  }

  function initGlossary() {
    const candidates = document.querySelectorAll('.algo-card-desc, .text-muted, .card-subtitle, .form-hint, .step-entry, #globalExplainText');
    candidates.forEach(node => {
      if (node.dataset.glossaryDone) return;
      let html = node.innerHTML;
      Object.entries(glossary).forEach(([term, def]) => {
        const re = new RegExp(`\\b(${term})\\b`, 'i');
        if (re.test(html) && !html.includes(`data-tip="${def}"`)) {
          html = html.replace(re, `<span data-tip="${def}">$1</span>`);
        }
      });
      node.innerHTML = html;
      node.dataset.glossaryDone = '1';
    });
  }

  function initValidationHints() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('invalid', () => showToast(`Fix ${input.id || 'number field'}: use a value between ${input.min || 'the minimum'} and ${input.max || 'the maximum'}.`));
      input.addEventListener('input', () => {
        input.classList.toggle('invalid-field', !input.checkValidity());
      });
    });
  }

  function initAnimatedStateTransitions() {
    const watched = [
      '.frame-cell', '.page-slot', '.ref-token',
      '.request-dot', '.head-marker', '.head-label',
      '.proc-row', '.process-state-card', '.state-chip',
      '.mem-block', '.mem-block-row', '.disk-block',
      '.memory-line', '.avail-cell', '.actor-state', '.actor-row',
      '.gantt-cell', '.gantt-block'
    ].join(',');

    const mark = node => {
      if (!(node instanceof Element)) return;
      const targets = node.matches(watched) ? [node] : [...node.querySelectorAll(watched)];
      targets.forEach(elm => {
        elm.classList.remove('state-enter');
        void elm.offsetWidth;
        elm.classList.add('state-enter');
      });
    };

    const previous = new WeakMap();
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(mark);
        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
          const target = mutation.target;
          if (!target.matches(watched)) return;
          const signature = `${target.className}|${target.getAttribute('style') || ''}|${target.textContent.trim()}`;
          if (previous.get(target) !== signature) {
            target.classList.remove('state-changed');
            void target.offsetWidth;
            target.classList.add('state-changed');
            previous.set(target, signature);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });

    document.querySelectorAll(watched).forEach(mark);

    const localStepControls = ['stepBackBtn', 'stepFwdBtn', 'playBtn', 'runBtn'];
    localStepControls.forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        document.querySelectorAll('.head-marker').forEach(h => {
          h.classList.add('moving');
          setTimeout(() => h.classList.remove('moving'), 700);
        });
      });
    });
  }

  function markProgress() {
    const key = `progress:${pageName()}:${activeAlgoLabel()}`;
    localStorage.setItem(key, new Date().toISOString());
    const panel = document.querySelector('.coverage-panel');
    if (panel) renderCoverage(panel);
  }

  function renderCoverage(panel) {
    const tried = Object.keys(localStorage).filter(k => k.startsWith('progress:')).length;
    const total = 60;
    const pct = Math.min(100, Math.round(tried / total * 100));
    panel.innerHTML = `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><div class="text-xs text-muted">${tried} topics tried · ${pct}% coverage</div>`;
  }

  function showToast(text) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = el('div', 'global-toast');
      toast.id = 'globalToast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function applyUrlState() {
    const params = new URLSearchParams(location.search);
    const algo = params.get('algo');
    if (!algo) return;
    [...document.querySelectorAll('.algo-tab, .algo-option')].find(x => x.textContent.trim() === algo)?.click();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initBreadcrumbs();
    initHomeSearch();
    initBadges();
    initOnboarding();
    initExplanationPanel();
    initGlobalScrubber();
    initKeyboard();
    initUtilityActions();
    initTeacherSummary();
    initGlossary();
    initValidationHints();
    initAnimatedStateTransitions();
    applyUrlState();
    markProgress();
    setInterval(initGlossary, 2500);
  });
})();
