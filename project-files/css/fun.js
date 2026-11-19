/* ==========================================================================
   fun.js — adds toasts, confetti, progress ring, greeting and sparkle.
   It only WATCHES your page; it never changes your table.js logic.
   Load with:  <script src="./fun.js" defer></script>   (after your other scripts)
   ========================================================================== *//*
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  const isInitialLoad = () => performance.now() - t0 < 2000;
  const num = (t) => {
    const m = String(t || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  };
  const debounce = (fn, ms = 60) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }; };

  /* ---------------- Toasts ---------------- *//*
  const stack = document.createElement('div');
  stack.className = 'toast-stack';
  stack.setAttribute('role', 'status');
  stack.setAttribute('aria-live', 'polite');
  document.body.appendChild(stack);

  function toast({ icon = '💡', title = '', msg = '', type = 'info', time = 4500 }) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.style.setProperty('--t', time + 'ms');
    el.innerHTML = `
      <div class="toast-icon" aria-hidden="true">${icon}</div>
      <div class="toast-body"><div class="toast-title"></div><div class="toast-msg"></div></div>
      <button class="toast-close" aria-label="Dismiss">×</button>
      <div class="toast-bar"></div>`;
    $('.toast-title', el).textContent = title;
    $('.toast-msg', el).textContent = msg;
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
    $('.toast-close', el).addEventListener('click', close);
    stack.appendChild(el);
    while (stack.children.length > 3) stack.firstChild.remove();
    setTimeout(close, time);
  }

  /* ---------------- Confetti ---------------- *//*
  function confetti(count = 120, big = false) {
    if (reduce) return;
    const c = document.createElement('canvas');
    Object.assign(c.style, { position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 650, pointerEvents: 'none' });
    c.width = innerWidth; c.height = innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#38bdf8', '#a78bfa'];
    const parts = Array.from({ length: count }, () => ({
      x: c.width / 2 + (Math.random() - .5) * (big ? c.width * .6 : 120),
      y: c.height * (big ? .35 : .75),
      vx: (Math.random() - .5) * (big ? 16 : 11),
      vy: -(Math.random() * (big ? 16 : 13) + 5),
      s: Math.random() * 7 + 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - .5) * .35,
      c: colors[(Math.random() * colors.length) | 0],
      round: Math.random() > .6,
    }));
    const start = performance.now();
    (function tick(now) {
      const age = now - start;
      ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach((p) => {
        p.vy += .38; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - age / 3200);
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, 7); ctx.fill(); }
        else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      age < 3200 ? requestAnimationFrame(tick) : c.remove();
    })(start);
  }

  /* ---------------- Greeting ---------------- *//*
  const h1 = $('.containers > h1');
  const userEl = $('.username-apper');
  let greet;
  if (h1) {
    greet = document.createElement('p');
    greet.className = 'greeting';
    h1.parentNode.insertBefore(greet, h1);
  }
  function updateGreeting() {
    if (!greet) return;
    const hr = new Date().getHours();
    const part = hr < 5 ? 'Still up' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    const name = userEl ? userEl.textContent.trim() : '';
    greet.innerHTML = `${part}${name ? ', ' : ''}<b></b> <span class="wave">👋</span>`;
    $('b', greet).textContent = name;
  }
  updateGreeting();
  if (userEl) new MutationObserver(updateGreeting).observe(userEl, { childList: true, characterData: true, subtree: true });

  /* ---------------- Progress card ---------------- *//*
  const card = document.createElement('div');
  card.className = 'progress-card';
  card.hidden = false;
  card.innerHTML = `
    <div class="ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="ring-track" cx="60" cy="60" r="52"/>
        <circle class="ring-bar" cx="60" cy="60" r="52"/>
      </svg>
      <div class="ring-text"><strong>0%</strong><span>to goal</span></div>
    </div>
    <div class="progress-info">
      <h3>Your progress</h3>
      <p class="progress-msg"></p>
      <div class="chips">
        <div class="chip"><b data-k="lost">0</b><small>lbs lost</small></div>
        <div class="chip"><b data-k="left">0</b><small>lbs to go</small></div>
        <div class="chip"><b data-k="weeks">0</b><small>weeks tracked</small></div>
      </div>
    </div>`;
  // normal place in the page: right after the Summary table
  const summaryArea = $('.summary-area');
  if (summaryArea) summaryArea.insertAdjacentElement('afterend', card);
  else document.body.appendChild(card);

  const ringBar = $('.ring-bar', card);
  const ringPct = $('.ring-text strong', card);
  const msgEl = $('.progress-msg', card);

  function countTo(el, to, decimals = 0) {
    const from = parseFloat(el.dataset.v || 0);
    el.dataset.v = to;
    if (reduce) { el.textContent = to.toFixed(decimals); return; }
    const t = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t) / 900);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (from + (to - from) * e).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    })(t);
  }


  const pctMessage = (p, reached) =>
    reached ? "You did it! Goal reached! 🏆" :
    p === 0 ? "Every journey starts with one step 🌱" :
    p < .25 ? "Great start — keep it going! 💪" :
    p < .5  ? "Building real momentum! 🚀" :
    p < .75 ? "Over halfway there! 🔥" :
              "So close you can taste it! 🏁";

  function showEmpty() {
    card.hidden = false;
    ringBar.style.strokeDashoffset = 326.7;
    ringPct.textContent = '0%';
    msgEl.textContent = 'Add your first weigh-in to start your journey! 🌱';
    countTo($('[data-k="lost"]', card), 0, 1);
    countTo($('[data-k="left"]', card), 0, 1);
    countTo($('[data-k="weeks"]', card), 0, 0);
  }

  let lastMilestone = null;
  let goalCelebrated = null;

  function onSummary() {
    const row = $('#summarys-list tr');
    if (!row || row.cells.length < 4) { showEmpty(); return; }
    const weeks = num(row.cells[0].textContent);
    const lost  = num(row.cells[2].textContent);
    const left  = num(row.cells[3].textContent);
    if (isNaN(lost)) { showEmpty(); return; }

    const total = Math.max(lost, 0) + Math.max(isNaN(left) ? 0 : left, 0);
    const reached = !isNaN(left) && left <= 0 && lost > 0;
    const pct = reached ? 1 : total > 0 ? Math.min(1, Math.max(0, lost) / total) : 0;

    card.hidden = false;
    ringBar.style.strokeDashoffset = 326.7 * (1 - pct);
    ringPct.textContent = Math.round(pct * 100) + '%';
    msgEl.textContent = pctMessage(pct, reached);
    countTo($('[data-k="lost"]', card),  Math.max(lost, 0), 1);
    countTo($('[data-k="left"]', card),  Math.max(isNaN(left) ? 0 : left, 0), 1);
    countTo($('[data-k="weeks"]', card), isNaN(weeks) ? 0 : weeks, 0);

    const mile = Math.floor(Math.max(lost, 0) / 5) * 5;
    if (lastMilestone === null) lastMilestone = mile;
    else if (mile > lastMilestone && mile > 0 && !isInitialLoad()) {
      toast({ icon: '🏅', type: 'celebrate', title: `Milestone: ${mile} lbs lost!`, msg: 'Amazing work. Your effort is paying off!', time: 6500 });
      confetti(160, true);
    }
    lastMilestone = mile;

    if (goalCelebrated === null) goalCelebrated = reached;
    else if (reached && !goalCelebrated && !isInitialLoad()) {
      toast({ icon: '🏆', type: 'celebrate', title: 'GOAL REACHED!', msg: 'You hit your target weight. Incredible!', time: 8000 });
      confetti(260, true);
    }
    goalCelebrated = reached;
  }

  /* ---------------- Table rows ---------------- *//*
  const list = $('#weight-loss-list');
  const section = list ? list.closest('section') : null;
  let empty;
  if (section) {
    empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<span class="big">🌱</span><b>No entries yet</b><br>Add your first weigh-in above to start your journey!';
    section.appendChild(empty);
  }
  let lastCount = list ? $$('tr', list).length : 0;

  function onRows() {
    if (!list) return;
    const rows = $$('tr', list);
    rows.forEach((tr) => {
      const c = tr.cells;
      if (c[2]) {
        const v = num(c[2].textContent);
        c[2].classList.toggle('loss', !isNaN(v) && v > 0);
        c[2].classList.toggle('gain', !isNaN(v) && v < 0);
      }
      $$('td', tr).forEach((td) => td.classList.toggle('badge-yes', /^\s*(yes|true|✅)/i.test(td.textContent)));
    });
    if (empty) empty.classList.toggle('show', rows.length === 0);

    if (!isInitialLoad()) {
      if (rows.length > lastCount) {
        toast({ icon: '✅', type: 'success', title: 'Entry saved!', msg: 'Another week in the books. Keep going!' });
        confetti(70);
      } else if (rows.length < lastCount) {
        toast({ icon: '🗑️', type: 'warn', title: 'Entry removed', msg: 'Your table and stats are updated.', time: 3500 });
      }
    }
    lastCount = rows.length;
  }

  if (list) new MutationObserver(debounce(onRows)).observe(list, { childList: true, subtree: true });
  const sum = $('#summarys-list');
  if (sum) new MutationObserver(debounce(onSummary)).observe(sum, { childList: true, subtree: true });
  onRows();
  onSummary();

  /* ---------------- Other friendly events ---------------- *//*
  const quotes = [
    ['💪', "Small steps every week add up to big change."],
    ['🌟', "You're doing better than you think!"],
    ['🥗', "Progress, not perfection."],
    ['🚀', "Consistency beats intensity. Keep showing up!"],
    ['💧', "Don't forget to drink some water today!"],
    ['🏃', "A 10-minute walk counts. Go for it!"],
    ['😴', "Good sleep helps your progress too."],
    ['🎯', "Eyes on the goal. You've got this!"],
  ];

  const fab = document.createElement('button');
  fab.id = 'cheerBtn';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Cheer me on');
  fab.title = 'Cheer me on!';
  fab.textContent = '🎉';
  document.body.appendChild(fab);
  fab.addEventListener('click', () => {
    const [icon, msg] = quotes[(Math.random() * quotes.length) | 0];
    toast({ icon, type: 'celebrate', title: 'Cheering for you!', msg, time: 5000 });
    confetti(80);
  });

  const themeToggle = $('#themeToggle');
  if (themeToggle) themeToggle.addEventListener('change', () =>
    toast({ icon: themeToggle.checked ? '🌙' : '☀️', title: themeToggle.checked ? 'Dark mode on' : 'Light mode on', msg: 'Your choice is applied.', time: 2200 }));

  const audio = $('#play-audio');
  if (audio) audio.addEventListener('change', () =>
    toast({ icon: audio.checked ? '🔊' : '🔇', title: audio.checked ? 'Celebration sound on' : 'Celebration sound off', msg: 'Saved for your next win.', time: 2200 }));

  const goalForm = $('#goal-form');
  if (goalForm) goalForm.addEventListener('submit', () => {
    if (goalForm.checkValidity()) toast({ icon: '🎯', type: 'success', title: 'Goal updated!', msg: 'New target locked in. Let\'s go!' });
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || reduce) return;
    const r = b.getBoundingClientRect();
    const d = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s);
    setTimeout(() => s.remove(), 600);
  });

  /* scroll-in reveal *//*
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
    }), { threshold: .08 });
    $$('.form-area, section, .search-form, .summary-area').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  /* one welcome pop-up per visit *//*
  try {
    if (!sessionStorage.getItem('welcomed')) {
      sessionStorage.setItem('welcomed', '1');
      setTimeout(() => toast({ icon: '👋', title: 'Welcome back!', msg: 'Log this week\'s weight and keep your streak alive.', time: 5500 }), 1200);
    }
  } catch (_) { /* storage blocked: ignore *//* }
})();*/