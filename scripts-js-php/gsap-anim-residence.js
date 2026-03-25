const rpStar1 = document.querySelector(".rp-illustration-star1");
const rpStar2 = document.querySelector(".rp-illustration-star2");
const rpStar3 = document.querySelector(".rp-illustration-star3");
const rpStar4 = document.querySelector(".rp-illustration-star4");
const rpStar5 = document.querySelector(".rp-illustration-star5");
const rpStar6 = document.querySelector(".rp-illustration-star6");
const rpStar7 = document.querySelector(".rp-illustration-star7");
const rpStar8 = document.querySelector(".rp-illustration-star8");

const rpCard = document.querySelector(".rp-illustration-card");

const rpFinger = document.querySelector(".rp-illustration-finger");
const rpGeotag = document.querySelector(".rp-illustration-geotag");
const rpShield = document.querySelector(".rp-illustration-shield");
const rpCity = document.querySelector(".rp-illustration-city");

let tlRp = gsap.timeline({repeat: -1, defaults: {duration: 10 }});

tlRp.from(rpStar1, {rotate: -360, ease: "power3.inOut"}, 0);
tlRp.from(rpStar2, {rotate: -360, ease: "power1.inOut"}, 0);
tlRp.from(rpStar3, {rotate: -360, ease: "none"}, 0);
tlRp.from(rpStar4, {rotate: -360, ease: "power1.inOut"}, 0);
tlRp.from(rpStar5, {rotate: -360, ease: "power3.inOut"}, 0);
tlRp.from(rpStar6, {rotate: -360, ease: "none"}, 0);
tlRp.from(rpStar7, {rotate: -360, ease: "none"}, 0);
tlRp.from(rpStar8, {rotate: -360, ease: "power2.inOut"}, 0);

tlRp.to(rpStar1, {rotate: 360, ease: "power3.inOut"}, 10);
tlRp.to(rpStar2, {rotate: 360, ease: "power1.inOut"}, 10);
tlRp.to(rpStar3, {rotate: 360, ease: "none"}, 10);
tlRp.to(rpStar4, {rotate: 360, ease: "power1.inOut"}, 10);
tlRp.to(rpStar5, {rotate: 360, ease: "power3.inOut"}, 10);
tlRp.to(rpStar6, {rotate: 360, ease: "none"}, 10);
tlRp.to(rpStar7, {rotate: 360, ease: "none"}, 10);
tlRp.to(rpStar8, {rotate: 360, ease: "power2.inOut"}, 10);

tlRp.from(rpCard, {yPercent:-7, duration: 5, ease: "none"}, 0);
tlRp.to(rpCard, {yPercent:7, duration: 5, ease: "power2.out"}, 5);
tlRp.to(rpCard, {yPercent:0, duration: 5, ease: "none"}, 10);
tlRp.to(rpCard, {yPercent:-7, duration: 5, ease: "none"}, 15);

tlRp.from(rpGeotag, {opacity:0, scale: 0.5, ease: "circ.out", duration: 2.5}, 5);
tlRp.from(rpFinger, {opacity:0, scale: 0.5, ease: "circ.out", duration: 2.5}, 5);
tlRp.from(rpShield, {opacity:0, scale: 0.5, ease: "circ.out", duration: 2.5}, 5);
tlRp.from(rpCity, {opacity:0, scale: 0.5, ease: "circ.out", duration: 2.5}, 5);

tlRp.to(rpGeotag, {opacity:0, scale: 0.5, ease: "circ.inOut", duration: 2.5}, 12.5);
tlRp.to(rpFinger, {opacity:0, scale: 0.5, ease: "circ.inOut", duration: 2.5}, 12.5);
tlRp.to(rpShield, {opacity:0, scale: 0.5, ease: "circ.inOut", duration: 2.5}, 12.5);
tlRp.to(rpCity, {opacity:0, scale: 0.5, ease: "circ.inOut", duration: 2.5}, 12.5);



