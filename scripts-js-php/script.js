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
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

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