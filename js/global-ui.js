(function () {
  /* ── Data ──────────────────────────────────────────── */
  const modules = [
    { href: 'index.html',           title: 'Home',             group: 'Core',        difficulty: 'Beginner' },
    { href: 'cpu-scheduling.html',  title: 'CPU Scheduling',   group: 'Scheduling',  difficulty: 'Intermediate' },
    { href: 'page-replacement.html',title: 'Page Replacement', group: 'Memory',      difficulty: 'Intermediate' },
    { href: 'disk-scheduling.html', title: 'Disk Scheduling',  group: 'Storage',     difficulty: 'Intermediate' },
    { href: 'deadlock.html',        title: 'Deadlock',         group: 'Concurrency', difficulty: 'Advanced' },
    { href: 'memory-allocation.html',title:'Memory Allocation',group: 'Memory',      difficulty: 'Beginner' },
    { href: 'synchronization.html', title: 'Synchronization',  group: 'Concurrency', difficulty: 'Advanced' },
    { href: 'file-allocation.html', title: 'File Allocation',  group: 'Storage',     difficulty: 'Beginner' },
    { href: 'paging.html',          title: 'Paging',           group: 'Memory',      difficulty: 'Intermediate' },
    { href: 'io-scheduling.html',   title: 'I/O Concepts',     group: 'I/O',         difficulty: 'Beginner' }
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

  /* Feature 19 – Big-O complexity lookup */
  const complexities = {
    'FCFS':        { time: 'O(n)',       space: 'O(n)',    note: 'Simple queue, no sorting' },
    'SJF':         { time: 'O(n log n)', space: 'O(n)',    note: 'Sort by burst time' },
    'SRTF':        { time: 'O(n²)',      space: 'O(n)',    note: 'Re-sort on each arrival' },
    'Round Robin': { time: 'O(n·q)',     space: 'O(n)',    note: 'q = time quantum units' },
    'Priority':    { time: 'O(n log n)', space: 'O(n)',    note: 'Heap-based priority queue' },
    'FIFO':        { time: 'O(n)',       space: 'O(f)',    note: 'f = frame count' },
    'LRU':         { time: 'O(n)',       space: 'O(f)',    note: 'Stack or hashmap tracking' },
    'LFU':         { time: 'O(n log f)', space: 'O(f)',    note: 'Min-heap by frequency' },
    'Optimal':     { time: 'O(n·f)',     space: 'O(f)',    note: 'Future look-ahead required' },
    'Clock':       { time: 'O(n)',       space: 'O(f)',    note: 'Circular buffer hand sweep' },
    'NRU':         { time: 'O(f)',       space: 'O(f)',    note: 'Class-based eviction' },
    'SSTF':        { time: 'O(n²)',      space: 'O(n)',    note: 'Nearest seek each step' },
    'SCAN':        { time: 'O(n log n)', space: 'O(n)',    note: 'Sort + bidirectional sweep' },
    'C-SCAN':      { time: 'O(n log n)', space: 'O(n)',    note: 'Circular single direction' },
    'LOOK':        { time: 'O(n log n)', space: 'O(n)',    note: 'SCAN without full extent' },
    'C-LOOK':      { time: 'O(n log n)', space: 'O(n)',    note: 'C-SCAN without full extent' },
    'First Fit':   { time: 'O(n)',       space: 'O(n)',    note: 'First free block scan' },
    'Best Fit':    { time: 'O(n)',       space: 'O(n)',    note: 'Full scan for smallest gap' },
    'Worst Fit':   { time: 'O(n)',       space: 'O(n)',    note: 'Full scan for largest gap' },
    'Next Fit':    { time: 'O(n)',       space: 'O(n)',    note: 'Resume from last position' },
    'Paging':      { time: 'O(1)',       space: 'O(n/p)',  note: 'p = page size' },
    'Segmentation':{ time: 'O(n)',       space: 'O(n)',    note: 'Variable-size segments' },
    'Buddy':       { time: 'O(log n)',   space: 'O(n)',    note: 'Power-of-2 split/merge' },
    'Compaction':  { time: 'O(n)',       space: 'O(1)',    note: 'Shift all live blocks' }
  };

  /* Feature 14 – Undo/redo state (shared across functions) */
  let _inputHistory = [], _historyIdx = -1, _inputLock = false;

  /* Feature 16 – Metrics comparison store */
  let _metricsStore = {};

  /* MOD 11 – Previous metrics for delta indicators */
  let _prevMetrics = {};

  /* ── Helpers ───────────────────────────────────────── */
  function pageName() {
    return location.pathname.split('/').pop() || 'index.html';
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
    return active ? active.textContent.trim().replace(/O\(.*?\)/g, '').trim() : currentModule().title;
  }

  /* ── Theme ─────────────────────────────────────────── */
  function setTheme(mode) {
    const resolved = mode === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.dataset.themeChoice = mode;
    localStorage.setItem('os-theme-choice', mode);
    localStorage.setItem('os-theme', resolved);
    const icon = resolved === 'dark' ? '☀️' : resolved === 'high-contrast' ? '⬜' : '🌙';
    document.querySelectorAll('#themeBtn').forEach(btn => {
      btn.textContent = icon;
      btn.title = 'Theme settings are in the global sidebar';
    });
  }

  function initTheme() {
    const choice = localStorage.getItem('os-theme-choice') || localStorage.getItem('os-theme') || 'light';
    setTheme(choice);
  }

  /* ── Sidebar ───────────────────────────────────────── */
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
    sidebar.appendChild(el('div', 'global-sidebar-brand',
      '<strong>OS Learning Suite</strong><span>Unified controls</span>'));
    initModeSwitch(sidebar);

    /* Module navigation */
    const nav = el('div', 'global-module-list');
    modules.filter(m => m.href !== 'index.html').forEach(m => {
      const a = el('a', m.href === pageName() ? 'active' : '',
        `<span>${m.title}</span><small>${m.group}</small>`);
      a.href = m.href;
      nav.appendChild(a);
    });
    sidebar.appendChild(section('Modules', nav));

    /* Feature 5 – Module progress checklist */
    const checklist = el('div', 'module-checklist');
    modules.filter(m => m.href !== 'index.html').forEach(m => {
      const tried = Object.keys(localStorage).some(k => k.startsWith(`progress:${m.href}:`));
      const item = el('div', 'checklist-item',
        `<span class="checklist-dot${tried ? ' done' : ''}"></span><span>${m.title}</span><small>${m.difficulty}</small>`);
      item.dataset.href = m.href;
      checklist.appendChild(item);
    });
    sidebar.appendChild(section('Progress Checklist', checklist));

    /* Display settings – Feature 21 high-contrast + Feature 22 colorblind */
    const theme = el('div', 'global-setting-stack');
    const select = el('select');
    select.innerHTML = [
      '<option value="light">Light</option>',
      '<option value="dark">Dark</option>',
      '<option value="high-contrast">High Contrast</option>',
      '<option value="system">System</option>'
    ].join('');
    select.value = localStorage.getItem('os-theme-choice') || localStorage.getItem('os-theme') || 'light';
    select.onchange = () => setTheme(select.value);

    const colorblindLabel = el('label', 'global-check',
      '<input type="checkbox" id="colorblindToggle"> Colorblind-safe palette');

    /* Feature 20 – Trace mode toggle */
    const traceLabel = el('label', 'global-check',
      '<input type="checkbox" id="traceModeCheck"> Trace mode annotations');

    theme.append(select, colorblindLabel, traceLabel);
    sidebar.appendChild(section('Display', theme));

    /* Scenario groups */
    const scenarioList = el('div', 'scenario-list');
    Object.entries(presets).forEach(([name, text]) => {
      const item = el('button', '', `<strong>${name}</strong><span>${text}</span>`);
      item.type = 'button';
      item.onclick = () => showToast(`Scenario: ${text}`);
      scenarioList.appendChild(item);
    });
    sidebar.appendChild(section('Scenario Groups', scenarioList));

    /* Coverage */
    const progress = el('div', 'coverage-panel');
    sidebar.appendChild(section('Coverage', progress));

    document.body.prepend(sidebar);
    document.body.classList.add('has-global-sidebar');

    const toggle = el('button', 'global-sidebar-toggle', 'Menu');
    toggle.type = 'button';
    toggle.onclick = () => document.body.classList.toggle('sidebar-open');
    document.body.appendChild(toggle);

    /* Wire colorblind toggle */
    const cb = document.getElementById('colorblindToggle');
    cb.checked = localStorage.getItem('os-colorblind') === '1';
    document.documentElement.classList.toggle('colorblind-safe', cb.checked);
    cb.onchange = () => {
      localStorage.setItem('os-colorblind', cb.checked ? '1' : '0');
      document.documentElement.classList.toggle('colorblind-safe', cb.checked);
    };

    /* Wire trace mode toggle */
    const tcb = document.getElementById('traceModeCheck');
    tcb.checked = localStorage.getItem('os-trace-mode') === '1';
    document.body.classList.toggle('trace-mode', tcb.checked);
    tcb.onchange = () => {
      localStorage.setItem('os-trace-mode', tcb.checked ? '1' : '0');
      document.body.classList.toggle('trace-mode', tcb.checked);
      showToast(tcb.checked ? 'Trace mode on — current step is highlighted.' : 'Trace mode off.');
    };

    renderCoverage(progress);
  }

  /* ── Breadcrumbs (Feature 2) ───────────────────────── */
  function initBreadcrumbs() {
    if (pageName() === 'index.html') return;
    const crumb = el('div', 'breadcrumb-bar',
      `<a href="index.html">Home</a><span>/</span>` +
      `<span>${currentModule().group}</span><span>/</span>` +
      `<span>${currentModule().title}</span><span>/</span>` +
      `<strong id="crumbAlgo">${activeAlgoLabel()}</strong>`);
    document.querySelector('.top-nav')?.insertAdjacentElement('afterend', crumb);
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

  /* ── Home Search ───────────────────────────────────── */
  function initHomeSearch() {
    if (pageName() !== 'index.html') return;
    const hero = document.querySelector('.hero');
    const panel = el('div', 'algorithm-index-panel');
    panel.innerHTML = `
      <div class="algorithm-search-row">
        <input id="algorithmSearch" type="text" placeholder="Search algorithms, topics, or concepts…">
        <span id="algorithmCount"></span>
      </div>
      <div id="algorithmIndex" class="algorithm-index"></div>`;
    hero?.insertAdjacentElement('afterend', panel);
    const records = [];
    document.querySelectorAll('.algo-card').forEach(card => {
      const title = card.querySelector('.algo-card-title')?.textContent.trim() || '';
      const tags = [...card.querySelectorAll('.tag')].map(t => t.textContent.trim());
      records.push({ title, href: card.getAttribute('href'), tags,
        text: `${title} ${tags.join(' ')}`.toLowerCase() });
    });
    const render = (q = '') => {
      const hits = records.filter(r => r.text.includes(q.toLowerCase()));
      document.getElementById('algorithmCount').textContent = `${hits.length} modules`;
      document.getElementById('algorithmIndex').innerHTML = hits
        .map(r => `<a href="${r.href}"><strong>${r.title}</strong><span>${r.tags.join(' · ')}</span></a>`)
        .join('');
      document.querySelectorAll('.algo-card').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
      });
    };
    document.getElementById('algorithmSearch').oninput = e => render(e.target.value);
    render();
  }

  /* ── Difficulty Badges ─────────────────────────────── */
  function initBadges() {
    const difficulty = currentModule().difficulty;
    document.querySelectorAll('.algo-card, .card').forEach((card, idx) => {
      if (card.querySelector('.ui-badge-row')) return;
      const row = el('div', 'ui-badge-row');
      row.innerHTML = `<span class="difficulty ${difficulty.toLowerCase()}">${difficulty}</span>` +
        `<span class="best-badge">Best: step-by-step teaching</span>` +
        `<span class="watch-badge">Watch: edge cases</span>`;
      const title = card.querySelector('.algo-card-title, .panel-title, .card-title');
      if (title && idx < 14) title.insertAdjacentElement('afterend', row);
    });
  }

  /* Feature 19 – Algorithm complexity badges */
  function initComplexityBadges() {
    document.querySelectorAll('.algo-tab:not([data-cx]), .algo-option:not([data-cx])').forEach(tab => {
      const name = tab.textContent.replace(/O\(.*?\)/g, '').trim();
      const info = complexities[name];
      if (!info) return;
      tab.dataset.cx = '1';
      tab.title = `Time: ${info.time}  ·  Space: ${info.space}  ·  ${info.note}`;
      if (!tab.querySelector('.complexity-badge')) {
        tab.appendChild(el('span', 'complexity-badge', info.time));
      }
    });
  }

  /* ── Onboarding ────────────────────────────────────── */
  function initOnboarding() {
    if (localStorage.getItem('os-onboarding-seen')) return;
    const tip = el('div', 'onboarding-tip',
      '<strong>Welcome!</strong>' +
      '<span>Pick Learn, Practice, or Compare in the sidebar. ' +
      'Space = play/pause · ← → = step · R = reset · ? = shortcuts · Ctrl+Z = undo.</span>' +
      '<button type="button">Got it</button>');
    tip.querySelector('button').onclick = () => {
      localStorage.setItem('os-onboarding-seen', '1');
      tip.remove();
    };
    document.body.appendChild(tip);
  }

  /* ── Explanation Panel ─────────────────────────────── */
  function initExplanationPanel() {
    if (document.getElementById('globalExplainPanel')) return;
    const panel = el('div', 'global-explain-panel');
    panel.id = 'globalExplainPanel';
    panel.innerHTML = '<div class="section-title">Why This Step Happened</div>' +
      '<div id="globalExplainText">Run or step through a visualization — the decision explanation appears here.</div>';
    (document.querySelector('.viz-panel') || document.body).appendChild(panel);
    setInterval(() => {
      const src = document.querySelector(
        '#decisionBox, .step-entry.current, .safety-step.current, #algoCard, #algoInfoCard');
      const txt = src?.textContent?.trim();
      if (txt) document.getElementById('globalExplainText').textContent = txt.replace(/\s+/g, ' ');
    }, 800);
  }

  /* ── Global Scrubber / Speed (Features 6 & 7) — MOD 2 & MOD 3 ── */
  function initGlobalScrubber() {
    if (document.getElementById('globalTimeline')) return;
    const bar = el('div', 'global-timeline');
    bar.id = 'globalTimeline';
    bar.innerHTML =
      '<button type="button" id="globalBack" title="Step back (←)">&#8592;</button>' +
      '<input id="globalScrub" type="range" min="0" max="100" value="0" title="Drag to scrub timeline">' +
      '<span id="globalScrubTooltip" class="scrub-tooltip" style="display:none;"></span>' +
      '<button type="button" id="globalForward" title="Step forward (→)">&#8594;</button>' +
      '<select id="globalSpeed" title="Playback speed">' +
        '<option value="2">0.5×</option>' +
        '<option value="1" selected>1×</option>' +
        '<option value="0.5">2×</option>' +
        '<option value="0.25">4×</option>' +
      '</select>' +
      '<span id="globalStepCount" class="step-counter"></span>' +
      '<button type="button" id="fullscreenVizBtn" title="Fullscreen visualization (F)">&#x26F6;</button>';
    document.body.appendChild(bar);

    document.getElementById('globalBack').onclick = () => document.getElementById('stepBackBtn')?.click();
    document.getElementById('globalForward').onclick = () => document.getElementById('stepFwdBtn')?.click();
    document.getElementById('globalSpeed').onchange = e => {
      /* Feature 6 – persist speed */
      localStorage.setItem('os-speed', e.target.value);
      const match = [...document.querySelectorAll('.speed-btn')].find(b => b.dataset.spd === e.target.value);
      match?.click();
    };
    /* Restore saved speed */
    const savedSpeed = localStorage.getItem('os-speed') || '1';
    document.getElementById('globalSpeed').value = savedSpeed;

    /* MOD 2 – Fullscreen button in timeline bar */
    document.getElementById('fullscreenVizBtn').onclick = () => {
      document.querySelector('.viz-panel')?.classList.toggle('fullscreen-mode');
    };

    const scrubEl = document.getElementById('globalScrub');
    const scrubTooltip = document.getElementById('globalScrubTooltip');

    scrubEl.oninput = e => {
      const local = document.querySelector('#scrubber, #stepSlider');
      if (local) {
        local.value = Math.round((+e.target.value / 100) * (+local.max || 100));
        local.dispatchEvent(new Event('input', { bubbles: true }));
      }
      /* MOD 3 – Show tooltip next to scrubber handle */
      const local2 = document.querySelector('#scrubber, #stepSlider');
      if (local2 && local2.max) {
        const stepVal = Math.round((+e.target.value / 100) * (+local2.max || 100));
        const maxVal = +local2.max;
        scrubTooltip.textContent = `Step ${stepVal} / ${maxVal}`;
        scrubTooltip.style.display = 'inline';
        clearTimeout(scrubTooltip._hideTimer);
        scrubTooltip._hideTimer = setTimeout(() => { scrubTooltip.style.display = 'none'; }, 1500);
      }
    };

    setInterval(() => {
      const local = document.querySelector('#scrubber, #stepSlider');
      if (!local || !local.max) return;
      document.getElementById('globalScrub').value = (+local.value / +local.max) * 100;
      const sc = document.getElementById('globalStepCount');
      /* MOD 3 – Updated step counter format */
      if (sc) sc.textContent = `Step ${local.value} / ${local.max}`;
    }, 400);
  }

  /* ── Keyboard Shortcuts (Feature 3 partial) — MOD 2 fullscreen key ── */
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); document.getElementById('playBtn')?.click(); }
      if (e.key === 'ArrowLeft') document.getElementById('stepBackBtn')?.click();
      if (e.key === 'ArrowRight') document.getElementById('stepFwdBtn')?.click();
      if (e.key === 'r' || e.key === 'R') document.getElementById('resetBtn')?.click();
      if (e.key === '?') document.getElementById('shortcutsBtn')?.click();
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); window._osUndoRedo?.undo(); }
      if (e.ctrlKey && (e.key === 'y' || e.key === 'Y')) { e.preventDefault(); window._osUndoRedo?.redo(); }
      /* MOD 2 – F key toggles fullscreen */
      if (e.key === 'f' || e.key === 'F') {
        document.querySelector('.viz-panel')?.classList.toggle('fullscreen-mode');
      }
    });
  }

  /* Feature 3 – Floating shortcuts panel */
  function initShortcutsPanel() {
    if (document.getElementById('shortcutsBtn')) return;
    const btn = el('button', 'shortcuts-fab', '?');
    btn.id = 'shortcutsBtn';
    btn.type = 'button';
    btn.title = 'Keyboard shortcuts (?)';
    btn.onclick = () => {
      const existing = document.getElementById('shortcutsModal');
      if (existing) { existing.remove(); return; }
      const modal = el('div', 'shortcuts-modal');
      modal.id = 'shortcutsModal';
      modal.innerHTML = `
        <div class="shortcuts-header">
          <strong>Keyboard Shortcuts</strong>
          <button type="button" id="closeShortcuts" title="Close">×</button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-row"><kbd>Space</kbd><span>Play / Pause simulation</span></div>
          <div class="shortcut-row"><kbd>←</kbd><span>Step backward one frame</span></div>
          <div class="shortcut-row"><kbd>→</kbd><span>Step forward one frame</span></div>
          <div class="shortcut-row"><kbd>R</kbd><span>Reset simulation</span></div>
          <div class="shortcut-row"><kbd>F</kbd><span>Toggle fullscreen visualization</span></div>
          <div class="shortcut-row"><kbd>?</kbd><span>Toggle this shortcuts panel</span></div>
          <div class="shortcut-row"><kbd>Ctrl Z</kbd><span>Undo last input change</span></div>
          <div class="shortcut-row"><kbd>Ctrl Y</kbd><span>Redo input change</span></div>
          <div class="shortcut-row"><kbd>Ctrl Scroll</kbd><span>Zoom Gantt chart in/out</span></div>
          <div class="shortcut-row"><kbd>Drag</kbd><span>Pan a zoomed Gantt chart</span></div>
          <div class="shortcut-row"><kbd>Dbl-click</kbd><span>Reset Gantt zoom</span></div>
          <div class="shortcut-row"><kbd>Swipe ←/→</kbd><span>Step (touch devices)</span></div>
        </div>`;
      document.body.appendChild(modal);
      document.getElementById('closeShortcuts').onclick = () => modal.remove();
      document.addEventListener('keydown', function esc(ev) {
        if (ev.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); }
      });
    };
    document.body.appendChild(btn);
  }

  /* ── Utility Action Buttons ────────────────────────── */
  function initUtilityActions() {
    const actions = el('div', 'global-actions');
    actions.innerHTML = `
      <button type="button" id="exportPngBtn">PNG</button>
      <button type="button" id="exportCsvBtn">CSV</button>
      <button type="button" id="exportJsonBtn">JSON</button>
      <button type="button" id="shareStateBtn">Share URL</button>
      <button type="button" id="printReportBtn">Print Report</button>
      <button type="button" id="randomizeBtn">Randomize</button>
      <button type="button" id="clearCompareBtn">Clear Chart</button>`;
    document.body.appendChild(actions);

    document.getElementById('exportPngBtn').onclick = () => exportSummaryPng();
    document.getElementById('exportCsvBtn').onclick = () => download('lesson-data.csv', collectRows());
    document.getElementById('exportJsonBtn').onclick = () => {
      download('lesson-state.json', JSON.stringify(collectState(), null, 2));
    };
    document.getElementById('shareStateBtn').onclick = () => {
      const url = new URL(location.href);
      url.searchParams.set('algo', activeAlgoLabel());
      url.searchParams.set('mode', document.body.dataset.learningMode || 'learn');
      url.hash = btoa(unescape(encodeURIComponent(JSON.stringify(collectState())))).slice(0, 1200);
      navigator.clipboard?.writeText(url.toString());
      showToast('Shareable URL copied — includes current algorithm and mode.');
    };
    document.getElementById('printReportBtn').onclick = () => {
      document.body.classList.add('print-report');
      setTimeout(() => window.print(), 50);
    };
    /* Feature 13 – Randomize inputs */
    document.getElementById('randomizeBtn').onclick = () => {
      let count = 0;
      document.querySelectorAll('input[type="number"]').forEach(input => {
        const min = parseInt(input.min) || 0;
        const max = parseInt(input.max) || (min + 20);
        input.value = min + Math.floor(Math.random() * Math.min(max - min, 20));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        count++;
      });
      if (count) showToast(`${count} inputs randomized — click Run to visualize.`);
      else showToast('No numeric inputs found on this page.');
    };
    /* Feature 16 – Clear comparison chart */
    document.getElementById('clearCompareBtn').onclick = () => {
      _metricsStore = {};
      const inner = document.getElementById('metricsChartInner');
      if (inner) inner.innerHTML = '<span class="chart-empty-msg">Run algorithms to compare metrics here.</span>';
      showToast('Comparison chart cleared.');
    };

    addEventListener('afterprint', () => document.body.classList.remove('print-report'));
  }

  /* ── Teacher Summary ───────────────────────────────── */
  function initTeacherSummary() {
    const summary = el('div', 'teacher-summary');
    summary.innerHTML = '<strong>Teacher Summary</strong>' +
      '<span>Run a simulation to generate a compact classroom recap.</span>';
    (document.querySelector('.viz-panel') || document.body).appendChild(summary);
    document.getElementById('runBtn')?.addEventListener('click', () => {
      setTimeout(() => {
        summary.innerHTML = `<strong>Teacher Summary</strong>` +
          `<span>${currentModule().title}: <em>${activeAlgoLabel()}</em> explored in ` +
          `${document.body.dataset.learningMode || 'learn'} mode. ` +
          `Key takeaway: inspect each highlighted decision and compare the final metrics.</span>`;
        markProgress();
      }, 500);
    });
  }

  /* ── Glossary Tooltips ─────────────────────────────── */
  function initGlossary() {
    const candidates = document.querySelectorAll(
      '.algo-card-desc, .text-muted, .card-subtitle, .form-hint, .step-entry, #globalExplainText');
    candidates.forEach(node => {
      if (node.dataset.glossaryDone) return;
      let html = node.innerHTML;
      Object.entries(glossary).forEach(([term, def]) => {
        const re = new RegExp(`\\b(${term})\\b`, 'i');
        if (re.test(html) && !html.includes(`data-tip="${def}"`))
          html = html.replace(re, `<span data-tip="${def}">$1</span>`);
      });
      node.innerHTML = html;
      node.dataset.glossaryDone = '1';
    });
  }

  /* ── Validation Hints — MOD 20 enhanced ───────────── */
  function initValidationHints() {
    document.querySelectorAll('input[type="number"]:not([data-vhook])').forEach(input => {
      input.dataset.vhook = '1';

      function getErrorMessage(inp) {
        if (inp.validity.valueMissing) return 'This field is required.';
        if (inp.validity.rangeUnderflow) return `Must be ≥ ${inp.min}`;
        if (inp.validity.rangeOverflow) return `Must be ≤ ${inp.max}`;
        if (inp.validity.stepMismatch) return `Must be a multiple of ${inp.step || 1}`;
        if (inp.validity.typeMismatch || inp.validity.badInput) return 'Must be a positive number';
        return `Use a value between ${inp.min || 'min'} and ${inp.max || 'max'}.`;
      }

      function getOrCreateTip(inp) {
        let tip = inp.nextElementSibling;
        if (!tip || !tip.classList.contains('field-error-tip')) {
          tip = el('span', 'field-error-tip');
          tip.style.cssText = 'color:var(--danger,#d32f2f);font-size:0.78em;display:block;margin-top:2px;';
          inp.insertAdjacentElement('afterend', tip);
        }
        return tip;
      }

      function validate() {
        const valid = input.checkValidity();
        input.classList.toggle('invalid-field', !valid);
        if (!valid) {
          const tip = getOrCreateTip(input);
          tip.textContent = getErrorMessage(input);
          tip.style.display = 'block';
        } else {
          const tip = input.nextElementSibling;
          if (tip && tip.classList.contains('field-error-tip')) {
            tip.style.display = 'none';
          }
        }
      }

      input.addEventListener('invalid', () => {
        showToast(`Fix ${input.id || 'a number field'}: ${getErrorMessage(input)}`);
        validate();
      });
      input.addEventListener('input', validate);
    });
  }

  /* ── Animated State Transitions ───────────────────── */
  function initAnimatedStateTransitions() {
    const watched = [
      '.frame-cell', '.page-slot', '.ref-token', '.request-dot',
      '.head-marker', '.head-label', '.proc-row', '.process-state-card',
      '.state-chip', '.mem-block', '.mem-block-row', '.disk-block',
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
          const sig = `${target.className}|${target.getAttribute('style') || ''}|${target.textContent.trim()}`;
          if (previous.get(target) !== sig) {
            target.classList.remove('state-changed');
            void target.offsetWidth;
            target.classList.add('state-changed');
            previous.set(target, sig);
          }
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    document.querySelectorAll(watched).forEach(mark);

    ['stepBackBtn', 'stepFwdBtn', 'playBtn', 'runBtn'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        document.querySelectorAll('.head-marker').forEach(h => {
          h.classList.add('moving');
          setTimeout(() => h.classList.remove('moving'), 700);
        });
      });
    });
  }

  /* ── Feature 9: Gantt Chart Zoom & Pan — MOD 13 zoom buttons ── */
  function initGanttZoom() {
    document.querySelectorAll('.gantt-wrap:not([data-zoom-init])').forEach(wrap => {
      wrap.dataset.zoomInit = '1';
      let scale = 1, isDragging = false, startX = 0, scrollStart = 0;

      /* Hint label */
      if (!wrap.querySelector('.gantt-zoom-hint')) {
        wrap.style.position = 'relative';
        wrap.appendChild(el('span', 'gantt-zoom-hint', 'Ctrl+Scroll to zoom · Drag to pan · Dbl-click to reset'));
      }

      function applyScale(newScale) {
        scale = Math.max(1, Math.min(5, newScale));
        const inner = wrap.querySelector('.gantt-chart') || wrap.firstElementChild;
        if (inner) inner.style.zoom = scale > 1 ? scale : '';
        wrap.style.overflowX = scale > 1 ? 'auto' : '';
        wrap.style.cursor = scale > 1 ? 'grab' : '';
        if (scale === 1) wrap.scrollLeft = 0;
      }

      /* MOD 13 – Zoom control buttons */
      if (!wrap.querySelector('.gantt-zoom-controls')) {
        const zoomControls = el('div', 'gantt-zoom-controls');
        zoomControls.style.cssText = 'display:flex;gap:4px;margin-top:4px;';
        const btnIn = el('button', 'zoom-ctrl-btn', '+');
        btnIn.type = 'button';
        btnIn.title = 'Zoom in';
        btnIn.dataset.dir = 'in';
        const btnOut = el('button', 'zoom-ctrl-btn', '&minus;');
        btnOut.type = 'button';
        btnOut.title = 'Zoom out';
        btnOut.dataset.dir = 'out';
        const btnReset = el('button', 'zoom-ctrl-btn', '&#x21BA;');
        btnReset.type = 'button';
        btnReset.title = 'Reset zoom';
        btnReset.dataset.dir = 'reset';

        btnIn.onclick = () => applyScale(scale * 1.25);
        btnOut.onclick = () => applyScale(scale / 1.25);
        btnReset.onclick = () => applyScale(1);

        zoomControls.append(btnIn, btnOut, btnReset);
        wrap.appendChild(zoomControls);
      }

      wrap.addEventListener('wheel', e => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.25 : 1 / 1.25;
        applyScale(scale * factor);
      }, { passive: false });

      wrap.addEventListener('mousedown', e => {
        if (scale <= 1) return;
        isDragging = true; startX = e.clientX; scrollStart = wrap.scrollLeft;
        wrap.style.cursor = 'grabbing'; e.preventDefault();
      });
      document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        wrap.scrollLeft = scrollStart - (e.clientX - startX);
      });
      document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        wrap.style.cursor = scale > 1 ? 'grab' : '';
      });
      wrap.addEventListener('dblclick', () => {
        applyScale(1);
      });
    });
  }

  /* ── Feature 14: Undo / Redo ───────────────────────── */
  function initUndoRedo() {
    if (document.body.dataset.undoInit) return;
    document.body.dataset.undoInit = '1';

    function snapshot() {
      const state = {};
      document.querySelectorAll('input:not([type=file]), select, textarea').forEach(x => {
        if (x.id) state[x.id] = x.type === 'checkbox' ? x.checked : x.value;
      });
      return state;
    }

    function push() {
      if (_inputLock) return;
      _inputHistory = _inputHistory.slice(0, _historyIdx + 1);
      _inputHistory.push(snapshot());
      if (_inputHistory.length > 60) _inputHistory.shift();
      _historyIdx = _inputHistory.length - 1;
    }

    function apply(snap) {
      _inputLock = true;
      Object.entries(snap).forEach(([id, val]) => {
        const input = document.getElementById(id);
        if (!input) return;
        if (input.type === 'checkbox') input.checked = val;
        else input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      _inputLock = false;
    }

    push(); // initial snapshot

    document.addEventListener('change', e => {
      if (e.target.matches('input, select, textarea')) push();
    });

    window._osUndoRedo = {
      undo() {
        if (_historyIdx > 0) { _historyIdx--; apply(_inputHistory[_historyIdx]); showToast('Undo'); }
        else showToast('Nothing to undo.');
      },
      redo() {
        if (_historyIdx < _inputHistory.length - 1) {
          _historyIdx++; apply(_inputHistory[_historyIdx]); showToast('Redo');
        } else showToast('Nothing to redo.');
      }
    };
  }

  /* ── Feature 15: Drag-to-Reorder Table Rows — MOD 23 ── */
  function initDragRows() {
    document.querySelectorAll(
      '.proc-table tbody:not([data-drag-init]), table.process-table tbody:not([data-drag-init])'
    ).forEach(tbody => {
      tbody.dataset.dragInit = '1';
      let dragSrc = null;

      /* Add header cell for the handle column */
      const headerRow = tbody.closest('table')?.querySelector('thead tr');
      if (headerRow && !headerRow.querySelector('.drag-handle-th')) {
        const th = document.createElement('th');
        th.className = 'drag-handle-th';
        th.title = 'Drag to reorder rows';
        headerRow.prepend(th);
      }

      function equip(row) {
        if (row.querySelector('.drag-handle')) return;
        const td = document.createElement('td');
        td.className = 'drag-handle';
        td.innerHTML = '&#8942;';
        td.title = 'Drag to reorder';
        row.prepend(td);
        row.draggable = true;

        row.addEventListener('dragstart', e => {
          dragSrc = row;
          e.dataTransfer.effectAllowed = 'move';
          row.classList.add('dragging');
        });
        row.addEventListener('dragend', () => {
          row.classList.remove('dragging');
          tbody.querySelectorAll('tr').forEach(r => r.classList.remove('drag-over'));
        });
        row.addEventListener('dragover', e => {
          e.preventDefault(); e.dataTransfer.dropEffect = 'move';
          tbody.querySelectorAll('tr').forEach(r => r.classList.remove('drag-over'));
          row.classList.add('drag-over');
        });
        row.addEventListener('drop', e => {
          e.preventDefault();
          if (dragSrc && dragSrc !== row) {
            const rows = [...tbody.rows];
            const si = rows.indexOf(dragSrc), di = rows.indexOf(row);
            if (si < di) tbody.insertBefore(dragSrc, row.nextSibling);
            else tbody.insertBefore(dragSrc, row);
            /* MOD 23 – More specific toast message */
            showToast('Row reordered — re-run simulation to update results.');
          }
          row.classList.remove('drag-over');
        });
      }

      [...tbody.rows].forEach(equip);

      /* Watch for dynamically added rows */
      new MutationObserver(muts => muts.forEach(m =>
        m.addedNodes.forEach(n => { if (n.tagName === 'TR') equip(n); })
      )).observe(tbody, { childList: true });
    });
  }

  /* ── MOD 14: Animated metric number rollup ─────────── */
  function animateMetricValue(elNode, endVal, duration) {
    if (!elNode) return;
    duration = duration || 600;
    const startTime = performance.now();
    const startVal = 0;
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = startVal + (endVal - startVal) * progress;
      elNode.textContent = Number.isInteger(endVal) ? Math.round(current) : current.toFixed(2);
      if (progress < 1) requestAnimationFrame(tick);
      else elNode.textContent = Number.isInteger(endVal) ? endVal : endVal.toFixed(2);
    }
    requestAnimationFrame(tick);
  }

  /* ── Feature 16: Metrics Comparison Bar Chart — MOD 11 delta indicators, MOD 14 rollup ── */
  function initMetricsChart() {
    if (document.getElementById('metricsChartPanel')) return;
    const target = document.querySelector('.viz-panel');
    if (!target) return;

    const panel = el('div', 'metrics-chart-panel');
    panel.id = 'metricsChartPanel';
    panel.innerHTML = `
      <div class="section-title">Algorithm Comparison</div>
      <div id="metricsChartInner">
        <span class="chart-empty-msg">Run algorithms to compare metrics here.</span>
      </div>`;
    target.appendChild(panel);

    function collectAndRender() {
      const algo = activeAlgoLabel();
      const cards = document.querySelectorAll('.metric-card');
      if (!cards.length) return;
      const data = {};
      cards.forEach(card => {
        const val = parseFloat(card.querySelector('.metric-value')?.textContent || '');
        const label = card.querySelector('.metric-label')?.textContent?.trim();
        if (label && !isNaN(val)) data[label] = val;
      });
      if (Object.keys(data).length) {
        _metricsStore[algo] = Object.assign(_metricsStore[algo] || {}, data);
        renderChart();
      }
    }

    function renderChart() {
      const algos = Object.keys(_metricsStore);
      if (!algos.length) return;
      const allMetrics = [...new Set(algos.flatMap(a => Object.keys(_metricsStore[a])))];
      const inner = document.getElementById('metricsChartInner');
      if (!inner) return;
      inner.innerHTML = allMetrics.map(metric => {
        const values = algos.map(a => ({ algo: a, val: _metricsStore[a][metric] ?? 0 }));
        const maxVal = Math.max(...values.map(v => v.val), 0.001);
        return `<div class="chart-metric-group">
          <div class="chart-metric-label">${metric}</div>
          ${values.map(v => `
            <div class="chart-bar-row">
              <span class="chart-algo-name" title="${v.algo}">${v.algo}</span>
              <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width:${(v.val/maxVal*100).toFixed(1)}%"></div>
              </div>
              <span class="chart-bar-val">${v.val.toFixed(1)}</span>
            </div>`).join('')}
        </div>`;
      }).join('');
    }

    /* MOD 11 – Delta indicators on metric cards, MOD 14 – animated rollup */
    function applyDeltasAndRollup() {
      const cards = document.querySelectorAll('.metric-card');
      const currentMetrics = {};
      cards.forEach(card => {
        const valEl = card.querySelector('.metric-value');
        const labelEl = card.querySelector('.metric-label');
        if (!valEl || !labelEl) return;
        const rawVal = parseFloat(valEl.textContent || '');
        const label = labelEl.textContent.trim();
        if (!isNaN(rawVal)) {
          currentMetrics[label] = rawVal;

          /* MOD 14 – Animate the value rolling up from 0 */
          animateMetricValue(valEl, rawVal, 600);

          /* MOD 11 – Delta indicator */
          let deltaSpan = card.querySelector('.metric-delta');
          if (!deltaSpan) {
            deltaSpan = el('span', 'metric-delta');
            deltaSpan.style.cssText = 'font-size:0.82em;margin-left:4px;font-weight:700;';
            labelEl.insertAdjacentElement('afterend', deltaSpan);
          }
          if (_prevMetrics.hasOwnProperty(label)) {
            const prev = _prevMetrics[label];
            if (rawVal < prev) {
              deltaSpan.textContent = ' ↓';
              deltaSpan.style.color = 'var(--success, #2e7d32)';
            } else if (rawVal > prev) {
              deltaSpan.textContent = ' ↑';
              deltaSpan.style.color = 'var(--danger, #d32f2f)';
            } else {
              deltaSpan.textContent = '';
            }
          } else {
            deltaSpan.textContent = '';
          }
        }
      });
      _prevMetrics = Object.assign({}, currentMetrics);
    }

    /* Hook existing and future run buttons */
    function hookRunBtn(btn) {
      if (btn.dataset.chartHooked) return;
      btn.dataset.chartHooked = '1';
      btn.addEventListener('click', () => {
        setTimeout(() => {
          collectAndRender();
          applyDeltasAndRollup();
        }, 700);
      });
    }
    document.querySelectorAll('#runBtn').forEach(hookRunBtn);
    new MutationObserver(() =>
      document.querySelectorAll('#runBtn:not([data-chart-hooked])').forEach(hookRunBtn)
    ).observe(document.body, { childList: true, subtree: true });
  }

  /* ── Feature 20: Trace Mode Annotations ────────────── */
  function initTraceAnnotations() {
    setInterval(() => {
      if (!document.body.classList.contains('trace-mode')) {
        document.querySelectorAll('.trace-annotation').forEach(a => a.remove());
        return;
      }
      document.querySelectorAll('.trace-annotation').forEach(a => a.remove());
      const current = document.querySelector(
        '.step-entry.current, .frame-cell.fault, .ref-token.current, .proc-row.state-running');
      if (current) {
        if (getComputedStyle(current).position === 'static') current.style.position = 'relative';
        const ann = el('span', 'trace-annotation', 'STEP');
        current.appendChild(ann);
      }
    }, 600);
  }

  /* ── Feature 24: Mobile Swipe Gestures ─────────────── */
  function initSwipeGestures() {
    if (document.body.dataset.swipeInit) return;
    document.body.dataset.swipeInit = '1';
    let tx = 0, ty = 0;
    document.addEventListener('touchstart', e => {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx) * 0.9) return;
      if (dx < 0) document.getElementById('stepFwdBtn')?.click();
      else document.getElementById('stepBackBtn')?.click();
    }, { passive: true });
  }

  /* ── Feature 25: Persist Input State ───────────────── */
  function initPersistInputs() {
    if (document.body.dataset.persistInit) return;
    document.body.dataset.persistInit = '1';
    const key = `os-inputs:${pageName()}`;

    /* Restore */
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      _inputLock = true;
      Object.entries(saved).forEach(([id, val]) => {
        const input = document.getElementById(id);
        if (input && input.type !== 'checkbox' && input.type !== 'button') {
          input.value = val;
          input.classList.add('restored-input');
          setTimeout(() => input.classList.remove('restored-input'), 1000);
        }
      });
      _inputLock = false;
    } catch (_) {}

    /* Save on change */
    let saveTimer;
    document.addEventListener('change', e => {
      if (!e.target.id || !e.target.matches('input:not([type=checkbox]), select, textarea')) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try {
          const saved = JSON.parse(localStorage.getItem(key) || '{}');
          saved[e.target.id] = e.target.value;
          localStorage.setItem(key, JSON.stringify(saved));
        } catch (_) {}
      }, 600);
    });
  }

  /* ── Progress Tracking ─────────────────────────────── */
  function markProgress() {
    const key = `progress:${pageName()}:${activeAlgoLabel()}`;
    localStorage.setItem(key, new Date().toISOString());
    const panel = document.querySelector('.coverage-panel');
    if (panel) renderCoverage(panel);
    /* Update checklist dots */
    document.querySelectorAll('.checklist-item').forEach(item => {
      const href = item.dataset.href;
      if (!href) return;
      const tried = Object.keys(localStorage).some(k => k.startsWith(`progress:${href}:`));
      item.querySelector('.checklist-dot')?.classList.toggle('done', tried);
    });
  }

  function renderCoverage(panel) {
    const tried = Object.keys(localStorage).filter(k => k.startsWith('progress:')).length;
    const total = 60;
    const pct = Math.min(100, Math.round(tried / total * 100));
    panel.innerHTML =
      `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>` +
      `<div class="text-xs text-muted">${tried} topics tried &middot; ${pct}% coverage</div>`;
  }

  /* ── Toast ─────────────────────────────────────────── */
  function showToast(text) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = el('div', 'global-toast'); toast.id = 'globalToast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ── State Collection (for export / share) ─────────── */
  function collectState() {
    const inputs = {};
    document.querySelectorAll('input, select, textarea').forEach(x => {
      if (x.id) inputs[x.id] = x.type === 'checkbox' ? x.checked : x.value;
    });
    return { module: currentModule().title, algorithm: activeAlgoLabel(),
      mode: document.body.dataset.learningMode, inputs };
  }

  function collectRows() {
    const rows = [['module', 'algorithm', 'field', 'value']];
    const state = collectState();
    Object.entries(state.inputs).forEach(([k, v]) =>
      rows.push([state.module, state.algorithm, k, String(v)]));
    return rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  function download(name, content) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = name; a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportSummaryPng() {
    const state = collectState();
    const canvas = document.createElement('canvas');
    canvas.width = 1200; canvas.height = 720;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--surface').trim() || '#edf4fb';
    ctx.fillRect(0, 0, 1200, 720);
    ctx.fillStyle = '#14212f';
    ctx.font = '700 42px Inter, Arial';    ctx.fillText('OS Algorithm Lesson Snapshot', 56, 84);
    ctx.font = '700 28px Inter, Arial';    ctx.fillText(state.module, 56, 146);
    ctx.font = '500 24px Inter, Arial';    ctx.fillText(`Algorithm: ${state.algorithm}`, 56, 194);
    ctx.fillText(`Mode: ${state.mode || 'learn'}`, 56, 236);
    ctx.font = '600 20px Inter, Arial';    ctx.fillText('Inputs', 56, 304);
    ctx.font = '500 18px Inter, Arial';
    Object.entries(state.inputs).slice(0, 14).forEach(([k, v], i) =>
      ctx.fillText(`${k}: ${v}`, 76, 340 + i * 28));
    ctx.fillStyle = '#1673c7'; ctx.fillRect(56, 650, 1088, 6);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png'); a.download = 'lesson-snapshot.png'; a.click();
  }

  /* ── MOD 50: Shareable URL state validation ─────────── */
  function applyUrlState() {
    const params = new URLSearchParams(location.search);
    const algo = params.get('algo');
    if (algo) {
      [...document.querySelectorAll('.algo-tab, .algo-option')]
        .find(x => x.textContent.trim().startsWith(algo))?.click();
    }
    if (!location.hash || location.hash.length < 5) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(1)))));
      if (!decoded || typeof decoded !== 'object' || !decoded.module || !decoded.inputs) {
        showToast('Saved URL state is incompatible with this version — using defaults.');
        return;
      }
      /* Apply inputs */
      Object.entries(decoded.inputs).forEach(([id, val]) => {
        const input = document.getElementById(id);
        if (input && input.type !== 'checkbox' && input.type !== 'button') {
          input.value = val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      showToast(`Loaded shared state: ${decoded.algorithm || decoded.module}`);
    } catch(e) {
      showToast('Saved URL state is incompatible with this version — using defaults.');
    }
  }

  /* ── MOD 1: Collapsible Side Panels ─────────────────── */
  function initCollapsiblePanels() {
    const panelDefs = [
      { selector: '.control-panel', arrow: '←', key: 'os-panel-control' },
      { selector: '.info-panel',    arrow: '→', key: 'os-panel-info'    }
    ];
    panelDefs.forEach(({ selector, arrow, key }) => {
      const panel = document.querySelector(selector);
      if (!panel || panel.dataset.collapseInit) return;
      panel.dataset.collapseInit = '1';

      const btn = el('button', 'panel-collapse-btn', arrow);
      btn.type = 'button';
      btn.title = 'Collapse/expand panel';
      btn.style.cssText =
        'position:absolute;top:8px;right:8px;z-index:10;cursor:pointer;' +
        'background:var(--surface2,#e0e8f0);border:none;border-radius:4px;' +
        'padding:2px 7px;font-size:1em;line-height:1.4;';

      if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
      panel.prepend(btn);

      /* Restore saved state */
      if (localStorage.getItem(key) === 'collapsed') {
        panel.classList.add('collapsed');
        btn.textContent = selector.includes('control') ? '→' : '←';
      }

      btn.onclick = () => {
        const isCollapsed = panel.classList.toggle('collapsed');
        if (selector.includes('control')) {
          btn.textContent = isCollapsed ? '→' : '←';
        } else {
          btn.textContent = isCollapsed ? '←' : '→';
        }
        localStorage.setItem(key, isCollapsed ? 'collapsed' : 'expanded');
      };
    });
  }

  /* ── MOD 5: Full-screen Viz Mode ────────────────────── */
  function initFullscreenMode() {
    function attachFullscreenBtn(vizPanel) {
      if (vizPanel.dataset.fsInit) return;
      vizPanel.dataset.fsInit = '1';

      /* Restore persisted state */
      if (localStorage.getItem('os-fullscreen') === '1') {
        vizPanel.classList.add('fullscreen-mode');
      }

      const btn = el('button', 'viz-fullscreen-btn', '&#x26F6;');
      btn.type = 'button';
      btn.title = 'Toggle fullscreen (F)';
      btn.style.cssText =
        'position:absolute;top:8px;right:8px;z-index:20;cursor:pointer;' +
        'background:var(--surface2,#e0e8f0);border:none;border-radius:4px;' +
        'padding:2px 8px;font-size:1.1em;line-height:1.4;';

      if (getComputedStyle(vizPanel).position === 'static') vizPanel.style.position = 'relative';
      vizPanel.prepend(btn);

      btn.onclick = () => {
        const active = vizPanel.classList.toggle('fullscreen-mode');
        localStorage.setItem('os-fullscreen', active ? '1' : '0');
      };
    }

    const existing = document.querySelector('.viz-panel');
    if (existing) {
      attachFullscreenBtn(existing);
    } else {
      /* Wait for .viz-panel to appear */
      const obs = new MutationObserver(() => {
        const vp = document.querySelector('.viz-panel');
        if (vp) { obs.disconnect(); attachFullscreenBtn(vp); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }

    /* Escape exits fullscreen */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const vp = document.querySelector('.viz-panel');
        if (vp && vp.classList.contains('fullscreen-mode')) {
          vp.classList.remove('fullscreen-mode');
          localStorage.setItem('os-fullscreen', '0');
        }
      }
    });
  }

  /* ── MOD 6: Persistent Panel Widths ─────────────────── */
  function initPanelResize() {
    const grid = document.querySelector('.page-layout-3');
    if (!grid || grid.dataset.resizeInit) return;
    grid.dataset.resizeInit = '1';

    /* Restore saved widths */
    const savedCols = localStorage.getItem('os-panel-cols');
    if (savedCols) grid.style.gridTemplateColumns = savedCols;

    /* Find column gap areas and insert a draggable handle */
    function addHandle(colIndex) {
      const handle = el('div', 'panel-resize-handle');
      handle.style.cssText =
        'grid-column:' + colIndex + ';cursor:col-resize;width:6px;' +
        'background:var(--border,#ccc);opacity:0.5;transition:opacity 0.2s;' +
        'z-index:5;user-select:none;';
      handle.onmouseenter = () => handle.style.opacity = '1';
      handle.onmouseleave = () => handle.style.opacity = '0.5';

      let startX, startCols;
      handle.addEventListener('mousedown', e => {
        e.preventDefault();
        startX = e.clientX;
        startCols = getComputedStyle(grid).gridTemplateColumns;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      function onMove(e) {
        const delta = e.clientX - startX;
        const parts = startCols.split(' ');
        if (parts.length < colIndex) return;
        const idx = colIndex - 1;
        const orig = parseFloat(parts[idx]);
        if (isNaN(orig)) return;
        parts[idx] = Math.max(120, orig + delta) + 'px';
        grid.style.gridTemplateColumns = parts.join(' ');
      }

      function onUp() {
        localStorage.setItem('os-panel-cols', grid.style.gridTemplateColumns);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      grid.appendChild(handle);
    }

    /* Add handles after column 1 and column 2 (before col 2 and col 3) */
    addHandle(1);
    addHandle(2);
  }

  /* ── MOD 8: Process Color Legend ────────────────────── */
  function initProcessColorLegend() {
    const tableEl = document.querySelector('.proc-table, .process-table');
    if (!tableEl) return;

    const vizPanel = document.querySelector('.viz-panel');
    if (!vizPanel) return;

    let legend = document.getElementById('procColorLegend');
    if (!legend) {
      legend = el('div', 'proc-color-legend');
      legend.id = 'procColorLegend';
      legend.style.cssText =
        'display:flex;flex-wrap:wrap;gap:8px;padding:6px 10px;' +
        'background:var(--surface2,#e8f0f8);border-radius:6px;margin-bottom:8px;font-size:0.82em;';
      const firstCard = vizPanel.querySelector('.card, .panel-card');
      if (firstCard) firstCard.insertAdjacentElement('beforebegin', legend);
      else vizPanel.prepend(legend);
    }

    const entries = [];
    tableEl.querySelectorAll('tbody tr').forEach(row => {
      const nameCell = row.querySelector('td:first-child, input[id*="proc"], input[id*="name"]');
      const colorChip = row.querySelector('.color-chip, [style*="background"], [class*="color"]');
      const label = nameCell ? (nameCell.textContent.trim() || nameCell.value || '') : '';
      if (!label) return;
      const color = colorChip
        ? (colorChip.style.backgroundColor || getComputedStyle(colorChip).backgroundColor || '#888')
        : '';
      if (label) entries.push({ label, color });
    });

    if (!entries.length) return;
    legend.innerHTML = '<strong style="margin-right:6px;">Processes:</strong>' +
      entries.map(e =>
        `<span style="display:inline-flex;align-items:center;gap:4px;">` +
        `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;` +
        `background:${e.color || 'var(--accent,#1673c7)'};border:1px solid #0003;"></span>` +
        `${e.label}</span>`
      ).join('');
  }

  /* ── MOD 22: Bulk Paste Support for Reference String Inputs ── */
  function initBulkPaste() {
    const selector = 'input#refInput, input[id*="ref"], textarea[id*="ref"]';
    function attachPaste(input) {
      if (input.dataset.bulkPaste) return;
      input.dataset.bulkPaste = '1';
      input.addEventListener('paste', e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const nums = text.split(/[\s,\n]+/).filter(s => /^\d+$/.test(s.trim())).map(s => s.trim());
        if (!nums.length) return;
        input.value = nums.join(' ');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        showToast(`Pasted ${nums.length} values — click Run to simulate`);
      });
    }
    document.querySelectorAll(selector).forEach(attachPaste);
    /* Watch for dynamic inputs */
    new MutationObserver(() =>
      document.querySelectorAll(selector + ':not([data-bulk-paste])').forEach(attachPaste)
    ).observe(document.body, { childList: true, subtree: true });
  }

  /* ── MOD 24: Add-Row Keyboard Shortcut ──────────────── */
  function initAddRowShortcut() {
    document.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const focused = document.activeElement;
      if (!focused || !/input/i.test(focused.tagName)) return;
      const tbody = focused.closest('.proc-table tbody, .process-table tbody');
      if (!tbody) return;
      const rows = [...tbody.querySelectorAll('tr')];
      if (!rows.length) return;
      const lastRow = rows[rows.length - 1];
      const inputsInLast = [...lastRow.querySelectorAll('input')];
      if (!inputsInLast.length || inputsInLast[inputsInLast.length - 1] !== focused) return;

      const addBtn = document.getElementById('addProcBtn');
      if (!addBtn) return;
      e.preventDefault();
      addBtn.click();
      /* Focus first input in new last row */
      setTimeout(() => {
        const newRows = [...tbody.querySelectorAll('tr')];
        const newRow = newRows[newRows.length - 1];
        newRow?.querySelector('input')?.focus();
      }, 50);
    });
  }

  /* ── MOD 25: Input History Dropdown (ref string) ────── */
  function initInputHistory() {
    const refInput = document.getElementById('refInput');
    if (!refInput || refInput.dataset.histInit) return;
    refInput.dataset.histInit = '1';

    const HISTORY_KEY = 'os-ref-history';
    const MAX_HISTORY = 5;

    function getHistory() {
      try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch(_) { return []; }
    }
    function saveHistory(arr) {
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch(_) {}
    }
    function pushHistory(val) {
      if (!val.trim()) return;
      let arr = getHistory().filter(x => x !== val);
      arr.unshift(val);
      arr = arr.slice(0, MAX_HISTORY);
      saveHistory(arr);
    }

    /* Wrap in a positioned container */
    const wrapper = el('span', 'ref-history-wrap');
    wrapper.style.cssText = 'position:relative;display:inline-block;';
    refInput.parentNode.insertBefore(wrapper, refInput);
    wrapper.appendChild(refInput);

    const clockBtn = el('button', 'ref-history-btn', '🕐');
    clockBtn.type = 'button';
    clockBtn.title = 'Show input history';
    clockBtn.style.cssText =
      'position:absolute;right:4px;top:50%;transform:translateY(-50%);' +
      'border:none;background:none;cursor:pointer;font-size:1em;padding:0 2px;';
    wrapper.appendChild(clockBtn);

    let dropdown = null;

    function closeDropdown() {
      if (dropdown) { dropdown.remove(); dropdown = null; }
    }

    clockBtn.onclick = e => {
      e.stopPropagation();
      if (dropdown) { closeDropdown(); return; }
      const history = getHistory();
      if (!history.length) { showToast('No reference string history yet.'); return; }
      dropdown = el('div', 'ref-history-dropdown');
      dropdown.style.cssText =
        'position:absolute;top:110%;left:0;right:0;background:var(--surface,#fff);' +
        'border:1px solid var(--border,#ccc);border-radius:6px;z-index:100;' +
        'box-shadow:0 4px 16px #0002;overflow:hidden;';
      history.forEach(item => {
        const opt = el('div', 'ref-history-item', item);
        opt.style.cssText = 'padding:6px 10px;cursor:pointer;font-family:monospace;font-size:0.9em;';
        opt.onmouseenter = () => opt.style.background = 'var(--surface2,#e8f0f8)';
        opt.onmouseleave = () => opt.style.background = '';
        opt.onclick = () => {
          refInput.value = item;
          refInput.dispatchEvent(new Event('input', { bubbles: true }));
          closeDropdown();
        };
        dropdown.appendChild(opt);
      });
      wrapper.appendChild(dropdown);
    };

    document.addEventListener('click', e => {
      if (dropdown && !wrapper.contains(e.target)) closeDropdown();
    });

    /* On successful run, push current value to history */
    document.getElementById('runBtn')?.addEventListener('click', () => {
      const val = refInput.value.trim();
      if (val) pushHistory(val);
    });
    /* Also hook future runBtns */
    new MutationObserver(() => {
      document.querySelectorAll('#runBtn:not([data-hist-hooked])').forEach(btn => {
        btn.dataset.histHooked = '1';
        btn.addEventListener('click', () => {
          const val = refInput.value.trim();
          if (val) pushHistory(val);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ── MOD 27: ARIA Live Region for Screen Readers ────── */
  function initAriaLive() {
    if (document.getElementById('osAriaLive')) return;
    const region = el('div', 'aria-live-region');
    region.id = 'osAriaLive';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;overflow:hidden;' +
      'clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    document.body.appendChild(region);

    window._osAnnounce = function(msg) {
      region.textContent = '';
      setTimeout(() => { region.textContent = msg; }, 10);
    };

    function announceCurrentStep() {
      const current = document.querySelector(
        '.step-entry.current, .dec-entry.current, .safety-step.current');
      if (current) window._osAnnounce(current.textContent.trim().replace(/\s+/g, ' '));
    }

    ['stepFwdBtn', 'stepBackBtn', 'playBtn'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => {
        setTimeout(announceCurrentStep, 150);
      });
    });

    /* Also hook future step buttons */
    new MutationObserver(() => {
      ['stepFwdBtn', 'stepBackBtn', 'playBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn && !btn.dataset.ariaHooked) {
          btn.dataset.ariaHooked = '1';
          btn.addEventListener('click', () => setTimeout(announceCurrentStep, 150));
        }
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ── DOMContentLoaded ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initBreadcrumbs();
    initHomeSearch();
    initBadges();
    initOnboarding();
    initExplanationPanel();
    initGlobalScrubber();
    initUndoRedo();          /* must be before initKeyboard */
    initKeyboard();
    initShortcutsPanel();
    initUtilityActions();
    initTeacherSummary();
    initGlossary();
    initValidationHints();
    initAnimatedStateTransitions();
    initSwipeGestures();
    initPersistInputs();
    applyUrlState();
    markProgress();

    /* MOD 1 */
    initCollapsiblePanels();
    /* MOD 5 */
    initFullscreenMode();
    /* MOD 6 */
    initPanelResize();
    /* MOD 8 */
    initProcessColorLegend();
    /* MOD 22 */
    initBulkPaste();
    /* MOD 24 */
    initAddRowShortcut();
    /* MOD 25 */
    initInputHistory();
    /* MOD 27 */
    initAriaLive();

    /* Poll for dynamically created DOM elements */
    setInterval(initGlossary,          2500);
    setInterval(initComplexityBadges,  1800);
    setInterval(initDragRows,          2000);
    setInterval(initGanttZoom,         2000);
    setInterval(initMetricsChart,      2500);
    setInterval(initTraceAnnotations,  600);
    setInterval(initValidationHints,   3000);
    setInterval(initCollapsiblePanels, 3000);
    setInterval(initProcessColorLegend, 2000);
    setInterval(initBulkPaste,         3000);
    setInterval(initInputHistory,      3000);
  });
})();
