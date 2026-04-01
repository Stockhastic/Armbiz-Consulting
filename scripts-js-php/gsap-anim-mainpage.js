gsap.registerPlugin(ScrollTrigger);

const bgShape1 = document.querySelector(".main-bg-animation-shape1");
const bgShape2 = document.querySelector(".main-bg-animation-shape2");
const bgShape3 = document.querySelector(".main-bg-animation-shape3");
const triggerShape1 = document.querySelector("#bg-trigger1");

if (bgShape1 && triggerShape1) {
    gsap.to(bgShape1, {
        scrollTrigger: {
            trigger: triggerShape1,
            scrub: true,
            start: "top 80%",
            end: "top 0",
            invalidateOnRefresh: true
        },
        x: 300,
        ease: "power3.inOut",
    });
}

if (bgShape2 && triggerShape1) {
    gsap.to(bgShape2, {
        scrollTrigger: {
            trigger: triggerShape1,
            scrub: true,
            start: "top 40%",
            end: "top 0",
            invalidateOnRefresh: true
        },
        x: 0,
        ease: "power3.inOut",
    });

    gsap.to(bgShape2, {
        scrollTrigger: {
            trigger: triggerShape1,
            scrub: true,
            start: "center 80%",
            end: "center 0",
            invalidateOnRefresh: true
        },
        y: 4900,
        rotate: -180,
        ease: "power3.inOut",
    });
}

if (bgShape3 && triggerShape1) {
    gsap.to(bgShape3, {
        scrollTrigger: {
            trigger: triggerShape1,
            scrub: true,
            start: "top 40%",
            end: "top 20%",
            invalidateOnRefresh: true
        },
        x: 0,
        ease: "power3.inOut",
    });

    gsap.to(bgShape3, {
        scrollTrigger: {
            trigger: triggerShape1,
            scrub: true,
            start: "center 82%",
            end: "bottom 0",
            invalidateOnRefresh: true
        },
        y: 5600,
        scaleY: 1.32,
        ease: "power3.inOut",
    });
}
