(function () {
    if (window.__b24uLoaderInitialized) {
        return;
    }

    window.__b24uLoaderInitialized = true;

    window.setTimeout(function () {
        if (document.querySelector('script[data-b24u-loader="external"]')) {
            return;
        }

        const chatScript = document.createElement('script');
        chatScript.src = 'https://i.b24u.ru/armbiz.biz';
        chatScript.async = true;
        chatScript.dataset.b24uLoader = 'external';
        chatScript.onload = function () {
            if (window.B24U) {
                window.B24U.init();
            }
        };

        document.body.appendChild(chatScript);
    }, 5000);
})();
