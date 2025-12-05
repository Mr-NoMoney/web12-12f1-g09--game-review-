/* script.js — robust tab + dark-mode + nation + contact handling
   Put this exact file in your project and overwrite existing script.js
*/


(() => {
  // helpers
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from((r || document).querySelectorAll(s));
  const log = (...a) => console.log('[WT]', ...a);


  // ensure HTML contains the expected elements
  const tabBtns = $$('.tab-btn');
  const tabContents = $$('.tab-content');
  const darkToggle = $('#darkToggle');
  const nationSelect = $('#nationSelect');
  const contactForm = document.querySelector('.contact-form');


  if (!tabBtns.length) log('No tab buttons (.tab-btn) found — check HTML.');
  if (!tabContents.length) log('No tab contents (.tab-content) found — check HTML.');
  if (!darkToggle) log('No dark toggle (#darkToggle) found — dark mode button required in header.');


  // Activate a tab by id
  function activateTab(tabId, pushState = true) {
    if (!tabId) return;
    const target = document.getElementById(tabId);
    if (!target) {
      log('activateTab: target tab not found for id', tabId);
      return;
    }


    // remove active classes
    tabBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
      b.setAttribute('aria-selected', b.dataset.tab === tabId ? 'true' : 'false');
      b.setAttribute('tabindex', b.dataset.tab === tabId ? '0' : '-1');
    });


    tabContents.forEach(c => {
      if (c.id === tabId) {
        c.classList.add('active');
        c.setAttribute('aria-hidden', 'false');
      } else {
        c.classList.remove('active');
        c.setAttribute('aria-hidden', 'true');
      }
    });


    // update url hash without jumping
    try {
      if (pushState && history && history.replaceState) history.replaceState(null, '', `#${tabId}`);
    } catch (err) { /* ignore */ }
  }


  // Click handlers for buttons
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.tab;
      activateTab(id);
    });


    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });


  // Initialize tabs: try hash, then first button
  (function initTabs() {
    const hash = location.hash ? location.hash.replace('#','') : null;
    const initial = hash && document.getElementById(hash) ? hash : (tabBtns[0] && tabBtns[0].dataset.tab);
    if (initial) activateTab(initial, false);
    // ensure at least one tab has tabindex 0 for accessibility
    tabBtns.forEach((b,i) => b.setAttribute('tabindex', b.classList.contains('active') ? '0' : '-1'));
  })();


  // keyboard navigation: left / right arrow
  document.addEventListener('keydown', (e) => {
    // ignore when typing in inputs/textareas
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const activeIndex = tabBtns.findIndex(b => b.classList.contains('active'));
      if (activeIndex === -1) return;
      const nextIndex = e.key === 'ArrowRight'
        ? (activeIndex + 1) % tabBtns.length
        : (activeIndex - 1 + tabBtns.length) % tabBtns.length;
      tabBtns[nextIndex].focus();
      tabBtns[nextIndex].click();
    }
  });


  // DARK MODE: toggles .dark on <html>
  if (darkToggle) {
    // restore preference
    const saved = localStorage.getItem('wt-dark-mode');
    if (saved === '1') document.documentElement.classList.add('dark');
    // ensure icon reflects mode
    updateDarkIcon();


    darkToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('wt-dark-mode', isDark ? '1' : '0');
      updateDarkIcon();
    });


    function updateDarkIcon() {
      const i = darkToggle.querySelector('i');
      if (!i) return;
      if (document.documentElement.classList.contains('dark')) {
        i.className = 'fa-solid fa-sun';
      } else {
        i.className = 'fa-solid fa-moon';
      }
    }
  }


  // NATION SELECT: show info box
  const nationDatabase = {
    "USA": "USA: Balanced tech trees, strong aircraft & combined arms. Known for versatility.",
    "Germany": "Germany: Excellent tanks and high-performance aircraft; good optics and shells.",
    "USSR": "USSR: Tough tanks, effective HEAT rounds, robust aircraft at many tiers.",
    "Japan": "Japan: Agile aircraft with great turn performance; lighter armor on tanks.",
    "Great Britain": "Great Britain: Accurate guns, excellent turreted tanks and naval units.",
    "China": "China: Recent additions with hybrid tech trees; varied options.",
    "Italy": "Italy: Light-to-medium vehicles and unique tank/airplay characteristics.",
    "France": "France: Auto-loading guns and fast tanks at certain tiers.",
    "Sweden": "Sweden: Precise guns and balanced vehicles; unique early designs.",
    "Israel": "Israel: Modern MBTs and advanced equipment in high tiers."
  };


  if (nationSelect) {
    const nationInfo = $('#nationInfo');
    if (!nationInfo) {
      log('nationSelect exists but #nationInfo not found — add <p id="nationInfo"> element to the Nations tab.');
    } else {
      nationInfo.style.display = 'none';
      nationSelect.addEventListener('change', (e) => {
        const v = e.target.value;
        if (!v) { nationInfo.style.display = 'none'; nationInfo.textContent = ''; return; }
        nationInfo.textContent = nationDatabase[v] || `Information about ${v} not available.`;
        nationInfo.style.display = 'block';
      });
    }
  }


  // CONTACT FORM: inline message, basic validation
  if (contactForm) {
    const messageEl = document.createElement('div');
    messageEl.className = 'form-message';
    messageEl.style.display = 'none';
    contactForm.appendChild(messageEl);


    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('input[type="text"]')?.value?.trim() || '';
      const email = contactForm.querySelector('input[type="email"]')?.value?.trim() || '';
      const msg = contactForm.querySelector('textarea')?.value?.trim() || '';


      if (!name || !email || !msg) {
        messageEl.style.display = 'block';
        messageEl.style.background = '#ffe6e6';
        messageEl.style.color = '#800';
        messageEl.textContent = 'Please fill all fields before sending.';
        return;
      }


      // simulate sending
      messageEl.style.display = 'block';
      messageEl.style.background = '#e6ffea';
      messageEl.style.color = '#064';
      messageEl.textContent = 'Thanks — your message was (simulated) sent.';


      contactForm.reset();
      setTimeout(() => messageEl.style.display = 'none', 4500);
    });
  }


  // small debug: log active tab on load
  const active = tabBtns.find(b => b.classList.contains('active'))?.dataset.tab || (tabBtns[0] && tabBtns[0].dataset.tab);
  if (active) log('initial active tab:', active);
})();



