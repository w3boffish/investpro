document.addEventListener('DOMContentLoaded', () => {
  // Global Supported Languages & Currencies
  const SUPPORTED_LANGS = ['en', 'fr', 'es', 'ar', 'zh'];
  const DEFAULT_LANG = 'en';
  const CURRENCY_CONFIG = {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.78 },
    SAR: { symbol: 'ر.س ', rate: 3.75 },
    CNY: { symbol: '¥', rate: 7.15 }
  };
  let currentCurrency = localStorage.getItem('investpro_currency') || 'USD';
  // DOM Elements
  const langSwitcher = document.getElementById('lang-switcher');
  const currencySwitcher = document.getElementById('currency-switcher');
  const footerLangLinks = document.querySelectorAll('[data-lang]');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const hamburgerBtn = document.getElementById('hamburger');
  const mainNav = document.querySelector('.main-nav');
  /**
   * 1. Multi-Currency Formatting Helper
   */
  function formatMoney(amountUSD) {
    const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.USD;
    const converted = amountUSD * config.rate;

    const formattedNum = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: converted >= 1000 ? 0 : 2
    }).format(converted);
    return `${config.symbol}${formattedNum}`;
  }
  function updatePageCurrencies() {
    const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.USD;
    // Update Pricing Card Prices
    document.querySelectorAll('.pricing-card .price').forEach(priceEl => {
      const valEl = priceEl.querySelector('.price-val');
      const symEl = priceEl.querySelector('.curr-sym');
      if (valEl && symEl) {
        const usdAmount = parseFloat(valEl.getAttribute('data-usd'));
        const converted = Math.round(usdAmount * config.rate);
        valEl.textContent = converted;
        symEl.textContent = config.symbol;
      }
    });
    if (currencySwitcher) {
      currencySwitcher.value = currentCurrency;
    }
  }
  if (currencySwitcher) {
    currencySwitcher.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      localStorage.setItem('investpro_currency', currentCurrency);
      updatePageCurrencies();
      renderMarketCards();
    });
  }
  /**
   * 2. Browser Language Detection & Translation Engine
   */
  function detectBrowserLanguage() {
    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || 'en'];
    for (let lang of browserLangs) {
      if (!lang) continue;
      const code = lang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGS.includes(code)) return code;
    }
    return DEFAULT_LANG;
  }
  function getInitialLanguage() {
    const saved = localStorage.getItem('investpro_lang');
    return (saved && SUPPORTED_LANGS.includes(saved)) ? saved : detectBrowserLanguage();
  }
  function getNestedTranslation(obj, keyPath) {
    return keyPath.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
  }
  function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
    const dict = translations[lang] || translations[DEFAULT_LANG];
    localStorage.setItem('investpro_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = getNestedTranslation(dict, key);
      if (text !== null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      }
    });
    if (dict.meta_title) document.title = dict.meta_title;
    if (langSwitcher && langSwitcher.value !== lang) langSwitcher.value = lang;
    footerLangLinks.forEach(link => {
      if (link.getAttribute('data-lang') === lang) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  const initialLang = getInitialLanguage();
  setLanguage(initialLang);
  if (langSwitcher) {
    langSwitcher.addEventListener('change', (e) => setLanguage(e.target.value));
  }
  footerLangLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setLanguage(link.getAttribute('data-lang'));
    });
  });
  /**
   * 3. Theme Switcher (Light / Dark Mode)
   */
  function getInitialTheme() {
    const savedTheme = localStorage.getItem('investpro_theme');
    if (savedTheme) return savedTheme;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'dark';
  }
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('investpro_theme', theme);
  }
  setTheme(getInitialTheme());
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'light' : 'dark');
    });
  }
  /**
   * 4. Mobile Menu Drawer
   */
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', () => {
      const expanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', !expanded);
      mainNav.classList.toggle('active');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
  /**
   * 5. Live Market Assets Ticker Data & Simulation
   */
  const marketAssets = [
    { symbol: 'BTC/USD', name: 'Bitcoin', priceUSD: 64250, change: 3.42, category: 'crypto' },
    { symbol: 'ETH/USD', name: 'Ethereum', priceUSD: 3480, change: 2.15, category: 'crypto' },
    { symbol: 'AAPL', name: 'Apple Inc.', priceUSD: 224.30, change: 1.12, category: 'stocks' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', priceUSD: 118.50, change: 5.84, category: 'stocks' },
    { symbol: 'TSLA', name: 'Tesla Inc.', priceUSD: 235.10, change: -1.45, category: 'stocks' },
    { symbol: 'AMZN', name: 'Amazon.com', priceUSD: 186.40, change: 0.88, category: 'stocks' },
    { symbol: 'MSFT', name: 'Microsoft', priceUSD: 448.20, change: 1.65, category: 'stocks' }
  ];
  function renderTicker() {
    const track = document.getElementById('ticker-track');
    if (!track) return;
    let html = '';
    marketAssets.forEach(asset => {
      const isPos = asset.change >= 0;
      const changeClass = isPos ? 'pos' : 'neg';
      const sign = isPos ? '+' : '';
      html += `
        <div class="ticker-item">
          <span class="t-sym">${asset.symbol}</span>
          <span class="t-price">${formatMoney(asset.priceUSD)}</span>
          <span class="t-change ${changeClass}">${sign}${asset.change}%</span>
        </div>
      `;
    });
    track.innerHTML = html + html;
  }
  let activeMarketFilter = 'all';
  function renderMarketCards() {
    const container = document.getElementById('market-cards-container');
    if (!container) return;
    const filtered = marketAssets.filter(a => activeMarketFilter === 'all' || a.category === activeMarketFilter);
    container.innerHTML = filtered.map(a => {
      const isPos = a.change >= 0;
      const changeClass = isPos ? 'card-pos' : 'card-neg';
      const sign = isPos ? '+' : '';
      return `
        <div class="market-card">
          <div class="m-card-header">
            <h4>${a.name}</h4>
            <span class="m-symbol">${a.symbol}</span>
          </div>
          <div class="m-card-price-row">
            <span class="m-price">${formatMoney(a.priceUSD)}</span>
            <span class="m-change ${changeClass}">${sign}${a.change}%</span>
          </div>
        </div>
      `;
    }).join('');
  }
  // Filter tab buttons
  document.querySelectorAll('.market-filter-tabs .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.market-filter-tabs .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMarketFilter = btn.getAttribute('data-filter');
      renderMarketCards();
    });
  });
  // Simulated Price Updates
  setInterval(() => {
    marketAssets.forEach(asset => {
      const delta = (Math.random() - 0.48) * 0.5;
      asset.priceUSD = Math.max(1, asset.priceUSD + delta);
      asset.change = parseFloat((asset.change + (delta > 0 ? 0.05 : -0.05)).toFixed(2));
    });
    renderTicker();
    renderMarketCards();
  }, 3500);
  renderTicker();
  renderMarketCards();
  /**
   * 6. Password Visibility Toggle & Strength Meter for Auth Pages
   */
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');
  const loginPassword = document.getElementById('login-password');
  if (togglePwdBtn && loginPassword) {
    togglePwdBtn.addEventListener('click', () => {
      const isPwd = loginPassword.type === 'password';
      loginPassword.type = isPwd ? 'text' : 'password';
      togglePwdBtn.textContent = isPwd ? '🙈' : '👁️';
    });
  }
  const togglePwdBtnSignup = document.getElementById('toggle-pwd-btn-signup');
  const signupPassword = document.getElementById('signup-password');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  if (togglePwdBtnSignup && signupPassword) {
    togglePwdBtnSignup.addEventListener('click', () => {
      const isPwd = signupPassword.type === 'password';
      signupPassword.type = isPwd ? 'text' : 'password';
      togglePwdBtnSignup.textContent = isPwd ? '🙈' : '👁️';
    });
  }
  if (signupPassword && strengthBar && strengthText) {
    signupPassword.addEventListener('input', (e) => {
      const val = e.target.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      const dict = translations[document.documentElement.lang || 'en'] || translations.en;
      const t = dict.auth || {};
      if (val.length === 0) {
        strengthBar.style.width = '0%';
        strengthText.textContent = '';
      } else if (score <= 1) {
        strengthBar.style.width = '33%';
        strengthBar.style.background = '#ef4444';
        strengthText.textContent = t.pwd_weak || 'Weak password';
        strengthText.style.color = '#ef4444';
      } else if (score <= 3) {
        strengthBar.style.width = '66%';
        strengthBar.style.background = '#f59e0b';
        strengthText.textContent = t.pwd_medium || 'Medium strength';
        strengthText.style.color = '#f59e0b';
      } else {
        strengthBar.style.width = '100%';
        strengthBar.style.background = '#10b981';
        strengthText.textContent = t.pwd_strong || 'Strong password';
        strengthText.style.color = '#10b981';
      }
    });
  }
  // Initial Currencies formatting
  updatePageCurrencies();
});
