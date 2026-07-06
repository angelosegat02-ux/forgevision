(function () {
  const ForgeCore = {
    init() {
      if (!window.ForgeMemory || !window.ForgeState || !window.ForgeConversation || !window.ForgeEvents) {
        console.error('[ForgeCore] Moduli mancanti. Controlla l’ordine degli script in index.html.');
        return false;
      }

      window.ForgeEvents.emit('forgecore:ready', this.getProject());
      return true;
    },

    startProject(studioData = {}) {
      const project = window.ForgeMemory.createProject(studioData);
      window.ForgeState.set(window.ForgeState.states.STUDIO);
      window.ForgeMemory.updateStatus('studio');
      return project;
    },

    updateStudio(studioData = {}) {
      return window.ForgeMemory.updateStudio(studioData);
    },

    startDesigner() {
      return window.ForgeConversation.start();
    },

    nextDesignerQuestion() {
      return window.ForgeConversation.nextQuestion();
    },

    answerDesigner(answer) {
      return window.ForgeConversation.saveAnswer(answer);
    },

    generateAnalysis() {
      return window.ForgeConversation.generateAnalysis();
    },

    generateProposals() {
      return window.ForgeConversation.generateProposals();
    },

    selectProposal(proposalId) {
      return window.ForgeMemory.selectProposal(proposalId);
    },

    getProject() {
      return window.ForgeMemory.getProject();
    },

    getState() {
      return window.ForgeState.get();
    },

    reset() {
      window.ForgeState.reset();
      return window.ForgeMemory.reset();
    }
  };

  window.ForgeCore = ForgeCore;

  document.addEventListener('DOMContentLoaded', () => {
    ForgeCore.init();
  });
})();
