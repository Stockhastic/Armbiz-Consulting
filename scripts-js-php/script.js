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

const interactive = document.querySelectorAll('button, a, input[type="submit"], .mouse-selectable');
interactive.forEach(el => {
    el.addEventListener('mouseenter', () => {
        aura.classList.add('hovered');
        cursor.classList.add('hidden');
    });
    el.addEventListener('mouseleave', () => {
        aura.classList.remove('hovered');
        cursor.classList.remove('hidden');
    });
});

document.addEventListener('mousedown', () => {
    aura.classList.add('clicked');
});

document.addEventListener('mouseup', () => {
    aura.classList.remove('clicked');
});


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

document.querySelectorAll('.header__lang-switcher-item').forEach(btn => {
  btn.addEventListener('click', () => {
    setLang(btn.getAttribute('data-lang'));
  });
});

const acc = new Accordion(".accordion-container", {
    duration: 300,
    showMultiple: false,
    collapse: true,
    openOnInit: [0],  
  });



/////////////////////////////////////////////////////////////
// GSAP //
////////////////////////////////////////////////////////////



//RESIDENCE-PERMIT ANIMATION

gsap.registerPlugin(ScrollTrigger);

let rpDoc = document.querySelector(".residence-permit__illustration-part-1");
let rpPrint = document.querySelector(".residence-permit__illustration-part-2");
let rpStampLowBack = document.querySelector(".residence-permit__illustration-part-3-back");
let rpStampLowFront = document.querySelector(".residence-permit__illustration-part-3-front");
let rpStampHighBack = document.querySelector(".residence-permit__illustration-part-4-back");
let rpStampHighFront = document.querySelector(".residence-permit__illustration-part-4-front");

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
  x: -2000,
  y: 500,
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

