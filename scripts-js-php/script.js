// CURSOR + AURA
const aura   = document.getElementById('aura');
const cursor = document.getElementById('cursor');

let mouseX = 0, mouseY = 0;
let auraX  = 0, auraY  = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
});

function animateAura() {
    auraX += (mouseX - auraX) * 0.24;
    auraY += (mouseY - auraY) * 0.24;
    aura.style.left = auraX + 'px';
    aura.style.top  = auraY + 'px';
    requestAnimationFrame(animateAura);
}
animateAura();

const interactiveSelector = 'button, a, input[type="submit"], .mouse-selectable';
document.addEventListener('pointerover', e => {
    const target = e.target instanceof Element ? e.target.closest(interactiveSelector) : null;
    if (!target) return;
    aura.classList.add('hovered');
    cursor.classList.add('hidden');
});
document.addEventListener('pointerout', e => {
    const target = e.target instanceof Element ? e.target.closest(interactiveSelector) : null;
    if (!target) return;
    const related = e.relatedTarget instanceof Element ? e.relatedTarget.closest(interactiveSelector) : null;
    if (related === target) return;
    aura.classList.remove('hovered');
    cursor.classList.remove('hidden');
});

document.addEventListener('mousedown', () => {
    aura.classList.add('clicked');
});

document.addEventListener('mouseup', () => {
    aura.classList.remove('clicked');
});

(() => {
    const overlay = document.querySelector(".page-fade");
    if (!overlay) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function isModifiedEvent(event) {
        return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    }

    function shouldIgnoreLink(link, event) {
        if (event.defaultPrevented || isModifiedEvent(event)) {
            return true;
        }

        if (link.hasAttribute("download")) {
            return true;
        }

        const target = link.getAttribute("target");
        if (target && target.toLowerCase() === "_blank") {
            return true;
        }

        const href = link.getAttribute("href");
        if (!href) {
            return true;
        }

        if (href.charAt(0) === "#") {
            return true;
        }

        const lowered = href.toLowerCase();
        if (lowered.indexOf("mailto:") === 0 || lowered.indexOf("tel:") === 0 || lowered.indexOf("javascript:") === 0) {
            return true;
        }

        try {
            const url = new URL(link.href, window.location.href);
            if (
                url.origin === window.location.origin &&
                url.pathname === window.location.pathname &&
                url.search === window.location.search &&
                url.hash
            ) {
                return true;
            }
        } catch (error) {
            return true;
        }

        return false;
    }

    function hideOverlay() {
        overlay.classList.remove("page-fade--active");
    }

    document.addEventListener("DOMContentLoaded", () => {
        window.setTimeout(hideOverlay, 20);
    });

    window.addEventListener("pageshow", event => {
        if (event.persisted) {
            hideOverlay();
        }
    });

    document.addEventListener("click", event => {
        const link = event.target instanceof Element ? event.target.closest("a") : null;
        if (!link || shouldIgnoreLink(link, event)) {
            return;
        }

        const url = link.href;
        event.preventDefault();
        overlay.classList.add("page-fade--active");

        const delay = prefersReducedMotion.matches ? 0 : 260;
        window.setTimeout(() => {
            window.location.href = url;
        }, delay);
    });
})();


// PRICES
fetch('scripts-js-php/service-prices.json')
    .then(r => r.json())
    .then(services => {
    services.forEach(service => {
        const priceEl = document.getElementById(`service-price-${service.id}`);
        const timelineEl = document.getElementById(`service-timeline-${service.id}`);
        if (priceEl) priceEl.textContent = `\u0426\u0435\u043d\u0430 \u043d\u0430\u0447\u0438\u043d\u0430\u0435\u0442\u0441\u044f \u043e\u0442 ${service.price}`;
        if (timelineEl) timelineEl.textContent = `\u0412\u0440\u0435\u043c\u0435\u043d\u043d\u044b\u0435 \u0440\u0430\u043c\u043a\u0438: ${service.timeline}`;
    });
});

let translations = {};
let currentLang = localStorage.getItem('siteLang') || 'ru';
let servicePrices = [];

fetch('/scripts-js-php/lang.json')
  .then(r => r.json())
  .then(data => {
    translations = data;
    setLang(currentLang);
    updateServicePrices(currentLang);
  });

fetch('/scripts-js-php/service-prices.json')
  .then(r => r.json())
  .then(services => {
    servicePrices = services;
    updateServicePrices(currentLang);
  });

