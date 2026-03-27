const cStar = document.querySelector(".citizenship-illustration-star");
const cStarry = document.querySelector(".citizenship-illustration-starry");
const cPass = document.querySelector(".citizenship-illustration-passport");

let tlCitizenship = gsap.timeline({repeat: -1, defaults: {duration: 10, ease: "none"}});

tlCitizenship.to(cStar, {rotation: 360});
tlCitizenship.to(cStarry, {rotation: -360}, "<");