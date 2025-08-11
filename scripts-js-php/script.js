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







//LANGUAGE
let translations = {};
let currentLang = 'ru';

fetch('/scripts-js-php/lang.json')
    .then(r => r.json())
    .then(data => {
    translations = data;
});

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
    }
    });
}

document.querySelectorAll('.header__lang-switcher-item').forEach(btn => {
    btn.addEventListener('click', () => {
    const lang = btn.getAttribute('data-lang');
    setLang(lang);
    });
});

document.querySelectorAll('.header__lang-switcher-item').forEach(btn => {
  btn.addEventListener('click', () => {
    // Получаем выбранный язык
    const lang = btn.getAttribute('data-lang');
    setLang(lang);

    // Снимаем выделение со всех кнопок
    document.querySelectorAll('.header__lang-switcher-item')
      .forEach(b => b.classList.remove('header__lang-switcher-item--selected'));

    // Добавляем выделение к выбранной кнопке
    btn.classList.add('header__lang-switcher-item--selected');
  });
});