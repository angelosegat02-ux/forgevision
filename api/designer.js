// ForgeVision Designer API
// Questa funzione è pronta per il futuro collegamento con OpenAI.
// Per ora il sito usa js/designerEngine.js in modalità simulata.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  return res.status(200).json({
    status: 'ready',
    message: 'ForgeVision Designer API pronta. Nel prossimo step collegheremo qui OpenAI con OPENAI_API_KEY su Vercel.'
  });
}
