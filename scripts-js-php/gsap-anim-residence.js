const resDoc = document.querySelector(".residence-permit__illustration-part-2");
const resShield = document.querySelector(".residence-permit__illustration-part-2");

const resStar1 = document.querySelector(".residence-permit__illustration-part-5-1");
const resStar2 = document.querySelector(".residence-permit__illustration-part-5-2");
const resStar3 = document.querySelector(".residence-permit__illustration-part-5-3");
const resStar4 = document.querySelector(".residence-permit__illustration-part-5-4");
const resStar5 = document.querySelector(".residence-permit__illustration-part-5-5");
const resStar6 = document.querySelector(".residence-permit__illustration-part-5-6");
const resStar7 = document.querySelector(".residence-permit__illustration-part-5-7");
const resStar8 = document.querySelector(".residence-permit__illustration-part-5-8");


gsap.set(resDoc, {y: 30})

let tlRes = gsap.timeline({repeat:-1});

tlRes.to(resDoc, {y: -30, ease: "power2.inOut", duration:6}, 1);
tlRes.to(resDoc, {y: 30, ease: "power1.inOut",duration: 6});



