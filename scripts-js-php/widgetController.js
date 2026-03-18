        (function () {
            const widgetConfig = {
                button: {
                    selector: '[data-chat-widget-b24u="button"]',
                    className: 'b24u-chat-button',
                    styles: {
                        bottom: '11rem',
                        right: '2.5rem',
                        width: '70px',
                        height: '70px',
                        'border-radius': '100%',
                        background: 'linear-gradient(45deg, #1a6eff, #60a2ff)',
                        'box-shadow': '0 0 10px #9cc0ff',
                    }
                },
                popup: {
                    selector: '[data-chat-widget-b24u="popup"]',
                    className: 'b24u-chat-popup',
                    styles: {
                        bottom: '120px',
                        right: '24px',
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

            function applyImportantStyles(element, styles = {}) {
                Object.entries(styles).forEach(([property, value]) => {
                    element.style.setProperty(property, value, 'important');
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

                return true;
            }

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