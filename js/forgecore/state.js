(function () {
  const states = {
    STUDIO: 'studio',
    DESIGNER: 'designer',
    ANALYSIS: 'analysis',
    PROPOSALS: 'proposals',
    QUOTE: 'quote',
    ORDER: 'order'
  };

  let currentState = states.STUDIO;

  const ForgeState = {
    states,

    get() {
      return currentState;
    },

    set(nextState) {
      if (!Object.values(states).includes(nextState)) {
        console.warn('[ForgeState] Stato non valido:', nextState);
        return currentState;
      }

      const previousState = currentState;
      currentState = nextState;

      if (window.ForgeEvents) {
        window.ForgeEvents.emit('state:changed', {
          previousState,
          currentState
        });
      }

      return currentState;
    },

    reset() {
      return this.set(states.STUDIO);
    }
  };

  window.ForgeState = ForgeState;
})();
