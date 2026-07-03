/*
  ForgeVision Designer Engine
  Versione 10 - base AI-ready
  Questo file gestisce il flusso intelligente del Designer.
  Oggi usa una logica simulata; in seguito potrà chiamare /api/designer.
*/

const DesignerEngine = {
  projectData: {},
  conversation: [],
  answers: [],
  questionIndex: 0,
  selectedProposal: null,

  baseQuestions: [
    {
      id: 'usage',
      text: 'A cosa servirà principalmente questo oggetto?',
      hint: 'Esempio: supporto per cuffie, ricambio, organizer, oggetto decorativo...'
    },
    {
      id: 'environment',
      text: 'Dove verrà utilizzato?',
      hint: 'Esempio: scrivania, auto, casa, esterno, officina...'
    },
    {
      id: 'strength',
      text: 'Deve sopportare peso, urti o sollecitazioni?',
      hint: 'Esempio: deve reggere 2 kg, deve essere solo estetico, deve stare al sole...'
    },
    {
      id: 'style',
      text: 'Che stile preferisci per questo oggetto?',
      hint: 'Esempio: minimal, moderno, tecnico, elegante, aggressivo...'
    },
    {
      id: 'constraints',
      text: 'Ci sono misure, spazi o vincoli importanti da rispettare?',
      hint: 'Esempio: massimo 15 cm, deve entrare in un cassetto, deve avere fori per viti...'
    }
  ],

  start(projectData = {}) {
    this.projectData = projectData || {};
    this.conversation = [];
    this.answers = [];
    this.questionIndex = 0;
    this.selectedProposal = null;

    const intro = this.buildIntro();
    this.conversation.push({ role: 'designer', content: intro });

    return {
      type: 'intro',
      message: intro
    };
  },

  buildIntro() {
    const idea = this.projectData.description || 'la tua idea';
    return `Ho letto le informazioni iniziali su ${idea}. Prima di proporti una soluzione, ti farò alcune domande mirate per capire meglio l'oggetto da realizzare.`;
  },

  getNextQuestion() {
    if (this.questionIndex >= this.baseQuestions.length) {
      return this.generateAnalysis();
    }

    const question = this.baseQuestions[this.questionIndex];
    this.questionIndex += 1;

    this.conversation.push({
      role: 'designer',
      content: question.text
    });

    return {
      type: 'question',
      question
    };
  },

  saveAnswer(answer) {
    const cleanAnswer = (answer || '').trim();
    if (!cleanAnswer) {
      return {
        type: 'error',
        message: 'Scrivi una risposta prima di continuare.'
      };
    }

    const currentQuestion = this.baseQuestions[this.questionIndex - 1];

    this.answers.push({
      questionId: currentQuestion?.id || `q${this.answers.length + 1}`,
      question: currentQuestion?.text || '',
      answer: cleanAnswer
    });

    this.conversation.push({
      role: 'user',
      content: cleanAnswer
    });

    return this.getNextQuestion();
  },

  getAnswer(id, fallback = 'Da definire') {
    return this.answers.find(item => item.questionId === id)?.answer || fallback;
  },

  getSuggestedMaterial() {
    const material = this.projectData.material;
    const strength = this.getAnswer('strength', '').toLowerCase();
    const environment = this.getAnswer('environment', '').toLowerCase();

    if (material && material !== 'Non lo so') return material;
    if (environment.includes('auto') || environment.includes('sole') || environment.includes('esterno')) return 'PETG';
    if (strength.includes('peso') || strength.includes('urti') || strength.includes('resist')) return 'PETG';
    return 'PLA';
  },

  generateAnalysis() {
    const material = this.getSuggestedMaterial();
    const analysis = {
      uso: this.getAnswer('usage'),
      ambiente: this.getAnswer('environment'),
      resistenza: this.getAnswer('strength'),
      stile: this.getAnswer('style'),
      vincoli: this.getAnswer('constraints'),
      materialeConsigliato: material,
      ragionamento: this.buildReasoning(material),
      indicazioni: [
        'Progettare una forma stabile e facilmente stampabile.',
        'Evitare dettagli troppo sottili nelle parti soggette a sforzo.',
        'Ottimizzare il modello per ridurre supporti, tempo e materiale.',
        'Prevedere spessori adeguati in base all’uso reale.'
      ]
    };

    this.conversation.push({
      role: 'designer',
      content: 'Ho raccolto abbastanza informazioni. Ora posso preparare una prima analisi progettuale.'
    });

    return {
      type: 'analysis',
      message: 'Perfetto. Ho abbastanza informazioni per proporti una direzione progettuale.',
      analysis
    };
  },

  buildReasoning(material) {
    const style = this.getAnswer('style', 'moderno');
    const constraints = this.getAnswer('constraints', 'senza vincoli specifici');
    return `Imposterei il progetto con uno stile ${style}, rispettando il vincolo: ${constraints}. Il materiale consigliato è ${material}, perché offre un buon equilibrio tra qualità, resistenza e semplicità di produzione in stampa 3D.`;
  },

  generateProposals() {
    const material = this.getSuggestedMaterial();
    const usage = this.getAnswer('usage', this.projectData.description || 'oggetto personalizzato');
    const environment = this.getAnswer('environment', 'ambiente generico');
    const constraints = this.getAnswer('constraints', 'nessun vincolo specifico');

    return {
      type: 'proposals',
      message: 'Ecco tre proposte pensate partendo dalle informazioni raccolte. Scegli quella più vicina alla tua idea oppure chiedi una modifica.',
      proposals: [
        {
          id: 'minimal',
          title: 'Design Minimal',
          badge: 'Pulito',
          icon: '◖',
          description: `Una versione essenziale e compatta del progetto: ${usage}.`,
          reasoning: `Ho ridotto le forme al minimo per ottenere un oggetto semplice, elegante e veloce da stampare. È ideale se vuoi un risultato discreto e ordinato per ${environment}.`,
          material,
          renderPrompt: `Render 3D realistico di ${usage}, stile minimal, materiale ${material}, forma pulita, colore scuro, sfondo da studio fotografico, prodotto stampabile in 3D.`,
          strengths: ['Ingombro ridotto', 'Costo più contenuto', 'Stampa più rapida', 'Aspetto pulito']
        },
        {
          id: 'modern',
          title: 'Design Moderno',
          badge: 'Consigliata',
          icon: '◆',
          description: `Una proposta più curata e visivamente distintiva per realizzare ${usage}.`,
          reasoning: `Ho scelto linee più morbide e un volume più equilibrato per dare al pezzo un aspetto premium senza perdere funzionalità. Tiene conto del vincolo: ${constraints}.`,
          material,
          renderPrompt: `Render 3D realistico di ${usage}, design moderno, materiale ${material}, superfici morbide, geometria elegante, oggetto stampato in 3D, sfondo chiaro da studio.`,
          strengths: ['Look professionale', 'Buona stabilità', 'Design più riconoscibile', 'Equilibrio tra estetica e funzione']
        },
        {
          id: 'technical',
          title: 'Design Tecnico',
          badge: 'Robusto',
          icon: '▥',
          description: `Una versione rinforzata e funzionale del progetto: ${usage}.`,
          reasoning: `Ho privilegiato spessori, nervature e stabilità. Questa proposta è più adatta se il pezzo dovrà sopportare peso, urti o uso frequente.`,
          material,
          renderPrompt: `Render 3D realistico di ${usage}, design tecnico e robusto, materiale ${material}, struttura rinforzata, nervature visibili, prodotto funzionale stampabile in 3D.`,
          strengths: ['Massima resistenza', 'Struttura rinforzata', 'Adatto a uso pratico', 'Maggiore durata']
        }
      ]
    };
  },

  selectProposal(id) {
    this.selectedProposal = id;
    return {
      type: 'selected',
      selectedProposal: id,
      message: 'Ottima scelta. Posso usare questa proposta come base per il preventivo e per la futura progettazione del modello 3D.'
    };
  },

  requestRevision(note) {
    const cleanNote = (note || '').trim();
    this.conversation.push({
      role: 'user',
      content: `Modifica richiesta: ${cleanNote}`
    });

    return {
      type: 'revision',
      message: 'Perfetto. Userò questa modifica per aggiornare la proposta progettuale.',
      note: cleanNote
    };
  },

  exportProject() {
    return {
      projectData: this.projectData,
      answers: this.answers,
      selectedProposal: this.selectedProposal,
      conversation: this.conversation
    };
  }
};

window.DesignerEngine = DesignerEngine;
