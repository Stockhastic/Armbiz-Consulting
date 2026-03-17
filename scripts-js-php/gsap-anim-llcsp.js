gsap.registerPlugin(MotionPathPlugin, MotionPathHelper, DrawSVGPlugin);

// LLC & SP ANIMATION

const llcSign = document.querySelector(".llcsp-illustration-signature");
const llcSignPath = document.querySelector(".llcsp-illustration-signature-path");
const llcPen = document.querySelector(".llcsp-illustration-pen");

if (llcSign && llcSignPath && llcPen) {
    const llctl = gsap.timeline({repeat: -1, defaults: {duration: 2, ease: "power3.inOut"}});

    llctl.set(llcSign, {opacity: 1}, 0);
    llctl.set(llcSignPath, {drawSVG: "0% 0%"}, 0);

    llctl.to(llcPen, {x: -40, y: -2}, 1);

    llctl.to(llcSignPath, {drawSVG: "0% 100%", duration: 3}, 3);
    llctl.to(llcPen, {
        duration: 3,
        motionPath: {
            path: "M-40,-2 C-42.83,5.07 -66.712,17.022 -69.753,14.796 -72.793,12.563 -72.102,4.032 -64.968,-0.589 -56.533,-6.051 -35.75,-2.32 -48.48,8.45 -61.21,19.22 -76.125,38.374 -59.386,24.389 -46.309,13.463 -39.99,6.326 -39.99,6.326 -39.99,6.326 -39.99,7.6 -35.75,5.63 -31.51,3.66 -30.09,0.83 -30.09,0.83 -30.09,0.83 -38.655,1.486 -28.756,4.325 -23.316,5.873 -21.763,2.163 -21.763,2.163 -21.763,2.163 -21.168,5.657 -16.933,4.239 -12.691,2.818 -9.359,-3.333 -9.359,-3.333 -9.358,0.44 -10.693,14.206 -10.693,17.986 "
        }
    }, "<");

    llctl.to(llcPen, {x: 0, y: 0, duration: 1});
    llctl.to(llcSign, {opacity: 0});
}
