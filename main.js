/*==================== DARK / LIGHT THEME ====================*/
// Theme choice is persisted in localStorage so it survives page reloads.
const themeButton = document.getElementById('theme-button');
const darkTheme = 'dark-theme';
const iconTheme = 'bx-sun';

const selectedTheme = localStorage.getItem('selected-theme');
const selectedIcon = localStorage.getItem('selected-icon');

const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'bx-moon' : 'bx-sun';

// Apply the theme the user picked last time, if any.
if (selectedTheme) {
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme);
  themeButton.classList[selectedIcon === 'bx-moon' ? 'add' : 'remove'](iconTheme);
}

themeButton.addEventListener('click', () => {
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);
  localStorage.setItem('selected-theme', getCurrentTheme());
  localStorage.setItem('selected-icon', getCurrentIcon());
});

/*==================== LANGUAGE SWITCH (EN / ES) ====================*/
// Swaps every [data-i18n*] element's text using the dictionary defined
// in translations.js. Persisted in localStorage, same pattern as theme.
// The button always shows the language it will switch TO.
const langButton = document.getElementById('lang-button');

function applyLanguage(lang) {
  const dict = translations[lang];
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.dataset.i18nAriaLabel;
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (dict[key] !== undefined) el.setAttribute('title', dict[key]);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  // Typing subtitle: swap its source text. If the typing animation has
  // already finished, this just replaces the visible text directly
  // rather than re-running the character-by-character effect.
  const typingSubtitle = document.getElementById('typing-subtitle');
  const typingKey = typingSubtitle && typingSubtitle.dataset.i18nText;
  if (typingSubtitle && typingKey && dict[typingKey] !== undefined) {
    const cursor = typingSubtitle.querySelector('.typing-cursor');
    typingSubtitle.dataset.text = dict[typingKey];
    typingSubtitle.textContent = dict[typingKey];
    if (cursor) typingSubtitle.appendChild(cursor);
  }

  document.title = dict['meta.title'];
  const metaDescription = document.getElementById('meta-description');
  if (metaDescription) metaDescription.setAttribute('content', dict['meta.description']);

  langButton.textContent = lang === 'en' ? 'ES' : 'EN';
  currentLang = lang;
  localStorage.setItem('selected-lang', lang);
}

let currentLang = localStorage.getItem('selected-lang') || 'en';
applyLanguage(currentLang);

langButton.addEventListener('click', () => {
  applyLanguage(currentLang === 'en' ? 'es' : 'en');
});

/*==================== MOBILE MENU SHOW / HIDE ====================*/
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');

if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
if (navClose) navClose.addEventListener('click', () => navMenu.classList.remove('show-menu'));

// Auto-close the mobile menu once a link is tapped.
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => navMenu.classList.remove('show-menu'));
});

/*==================== ACTIVE NAV LINK ON SCROLL ====================*/
const sections = document.querySelectorAll('section[id]');

function scrollActiveLink() {
  const scrollY = window.pageYOffset;
  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    // 58px roughly matches the fixed header height so the link switches
    // slightly before the section reaches the very top of the viewport.
    const sectionTop = current.offsetTop - 58;
    const sectionId = current.getAttribute('id');
    const link = document.querySelector('.nav__menu a[href*="' + sectionId + '"]');
    if (link) {
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        link.classList.add('active-link');
      } else {
        link.classList.remove('active-link');
      }
    }
  });
}
window.addEventListener('scroll', scrollActiveLink);

/*==================== HEADER BACKGROUND ON SCROLL ====================*/
function scrollHeader() {
  const header = document.getElementById('header');
  if (window.scrollY >= 50) header.classList.add('bg-header');
  else header.classList.remove('bg-header');
}
window.addEventListener('scroll', scrollHeader);

/*==================== SCROLL-UP BUTTON ====================*/
function scrollUp() {
  const scrollUpBtn = document.getElementById('scroll-up');
  if (window.scrollY >= 350) scrollUpBtn.classList.add('show-scroll');
  else scrollUpBtn.classList.remove('show-scroll');
}
window.addEventListener('scroll', scrollUp);

