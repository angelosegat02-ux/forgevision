import { NextResponse } from 'next/server';

export async function POST(request) {
  const { project, mode } = await request.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY non configurata' }, { status: 503 });
  }

  const prompt = `
Sei ForgeVision Designer, un progettista virtuale per stampa 3D e prototipazione.
Rispondi solo in JSON valido.

Progetto:
${JSON.stringify(project, null, 2)}

Modalità: ${mode}

Se mode è "question", restituisci:
{"type":"question","question":"una sola domanda tecnica utile"}

Se mode è "analysis", restituisci:
{
 "type":"analysis",
 "analysis": {
   "summary":"...",
   "material":"...",
   "materialReason":"...",
   "designDirection":"...",
   "constraints":"...",
   "criticalities":"...",
   "confidence":100
 },
 "proposals":[
   {"id":"minimal","title":"Concept Minimal","description":"...","reasoning":"...","material":"...","renderPrompt":"..."},
   {"id":"moderno","title":"Concept Moderno","description":"...","reasoning":"...","material":"...","renderPrompt":"..."},
   {"id":"tecnico","title":"Concept Tecnico","description":"...","reasoning":"...","material":"...","renderPrompt":"..."}
 ]
}`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.6
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: 'Errore OpenAI', details: data }, { status: response.status });
  }

  const text = data.output_text || data.output?.[0]?.content?.[0]?.text || '{}';

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ type: 'question', question: text });
  }
}
