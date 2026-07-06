(function () {
  const defaultQuestions = [
    'A cosa servirà principalmente questo oggetto?',
    'Dove verrà utilizzato: casa, auto, ufficio, esterno o altro?',
    'Deve sopportare peso, urti o sollecitazioni particolari?',
    'Preferisci un design minimal, moderno o più tecnico?',
    'Ci sono dimensioni o limiti di spazio da rispettare?'
  ];

  function getProject() {
    return window.ForgeMemory.getProject();
  }

  const ForgeConversation = {
    questions: defaultQuestions,

    start() {
      window.ForgeState.set(window.ForgeState.states.DESIGNER);
      window.ForgeMemory.updateStatus('designer');

      const message = 'Ciao! Sono ForgeVision Designer. Ho letto le informazioni iniziali del tuo progetto. Prima di proporti una soluzione, ti farò alcune domande mirate.';
      window.ForgeMemory.addMessage('designer', message);

      return {
        type: 'message',
        message,
        project: getProject()
      };
    },

    nextQuestion() {
      const project = getProject();
      const index = project.designer.currentQuestionIndex || 0;

      if (index >= this.questions.length) {
        return this.generateAnalysis();
      }

      const question = this.questions[index];
      window.ForgeMemory.addMessage('designer', question);
      window.ForgeMemory.setQuestionIndex(index + 1);

      return {
        type: 'question',
        question,
        questionIndex: index + 1,
        totalQuestions: this.questions.length,
        project: getProject()
      };
    },

    saveAnswer(answer) {
      const cleanAnswer = String(answer || '').trim();

      if (!cleanAnswer) {
        return {
          type: 'error',
          message: 'Scrivi una risposta prima di continuare.'
        };
      }

      window.ForgeMemory.addAnswer(cleanAnswer);
      window.ForgeMemory.addMessage('user', cleanAnswer);

      return this.nextQuestion();
    },

    generateAnalysis() {
      window.ForgeState.set(window.ForgeState.states.ANALYSIS);
      window.ForgeMemory.updateStatus('analysis');

      const project = getProject();
      const answers = project.designer.answers || [];
      const studio = project.studio || {};

      const analysis = {
        summary: studio.description || 'Idea da definire con il cliente.',
        usage: answers[0] || 'Utilizzo da approfondire.',
        environment: answers[1] || 'Ambiente non specificato.',
        resistance: answers[2] || 'Resistenza da valutare.',
        style: answers[3] || studio.concept || 'Design moderno e funzionale.',
        dimensions: answers[4] || studio.size || 'Dimensioni da confermare.',
        recommendedMaterial: studio.material && studio.material !== 'Non lo so' ? studio.material : 'PETG',
        reasoning: 'La proposta dovrà bilanciare estetica, resistenza e facilità di stampa. La geometria dovrà evitare parti troppo sottili e privilegiare superfici stabili e stampabili.',
        risks: ['Dimensioni da verificare prima della modellazione CAD', 'Eventuali punti di fissaggio da confermare', 'Tolleranze da definire se il pezzo deve incastrarsi con altri oggetti']
      };

      window.ForgeMemory.setAnalysis(analysis);

      return {
        type: 'analysis',
        message: 'Perfetto. Ho raccolto abbastanza informazioni per costruire una prima analisi del progetto.',
        analysis,
        project: getProject()
      };
    },

    generateProposals() {
      window.ForgeState.set(window.ForgeState.states.PROPOSALS);
      window.ForgeMemory.updateStatus('proposals');

      const project = getProject();
      const material = project.designer.analysis?.recommendedMaterial || 'PETG';

      const proposals = [
        {
          id: 'minimal',
          title: 'Design Minimal',
          description: 'Una soluzione pulita, compatta e semplice da produrre, pensata per ridurre ingombro e tempi di stampa.',
          reasoning: 'Ho privilegiato linee essenziali e una struttura senza dettagli superflui, così il pezzo resta funzionale, economico e facile da rifinire.',
          material,
          strengths: ['Costo contenuto', 'Stampa più rapida', 'Aspetto ordinato'],
          renderPrompt: 'Render realistico di un oggetto stampato in 3D con design minimal, linee pulite, materiale plastico satinato, sfondo scuro premium.'
        },
        {
          id: 'modern',
          title: 'Design Moderno',
          description: 'Una proposta più curata esteticamente, con forme morbide e un aspetto più premium.',
          reasoning: 'Ho scelto un equilibrio tra funzionalità e design, così l’oggetto può stare bene anche in ambienti visibili come casa, scrivania o negozio.',
          material,
          strengths: ['Design curato', 'Buona resistenza', 'Adatto a uso quotidiano'],
          renderPrompt: 'Render realistico di un prodotto stampato in 3D moderno, forme morbide, finitura elegante, illuminazione da studio, sfondo dark tech.'
        },
        {
          id: 'technical',
          title: 'Design Tecnico',
          description: 'Una versione più robusta, pensata per resistenza, stabilità e uso pratico.',
          reasoning: 'Ho aumentato l’attenzione su spessori, punti di appoggio e semplicità costruttiva, ideale se il pezzo deve lavorare o sopportare sollecitazioni.',
          material,
          strengths: ['Più robusto', 'Funzionale', 'Adatto a prototipi tecnici'],
          renderPrompt: 'Render realistico di un componente tecnico stampato in 3D, struttura rinforzata, dettagli funzionali, materiale plastico resistente, sfondo professionale.'
        }
      ];

      window.ForgeMemory.setProposals(proposals);

      return {
        type: 'proposals',
        message: 'Ho preparato tre direzioni progettuali. Ognuna segue una logica diversa.',
        proposals,
        project: getProject()
      };
    }
  };

  window.ForgeConversation = ForgeConversation;
})();
