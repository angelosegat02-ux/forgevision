'use client';

export default function ForgeVisionDesigner({
  project,
  phase,
  currentQuestion,
  answer,
  loading,
  onClose,
  onStart,
  onAnswerChange,
  onSendAnswer,
  onShowProposals,
  onBackToConversation,
  onSelectProposal
}) {
  return (
    <div className="designerPageOverlay">
      <div className="designerAppShell">
        <button className="designerClose" onClick={onClose}>×</button>
        <DesignerSidebar project={project} />

        <section className="designerWorkspace">
          <div className="designerTopbar">
            <div>
              <p className="eyebrow small">ForgeVision platform</p>
              <h2>✨ ForgeVision Designer</h2>
            </div>
            <button className="ghost smallButton">Salva progetto</button>
          </div>

          {phase === 'intro' && (
            <IntroPanel onStart={onStart} />
          )}

          {phase === 'conversation' && (
            <ConversationPanel
              currentQuestion={currentQuestion}
              answer={answer}
              onAnswerChange={onAnswerChange}
              onSendAnswer={onSendAnswer}
              project={project}
            />
          )}

          {loading && (
            <LoadingPanel />
          )}

          {phase === 'analysis' && project.analysis && (
            <AnalysisPanel
              project={project}
              onShowProposals={onShowProposals}
              onBackToConversation={onBackToConversation}
            />
          )}

          {phase === 'proposals' && (
            <ProposalPanel
              proposals={project.proposals || []}
              onSelectProposal={onSelectProposal}
            />
          )}

          {phase === 'quote' && (
            <QuotePreview project={project} />
          )}
        </section>
      </div>
    </div>
  );
}

