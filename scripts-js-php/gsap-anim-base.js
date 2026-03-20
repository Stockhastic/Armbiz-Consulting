(() => {
    if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 1023px)");
    const DEFAULT_DURATION = 0.8;
    const DEFAULT_DELAY = 0.1;
    const DEFAULT_EASE = "power2.out";
    const DEFAULT_START = "top 93%";
    const CONTENT_WRAPPER_SELECTOR = ".scheme__item-title";

    // Example:
    // data-anim="fade-up"
    // data-anim-duration="1"
    // data-anim-ease="power3.out"
    // data-anim-delay="0.15"
    // data-anim-start="top 90%"
    // data-anim-once="false"

    const PRESETS = {
        "fade-up": { autoAlpha: 0, y: 60 },
        "fade-down": { autoAlpha: 0, y: -60 },
        "fade-left": { autoAlpha: 0, x: -60 },
        "fade-right": { autoAlpha: 0, x: 60 },
        reveal: { autoAlpha: 0 }
    };
    const animationStates = new WeakMap();

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

            animationStates.set(el, { tween });
        });
    }

    function refreshReveal(root = document) {
        initReveal(root);
        ScrollTrigger.refresh();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => refreshReveal());
    } else {
        refreshReveal();
    }

    document.addEventListener("includes:loaded", () => refreshReveal());
    document.addEventListener("i18n:updated", () => {
        resetReveal();
        refreshReveal();
    });
})();
