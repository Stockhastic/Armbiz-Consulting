const accGraph1 = document.querySelector(".accounting-illustration__part-2");
const accGraph2 = document.querySelector(".accounting-illustration__part-3");
const accGraph3 = document.querySelector(".accounting-illustration__part-4");
const accGraph4 = document.querySelector(".accounting-illustration__part-5");
const accSidebar = document.querySelector(".accounting-illustration__part-6");

let tlAccount = gsap.timeline({repeat: -1, defaults: {duration: 2, ease: "circ.inOut"}});

//Graph Animation
tlAccount.to(accGraph1, {yPercent: 1.75});
tlAccount.to(accGraph1, {yPercent: 3.75});
tlAccount.to(accGraph1, {yPercent: 2.25});
tlAccount.to(accGraph1, {yPercent: 0});

tlAccount.set(accGraph2, {yPercent: 1.75}, 0);
tlAccount.to(accGraph2, {yPercent: 0}, "<");
tlAccount.to(accGraph2, {yPercent: 3.75}, 2);
tlAccount.to(accGraph2, {yPercent: 0.75}, 4);
tlAccount.to(accGraph2, {yPercent: 1.75}, 6);

tlAccount.to(accGraph3,{yPercent: 3.25}, 0);
tlAccount.to(accGraph3,{yPercent: 1.75}, 2);
tlAccount.to(accGraph3,{yPercent: 2.5}, 4);
tlAccount.to(accGraph3,{yPercent: 0}, 6);

tlAccount.to(accGraph4,{yPercent: 5}, 0);
tlAccount.to(accGraph4,{yPercent: 3.75}, 2);
tlAccount.to(accGraph4,{yPercent: 2.25}, 4);
tlAccount.to(accGraph4,{yPercent: 0}, 6);

// Sidebar Animation
tlAccount.to(accSidebar, {yPercent: -26.7, duration: 6, ease: "power1.inOut"}, 0);
