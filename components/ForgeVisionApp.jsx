'use client';

import { useMemo, useState } from 'react';
import ForgeVisionDesigner from './ForgeVisionDesigner';
import {
  addConversationAnswer,
  buildFallbackAnalysis,
  buildFallbackProposals,
  createProjectMemory,
  fallbackQuestions
} from '../lib/forgecore';

const studioSteps = [
  { key: 'path', title: 'Come possiamo aiutarti?', type: 'cards', options: ['Ho un’idea', 'Ho un file STL', 'Voglio modificare un oggetto'] },
  { key: 'idea', title: 'Raccontaci il tuo progetto', type: 'textarea', placeholder: 'Descrivi cosa vuoi realizzare...' },
  { key: 'size', title: 'Quanto sarà grande?', type: 'cards', options: ['Piccolo', 'Medio', 'Grande', 'Non lo so'] },
  { key: 'material', title: 'Quale materiale preferisci?', type: 'cards', options: ['PLA', 'PETG', 'ABS', 'Resina', 'Non lo so'] },
  { key: 'color', title: 'Scegli un colore', type: 'cards', options: ['Bianco', 'Nero', 'Rosso', 'Blu', 'Verde', 'Altro'] },
  { key: 'quantity', title: 'Quanti pezzi vuoi?', type: 'quantity' },
  { key: 'delivery', title: 'Consegna', type: 'cards', options: ['Standard', 'Espressa', 'Ritiro'] }
];