function updateServicePrices(lang) {
  if (!translations[lang]) return;
  servicePrices.forEach(service => {
    const priceEl = document.getElementById(`service-price-${service.id}`);
    const timelineEl = document.getElementById(`service-timeline-${service.id}`);
    if (priceEl) {
      if (priceEl.dataset.priceLabel === "false") {
        priceEl.textContent = service.price;
      } else {
        priceEl.textContent = `${translations[lang]["service-price-label"]} ${service.price}`;
      }
    }
    if (timelineEl && service.timeline && service.timeline[lang]) {
      timelineEl.textContent = `${translations[lang]["service-timeline-label"]} ${service.timeline[lang]}`;
    }
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('siteLang', lang);

  // translate data-i18n
  // Translate elements with data-i18n (supports [attr]key syntax)
  const applyI18n = (el) => {
    const specRaw = el.getAttribute('data-i18n');
    if (!specRaw) return;
    const specs = specRaw.split(';').map(s => s.trim()).filter(Boolean);
    const t = translations[lang];
    if (!t) return;
    specs.forEach(spec => {
      const m = spec.match(/^\[([^\]]+)\](.+)$/);
      if (m) {
        const attr = m[1].trim();
        const key = m[2].trim();
        const val = t[key];
        if (val == null) return;
        if (attr.toLowerCase() === 'html') {
          el.innerHTML = val;
        } else if (attr.toLowerCase() === 'text') {
          el.textContent = val;
        } else {
          el.setAttribute(attr, val);
        }
      } else {
        const key = spec;
        const val = t[key];
        if (val == null) return;
        el.innerHTML = val;
      }
    });
  };
  
  document.querySelectorAll('[data-i18n]').forEach(el => applyI18n(el));

  // LANGUAGE ICON CHANGE
  const langIcon = document.getElementById('header-lang-icon');
  if (langIcon) {
    langIcon.src = lang === 'ru'
      ? '/src/graphics/png/header-lang-ru.png'
      : '/src/graphics/png/header-lang-en.png';
  }

  // BUTTON SELECTION REFRESHER
  document.querySelectorAll('.header__lang-switcher-item')
    .forEach(btn => {
      btn.classList.toggle(
        'header__lang-switcher-item--selected',
        btn.getAttribute('data-lang') === lang
      );
    });

  updateServicePrices(lang);
}

function initHeaderMenu() {
  const header = document.querySelector('.header');
  if (!header || header.classList.contains('header--menu-ready')) {
    return;
  }

  const nav = header.querySelector('.header__nav');
  const lang = header.querySelector('.header__lang');
  if (!nav || !lang) {
    return;
  }

  header.classList.add('header--menu-ready');

  const burger = document.createElement('button');
  burger.className = 'header__burger';
  burger.type = 'button';
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'header-menu');
  burger.innerHTML = [
    '<span class="header__burger-line"></span>',
    '<span class="header__burger-line"></span>',
    '<span class="header__burger-line"></span>',
  ].join('');

  const menu = document.createElement('div');
  menu.className = 'header__menu';
  menu.id = 'header-menu';
  menu.setAttribute('aria-hidden', 'true');

  const panel = document.createElement('div');
  panel.className = 'header__menu-panel';

  const logo = header.querySelector('.header__logo');
  if (logo) {
    logo.insertAdjacentElement('afterend', burger);
  } else {
    header.insertBefore(burger, nav);
  }
  burger.insertAdjacentElement('afterend', menu);
  menu.appendChild(panel);
  panel.appendChild(nav);
  panel.appendChild(lang);

  const overlay = document.createElement('button');
  overlay.className = 'header__menu-overlay';
  overlay.type = 'button';
  overlay.setAttribute('data-menu-close', '');
  overlay.setAttribute('aria-label', 'Close menu');
  header.appendChild(overlay);

  const toggleMenu = (forceOpen) => {
    const shouldOpen = typeof forceOpen === 'boolean'
      ? forceOpen
      : !header.classList.contains('header--menu-open');
    header.classList.toggle('header--menu-open', shouldOpen);
    burger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    menu.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');
    document.body.classList.toggle('menu-open', shouldOpen);
  };

  burger.addEventListener('click', () => toggleMenu());
  overlay.addEventListener('click', () => toggleMenu(false));
  menu.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (!link) return;
    toggleMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      toggleMenu(false);
    }
  });

  const desktopQuery = window.matchMedia('(min-width: 1024px)');
  const handleDesktopChange = () => {
    if (desktopQuery.matches) {
      toggleMenu(false);
    }
  };
  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleDesktopChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleDesktopChange);
  }
  handleDesktopChange();
}

