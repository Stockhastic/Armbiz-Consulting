const rmcScene = document.querySelector(".hero__image");
const rmcBuilding = document.querySelector(".rm-illustration-building");
const rmcCompany = document.querySelector(".rm-illustration-company");
const rmcRoof = document.querySelector(".rm-illustration-roof");
const rmcBlockDoc = document.querySelector(".rm-illustration-document");
const rmcBlockValue = document.querySelector(".rm-illustration-value");
const rmcBlockStamp = document.querySelector(".rm-illustration-stamp");
const rmcRopes = document.querySelector(".rm-illustration-ropes");
const rmcCrane = document.querySelector(".rm-illustration-crane");

if (
    rmcScene &&
    rmcBuilding &&
    rmcCompany &&
    rmcRoof &&
    rmcBlockDoc &&
    rmcBlockValue &&
    rmcBlockStamp &&
    rmcRopes &&
    rmcCrane
) {
    const BASE_SCENE_WIDTH = 500;
    const BASE_SCENE_HEIGHT = 400;
    const ROOF_OFFSET_Y = 18;
    const BLOCK_DOC_OFFSET = {x: -100, y: -50};
    const BLOCK_VALUE_OFFSET = {x: 50, y: -30};
    const BLOCK_STAMP_OFFSET = {x: 100, y: 50};
    const sceneOverflowValue = typeof CSS !== "undefined" && CSS.supports("overflow", "clip")
        ? "clip"
        : "hidden";

    let tlRmc;
    let rebuildFrame = 0;

    function scaleOffset(offset, scaleX, scaleY) {
        return {
            x: offset.x * scaleX,
            y: offset.y * scaleY
        };
    }

    function buildTimeline() {
        const scaleX = rmcScene.clientWidth / BASE_SCENE_WIDTH;
        const scaleY = rmcScene.clientHeight / BASE_SCENE_HEIGHT;
        const docOffset = scaleOffset(BLOCK_DOC_OFFSET, scaleX, scaleY);
        const valueOffset = scaleOffset(BLOCK_VALUE_OFFSET, scaleX, scaleY);
        const stampOffset = scaleOffset(BLOCK_STAMP_OFFSET, scaleX, scaleY);
        const roofOffsetY = ROOF_OFFSET_Y * scaleY;

        tlRmc?.kill();
        gsap.killTweensOf([
            rmcBuilding,
            rmcCompany,
            rmcRoof,
            rmcBlockDoc,
            rmcBlockValue,
            rmcBlockStamp,
            rmcRopes,
            rmcCrane
        ]);

        gsap.set(rmcCompany, {opacity: 0, x: 0, y: 0});
        gsap.set(rmcRoof, {y: 0});
        gsap.set(rmcBlockDoc, {opacity: 1, x: 0, y: 0});
        gsap.set(rmcBlockValue, {opacity: 1, x: 0, y: 0});
        gsap.set(rmcBlockStamp, {opacity: 1, x: 0, y: 0});
        gsap.set(rmcRopes, {opacity: 1, scaleY: 1, transformOrigin: "20% 10%"});
        gsap.set(rmcCrane, {opacity: 1, x: 0, y: 0});

        tlRmc = gsap.timeline({repeat: -1, defaults: {duration: 1.5, ease: "power2.out"}});

        tlRmc.to(rmcRopes, {scaleY: 1.6, duration: 2.5}, 1);
        tlRmc.to(rmcRoof, {y: roofOffsetY, duration: 2.5}, "<");

        tlRmc.to(rmcRopes, {opacity: 0});
        tlRmc.to(rmcCompany, {opacity: 1}, "<");
        tlRmc.to(rmcCrane, {opacity: 0});

        tlRmc.from(rmcBlockDoc, {...docOffset, opacity: 0, duration: 1});
        tlRmc.from(rmcBlockValue, {...valueOffset, opacity: 0, duration: 1});
        tlRmc.from(rmcBlockStamp, {...stampOffset, opacity: 0, duration: 1});
        tlRmc.to(rmcRopes, {scaleY: 1});

        tlRmc.to(rmcCompany, {opacity: 0});

        tlRmc.to(rmcBlockDoc, {...docOffset, opacity: 0, duration: 1});
        tlRmc.to(rmcBlockValue, {...valueOffset, opacity: 0, duration: 1}, "<");
        tlRmc.to(rmcBlockStamp, {...stampOffset, opacity: 0, duration: 1}, "<");
        tlRmc.to(rmcRoof, {y: 0, duration: 2.5}, "<");

        tlRmc.to(rmcRopes, {opacity: 1});
        tlRmc.to(rmcCrane, {opacity: 1}, "<");
    }

    function queueTimelineBuild() {
        cancelAnimationFrame(rebuildFrame);
        rebuildFrame = requestAnimationFrame(buildTimeline);
    }

    rmcScene.style.overflow = sceneOverflowValue;
    buildTimeline();

    if ("ResizeObserver" in window) {
        const rmcSceneResizeObserver = new ResizeObserver(queueTimelineBuild);
        rmcSceneResizeObserver.observe(rmcScene);
    } else {
        window.addEventListener("resize", queueTimelineBuild);
    }
}
