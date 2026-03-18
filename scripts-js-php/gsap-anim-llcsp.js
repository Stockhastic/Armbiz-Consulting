gsap.registerPlugin(MotionPathPlugin, MotionPathHelper, DrawSVGPlugin);

// LLC & SP ANIMATION

const llcScene = document.querySelector(".hero__image");
const llcSign = document.querySelector(".llcsp-illustration-signature");
const llcPapers = document.querySelector(".llcsp-illustration-back");
const llcSignPath = document.querySelector(".llcsp-illustration-signature-path");
const llcPen = document.querySelector(".llcsp-illustration-pen");

if (llcScene && llcSign && llcPapers && llcSignPath && llcPen) {
    const BASE_SCENE_WIDTH = 520;
    const BASE_SCENE_HEIGHT = 400;
    const PAPERS_OFFSET_X = 100;
    const PEN_OFFSET = {x: -40, y: -2};
    const PEN_PATH = "M-40,-2 C-42.83,5.07 -66.712,17.022 -69.753,14.796 -72.793,12.563 -72.102,4.032 -64.968,-0.589 -56.533,-6.051 -35.75,-2.32 -48.48,8.45 -61.21,19.22 -76.125,38.374 -59.386,24.389 -46.309,13.463 -39.99,6.326 -39.99,6.326 -39.99,6.326 -39.99,7.6 -35.75,5.63 -31.51,3.66 -30.09,0.83 -30.09,0.83 -30.09,0.83 -38.655,1.486 -28.756,4.325 -23.316,5.873 -21.763,2.163 -21.763,2.163 -21.763,2.163 -21.168,5.657 -16.933,4.239 -12.691,2.818 -9.359,-3.333 -9.359,-3.333 -9.358,0.44 -10.693,14.206 -10.693,17.986 ";

    let llctl;
    let rebuildFrame = 0;

    function scalePath(path, scaleX, scaleY) {
        let coordinateIndex = 0;

        return path.replace(/-?\d*\.?\d+/g, (value) => {
            const numericValue = parseFloat(value);
            const scale = coordinateIndex % 2 === 0 ? scaleX : scaleY;

            coordinateIndex += 1;

            return (numericValue * scale).toFixed(3).replace(/\.?0+$/, "");
        });
    }

    function buildTimeline() {
        const scaleX = llcScene.clientWidth / BASE_SCENE_WIDTH;
        const scaleY = llcScene.clientHeight / BASE_SCENE_HEIGHT;
        const papersOffsetX = PAPERS_OFFSET_X * scaleX;
        const penOffsetX = PEN_OFFSET.x * scaleX;
        const penOffsetY = PEN_OFFSET.y * scaleY;
        const scaledPenPath = scalePath(PEN_PATH, scaleX, scaleY);

        llctl?.kill();
        gsap.killTweensOf([llcSign, llcPapers, llcSignPath, llcPen]);

        gsap.set(llcSign, {opacity: 1});
        gsap.set(llcPapers, {opacity: 0, x: papersOffsetX});
        gsap.set(llcSignPath, {drawSVG: "0% 0%"});
        gsap.set(llcPen, {x: 0, y: 0});

        llctl = gsap.timeline({repeat: -1, defaults: {duration: 2, ease: "power3.inOut"}});

        llctl.to(llcPapers, {opacity: 1, x: 0}, 1);
        llctl.to(llcPen, {x: penOffsetX, y: penOffsetY}, 2);
        llctl.to(llcSignPath, {drawSVG: "0% 100%", duration: 3}, 4);
        llctl.to(llcPen, {
            duration: 3,
            motionPath: {
                path: scaledPenPath
            }
        }, "<");
        llctl.to(llcPen, {x: 0, y: 0, duration: 1});
        llctl.to(llcPapers, {opacity: 0, x: papersOffsetX});
        llctl.to(llcSign, {opacity: 0});
    }

    function queueTimelineBuild() {
        cancelAnimationFrame(rebuildFrame);
        rebuildFrame = requestAnimationFrame(buildTimeline);
    }

    buildTimeline();

    if ("ResizeObserver" in window) {
        const llcSceneResizeObserver = new ResizeObserver(queueTimelineBuild);
        llcSceneResizeObserver.observe(llcScene);
    } else {
        window.addEventListener("resize", queueTimelineBuild);
    }
}