document.addEventListener('click', e => {
  const target = e.target instanceof Element ? e.target.closest('.header__lang-switcher-item') : null;
  if (!target) return;
  setLang(target.getAttribute('data-lang'));
});

let reviewsSwiper = null;

function initReviewsSwiper() {
  if (reviewsSwiper || typeof Swiper !== 'function') {
    return;
  }

  const swiperContainer = document.querySelector('.swiper');
  if (!swiperContainer) {
    return;
  }

  const options = {
    loop: true,
  };

  const paginationEl = swiperContainer.querySelector('.swiper-pagination');
  if (paginationEl) {
    options.pagination = {
      el: paginationEl,
    };
  }

  const nextEl = swiperContainer.querySelector('.swiper-button-next');
  const prevEl = swiperContainer.querySelector('.swiper-button-prev');
  if (nextEl && prevEl) {
    options.navigation = {
      nextEl,
      prevEl,
    };
  }

  const scrollbarEl = swiperContainer.querySelector('.swiper-scrollbar');
  if (scrollbarEl) {
    options.scrollbar = {
      el: scrollbarEl,
    };
  }

  reviewsSwiper = new Swiper(swiperContainer, options);
}

document.addEventListener('includes:loaded', () => {
  setLang(currentLang);
  initHeaderMenu();
  initReviewsSwiper();
  initContactForms();
});

// Initialize FAQ accordion only when the container exists to avoid runtime errors on pages without it
const accordionContainer = document.querySelector('.accordion-container');
if (accordionContainer) {
  new Accordion('.accordion-container', {
    duration: 300,
    showMultiple: false,
    collapse: true,
    openOnInit: [0],
  });
}

//SWIPER INITIALIZATION
initReviewsSwiper();

const CONTACT_FORM_ENDPOINT = '/api/contact.php';
const ALLOWED_CONTACT_METHODS = new Set(['mail', 'messenger', 'phone']);
const ALLOWED_SERVICES = new Set([
  'llc-ie',
  'ready-company',
  'residence',
  'citizenship',
  'accounting',
  'social-card',
  'bank-card',
  'registration',
  'logistics',
  'other',
]);
const CONTACT_FORM_MESSAGES = {
  sending: '\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c \u0437\u0430\u044f\u0432\u043a\u0443...',
  genericError: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437 \u043d\u0435\u043c\u043d\u043e\u0433\u043e \u043f\u043e\u0437\u0436\u0435.',
};
const CONTACT_FORM_SUCCESS_CONTENT = {
  iconPath: '/src/graphics/svg/citizenship-icon1.svg',
  title: '\u0421\u043f\u0430\u0441\u0438\u0431\u043e. \u0412\u0430\u0448\u0430 \u0437\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430!',
  text: '\u041d\u0430\u0448 \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442 \u0441\u0432\u044f\u0436\u0435\u0442\u0441\u044f \u0441 \u0432\u0430\u043c\u0438 \u0432 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043c\u044f.',
};



function getContactFormStatus(form) {
  let status = form.querySelector('.form__status');
  if (status) return status;

  status = document.createElement('p');
  status.className = 'form__status';
  status.setAttribute('aria-live', 'polite');
  form.appendChild(status);
  return status;
}
function getContactFormSuccessPanel(form) {
  let panel = form.querySelector('.form__success');
  if (panel) return panel;

  panel = document.createElement('div');
  panel.className = 'form__success';
  panel.hidden = true;

  const icon = document.createElement('img');
  icon.className = 'form__success-icon';
  icon.src = CONTACT_FORM_SUCCESS_CONTENT.iconPath;
  icon.alt = '\u0417\u0430\u044f\u0432\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430';
  icon.width = 300;
  icon.height = 300;

  const title = document.createElement('h3');
  title.className = 'form__success-title';
  title.textContent = CONTACT_FORM_SUCCESS_CONTENT.title;

  const text = document.createElement('p');
  text.className = 'form__success-text';
  text.textContent = CONTACT_FORM_SUCCESS_CONTENT.text;

  panel.append(icon, title, text);
  form.appendChild(panel);
  return panel;
}

function setContactFormStatus(form, type, text) {
  const status = getContactFormStatus(form);
  status.classList.remove(
    'form__status--info',
    'form__status--success',
    'form__status--error',
    'form__status--visible'
  );

  if (!text) {
    status.textContent = '';
    return;
  }

  status.textContent = text;
  status.classList.add(`form__status--${type}`, 'form__status--visible');
}

function clearFormFieldState(form) {
  form.querySelectorAll('.form__field--invalid').forEach(field => {
    field.classList.remove('form__field--invalid');
  });

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.setCustomValidity('');
  });
}

