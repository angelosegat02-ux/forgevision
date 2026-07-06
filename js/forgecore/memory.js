(function () {
  const STORAGE_KEY = 'forgevision_current_project';

  function generateProjectId() {
    const year = new Date().getFullYear();
    const number = Math.floor(Math.random() * 900000 + 100000);
    return `FV-${year}-${number}`;
  }

  function emptyProject() {
    return {
      projectId: generateProjectId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'studio',
      studio: {
        path: '',
        description: '',
        size: '',
        material: '',
        color: '',
        quantity: 1,
        delivery: '',
        concept: ''
      },
      designer: {
        conversation: [],
        answers: [],
        currentQuestionIndex: 0,
        analysis: null,
        proposals: [],
        selectedProposal: null
      },
      quote: {
        estimate: null,
        notes: ''
      }
    };
  }

  let currentProject = load() || emptyProject();

  function save() {
    currentProject.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProject));
    } catch (error) {
      console.warn('[ForgeMemory] Impossibile salvare in localStorage:', error);
    }

    if (window.ForgeEvents) {
      window.ForgeEvents.emit('project:updated', structuredCloneSafe(currentProject));
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('[ForgeMemory] Impossibile leggere localStorage:', error);
      return null;
    }
  }

  function structuredCloneSafe(value) {
    try {
      return structuredClone(value);
    } catch (_) {
      return JSON.parse(JSON.stringify(value));
    }
  }

  const ForgeMemory = {
    createProject(initialStudioData = {}) {
      currentProject = emptyProject();
      this.updateStudio(initialStudioData);
      save();
      return this.getProject();
    },

    getProject() {
      return structuredCloneSafe(currentProject);
    },

    getProjectId() {
      return currentProject.projectId;
    },

    updateStatus(status) {
      currentProject.status = status;
      save();
      return this.getProject();
    },

    updateStudio(studioData = {}) {
      currentProject.studio = {
        ...currentProject.studio,
        ...studioData
      };
      save();
      return this.getProject();
    },

    addMessage(role, content) {
      currentProject.designer.conversation.push({
        role,
        content,
        createdAt: new Date().toISOString()
      });
      save();
      return this.getProject();
    },

    addAnswer(answer) {
      currentProject.designer.answers.push(answer);
      save();
      return this.getProject();
    },

    setQuestionIndex(index) {
      currentProject.designer.currentQuestionIndex = index;
      save();
      return this.getProject();
    },

    setAnalysis(analysis) {
      currentProject.designer.analysis = analysis;
      save();
      return this.getProject();
    },

    setProposals(proposals) {
      currentProject.designer.proposals = proposals;
      save();
      return this.getProject();
    },

    selectProposal(proposalId) {
      currentProject.designer.selectedProposal = proposalId;
      save();
      return this.getProject();
    },

    reset() {
      currentProject = emptyProject();
      save();
      return this.getProject();
    }
  };

  window.ForgeMemory = ForgeMemory;
})();
