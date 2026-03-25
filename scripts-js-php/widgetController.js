        (function () {
            const widgetConfig = {
                button: {
                    selector: '[data-chat-widget-b24u="button"]',
                    className: 'b24u-chat-button',
                    visibleClassName: 'b24u-chat-button--visible',
                    styles: {
                        bottom: '11rem',
                        right: '2.5rem',
                        width: '70px',
                        height: '70px',
                        'border-radius': '100%',
                        background: 'linear-gradient(45deg, #1a6eff, #60a2ff)',
                        'box-shadow': '0 0 10px #9cc0ff',
                        transition: 'opacity 920ms cubic-bezier(0.22, 1, 0.36, 1), translate 920ms cubic-bezier(0.22, 1, 0.36, 1), transform 0.2s'
                    }
                },
                popup: {
                    selector: '[data-chat-widget-b24u="popup"]',
                    className: 'b24u-chat-popup',
                    styles: {
                        bottom: '11rem',
                        right: '11rem',
                        width: '340px',
                        'border-radius': '24px',
                        overflow: 'hidden'
                    }
                },
                container: {
                    selector: '[data-chat-widget-b24u="container"]',
                    className: 'b24u-chat-container'
                },
                content: {
                    selector: '[data-chat-widget-b24u="content"]',
                    className: 'b24u-chat-content'
                }
            };
            const animatedElements = new WeakSet();

            function injectAppearanceStyles() {
                if (document.getElementById('b24u-widget-controller-styles')) {
                    return;
                }

                const styleElement = document.createElement('style');
                styleElement.id = 'b24u-widget-controller-styles';
                styleElement.textContent = `
                    [data-chat-widget-b24u="button"] {
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                        translate: 0 18px !important;
                    }

                    [data-chat-widget-b24u="button"].b24u-chat-button--visible {
                        opacity: 1 !important;
                        visibility: visible !important;
                        pointer-events: auto !important;
                        translate: 0 0 !important;
                    }
                `;

                document.head.appendChild(styleElement);
            }

            function applyImportantStyles(element, styles = {}) {
                Object.entries(styles).forEach(([property, value]) => {
                    element.style.setProperty(property, value, 'important');
                });
            }

            function revealElement(element, visibleClassName) {
                if (!element || !visibleClassName || animatedElements.has(element)) {
                    return;
                }

                animatedElements.add(element);

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        element.classList.add(visibleClassName);
                    });
                });
            }

            function applyWidgetStyles() {
                const button = document.querySelector(widgetConfig.button.selector);
                const popup = document.querySelector(widgetConfig.popup.selector);
                const container = document.querySelector(widgetConfig.container.selector);
                const content = document.querySelector(widgetConfig.content.selector);
                const elements = [
                    { element: button, config: widgetConfig.button },
                    { element: popup, config: widgetConfig.popup },
                    { element: container, config: widgetConfig.container },
                    { element: content, config: widgetConfig.content }
                ];

                if (!button || !popup) {
                    return false;
                }

                elements.forEach(({ element, config }) => {
                    if (!element) {
                        return;
                    }

                    element.classList.add(config.className);
                    applyImportantStyles(element, config.styles);
                });

                revealElement(button, widgetConfig.button.visibleClassName);

                return true;
            }

            injectAppearanceStyles();

            const bodyObserver = new MutationObserver(() => {
                if (applyWidgetStyles()) {
                    bodyObserver.disconnect();
                }
            });

            if (!applyWidgetStyles()) {
                bodyObserver.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        })();