function markFieldError(form, fieldName, message) {
  const fields = form.querySelectorAll(`[name="${fieldName}"]`);
  if (!fields.length) return;

  fields.forEach((field, index) => {
    field.classList.add('form__field--invalid');
    field.setCustomValidity(index === 0 ? message : '');
  });
}

function collectContactFormPayload(form) {
  const formData = new FormData(form);

  return {
    name: String(formData.get('name') || '').trim(),
    preferredContactMethod: String(formData.get('feedback') || '').trim(),
    contactCredentials: String(formData.get('feedback-credentials') || '').trim(),
    service: String(formData.get('service') || '').trim(),
    message: String(formData.get('message') || '').trim(),
  };
}

function validateContactPayload(payload) {
  const errors = {};

  if (payload.name.length < 2 || payload.name.length > 120) {
    errors.name = '\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0438\u043c\u044f \u0438\u043b\u0438 \u043d\u0438\u043a \u043e\u0442 2 \u0434\u043e 120 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432.';
  }

  if (!ALLOWED_CONTACT_METHODS.has(payload.preferredContactMethod)) {
    errors.feedback = '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0438\u0442\u0430\u0435\u043c\u044b\u0439 \u0441\u043f\u043e\u0441\u043e\u0431 \u0441\u0432\u044f\u0437\u0438.';
  }

  if (payload.contactCredentials.length < 3 || payload.contactCredentials.length > 160) {
    errors['feedback-credentials'] = '\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u043d\u0442\u0430\u043a\u0442 \u0434\u043b\u044f \u0441\u0432\u044f\u0437\u0438 \u043e\u0442 3 \u0434\u043e 160 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432.';
  }

  if (!ALLOWED_SERVICES.has(payload.service)) {
    errors.service = '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0443\u0441\u043b\u0443\u0433\u0443 \u0438\u0437 \u0441\u043f\u0438\u0441\u043a\u0430.';
  }

  if (payload.message.length > 2000) {
    errors.message = '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u043f\u0440\u0435\u0432\u044b\u0448\u0430\u0442\u044c 2000 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432.';
  }

  return errors;
}

async function sendContactPayload(payload) {
  const response = await fetch(CONTACT_FORM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    const serverMessage = data && typeof data.error === 'string' ? data.error : null;
    throw new Error(serverMessage || CONTACT_FORM_MESSAGES.genericError);
  }
}

