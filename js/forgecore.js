/* ForgeVision V11 — ForgeCore
   Motore frontend del ForgeVision Designer.
   Funziona subito in modalità simulata e, quando /api/designer è attiva su Vercel,
   può ricevere domande/proposte reali dall'AI. */

window.ForgeCore = (() => {
  const state = {
    project: {},
    conversation: [],
    phase: 'idle',
    questionIndex: 0,
    maxQuestions: 5,
    answers: [],
    analysis: null,
    proposals: [],
    selectedProposal: null,
    useApi: true
  };

  const fallbackQuestions = [
    'A cosa servirà principalmente questo oggetto?',
    'Dove verrà utilizzato: casa, auto, ufficio, esterno, automobile o altro?',
    'Il pezzo dovrà sopportare peso, calore, urti o movimenti?',
    'Preferisci un design minimal, moderno, tecnico o più scenico?',
    'Ci sono dimensioni precise, misure o limiti di spazio da rispettare?'
  ];

  function reset(project = {}) {
    state.project = { ...project };
    state.conversation = [];
    state.phase = 'intro';
    state.questionIndex = 0;
    state.answers = [];
    state.analysis = null;
    state.proposals = [];
    state.selectedProposal = null;
    addDesignerMessage('Ciao! Sono ForgeVision Designer. Ho letto le informazioni iniziali del tuo progetto. Prima di proporti una soluzione, ti farò alcune domande mirate per capire meglio cosa vuoi realizzare.');
    return snapshot();
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(state));
  }

  function addDesignerMessage(content, meta = {}) {
    const msg = { role: 'designer', content, time: now(), ...meta };
    state.conversation.push(msg);
    return msg;
  }

  function addUserMessage(content) {
    const msg = { role: 'user', content, time: now() };
    state.conversation.push(msg);
    state.answers.push(content);
    return msg;
  }

  function now() {
    return new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  function getNextFallbackQuestion() {
    if (state.questionIndex >= state.maxQuestions) return null;
    const question = fallbackQuestions[state.questionIndex] || 'C’è qualche dettaglio importante che vuoi aggiungere prima delle proposte?';
    state.questionIndex += 1;
    state.phase = 'questions';
    addDesignerMessage(question, { type: 'question' });
    return question;
  }

  async function nextQuestion() {
    // In V11 la chiamata API è predisposta, ma se qualcosa non è configurato passa automaticamente al motore locale.
    const apiResult = await callDesignerApi('question').catch(() => null);

    if (apiResult && apiResult.type === 'question' && apiResult.question) {
      state.phase = 'questions';
      state.questionIndex += 1;
      addDesignerMessage(apiResult.question, { type: 'question', ai: true });
      return snapshot();
    }

    getNextFallbackQuestion();
    return snapshot();
  }

  async function answer(text) {
    if (!text || !text.trim()) return snapshot();
    addUserMessage(text.trim());

    if (state.questionIndex >= state.maxQuestions) {
      await buildAnalysisAndProposals();
      return snapshot();
    }

    return nextQuestion();
  }

  async function buildAnalysisAndProposals() {
    const apiResult = await callDesignerApi('proposals').catch(() => null);

    if (apiResult && apiResult.type === 'proposals' && Array.isArray(apiResult.proposals) && apiResult.proposals.length) {
      state.phase = 'proposals';
      state.analysis = normalizeAnalysis(apiResult.analysis || apiResult.message);
      state.proposals = normalizeProposals(apiResult.proposals);
      addDesignerMessage(apiResult.message || 'Ho completato l’analisi. Ecco alcune proposte progettuali basate sulle informazioni raccolte.', { type: 'analysis', ai: true });
      return snapshot();
    }

    state.phase = 'proposals';
    state.analysis = createFallbackAnalysis();
    state.proposals = createFallbackProposals();
    addDesignerMessage('Perfetto. Ho abbastanza informazioni per trasformare la tua idea in tre direzioni progettuali diverse. Ti spiego il ragionamento e poi scegliamo insieme la proposta migliore.', { type: 'analysis' });
    return snapshot();
  }

  async function callDesignerApi(mode) {
    if (!state.useApi) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch('/api/designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          project: state.project,
          conversation: state.conversation,
          answers: state.answers,
          questionIndex: state.questionIndex
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      clearTimeout(timeout);
      return null;
    }
  }

  function normalizeAnalysis(raw) {
    if (typeof raw === 'object' && raw !== null) return raw;
    return createFallbackAnalysis(raw);
  }

  function normalizeProposals(proposals) {
    return proposals.slice(0, 3).map((p, index) => ({
      id: p.id || `proposal-${index + 1}`,
      title: p.title || ['Design Minimal', 'Design Moderno', 'Design Tecnico'][index] || 'Proposta Design',
      description: p.description || 'Soluzione progettata in base alle informazioni raccolte.',
      reasoning: p.reasoning || p.ragionamento || 'La proposta bilancia estetica, funzionalità e semplicità di stampa.',
      material: p.material || p.materiale || suggestedMaterial(),
      strengths: Array.isArray(p.strengths) ? p.strengths : (Array.isArray(p.puntiDiForza) ? p.puntiDiForza : ['Funzionale', 'Stampabile in 3D', 'Personalizzabile']),
      renderPrompt: p.promptRender || p.renderPrompt || buildRenderPrompt(p.title || 'prodotto stampato in 3D'),
      visual: ['minimal', 'modern', 'technical'][index] || 'modern'
    }));
  }

  function createFallbackAnalysis(extra = '') {
    const [uso, ambiente, resistenza, stile, dimensioni] = state.answers;
    return {
      sintesi: `L’oggetto verrà pensato per ${uso || 'l’utilizzo indicato'}, con attenzione a funzionalità, stabilità e semplicità di produzione.` + (extra ? ` ${extra}` : ''),
      uso: uso || state.project.description || 'Utilizzo da definire',
      ambiente: ambiente || 'Ambiente da confermare',
      resistenza: resistenza || 'Resistenza da valutare in base al carico reale',
      stile: stile || 'Design moderno e pulito',
      dimensioni: dimensioni || state.project.size || 'Dimensioni da definire',
      materialeConsigliato: suggestedMaterial(),
      notaTecnica: 'La geometria dovrà evitare parti troppo sottili e dovrà essere ottimizzata per ridurre supporti, sprechi e tempi di stampa.'
    };
  }

  function createFallbackProposals() {
    const material = suggestedMaterial();
    return [
      {
        id: 'minimal',
        title: 'Design Minimal',
        description: 'Una versione pulita, compatta ed elegante, pensata per essere semplice da produrre e facile da usare.',
        reasoning: 'Ho scelto linee essenziali per ridurre materiale, ingombro e tempi di stampa, mantenendo un aspetto ordinato.',
        material,
        strengths: ['Ingombro ridotto', 'Costo più contenuto', 'Stampa più rapida', 'Aspetto pulito'],
        renderPrompt: buildRenderPrompt('oggetto minimal con linee pulite'),
        visual: 'minimal'
      },
      {
        id: 'modern',
        title: 'Design Moderno',
        description: 'Una proposta più curata esteticamente, con forme morbide e un look più premium.',
        reasoning: 'Ho privilegiato un equilibrio tra estetica e funzionalità, così l’oggetto può essere pratico ma anche bello da vedere.',
        material,
        strengths: ['Look premium', 'Buona stabilità', 'Personalizzabile', 'Adatto a casa o scrivania'],
        renderPrompt: buildRenderPrompt('oggetto moderno con forme morbide e base stabile'),
        visual: 'modern'
      },
      {
        id: 'technical',
        title: 'Design Tecnico',
        description: 'Una versione più robusta e funzionale, pensata per resistenza, durata e utilizzo pratico.',
        reasoning: 'Ho aumentato la robustezza strutturale e semplificato le geometrie critiche per rendere il pezzo più affidabile.',
        material: material === 'PLA' ? 'PETG' : material,
        strengths: ['Struttura rinforzata', 'Maggiore resistenza', 'Uso tecnico', 'Affidabilità superiore'],
        renderPrompt: buildRenderPrompt('oggetto tecnico rinforzato con nervature strutturali'),
        visual: 'technical'
      }
    ];
  }

  function suggestedMaterial() {
    const m = (state.project.material || '').toLowerCase();
    if (m && m !== 'non lo so') return state.project.material;
    const text = [...state.answers, state.project.description].join(' ').toLowerCase();
    if (text.includes('auto') || text.includes('calore') || text.includes('sole') || text.includes('resistente')) return 'PETG';
    if (text.includes('dettaglio') || text.includes('miniatura') || text.includes('preciso')) return 'Resina';
    return 'PLA o PETG';
  }

  function buildRenderPrompt(style) {
    const idea = state.project.description || 'oggetto personalizzato stampato in 3D';
    return `Render 3D realistico di ${idea}, stile ${style}, materiale ${suggestedMaterial()}, sfondo neutro, illuminazione da studio, prodotto singolo ben visibile, design stampabile in 3D.`;
  }

  function selectProposal(id) {
    const proposal = state.proposals.find(p => p.id === id);
    state.selectedProposal = proposal || null;
    state.phase = 'confirm';
    if (proposal) addDesignerMessage(`Hai selezionato “${proposal.title}”. Possiamo usare questa proposta come base per il preventivo oppure modificarla ancora.`, { type: 'selection' });
    return snapshot();
  }

  function modifyRequest(text) {
    if (!text || !text.trim()) return snapshot();
    addUserMessage(text.trim());
    state.phase = 'proposals';
    state.analysis = createFallbackAnalysis('Ho aggiornato il ragionamento tenendo conto della modifica richiesta.');
    state.proposals = createFallbackProposals().map((p, i) => ({ ...p, title: `${p.title} aggiornato`, reasoning: `${p.reasoning} Modifica richiesta: ${text.trim()}` }));
    addDesignerMessage('Perfetto, ho aggiornato le proposte in base alla modifica. Scegli quella più vicina a ciò che avevi in mente.', { type: 'revision' });
    return snapshot();
  }

  function getQuotePreview() {
    const complexity = state.selectedProposal?.id === 'technical' ? 'Media' : 'Bassa / Media';
    const base = state.selectedProposal?.id === 'technical' ? [45, 85] : state.selectedProposal?.id === 'modern' ? [35, 70] : [25, 55];
    return {
      range: `${base[0]}€ – ${base[1]}€`,
      timing: '3–7 giorni lavorativi',
      complexity,
      note: 'Stima indicativa. Il prezzo definitivo verrà confermato dopo verifica tecnica, dimensioni reali e materiale.'
    };
  }

  return {
    state,
    reset,
    snapshot,
    nextQuestion,
    answer,
    buildAnalysisAndProposals,
    selectProposal,
    modifyRequest,
    getQuotePreview
  };
})();
