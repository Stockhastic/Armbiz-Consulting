const bcLine1 = document.querySelector(".bankcard-illustration-line1");
const bcLine2 = document.querySelector(".bankcard-illustration-line2");
const bcLine3 = document.querySelector(".bankcard-illustration-line3");
const bcEarth = document.querySelector(".bankcard-illustration-earth");
const bcCard = document.querySelector(".bankcard-illustration-card");
const bcBadge1 = document.querySelector(".bankcard-illustration-badge1");
const bcBadge2 = document.querySelector(".bankcard-illustration-badge2");
const bcBadge3 = document.querySelector(".bankcard-illustration-badge3");

const bcLineReveal = {
    clipPath: "inset(0 0 0 100%)",
    opacity: 0,
    ease: "power2.out"
};

let tlBc = gsap.timeline({repeat: -1, defaults: {duration: 2}});

tlBc.from(bcEarth, {opacity: 0, y: 30});

tlBc.from(bcCard, {opacity: 0, y: -30});

tlBc.from(bcLine1, bcLineReveal);
tlBc.from(bcBadge1, {
    opacity: 0, 
    scale: 0.5, 
    ease: "elastic.inOut", 
    transformOrigin: "20% 20%"}, "<");

tlBc.from(bcLine2, bcLineReveal);
tlBc.from(bcBadge2, {
    opacity: 0, 
    scale: 0.5, 
    ease: "elastic.inOut", 
    transformOrigin: "10% 50%"}, "<");

tlBc.from(bcLine3, bcLineReveal);
tlBc.from(bcBadge3, {
    opacity: 0, 
    scale: 0.5, 
    ease: "elastic.inOut", 
    transformOrigin: "20% 80%"}, "<");

tlBc.to(bcLine1 , {opacity: 0});
tlBc.to(bcLine2 , {opacity: 0}, "<");
tlBc.to(bcLine3 , {opacity: 0}, "<");
tlBc.to(bcBadge1 , {opacity: 0}, "<");
tlBc.to(bcBadge2 , {opacity: 0}, "<");
tlBc.to(bcBadge3 , {opacity: 0}, "<");

tlBc.to(bcCard, {opacity: 0})
tlBc.to(bcEarth , {opacity: 0, delay: 2}, "<");