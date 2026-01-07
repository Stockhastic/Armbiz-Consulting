// 1) Курсор
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


// Цены
fetch('scripts-js-php/service-prices.json')
    .then(r => r.json())
    .then(services => {
    services.forEach(service => {
        const priceEl = document.getElementById(`service-price-${service.id}`);
        const timelineEl = document.getElementById(`service-timeline-${service.id}`);
        if (priceEl) priceEl.textContent = `Цена начинается от ${service.price}`;
        if (timelineEl) timelineEl.textContent = `Временные рамки: ${service.timeline}`;
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

  // Переводим все элементы с data-i18n
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

  // Меняем иконку языка
  const langIcon = document.getElementById('header-lang-icon');
  if (langIcon) {
    langIcon.src = lang === 'ru'
      ? '/src/graphics/png/header-lang-ru.png'
      : '/src/graphics/png/header-lang-en.png';
  }

  // Обновляем выделение кнопки
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

document.addEventListener('includes:loaded', () => {
  setLang(currentLang);
  initHeaderMenu();
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



/////////////////////////////////////////////////////////////
// GSAP //
////////////////////////////////////////////////////////////



//RESIDENCE-PERMIT ANIMATION

gsap.registerPlugin(ScrollTrigger);

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

