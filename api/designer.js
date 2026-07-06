export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { mode = 'question', project = {}, conversation = [], answers = [], questionIndex = 0 } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        type: 'fallback',
        message: 'OpenAI non è ancora configurato. Il sito userà ForgeCore locale.'
      });
    }

    const systemPrompt = `
Sei ForgeVision Designer, un progettista virtuale per stampa 3D e prototipazione.
Devi aiutare il cliente a trasformare un'idea in un oggetto realizzabile.
Rispondi sempre in italiano.
Non dire mai che sei ChatGPT.
Non promettere generazione automatica di STL finale.
Fai una sola domanda alla volta se servono informazioni.
Massimo 5 domande totali prima delle proposte.
Quando generi proposte, crea 3 alternative: Minimal, Moderno, Tecnico.
Ogni proposta deve contenere: id, title, description, reasoning, material, strengths, renderPrompt.
Restituisci SOLO JSON valido, senza markdown.
`;

    const schemaInstruction = mode === 'proposals'
      ? `Restituisci JSON nel formato:
{
  "type":"proposals",
  "message":"testo introduttivo",
  "analysis":{
    "sintesi":"...",
    "uso":"...",
    "ambiente":"...",
    "resistenza":"...",
    "stile":"...",
    "dimensioni":"...",
    "materialeConsigliato":"...",
    "notaTecnica":"..."
  },
  "proposals":[
    {"id":"minimal","title":"Design Minimal","description":"...","reasoning":"...","material":"...","strengths":["..."],"renderPrompt":"..."},
    {"id":"modern","title":"Design Moderno","description":"...","reasoning":"...","material":"...","strengths":["..."],"renderPrompt":"..."},
    {"id":"technical","title":"Design Tecnico","description":"...","reasoning":"...","material":"...","strengths":["..."],"renderPrompt":"..."}
  ]
}`
      : `Restituisci JSON nel formato:
{"type":"question","message":"breve introduzione","question":"una domanda utile e specifica"}`;

    const userPrompt = `
DATI BASE DEL PROGETTO:
${JSON.stringify(project, null, 2)}

RISPOSTE RACCOLTE:
${JSON.stringify(answers, null, 2)}

CONVERSAZIONE:
${JSON.stringify(conversation, null, 2)}

DOMANDA NUMERO: ${questionIndex + 1}
MODALITÀ: ${mode}

${schemaInstruction}
`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.65
      })
    });

    const raw = await response.json();
    if (!response.ok) {
      return res.status(200).json({ type: 'fallback', error: 'Errore OpenAI', details: raw });
    }

    const text = raw.output_text || raw.output?.[0]?.content?.[0]?.text || '';
    try {
      return res.status(200).json(JSON.parse(text));
    } catch (error) {
      return res.status(200).json({
        type: mode === 'proposals' ? 'fallback' : 'question',
        message: 'Risposta ricevuta ma non in formato JSON perfetto.',
        question: text || 'Puoi aggiungere un dettaglio importante sul progetto?'
      });
    }
  } catch (error) {
    return res.status(200).json({ type: 'fallback', error: error.message });
  }
}
