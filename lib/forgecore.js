export function createProjectMemory() {
  const year = new Date().getFullYear();
  const id = `FV-${year}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    projectId: id,
    status: 'studio',
    studio: {
      idea: '',
      path: '',
      size: '',
      material: '',
      color: '',
      quantity: 1,
      delivery: ''
    },
    conversation: [],
    confidence: 20,
    analysis: null,
    proposals: [],
    selectedProposal: null
  };
}

export const fallbackQuestions = [
  'A cosa servirà principalmente questo oggetto?',
  'Dove verrà utilizzato: casa, auto, ufficio, esterno o altro?',
  'Deve sopportare peso, calore, urti o vibrazioni?',
  'Preferisci un design minimal, moderno o più tecnico?',
  'Ci sono dimensioni precise o limiti di spazio da rispettare?'
];

export function addConversationAnswer(project, question, answer) {
  const conversation = [
    ...project.conversation,
    { role: 'designer', content: question },
    { role: 'user', content: answer }
  ];

  return {
    ...project,
    conversation,
    confidence: Math.min(100, project.confidence + 16)
  };
}

export function buildFallbackAnalysis(project) {
  const answers = project.conversation.filter((m) => m.role === 'user').map((m) => m.content);
  const idea = project.studio.idea || 'oggetto personalizzato';

  return {
    summary: `Ho interpretato il progetto come una richiesta per realizzare ${idea}. Le informazioni raccolte mi permettono di proporre una soluzione stampabile, stabile e coerente con l'utilizzo indicato.`,
    material: project.studio.material && project.studio.material !== 'Non lo so' ? project.studio.material : 'PETG',
    materialReason: 'È una scelta versatile, più resistente del PLA e adatta a molti oggetti funzionali.',
    designDirection: answers[3] || 'Design moderno e funzionale',
    constraints: answers[4] || project.studio.size || 'Dimensioni da confermare in fase di progettazione',
    criticalities: 'Da verificare spessori, punti di carico e orientamento di stampa.',
    confidence: project.confidence
  };
}

export function buildFallbackProposals(project) {
  const idea = project.studio.idea || 'oggetto personalizzato';

  return [
    {
      id: 'minimal',
      title: 'Concept Minimal',
      description: `Versione essenziale di ${idea}, pensata per essere pulita, compatta e facile da stampare.`,
      reasoning: 'Ho privilegiato linee semplici, meno materiale e una geometria stabile per ridurre tempi e costi.',
      material: project.studio.material || 'PLA / PETG',
      renderPrompt: `Render realistico da studio di un ${idea} in stile minimal, stampabile in 3D, materiale opaco, sfondo scuro, illuminazione premium.`
    },
    {
      id: 'moderno',
      title: 'Concept Moderno',
      description: `Versione più curata esteticamente, con forme morbide e aspetto premium.`,
      reasoning: 'Ho dato più importanza all’estetica mantenendo comunque una struttura realizzabile in stampa 3D.',
      material: 'PETG',
      renderPrompt: `Render realistico da studio di un ${idea} moderno, bordi arrotondati, design premium, prodotto stampato in 3D, luce cinematografica.`
    },
    {
      id: 'tecnico',
      title: 'Concept Tecnico',
      description: `Versione robusta e funzionale, pensata per resistenza e utilizzo pratico.`,
      reasoning: 'Ho aumentato solidità e semplicità produttiva, riducendo parti fragili e geometrie complesse.',
      material: 'PETG / ABS',
      renderPrompt: `Render realistico tecnico di un ${idea} robusto, struttura rinforzata, dettagli funzionali, materiale plastico stampato in 3D.`
    }
  ];
}
