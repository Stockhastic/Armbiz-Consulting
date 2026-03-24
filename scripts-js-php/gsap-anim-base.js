(() => {
    if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 1023px)");
    const desktopViewport = window.matchMedia("(min-width: 1024px)");
    const DEFAULT_DURATION = 0.8;
    const DEFAULT_DELAY = 0.1;
    const DEFAULT_EASE = "power2.out";
    const DEFAULT_START = "top 93%";
    const CONTENT_WRAPPER_SELECTOR = ".scheme__item-title";
    const SMOOTHER_SCRIPT_SRC = "/scripts-js-php/gsap-public/minified/ScrollSmoother.min.js";
    const SMOOTH_WRAPPER_ID = "smooth-wrapper";
    const SMOOTH_CONTENT_ID = "smooth-content";

    // Example:
    // data-anim="fade-up"
    // data-anim-duration="1"
    // data-anim-ease="power3.out"
    // data-anim-delay="0.15"
    // data-anim-start="top 90%"
    // data-anim-once="false"

    const PRESETS = {
        "fade-up": {autoAlpha: 0, y: 60},
        "fade-down": {autoAlpha: 0, y: -60},
        "fade-left": {autoAlpha: 0, x: -60},
        "fade-right": {autoAlpha: 0, x: 60},
        reveal: {autoAlpha: 0}
    };

    const animationStates = new WeakMap();
    let smootherScriptPromise = null;
    let bodyClassObserver = null;
    let anchorNavigationBound = false;
    let initialHashSyncDone = false;

    function parseNumber(value, fallback) {
        const parsedValue = Number.parseFloat(value);
        return Number.isFinite(parsedValue) ? parsedValue : fallback;
    }

    function parseString(value, fallback) {
        const parsedValue = typeof value === "string" ? value.trim() : "";
        return parsedValue || fallback;
    }

    function resolvePresetName(rawPresetName) {
        const presetName = rawPresetName || "fade-up";

        if (compactViewport.matches && presetName.indexOf("fade-") === 0) {
            return "fade-up";
        }

        return presetName;
    }

    function getScopedTargets(root, selector) {
        if (!(root instanceof Element) && root !== document) {
            return [];
        }

        const targets = [];

        if (root instanceof Element && root.matches(selector)) {
            targets.push(root);
        }

        return targets.concat(Array.from(root.querySelectorAll(selector)));
    }

    function getAnimationTargets(root) {
        return getScopedTargets(root, "[data-anim]:not([data-anim-ready])");
    }

    function shouldAnimateContentWrapper(el) {
        return el.matches(CONTENT_WRAPPER_SELECTOR);
    }

    function ensureAnimationWrapper(el) {
        const existingWrapper = Array.from(el.children).find((child) => child.dataset.animContent === "true");
        if (existingWrapper) {
            return existingWrapper;
        }

        const wrapper = document.createElement("span");
        wrapper.dataset.animContent = "true";
        wrapper.style.display = "block";
        wrapper.style.width = "100%";
        wrapper.style.maxWidth = "100%";
        wrapper.style.font = "inherit";
        wrapper.style.color = "inherit";
        wrapper.style.lineHeight = "inherit";
        wrapper.style.letterSpacing = "inherit";
        wrapper.style.textTransform = "inherit";
        wrapper.style.textAlign = "inherit";
        wrapper.style.whiteSpace = "inherit";
        wrapper.style.wordBreak = "inherit";
        wrapper.style.overflowWrap = "inherit";
        wrapper.style.textWrap = "inherit";

        while (el.firstChild) {
            wrapper.appendChild(el.firstChild);
        }

        el.appendChild(wrapper);

        return wrapper;
    }

    function cleanupAnimation(el) {
        const state = animationStates.get(el);
        if (state) {
            state.tween.scrollTrigger?.kill();
            state.tween.kill();
            animationStates.delete(el);
        }

        const wrapper = Array.from(el.children).find((child) => child.dataset.animContent === "true");
        if (wrapper) {
            while (wrapper.firstChild) {
                el.insertBefore(wrapper.firstChild, wrapper);
            }

            wrapper.remove();
        }

        delete el.dataset.animReady;
    }

    function resetReveal(root = document) {
        getScopedTargets(root, "[data-anim]").forEach((el) => {
            cleanupAnimation(el);
        });
    }

    function initReveal(root = document) {
        if (prefersReducedMotion.matches) {
            return;
        }

        getAnimationTargets(root).forEach((el) => {
            const presetName = resolvePresetName(el.dataset.anim);
            const preset = PRESETS[presetName] || PRESETS["fade-up"];
            const duration = parseNumber(el.dataset.animDuration, DEFAULT_DURATION);
            const delay = parseNumber(el.dataset.animDelay, DEFAULT_DELAY);
            const ease = parseString(el.dataset.animEase, DEFAULT_EASE);
            const start = parseString(el.dataset.animStart, DEFAULT_START);
            const once = el.dataset.animOnce !== "false";
            const animationTarget = shouldAnimateContentWrapper(el)
                ? ensureAnimationWrapper(el)
                : el;

            el.dataset.animReady = "true";

            const tween = gsap.fromTo(animationTarget, preset, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                duration,
                delay,
                ease,
                scrollTrigger: {
                    trigger: el,
                    start,
                    once,
                    toggleActions: once ? "play none none none" : "play none none reverse"
                }
            });

            animationStates.set(el, {tween});
        });
    }

    function refreshReveal(root = document) {
        initReveal(root);
        requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    function getHeaderElement() {
        return document.getElementById("site-header")
            || document.querySelector(`#${SMOOTH_CONTENT_ID} > header, body > header`);
    }

    function getMainElement() {
        return document.querySelector(`#${SMOOTH_CONTENT_ID} > main, body > main`);
    }

    function getFooterElement() {
        return document.getElementById("site-footer")
            || document.querySelector(`#${SMOOTH_CONTENT_ID} > footer, body > footer`);
    }

    function isIgnorableSphereSibling(el) {
        return el.matches(".backer-trigger, .bg-animations");
    }

    function findSphereForHero(hero) {
        let current = hero;

        while (current && current !== document.body) {
            let sibling = current.previousElementSibling;

            while (sibling) {
                if (
                    sibling.classList.contains("sphere-container")
                    && sibling.dataset.sphereMounted !== "true"
                ) {
                    return sibling;
                }

                if (!isIgnorableSphereSibling(sibling)) {
                    break;
                }

                sibling = sibling.previousElementSibling;
            }

            current = current.parentElement;
        }

        return null;
    }

    function normalizeHeroSpheres(root = document) {
        getScopedTargets(root, ".hero").forEach((hero) => {
            const directSphere = Array.from(hero.children).find((child) => child.classList.contains("sphere-container"));
            const sphere = directSphere || findSphereForHero(hero);

            if (!sphere) {
                return;
            }

            if (sphere.parentNode !== hero || hero.firstElementChild !== sphere) {
                hero.insertBefore(sphere, hero.firstChild);
            }

            sphere.dataset.sphereMounted = "true";
            hero.classList.add("hero--with-spheres");

            if (hero.classList.contains("hero--service")) {
                hero.classList.add("hero--service-spheres");
            }
        });
    }

    function shouldUseSmoother() {
        return desktopViewport.matches && !prefersReducedMotion.matches;
    }

    function ensureScrollSmootherPlugin() {
        if (typeof window.ScrollSmoother !== "undefined") {
            return Promise.resolve(window.ScrollSmoother);
        }

        if (smootherScriptPromise) {
            return smootherScriptPromise;
        }

        smootherScriptPromise = new Promise((resolve, reject) => {
            const existingScript = Array.from(document.scripts).find((script) => {
                const scriptSrc = script.getAttribute("src");

                if (!scriptSrc) {
                    return false;
                }

                try {
                    return new URL(script.src, window.location.href).pathname === SMOOTHER_SCRIPT_SRC;
                } catch (error) {
                    return scriptSrc === SMOOTHER_SCRIPT_SRC;
                }
            });

            const finalizeLoad = (script) => {
                if (typeof window.ScrollSmoother === "undefined") {
                    reject(new Error("ScrollSmoother script loaded but plugin is unavailable."));
                    return;
                }

                if (script) {
                    script.dataset.scrollSmootherReady = "true";
                }

                resolve(window.ScrollSmoother);
            };

            const handleError = () => reject(new Error(`Failed to load ${SMOOTHER_SCRIPT_SRC}`));

            if (existingScript) {
                if (
                    existingScript.dataset.scrollSmootherReady === "true"
                    || typeof window.ScrollSmoother !== "undefined"
                ) {
                    resolve(window.ScrollSmoother);
                    return;
                }

                existingScript.addEventListener("load", () => finalizeLoad(existingScript), {once: true});
                existingScript.addEventListener("error", handleError, {once: true});
                return;
            }

            const script = document.createElement("script");
            script.src = SMOOTHER_SCRIPT_SRC;
            script.async = false;
            script.addEventListener("load", () => finalizeLoad(script), {once: true});
            script.addEventListener("error", handleError, {once: true});
            document.head.appendChild(script);
        }).catch((error) => {
            console.error(error);
            return null;
        });

        return smootherScriptPromise;
    }

    function ensureSmoothStructure() {
        const header = getHeaderElement();
        const main = getMainElement();
        const footer = getFooterElement();

        if (!header || !main || !footer) {
            return null;
        }

        let wrapper = document.getElementById(SMOOTH_WRAPPER_ID);
        let content = document.getElementById(SMOOTH_CONTENT_ID);

        if (!content) {
            content = document.createElement("div");
            content.id = SMOOTH_CONTENT_ID;
            header.parentNode.insertBefore(content, header);
        }

        if (header.parentNode !== content) {
            content.appendChild(header);
        }

        if (main.parentNode !== content) {
            content.appendChild(main);
        }

        if (footer.parentNode !== content) {
            content.appendChild(footer);
        }

        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.id = SMOOTH_WRAPPER_ID;
            content.parentNode.insertBefore(wrapper, content);
        }

        if (content.parentNode !== wrapper) {
            wrapper.appendChild(content);
        }

        return {wrapper, content};
    }

    function teardownSmoothStructure() {
        const wrapper = document.getElementById(SMOOTH_WRAPPER_ID);
        const content = document.getElementById(SMOOTH_CONTENT_ID);
        const header = getHeaderElement();
        const main = getMainElement();
        const footer = getFooterElement();

        if (!wrapper || !content || !wrapper.parentNode) {
            return;
        }

        const parent = wrapper.parentNode;
        [header, main, footer].forEach((el) => {
            if (el && el.parentNode === content) {
                parent.insertBefore(el, wrapper);
            }
        });

        if (content.parentNode === wrapper) {
            content.remove();
        }

        wrapper.remove();
    }

    function refreshSmoother() {
        if (typeof window.ScrollSmoother === "undefined") {
            requestAnimationFrame(() => ScrollTrigger.refresh());
            return;
        }

        const smoother = window.ScrollSmoother.get();
        if (smoother) {
            requestAnimationFrame(() => smoother.refresh());
            return;
        }

        requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    function isModifiedPrimaryClick(event) {
        return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    }

    function getSamePageHash(link) {
        const rawHref = link.getAttribute("href");
        if (!rawHref || link.hasAttribute("download")) {
            return "";
        }

        const target = link.getAttribute("target");
        if (target && target.toLowerCase() === "_blank") {
            return "";
        }

        try {
            const url = new URL(link.href, window.location.href);
            const isSamePage = url.origin === window.location.origin
                && url.pathname === window.location.pathname
                && url.search === window.location.search;

            if (!isSamePage) {
                return "";
            }

            if (rawHref.charAt(0) === "#") {
                return rawHref === "#" ? "#" : url.hash || rawHref;
            }

            return url.hash || "";
        } catch (error) {
            return rawHref.charAt(0) === "#" ? rawHref : "";
        }
    }

    function decodeHashValue(hash) {
        try {
            return decodeURIComponent(hash.slice(1));
        } catch (error) {
            return hash.slice(1);
        }
    }

    function findHashTarget(hash) {
        if (!hash || hash === "#") {
            return null;
        }

        const targetId = decodeHashValue(hash);
        return document.getElementById(targetId)
            || document.getElementsByName(targetId)[0]
            || null;
    }

    function updateBrowserHash(hash, replace = false) {
        const nextUrl = hash && hash !== "#"
            ? `${window.location.pathname}${window.location.search}${hash}`
            : `${window.location.pathname}${window.location.search}`;
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (nextUrl === currentUrl || !window.history) {
            return;
        }

        const method = replace ? "replaceState" : "pushState";
        if (typeof window.history[method] === "function") {
            window.history[method](null, "", nextUrl);
        }
    }

    function scrollToHash(hash, {
        animate = !prefersReducedMotion.matches,
        updateHistory = false,
        replaceHistory = false
    } = {}) {
        const smoother = typeof window.ScrollSmoother !== "undefined"
            ? window.ScrollSmoother.get()
            : null;

        if (hash === "#") {
            if (smoother) {
                smoother.scrollTo(0, animate);
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: animate ? "smooth" : "auto"
                });
            }

            if (updateHistory) {
                updateBrowserHash("", replaceHistory);
            }

            return true;
        }

        const target = findHashTarget(hash);
        if (!target) {
            return false;
        }

        if (smoother) {
            smoother.scrollTo(target, animate);
        } else {
            target.scrollIntoView({
                behavior: animate ? "smooth" : "auto",
                block: "start"
            });
        }

        if (updateHistory) {
            updateBrowserHash(hash, replaceHistory || window.location.hash === hash);
        }

        return true;
    }

    function handleSamePageAnchorClick(event) {
        const link = event.target instanceof Element
            ? event.target.closest("a[href]")
            : null;
        if (!link || event.defaultPrevented || isModifiedPrimaryClick(event)) {
            return;
        }

        const hash = getSamePageHash(link);
        if (!hash) {
            return;
        }

        if (!scrollToHash(hash, {
            animate: !prefersReducedMotion.matches,
            updateHistory: true
        })) {
            return;
        }

        event.preventDefault();
    }

    function handleHashChange() {
        const hash = window.location.hash || "#";
        if (scrollToHash(hash, {
            animate: false,
            updateHistory: false
        })) {
            initialHashSyncDone = true;
        }
    }

    function syncInitialHashNavigation() {
        if (initialHashSyncDone || !window.location.hash) {
            return;
        }

        requestAnimationFrame(() => {
            if (scrollToHash(window.location.hash, {
                animate: false,
                updateHistory: false,
                replaceHistory: true
            })) {
                initialHashSyncDone = true;
            }
        });
    }

    function syncSmootherPauseState() {
        if (typeof window.ScrollSmoother === "undefined") {
            return;
        }

        const smoother = window.ScrollSmoother.get();
        if (!smoother || !document.body) {
            return;
        }

        smoother.paused(document.body.classList.contains("menu-open"));
    }

    function ensureBodyClassObserver() {
        if (
            bodyClassObserver
            || typeof MutationObserver === "undefined"
            || !document.body
        ) {
            return;
        }

        bodyClassObserver = new MutationObserver(syncSmootherPauseState);
        bodyClassObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    function ensureAnchorNavigation() {
        if (anchorNavigationBound) {
            return;
        }

        document.addEventListener("click", handleSamePageAnchorClick);
        window.addEventListener("hashchange", handleHashChange);
        anchorNavigationBound = true;
    }

    async function updateSmoother() {
        normalizeHeroSpheres();

        if (!shouldUseSmoother()) {
            if (typeof window.ScrollSmoother !== "undefined") {
                window.ScrollSmoother.get()?.kill();
            }

            teardownSmoothStructure();
            requestAnimationFrame(() => ScrollTrigger.refresh());
            syncInitialHashNavigation();
            return;
        }

        const ScrollSmootherPlugin = await ensureScrollSmootherPlugin();

        if (
            !ScrollSmootherPlugin
            || typeof window.ScrollSmoother === "undefined"
            || !shouldUseSmoother()
        ) {
            requestAnimationFrame(() => ScrollTrigger.refresh());
            return;
        }

        gsap.registerPlugin(ScrollTrigger, ScrollSmootherPlugin);

        const structure = ensureSmoothStructure();
        if (!structure) {
            return;
        }

        const existingSmoother = window.ScrollSmoother.get();
        if (
            existingSmoother
            && (
                existingSmoother.wrapper() !== structure.wrapper
                || existingSmoother.content() !== structure.content
            )
        ) {
            existingSmoother.kill();
        }

        window.ScrollSmoother.get() || window.ScrollSmoother.create({
            wrapper: structure.wrapper,
            content: structure.content,
            smooth: 1,
            smoothTouch: false,
            effects: false
        });

        ensureBodyClassObserver();
        syncSmootherPauseState();
        refreshSmoother();
        syncInitialHashNavigation();
    }

    function initPageFeatures() {
        ensureAnchorNavigation();
        normalizeHeroSpheres();
        refreshReveal();
        updateSmoother();
    }

    function handleEnvironmentChange() {
        resetReveal();
        refreshReveal();
        updateSmoother();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPageFeatures);
    } else {
        initPageFeatures();
    }

    document.addEventListener("includes:loaded", () => {
        refreshReveal();
        updateSmoother();
    });

    document.addEventListener("i18n:updated", () => {
        resetReveal();
        refreshReveal();
        refreshSmoother();
    });

    if (typeof compactViewport.addEventListener === "function") {
        compactViewport.addEventListener("change", handleEnvironmentChange);
        prefersReducedMotion.addEventListener("change", handleEnvironmentChange);
    } else {
        compactViewport.addListener(handleEnvironmentChange);
        prefersReducedMotion.addListener(handleEnvironmentChange);
    }

    window.addEventListener("load", refreshSmoother, {once: true});
})();
