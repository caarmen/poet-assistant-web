if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/dev/pwa/service-worker.js', { scope: "/dev/" });
  }
  