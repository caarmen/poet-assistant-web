if ('serviceWorker' in navigator && !globalThis.desktop) {
    navigator.serviceWorker.register('/pwa/service-worker.js', { scope: "/" });
}