export default function ForgeVisionApp() {
  const [project, setProject] = useState(() => createProjectMemory());
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioStep, setStudioStep] = useState(0);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [designerPhase, setDesignerPhase] = useState('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(fallbackQuestions[0]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const currentStudio = studioSteps[studioStep];
  const progress = Math.round(((studioStep + 1) / studioSteps.length) * 100);

  function updateStudio(key, value) {
    setProject((prev) => ({ ...prev, studio: { ...prev.studio, [key]: value } }));
  }

  function nextStudio() {
    if (studioStep < studioSteps.length - 1) {
      setStudioStep((s) => s + 1);
    } else {
      setStudioOpen(false);
      setDesignerOpen(true);
      setDesignerPhase('intro');
      setProject((prev) => ({ ...prev, status: 'designer' }));
    }
  }

  async function askAIOrFallback(nextProject, mode = 'question') {
    try {
      const response = await fetch('/api/designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: nextProject, mode })
      });

      if (!response.ok) throw new Error('AI non disponibile');
      return await response.json();
    } catch {
      if (mode === 'analysis') {
        return {
          type: 'analysis',
          analysis: buildFallbackAnalysis(nextProject),
          proposals: buildFallbackProposals(nextProject)
        };
      }
      return {
        type: 'question',
        question: fallbackQuestions[Math.min(questionIndex, fallbackQuestions.length - 1)]
      };
    }
  }

  async function startDesigner() {
    setDesignerPhase('conversation');
    setCurrentQuestion(fallbackQuestions[0]);
  }

  async function sendAnswer() {
    if (!answer.trim()) return;
    const updated = addConversationAnswer(project, currentQuestion, answer.trim());
    setProject(updated);
    setAnswer('');

    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);

    if (nextIndex >= fallbackQuestions.length || updated.confidence >= 95) {
      setLoading(true);
      const result = await askAIOrFallback(updated, 'analysis');
      setProject((prev) => ({
        ...prev,
        status: 'analysis',
        analysis: result.analysis || buildFallbackAnalysis(updated),
        proposals: result.proposals?.length ? result.proposals : buildFallbackProposals(updated),
        confidence: 100
      }));
      setLoading(false);
      setDesignerPhase('analysis');
      return;
    }

    const ai = await askAIOrFallback(updated, 'question');
    setCurrentQuestion(ai.question || fallbackQuestions[nextIndex]);
  }

  function selectProposal(proposal) {
    setProject((prev) => ({ ...prev, selectedProposal: proposal, status: 'quote' }));
    setDesignerPhase('quote');
  }

  return (
    <main>
      <nav className="nav">
        <div className="brand">FORGEVISION</div>
        <div className="navLinks"><a href="#how">Come funziona</a><a href="#shop">Shop</a><a href="#portfolio">Portfolio</a></div>
      </nav>

      <section className="hero">
        <div className="gridGlow" />
        <div className="orb orbOne" />
        <div className="orb orbTwo" />
        <div className="heroContent">
          <p className="eyebrow">Progettazione assistita + stampa 3D</p>
          <h1>FORGEVISION</h1>
          <h2>Dalla tua mente alla realtà</h2>
          <p className="heroClaim">Non servono competenze di modellazione 3D. Basta la tua idea.</p>

          <div className="studioCard">
            <div className="studioHeader">✨ ForgeVision Studio</div>
            <textarea
              value={project.studio.idea}
              onChange={(e) => updateStudio('idea', e.target.value)}
              placeholder="Raccontaci la tua idea..."
            />
            <div className="actionRow">
              <button className="ghost">📷 Immagine</button>
              <button className="ghost">📦 STL</button>
            </div>
            <button className="primary" onClick={() => setStudioOpen(true)}>Dai vita alla tua idea</button>
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <h2>Come funziona</h2>
        <div className="cards">
          <div className="card"><span>01</span><h3>Racconta l’idea</h3><p>Partiamo da parole, schizzi o file STL.</p></div>
          <div className="card"><span>02</span><h3>ForgeVision Designer</h3><p>Il progettista digitale ti guida con domande mirate.</p></div>
          <div className="card"><span>03</span><h3>Produzione</h3><p>Stampiamo il tuo progetto e lo spediamo a casa tua.</p></div>
        </div>
      </section>

      <section id="shop" className="section muted"><h2>Shop</h2><p>Prodotti già pronti e personalizzabili.</p></section>
      <section id="portfolio" className="section"><h2>Portfolio</h2><p>Una galleria dei progetti realizzati e delle nostre stampanti.</p></section>

      {studioOpen && (
        <div className="overlay">
          <div className="modal studioModal">
            <button className="close" onClick={() => setStudioOpen(false)}>×</button>
            <div className="progress"><span style={{ width: `${progress}%` }} /></div>
            <p className="stepLabel">Step {studioStep + 1} di {studioSteps.length}</p>
            <h2>{currentStudio.title}</h2>

            {currentStudio.type === 'textarea' && (
              <textarea className="bigInput" value={project.studio[currentStudio.key] || ''} onChange={(e) => updateStudio(currentStudio.key, e.target.value)} placeholder={currentStudio.placeholder} />
            )}

            {currentStudio.type === 'cards' && (
              <div className="choiceGrid">
                {currentStudio.options.map((option) => (
                  <button key={option} className={`choice ${project.studio[currentStudio.key] === option ? 'selected' : ''}`} onClick={() => updateStudio(currentStudio.key, option)}>{option}</button>
                ))}
              </div>
            )}

            {currentStudio.type === 'quantity' && (
              <div className="quantity">
                <button onClick={() => updateStudio('quantity', Math.max(1, project.studio.quantity - 1))}>−</button>
                <strong>{project.studio.quantity}</strong>
                <button onClick={() => updateStudio('quantity', project.studio.quantity + 1)}>+</button>
              </div>
            )}

            <div className="modalNav">
              <button className="ghost" disabled={studioStep === 0} onClick={() => setStudioStep((s) => Math.max(0, s - 1))}>Indietro</button>
              <button className="primary" onClick={nextStudio}>{studioStep === studioSteps.length - 1 ? 'Apri ForgeVision Designer' : 'Avanti'}</button>
            </div>
          </div>
        </div>
      )}

      {designerOpen && (
        <ForgeVisionDesigner
          project={project}
          phase={designerPhase}
          currentQuestion={currentQuestion}
          answer={answer}
          loading={loading}
          onClose={() => setDesignerOpen(false)}
          onStart={startDesigner}
          onAnswerChange={setAnswer}
          onSendAnswer={sendAnswer}
          onShowProposals={() => setDesignerPhase('proposals')}
          onBackToConversation={() => setDesignerPhase('conversation')}
          onSelectProposal={selectProposal}
        />
      )}

    </main>
  );
}
