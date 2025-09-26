// Variable global para almacenar los tiempos de las fases completadas.
const phaseTimings = {};

self.addEventListener('install', event => {
  const startTime = performance.now();
  console.log('SW: ⚙️ 1. Evento de Instalación');
  self.skipWaiting();

  event.waitUntil(
    new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
      const endTime = performance.now();
      const installTimeNs = (endTime - startTime) * 1000000;
      
      // Guardamos el tiempo en nuestra variable global en lugar de enviarlo.
      phaseTimings.installing = 0;
      phaseTimings.installed = installTimeNs;
      console.log('SW: ✅ Fase de instalación completada y tiempo guardado.');
    })
  );
});

self.addEventListener('activate', event => {
  const startTime = performance.now();
  console.log('SW: 🚀 2. Evento de Activación');

  event.waitUntil(self.clients.claim().then(() => {
    return new Promise(resolve => setTimeout(resolve, 500)).then(() => {
      const endTime = performance.now();
      const activateTimeNs = (endTime - startTime) * 1000000;

      // Guardamos los tiempos restantes.
      phaseTimings.activating = 0;
      phaseTimings.activated = activateTimeNs;
      phaseTimings.idle = 0;
      console.log('SW: ✅ Fase de activación completada y tiempos guardados.');

      // Avisamos a todos los clientes que estamos listos.
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ status: 'ready' });
        });
      });
    });
  }));
});

// ¡NUEVO! Escuchamos mensajes de la página.
self.addEventListener('message', event => {
  // Si la página nos pide el estado, se lo enviamos.
  if (event.data && event.data.command === 'getStatus') {
    console.log('SW: 📬 Petición de estado recibida, enviando tiempos...');
    // event.source se refiere a la página que envió el mensaje.
    event.source.postMessage({
      status: 'fullStatus',
      timings: phaseTimings
    });
  }
});