function DesignerSidebar({ project }) {
  const steps = [
    { key: 'studio', label: 'Idea iniziale' },
    { key: 'designer', label: 'Conversazione' },
    { key: 'analysis', label: 'Analisi progetto' },
    { key: 'concept', label: 'Proposte design' },
    { key: 'render', label: 'Render' },
    { key: 'quote', label: 'Preventivo' }
  ];

  const statusIndex = getStatusIndex(project.status, project);

  return (
    <aside className="designerSidebar">
      <div className="designerLogo">
        <span>FV</span>
        <div>
          <strong>ForgeVision</strong>
          <small>Designer</small>
        </div>
      </div>

      <div className="projectBadge">
        <small>Progetto attivo</small>
        <strong>{project.projectId}</strong>
      </div>

      <div className="confidenceBox">
        <div className="confidenceHeader">
          <span>Comprensione</span>
          <strong>{project.confidence || 0}%</strong>
        </div>
        <div className="confidence"><span style={{ width: `${project.confidence || 0}%` }} /></div>
      </div>

      <ul className="designerSteps">
        {steps.map((step, index) => (
          <li key={step.key} className={index < statusIndex ? 'done' : index === statusIndex ? 'active' : ''}>
            <span>{index < statusIndex ? '✓' : index + 1}</span>
            {step.label}
          </li>
        ))}
      </ul>

      <div className="projectSummaryCard">
        <h4>📁 Scheda progetto</h4>
        <SummaryItem label="Idea" value={project.studio?.idea || 'Da definire'} />
        <SummaryItem label="Dimensione" value={project.studio?.size || 'Da definire'} />
        <SummaryItem label="Materiale" value={project.studio?.material || 'Da definire'} />
        <SummaryItem label="Colore" value={project.studio?.color || 'Da definire'} />
        <SummaryItem label="Quantità" value={project.studio?.quantity || 1} />
      </div>
    </aside>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="summaryItem">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function IntroPanel({ onStart }) {
  return (
    <div className="designerHeroPanel">
      <div className="pulseIcon">✦</div>
      <h1>Entriamo nello studio del progetto</h1>
      <p>
        Analizzerò le informazioni raccolte da ForgeVision Studio e ti farò alcune domande mirate.
        L’obiettivo è arrivare a un concept chiaro prima del preventivo.
      </p>
      <button className="primary" onClick={onStart}>Inizia la progettazione</button>
    </div>
  );
}

function ConversationPanel({ currentQuestion, answer, onAnswerChange, onSendAnswer, project }) {
  return (
    <div className="designerChatLayout">
      <div className="chatStream">
        <Message role="designer">
          Ciao, sono ForgeVision Designer. Ho letto la tua idea e sto costruendo la scheda del progetto.
        </Message>
        {(project.conversation || []).map((item, index) => (
          <Message key={index} role={item.role === 'user' ? 'user' : 'designer'}>{item.content || item.answer || item.question}</Message>
        ))}
        <Message role="designer">{currentQuestion}</Message>
      </div>

      <div className="answerComposer">
        <textarea value={answer} onChange={(e) => onAnswerChange(e.target.value)} placeholder="Rispondi come parleresti a un progettista..." />
        <button className="primary" onClick={onSendAnswer}>Invia risposta</button>
      </div>
    </div>
  );
}

function Message({ role, children }) {
  return (
    <div className={`designerMessage ${role}`}>
      <div className="avatar">{role === 'user' ? 'TU' : 'FV'}</div>
      <div className="bubble">
        <strong>{role === 'user' ? 'Tu' : 'ForgeVision Designer'}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="designerHeroPanel">
      <div className="pulseIcon">⌁</div>
      <h1>Sto analizzando il progetto...</h1>
      <p>Sto trasformando le risposte in una direzione progettuale chiara.</p>
      <div className="loader" />
    </div>
  );
}

function AnalysisPanel({ project, onShowProposals, onBackToConversation }) {
  const analysis = project.analysis;
  return (
    <div className="analysisPanel">
      <p className="eyebrow small">Analisi progettuale</p>
      <h1>Prima proposta ragionata</h1>
      <p className="largeText">{analysis.summary}</p>

      <div className="analysisCards">
        <InfoCard title="Materiale consigliato" value={analysis.material} text={analysis.materialReason} />
        <InfoCard title="Direzione design" value={analysis.designDirection} text="La forma verrà studiata per bilanciare estetica, stabilità e semplicità di stampa." />
        <InfoCard title="Criticità" value="Da valutare" text={analysis.criticalities} />
        <InfoCard title="Prossimo passo" value="Concept" text="Ora posso trasformare il ragionamento in proposte di design alternative." />
      </div>

      <div className="designerActions">
        <button className="primary" onClick={onShowProposals}>Mostrami le proposte</button>
        <button className="ghost" onClick={onBackToConversation}>Vorrei modificare qualcosa</button>
      </div>
    </div>
  );
}

function InfoCard({ title, value, text }) {
  return (
    <div className="infoCard">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{text}</p>
    </div>
  );
}

function ProposalPanel({ proposals, onSelectProposal }) {
  return (
    <div className="proposalPanel">
      <p className="eyebrow small">ForgeVision Designer</p>
      <h1>Ecco tre direzioni progettuali</h1>
      <p className="largeText">Ogni proposta nasce dalle informazioni raccolte. I render reali arriveranno nello Sprint successivo.</p>
      <div className="proposalGrid designerProposals">
        {proposals.map((proposal, index) => (
          <article className={`proposal ${index === 1 ? 'recommended' : ''}`} key={proposal.id || proposal.title}>
            {index === 1 && <div className="recommendedBadge">Consigliata</div>}
            <div className="renderPlaceholder nextRender">
              <span>Render AI</span>
              <small>{proposal.title}</small>
            </div>
            <h3>{proposal.title}</h3>
            <p>{proposal.description}</p>
            <strong>Perché ho progettato così</strong>
            <p>{proposal.reasoning}</p>
            <small>Materiale: {proposal.material}</small>
            <button className="primary" onClick={() => onSelectProposal(proposal)}>Scegli questa proposta</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function QuotePreview({ project }) {
  return (
    <div className="analysisPanel">
      <p className="eyebrow small">Anteprima preventivo</p>
      <h1>Progetto pronto per la stima</h1>
      <p>Hai scelto: <strong>{project.selectedProposal?.title}</strong></p>
      <div className="quoteBox">
        <span>Stima indicativa</span>
        <strong>35€ - 65€</strong>
        <small>Il prezzo definitivo verrà confermato dopo verifica tecnica e render approvato.</small>
      </div>
      <button className="primary">Richiedi preventivo ufficiale</button>
    </div>
  );
}

function getStatusIndex(status, project) {
  if (status === 'quote') return 5;
  if (project.proposals?.length && status !== 'quote') return 3;
  if (project.analysis) return 2;
  if (status === 'designer') return 1;
  return 0;
}