/*==================== PROJECTS CAROUSEL (SWIPER) ====================*/
const swiper = new Swiper('.projects__container', {
  loop: true,
  spaceBetween: 24,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  breakpoints: {
    1200: { slidesPerView: 2, spaceBetween: 24 },
  },
});

/*==================== SCROLL-REVEAL ANIMATIONS ====================*/
// Adds the ".reveal--visible" class the first time an element enters the
// viewport, which triggers the fade/slide-in transition defined in CSS.
// Skipped entirely for users who prefer reduced motion.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealTargets.forEach(el => el.classList.add('reveal--visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));
}

/*==================== ANIMATED STAT COUNTERS ====================*/
// Counts each ".home__info-number" up from 0 to its "data-count" value
// once it scrolls into view, instead of just showing the final number.
function animateCounter(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1200; // ms
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.round(target * progress);
    el.textContent = String(value).padStart(2, '0') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterEls = document.querySelectorAll('.home__info-number[data-count]');
if (prefersReducedMotion) {
  counterEls.forEach(el => {
    el.textContent = String(el.dataset.count).padStart(2, '0') + (el.dataset.suffix || '');
  });
} else {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));
}

/*==================== TYPING EFFECT (HOME SUBTITLE) ====================*/
const typingEl = document.getElementById('typing-subtitle');
if (typingEl && !prefersReducedMotion) {
  const fullText = typingEl.dataset.text || typingEl.textContent.trim();
  const cursor = typingEl.querySelector('.typing-cursor');
  let charIndex = 0;

  function typeNextChar() {
    if (charIndex <= fullText.length) {
      typingEl.textContent = fullText.slice(0, charIndex);
      if (cursor) typingEl.appendChild(cursor);
      charIndex++;
      setTimeout(typeNextChar, 55);
    }
  }
  typeNextChar();
}

/*==================== SKILL LEVEL BARS ====================*/
// Each bar fill starts at width 0 (see CSS) and animates to its
// "data-level" percentage once the skills section is visible.
const skillBars = document.querySelectorAll('.skills__bar-fill');
if (prefersReducedMotion) {
  skillBars.forEach(bar => { bar.style.width = bar.dataset.level + '%'; });
} else {
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillBars.forEach(bar => { bar.style.width = bar.dataset.level + '%'; });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    skillsObserver.observe(skillsSection);
  }
}

/*==================== CONTACT FORM (FORMSPREE) ====================*/
// Submits the form with fetch() instead of a full page reload, so we can
// show an inline success/error message. Requires a real Formspree form ID
// in the form's "action" attribute (see index.html) to actually deliver
// messages to your inbox — sign up for free at https://formspree.io.
const contactForm = document.getElementById('contact-form');
const contactMessage = document.getElementById('contact-form-message');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formAction = contactForm.getAttribute('action');
    const formIsConfigured = formAction && !formAction.includes('YOUR_FORM_ID');

    submitButton.disabled = true;

    if (!formIsConfigured) {
      showContactMessage('error', translations[currentLang]['contact.form.notConfigured']);
      submitButton.disabled = false;
      return;
    }

    try {
      const response = await fetch(formAction, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        showContactMessage('success', translations[currentLang]['contact.form.success']);
        contactForm.reset();
      } else {
        showContactMessage('error', translations[currentLang]['contact.form.errorResponse']);
      }
    } catch (error) {
      showContactMessage('error', translations[currentLang]['contact.form.errorNetwork']);
    } finally {
      submitButton.disabled = false;
    }
  });
}

function showContactMessage(type, text) {
  if (!contactMessage) return;
  contactMessage.textContent = text;
  contactMessage.classList.remove('contact__form-message--success', 'contact__form-message--error');
  contactMessage.classList.add(`contact__form-message--${type}`);
  contactMessage.classList.add('contact__form-message--visible');
}
