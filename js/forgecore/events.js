(function () {
  const listeners = {};

  const ForgeEvents = {
    on(eventName, callback) {
      if (!listeners[eventName]) listeners[eventName] = [];
      listeners[eventName].push(callback);

      return function unsubscribe() {
        listeners[eventName] = (listeners[eventName] || []).filter(fn => fn !== callback);
      };
    },

    emit(eventName, payload) {
      (listeners[eventName] || []).forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`[ForgeEvents] Errore evento ${eventName}:`, error);
        }
      });
    }
  };

  window.ForgeEvents = ForgeEvents;
})();
