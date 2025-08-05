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