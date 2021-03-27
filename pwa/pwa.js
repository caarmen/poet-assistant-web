if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pwa/service-worker.js', { scope: "/" });
  }
  