async function handleContactFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.classList.contains('form--submitted')) return;

  clearFormFieldState(form);

  const payload = collectContactFormPayload(form);
  const errors = validateContactPayload(payload);

  if (Object.keys(errors).length) {
    Object.entries(errors).forEach(([fieldName, message]) => {
      markFieldError(form, fieldName, message);
    });
    form.reportValidity();
    setContactFormStatus(form, 'error', '\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435 \u043f\u043e\u043b\u0435\u0439 \u0444\u043e\u0440\u043c\u044b.');
    return;
  }

  setContactFormStatus(form, 'info', CONTACT_FORM_MESSAGES.sending);

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;

  try {
    await sendContactPayload(payload);
    setContactFormStatus(form, 'success', '');
    form.reset();
    const successPanel = getContactFormSuccessPanel(form);
    successPanel.hidden = false;
    form.classList.add('form--submitted');
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : CONTACT_FORM_MESSAGES.genericError;
    setContactFormStatus(form, 'error', message);
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

function initContactForms() {
  document.querySelectorAll('form.form').forEach(form => {
    if (form.dataset.contactFormReady === 'true') return;
    form.dataset.contactFormReady = 'true';
    getContactFormSuccessPanel(form);
    form.addEventListener('submit', handleContactFormSubmit);
  });
}

initContactForms();

// var swiper = new Swiper(".swiper", {

//   loop: true,

//   effect: "coverflow",
//   grabCursor: true,
//   centeredSlides: true,
//   slidesPerView: "auto",
//   coverflowEffect: {
//     rotate: 45,
//     stretch: 0,
//     depth: 100,
//     modifier: 1,
//     slideShadows: true,
//   },
//   pagination: {
//     el: ".swiper-pagination",
//   },
// });


/////////////////////////////////////////////////////////////
// GSAP //
////////////////////////////////////////////////////////////
gsap.registerPlugin(ScrollTrigger);

//Backer reveal

let backer = document.querySelector(".backer");
let backerTrigger = document.querySelector(".backer-trigger");

gsap.from(backer, {
  scrollTrigger: {
    trigger: backerTrigger,
    start: "bottom 20%",
    end: "600px 20%",
    // markers: true,
    scrub: 1.3
  },
  x:100,
  scale: 0.2,
  duration: 2,
  ease: "elastic.inOut"
})

//RESIDENCE-PERMIT ANIMATION


console.log('GSAP illustration init');

let rpDoc = document.querySelector(".registration__illustration-part-1");
let rpPrint = document.querySelector(".registration__illustration-part-2");
let rpStampLowBack = document.querySelector(".registration__illustration-part-3-back");
let rpStampLowFront = document.querySelector(".registration__illustration-part-3-front");
let rpStampHighBack = document.querySelector(".registration__illustration-part-4-back");
let rpStampHighFront = document.querySelector(".registration__illustration-part-4-front");

let stampTween = gsap.from(rpPrint, {opacity: 0, paused: true});

let tlRP = gsap.timeline({repeat: -1, defaults: {duration: 2}});

tlRP.to(rpStampHighBack, {x:-145,y: -20, ease: "expo.inOut"}, 1);
tlRP.to(rpStampLowBack, {x:-145,y: -20, ease: "expo.inOut"}, 1);
tlRP.to(rpStampHighFront, {x:-145,y: -20, ease: "expo.inOut"}, 1);
tlRP.to(rpStampLowFront, {x:-145,y: -20, ease: "expo.inOut"}, 1);

tlRP.to(rpStampHighBack, {y:58, ease: "expo.inOut", duration: 1.3});
tlRP.to(rpStampLowBack, {y:58, ease: "expo.inOut", duration: 1.3}, "<");
tlRP.to(rpStampHighFront, {y:58, ease: "expo.inOut", duration: 1.3}, "<");
tlRP.to(rpStampLowFront, {y:58, ease: "expo.inOut", duration: 1.3}, "<");

tlRP.to(rpStampHighBack, {y:120, ease: "back.in", duration: .6});
tlRP.to(rpStampHighFront, {y:110, ease: "back.in", duration: .6}, "<");

tlRP.to(rpStampHighBack, {y:55, ease: "elastic.out", duration: .8 });
tlRP.to(rpStampHighFront, {y:55, ease: "elastic.out", duration: .8 }, "<");
tlRP.to(rpPrint, {opacity:1, duration: 0}, "<");

tlRP.to(rpStampHighBack, {x:-145,y: -20, ease: "expo.out", duration: 1.6});
tlRP.to(rpStampLowBack, {x:-145,y: -20, ease: "expo.out", duration: 1.6}, "<");
tlRP.to(rpStampHighFront, {x:-145,y: -20, ease: "expo.out", duration: 1.6}, "<");
tlRP.to(rpStampLowFront, {x:-145,y: -20, ease: "expo.out", duration: 1.6}, "<");

tlRP.to(rpStampHighBack, {x:0,y:0, ease: "expo.inOut"}, "-=35%");
tlRP.to(rpStampLowBack, {x:0,y:0, ease: "expo.inOut"}, "<");
tlRP.to(rpStampHighFront, {x:0,y:0, ease: "expo.inOut"}, "<");
tlRP.to(rpStampLowFront, {x:0,y:0, ease: "expo.inOut"}, "<");

tlRP.to(rpPrint, {opacity:0, duration: 2})


// LLC & SP ANIMATION

let tlLLCSP = gsap.timeline({repeat: -1, defaults: {duration: 2}});

let llcspBack = document.querySelector(".llcsp-illustration-back");
let llcspSign = document.querySelector(".llcsp-illustration-signature");
let llcspPen = document.querySelector(".llcsp-illustration-pen");

let signTween = gsap.from(llcspSign, {opacity: 0, paused: true});

// ACCOUNTING ANIMATION

let tlAcc = gsap.timeline()

let bgGeometry = document.querySelector(".bg-geometry");
let bgGeometry2 = document.querySelector(".bg-geometry-2");

gsap.to(bgGeometry, {
  scrollTrigger: {
    trigger: bgGeometry,
    start: "top 90%",
    end: "900px 5%",
    // markers: true,
    scrub: 1.3
  },
  x: -2300,
  y: 300,
  scale: 0.8,
  rotate: 360,
  ease: "power3.inOut",
})

gsap.to(bgGeometry2, {
  scrollTrigger: {
    trigger: bgGeometry2,
    start: "300px 90%",
    end: "900px 5%",
    // markers: true,
    scrub: 1.3
  },
  x: 2000,
  y: 500,
  scale: 0.8,
  rotate: 360,
  ease: "power3.inOut",
})

