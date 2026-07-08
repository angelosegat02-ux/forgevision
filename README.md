# ForgeVision Next.js Migration

Questa è la migrazione iniziale di ForgeVision da HTML statico a Next.js.

## Comandi

```bash
npm install
npm run dev
```

Apri http://localhost:3000

## Deploy su Vercel

Dopo il push su GitHub, Vercel riconosce automaticamente Next.js.

## AI

La route API è in:

```
app/api/designer/route.js
```

Per attivare OpenAI aggiungi su Vercel la variabile:

```
OPENAI_API_KEY
```

Senza chiave API il sito usa il fallback locale.
