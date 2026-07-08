

// ── PAGE TRANSITION OVERLAY ──
(function () {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;

  // Slide out on load
  overlay.classList.add('slide-out');
  setTimeout(() => overlay.classList.remove('slide-out'), 380);

  // Intercept all internal nav clicks
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('http')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('slide-in');
      setTimeout(() => { window.location.href = href; }, 360);
    });
  });
})();

// ── THEME (dark / light) ──
(function () {
  let stored = 'light';
  try {
    stored = localStorage.getItem('st-theme') || 'light';
  } catch (e) {
    console.warn('localStorage unavailable, defaulting to light theme.', e);
  }
  if (stored === 'light') document.body.classList.add('light');

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const mode = document.body.classList.contains('light') ? 'light' : 'dark';
      try {
        localStorage.setItem('st-theme', mode);
      } catch (e) {
        console.warn('localStorage unavailable, theme will not persist on reload.', e);
      }
    });
  });
})();

// ── NAVBAR SCROLL SHADOW ──
(function () {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const check = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

// ── HAMBURGER / MOBILE MENU ──
(function () {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
  });
  // close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      btn.classList.remove('open');
      menu.classList.remove('open');
    }
  });
  // close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
    });
  });
})();

// ── SCROLL REVEAL ──
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  els.forEach(el => io.observe(el));
})();

// ── COUNTER ANIMATION ──
(function () {
  document.querySelectorAll('[data-count]').forEach(el => {
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.unobserve(el);
      const target = +el.dataset.count;
      const dur = 1600;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });
})();

// ── PRODUCT FILTER (products.html) ──
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.prod-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const show = f === 'all' || c.dataset.cat === f;
        c.classList.toggle('hidden', !show);
        if (show) c.style.animation = 'fadeCardIn .3s ease';
      });
    });
  });

  const s = document.createElement('style');
  s.textContent = '@keyframes fadeCardIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}';
  document.head.appendChild(s);
})();

// ── CONTACT FORM (contact.html) — Web3Forms submission ──
(function () {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const error = document.getElementById('formError');
  if (!form || !success) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-primary');
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    success.style.display = 'none';
    if (error) error.style.display = 'none';

    try {
      const formData = new FormData(form); // access_key comes from hidden input

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        success.style.display = 'block';
        form.reset();
        setTimeout(() => { success.style.display = 'none'; }, 6000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      if (error) {
        error.style.display = 'block';
        setTimeout(() => { error.style.display = 'none'; }, 6000);
      }
    } finally {
      btn.textContent = original;
      btn.disabled = false;
    }
  });
})();