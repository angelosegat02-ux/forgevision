# ForgeVision V10 - AI Base

Questa versione introduce una base ordinata per l'integrazione dell'intelligenza artificiale:

- `js/designerEngine.js` — cervello frontend del ForgeVision Designer
- `js/app.js` — flusso Studio → Designer → Proposte → Preventivo
- `api/designer.js` — endpoint backend Vercel pronto per OpenAI

## Stato

La parte AI è simulata per testare l'esperienza senza costi API. Nel prossimo step sarà possibile collegare OpenAI inserendo `OPENAI_API_KEY` su Vercel.
