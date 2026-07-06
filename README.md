# ForgeVision V11 — ForgeCore AI Base

Questa versione introduce la prima architettura reale per la parte intelligente di ForgeVision.

## Cosa contiene

- Home e ForgeVision Studio esistenti.
- Nuovo motore `ForgeCore` in `js/forgecore.js`.
- Flusso: Studio → ForgeVision Designer → domande → analisi → proposte → anteprima preventivo.
- Backend `api/designer.js` predisposto per OpenAI su Vercel.
- Fallback locale: il Designer funziona anche senza API key, così puoi testare l'esperienza subito.

## Come pubblicare

Dopo aver sostituito i file nella cartella del progetto:

```bash
git add .
git commit -m "ForgeVision V11 ForgeCore Designer"
git push
```

## Collegamento AI reale

Quando vuoi attivare l'AI vera:

1. Vai su Vercel → progetto ForgeVision → Settings → Environment Variables.
2. Aggiungi:
   - `OPENAI_API_KEY` = la tua chiave OpenAI
   - opzionale: `OPENAI_MODEL` = `gpt-4.1-mini`
3. Rifai deploy.

Se la chiave non è presente, il sito userà automaticamente il motore locale simulato.

## Prossimo sprint

V12: collegare generazione render reali dalle proposte approvate.
