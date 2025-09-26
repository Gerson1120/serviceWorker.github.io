if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('✅ Service Worker registrado.');
    }).catch(error => {
      console.log('❌ Error en el registro del SW:', error);
    });

  // Función para actualizar el checklist completo.
  const updateChecklist = (timings) => {
    console.log('🎨 Actualizando checklist con estos tiempos:', timings);
    // Mapeamos los nombres de las fases a los IDs de los elementos.
    const phaseMapping = {
      installing: '#fase1',
      installed: '#fase2',
      activating: '#fase3',
      activated: '#fase4',
      idle: '#fase5'
    };

    // Recorremos cada fase y actualizamos el HTML si el tiempo existe.
    for (const phaseName in timings) {
      const elementId = phaseMapping[phaseName];
      const time = timings[phaseName];
      
      if (elementId) {
        const checklistItem = document.querySelector(elementId);
        if (checklistItem) {
          checklistItem.querySelector('input[type="checkbox"]').checked = true;
          checklistItem.querySelector('.time').textContent = `(${new Intl.NumberFormat('es-MX').format(time)} ns)`;
        }
      }
    }
  };

  // Escuchamos mensajes del service worker.
  navigator.serviceWorker.addEventListener('message', event => {
    const data = event.data;
    console.log('📬 Mensaje recibido del SW:', data);

    // Si el SW nos dice que está listo, le pedimos el estado completo.
    if (data.status === 'ready') {
      console.log('➡️ SW está listo. Pidiendo estado completo.');
      navigator.serviceWorker.controller.postMessage({ command: 'getStatus' });
    }

    // Si el SW nos envía el estado completo, actualizamos el checklist.
    if (data.status === 'fullStatus') {
      updateChecklist(data.timings);
    }
  });

  // Adicional: Si la página se recarga y el SW ya está activo,
  // le pedimos el estado inmediatamente.
  navigator.serviceWorker.ready.then(registration => {
    if (registration.active) {
       registration.active.postMessage({ command: 'getStatus' });
    }
  });
}