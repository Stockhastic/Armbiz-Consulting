const scDoc = document.querySelector(".socialcard-illustration-1-docs");
const scCard = document.querySelector(".socialcard-illustration-2-card");
const scCheck1 = document.querySelector(".socialcard-illustration-3-check1");
const scCheck2 = document.querySelector(".socialcard-illustration-3-check2");

let tlSc = gsap.timeline({repeat: -1, defaults: {duration: 2}});

tlSc.from(scDoc, {opacity: 0, y: -50, ease: "power3.inOut"}, 0.5);

tlSc.from(scCheck1, {opacity: 0, scale: 0.5, ease: "circ.inOut", transformOrigin: "71% 35%", duration: 1});
tlSc.from(scCheck2, {opacity: 0, scale: 0.5, ease: "circ.inOut", transformOrigin: "70% 47%", duration: 1});

tlSc.from(scCard, {opacity: 0, x: -150, ease: "power3.inOut"});

tlSc.to(scCard, {opacity:0, x: -150, delay: 2, ease: "power2.inOut"});
tlSc.to(scDoc, {opacity:0, y: -50, ease: "power2.inOut"});
tlSc.to(scCheck1, {opacity: 0, y: -50, ease: "power2.inOut",}, "<");
tlSc.to(scCheck2, {opacity: 0, y: -50, ease: "power2.inOut",}, "<");