const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let w, h, particles = [];

function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  particles = Array.from({ length: Math.min(95, Math.floor(w / 16)) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    r: Math.random() * 1.8 + 0.5
  }));
}

function draw() {
  ctx.clearRect(0, 0, w, h);
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180,210,255,.65)';
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d = Math.hypot(dx, dy);
      if (d < 125) {
        ctx.strokeStyle = `rgba(110,168,254,${(1 - d / 125) * 0.18})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  });
  requestAnimationFrame(draw);
}

addEventListener('resize', resize);
resize();
draw();

const overlay = document.getElementById('studioOverlay');
const stepBox = document.getElementById('studioStep');
const stepTitle = document.getElementById('stepTitle');
const stepCounter = document.getElementById('stepCounter');
const progressBar = document.getElementById('progressBar');
const prevBtn = document.getElementById('prevStep');
const nextBtn = document.getElementById('nextStep');
const actionsBar = document.querySelector('.studio-actions');
const quickIdea = document.getElementById('quickIdea');

let step = 0;
let designerState = 'intro';
let currentDesignerQuestion = null;
let designerAnalysis = null;
let designerProposals = null;

const data = {
  path: '',
  description: '',
  size: '',
  material: '',
  color: '',
  quantity: 1,
  delivery: '',
  concept: ''
};

const steps = [
  {
    title: 'Come possiamo aiutarti?',
    render: () => cards('path', [
      ['idea', '💡 Ho un\'idea', 'Descrivici quello che immagini. Pensiamo noi al resto.'],
      ['stl', '📦 Ho un file STL', 'Carica il tuo modello e scegli materiale, colore e quantità.'],
      ['modify', '🛠️ Voglio modificare un oggetto', 'Partiamo da un oggetto esistente e lo adattiamo.']
    ])
  },
  {
    title: 'Raccontaci il tuo progetto',
    render: () => `<textarea id="descInput" placeholder="Descrivi cosa vuoi realizzare, a cosa serve, dove verrà usato...">${data.description || quickIdea.value || ''}</textarea><button class="secondary" style="margin-top:12px" id="helpIdea">✨ Aiutami a descrivere meglio l'idea</button>`
  },
  {
    title: 'Quanto sarà grande?',
    render: () => cards('size', [
      ['Piccolo', '📏 Piccolo', 'Fino a circa 10 cm'],
      ['Medio', '📐 Medio', 'Tra 10 e 20 cm'],
      ['Grande', '📦 Grande', 'Oltre 20 cm'],
      ['Non lo so', '❔ Non lo so', 'Ti aiutiamo noi a definirlo']
    ])
  },
  {
    title: 'Quale materiale preferisci?',
    render: () => cards('material', [
      ['PLA', '🧱 PLA', 'Perfetto per la maggior parte dei progetti'],
      ['PETG', '💪 PETG', 'Più resistente e durevole'],
      ['ABS', '⚙️ ABS', 'Per utilizzi tecnici'],
      ['Resina', '💎 Resina', 'Massima precisione e dettaglio'],
      ['Non lo so', '❔ Non lo so', 'Lo consigliamo noi']
    ])
  },
  {
    title: 'Scegli un colore',
    render: () => `<div class="color-row">${['Bianco', 'Nero', 'Rosso', 'Blu', 'Verde', 'Giallo', 'Altro'].map((c, i) => `<button class="option ${data.color === c ? 'selected' : ''}" data-key="color" data-val="${c}"><b>${['⚪', '⚫', '🔴', '🔵', '🟢', '🟡', '🎨'][i]} ${c}</b></button>`).join('')}</div>`
  },
  {
    title: 'Quanti pezzi vuoi?',
    render: () => `<div class="quantity"><button id="minusQty">−</button><strong id="qtyValue">${data.quantity}</strong><button id="plusQty">+</button></div>`
  },
  {
    title: 'Consegna',
    render: () => cards('delivery', [
      ['Standard', '🚚 Standard', 'Tempi normali'],
      ['Espressa', '⚡ Espressa', 'Priorità nella produzione'],
      ['Ritiro', '📍 Ritiro', 'Ritira di persona']
    ])
  },
  {
    title: 'ForgeVision Designer',
    render: () => renderDesigner()
  },
  {
    title: 'Riepilogo finale',
    render: () => renderSummary()
  }
];

function label(v) {
  return {
    idea: 'Ho un\'idea',
    stl: 'Ho un file STL',
    modify: 'Modifica oggetto',
    minimal: 'Design Minimal',
    modern: 'Design Moderno',
    technical: 'Design Tecnico'
  }[v] || v;
}

function cards(key, arr) {
  return `<div class="option-grid">${arr.map(a => `<button class="option ${data[key] === a[0] ? 'selected' : ''}" data-key="${key}" data-val="${a[0]}"><b>${a[1]}</b><span>${a[2]}</span></button>`).join('')}</div>`;
}

function openStudio(path) {
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (path) data.path = path;
  if (quickIdea.value && !data.description) data.description = quickIdea.value;
  renderStep();
}

function closeStudio() {
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderStep() {
  const total = steps.length;
  stepTitle.textContent = steps[step].title;
  stepCounter.textContent = `${step + 1} / ${total}`;
  progressBar.style.width = `${((step + 1) / total) * 100}%`;
  stepBox.innerHTML = steps[step].render();
  prevBtn.style.visibility = step === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = step === total - 1 ? 'Fine' : 'Avanti';
  if (actionsBar) actionsBar.classList.toggle('hidden', step === 7);
  overlay.scrollTop = 0;
  bindDynamic();
}

function bindDynamic() {
  stepBox.querySelectorAll('[data-key]').forEach(el => el.addEventListener('click', () => {
    data[el.dataset.key] = el.dataset.val;
    renderStep();
  }));

  const desc = document.getElementById('descInput');
  if (desc) desc.addEventListener('input', e => data.description = e.target.value);

  const help = document.getElementById('helpIdea');
  if (help) help.addEventListener('click', () => {
    data.description = (desc.value ? desc.value + '\n\n' : '') + 'Mi aiuti a trasformare questa idea in un progetto chiaro, definendo uso, dimensioni, stile e dettagli funzionali.';
    renderStep();
  });

  const minus = document.getElementById('minusQty');
  const plus = document.getElementById('plusQty');
  if (minus) minus.onclick = () => { data.quantity = Math.max(1, data.quantity - 1); renderStep(); };
  if (plus) plus.onclick = () => { data.quantity++; renderStep(); };

  const startDesigner = document.getElementById('startDesigner');
  if (startDesigner) startDesigner.onclick = () => {
    DesignerEngine.start({ ...data });
    designerState = 'question';
    currentDesignerQuestion = DesignerEngine.getNextQuestion();
    renderStep();
  };

  const sendAnswer = document.getElementById('sendDesignerAnswer');
  if (sendAnswer) sendAnswer.onclick = () => {
    const input = document.getElementById('designerAnswer');
    const result = DesignerEngine.saveAnswer(input.value);
    if (result.type === 'error') {
      input.focus();
      return;
    }
    if (result.type === 'analysis') {
      designerState = 'analysis';
      designerAnalysis = result.analysis;
    } else {
      designerState = 'question';
      currentDesignerQuestion = result;
    }
    renderStep();
  };

  const generateProposals = document.getElementById('generateProposals');
  if (generateProposals) generateProposals.onclick = () => {
    const result = DesignerEngine.generateProposals();
    designerState = 'proposals';
    designerProposals = result.proposals;
    renderStep();
  };

  stepBox.querySelectorAll('[data-select-proposal]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.selectProposal;
    data.concept = id;
    DesignerEngine.selectProposal(id);
    step = 8;
    renderStep();
  }));

  const revisionBtn = document.getElementById('requestRevision');
  if (revisionBtn) revisionBtn.onclick = () => {
    const note = document.getElementById('revisionNote')?.value || '';
    DesignerEngine.requestRevision(note);
    designerState = 'analysis';
    if (designerAnalysis) {
      designerAnalysis.ragionamento = `${designerAnalysis.ragionamento} Modifica richiesta: ${note || 'da definire meglio insieme al cliente'}.`;
    }
    renderStep();
  };

  const send = document.getElementById('sendRequest');
  if (send) send.onclick = () => alert('Richiesta pronta. Nel prossimo step collegheremo email, WhatsApp o database ordini.');
}

function renderDesigner() {
  const sidebar = renderDesignerSidebar();
  let content = '';

  if (designerState === 'intro') {
    content = `
      <div class="designer-message">
        <strong>✨ ForgeVision Designer</strong><br>
        Ciao! Sono il progettista virtuale di ForgeVision. Userò le informazioni che hai inserito nello Studio per farti alcune domande mirate e proporti soluzioni ragionate.
      </div>
      <div class="designer-actions-row">
        <button class="primary" id="startDesigner">Iniziamo</button>
      </div>
    `;
  }

  if (designerState === 'question') {
    const q = currentDesignerQuestion?.question;
    content = `
      ${renderConversation()}
      <div class="designer-question">
        <h3>${q?.text || 'Domanda'}</h3>
        <p>${q?.hint || ''}</p>
        <div class="designer-input">
          <textarea id="designerAnswer" placeholder="Scrivi la tua risposta..."></textarea>
          <button class="primary" id="sendDesignerAnswer">Invia risposta</button>
        </div>
      </div>
    `;
  }

  if (designerState === 'analysis') {
    content = `
      ${renderConversation()}
      <div class="designer-analysis">
        <h3>Analisi del progetto</h3>
        <p>Ho interpretato le tue risposte e ho preparato una direzione progettuale iniziale.</p>
        ${renderAnalysis(designerAnalysis)}
        <div class="designer-actions-row">
          <button class="primary" id="generateProposals">Crea proposte di design</button>
        </div>
      </div>
    `;
  }

  if (designerState === 'proposals') {
    content = `
      ${renderConversation()}
      <div class="designer-proposals">
        <h3>Ecco le proposte di design per il tuo progetto</h3>
        <p>Ogni proposta include una logica progettuale e un render concettuale. Più avanti collegheremo veri render generati dall'intelligenza artificiale.</p>
        ${renderProposals(designerProposals || [])}
        <div class="revision-box">
          <p>Non è ancora quello che avevi in mente?</p>
          <textarea id="revisionNote" placeholder="Esempio: lo vorrei più piccolo, più resistente, più elegante..."></textarea>
          <button class="secondary" id="requestRevision">Chiedi una modifica</button>
        </div>
      </div>
    `;
  }

  return `<div class="designer-panel">${sidebar}<div class="designer-chat">${content}</div></div>`;
}

function renderDesignerSidebar() {
  const statuses = [
    ['Idea iniziale', true],
    ['Informazioni di base', true],
    ['Domande mirate', designerState !== 'intro'],
    ['Analisi del progetto', designerState === 'analysis' || designerState === 'proposals'],
    ['Proposte di design', designerState === 'proposals'],
    ['Preventivo', false]
  ];

  return `
    <aside class="designer-sidebar">
      <h3>Il tuo progetto</h3>
      <div class="designer-steps">
        ${statuses.map((s, i) => `<div class="designer-status ${s[1] ? 'done' : (i === getActiveDesignerIndex() ? 'active' : '')}"><span>${s[1] ? '✓' : i + 1}</span>${s[0]}</div>`).join('')}
      </div>
    </aside>
  `;
}

function getActiveDesignerIndex() {
  if (designerState === 'intro') return 2;
  if (designerState === 'question') return 2;
  if (designerState === 'analysis') return 3;
  if (designerState === 'proposals') return 4;
  return 2;
}

function renderConversation() {
  const lastMessages = DesignerEngine.conversation.slice(-5);
  return lastMessages.map(message => `<div class="designer-message ${message.role === 'user' ? 'user' : ''}">${escapeHtml(message.content)}</div>`).join('');
}

function renderAnalysis(analysis) {
  if (!analysis) return '';
  return `
    <div class="analysis-grid">
      <div class="analysis-item"><span>Utilizzo</span><strong>${escapeHtml(analysis.uso)}</strong></div>
      <div class="analysis-item"><span>Ambiente</span><strong>${escapeHtml(analysis.ambiente)}</strong></div>
      <div class="analysis-item"><span>Resistenza</span><strong>${escapeHtml(analysis.resistenza)}</strong></div>
      <div class="analysis-item"><span>Stile</span><strong>${escapeHtml(analysis.stile)}</strong></div>
      <div class="analysis-item"><span>Vincoli</span><strong>${escapeHtml(analysis.vincoli)}</strong></div>
      <div class="analysis-item"><span>Materiale consigliato</span><strong>${escapeHtml(analysis.materialeConsigliato)}</strong></div>
    </div>
    <p style="margin-top:14px">${escapeHtml(analysis.ragionamento)}</p>
    <ul class="analysis-list">${analysis.indicazioni.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  `;
}

function renderProposals(proposals) {
  return `<div class="proposal-grid">${proposals.map(proposal => `
    <article class="proposal-card ${proposal.id === 'modern' ? 'recommended' : ''}" data-proposal="${proposal.id}">
      <div class="proposal-top">
        <h3>${escapeHtml(proposal.title)}</h3>
        <span class="proposal-badge">${escapeHtml(proposal.badge)}</span>
      </div>
      <div class="proposal-render"><div class="proposal-object"></div></div>
      <p><strong>Descrizione:</strong> ${escapeHtml(proposal.description)}</p>
      <p><strong>Ragionamento:</strong> ${escapeHtml(proposal.reasoning)}</p>
      <p><strong>Materiale:</strong> ${escapeHtml(proposal.material)}</p>
      <ul>${proposal.strengths.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      <button class="${proposal.id === 'modern' ? 'primary' : 'secondary'}" data-select-proposal="${proposal.id}">Seleziona questa proposta</button>
    </article>
  `).join('')}</div>`;
}

function renderSummary() {
  return `
    <div class="summary">
      <p><b>Percorso:</b> ${label(data.path) || 'Non selezionato'}</p>
      <p><b>Descrizione:</b> ${data.description || 'Non inserita'}</p>
      <p><b>Dimensione:</b> ${data.size || 'Non selezionata'}</p>
      <p><b>Materiale:</b> ${data.material || 'Non selezionato'}</p>
      <p><b>Colore:</b> ${data.color || 'Non selezionato'}</p>
      <p><b>Quantità:</b> ${data.quantity}</p>
      <p><b>Consegna:</b> ${data.delivery || 'Non selezionata'}</p>
      <p><b>Proposta scelta:</b> ${label(data.concept) || 'Non selezionata'}</p>
    </div>
    <button class="primary large" style="margin-top:18px" id="sendRequest">Richiedi preventivo</button>
  `;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.querySelectorAll('[data-open-studio]').forEach(btn => btn.addEventListener('click', () => openStudio(btn.dataset.path || '')));
document.getElementById('closeStudio').addEventListener('click', closeStudio);
overlay.addEventListener('click', e => { if (e.target === overlay) closeStudio(); });
prevBtn.onclick = () => { if (step > 0) { step--; renderStep(); } };
nextBtn.onclick = () => { if (step < steps.length - 1) { step++; renderStep(); } else closeStudio(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) closeStudio(); });

const galleryOverlay = document.getElementById('galleryOverlay');
const closeGalleryBtn = document.getElementById('closeGallery');
document.querySelectorAll('[data-open-gallery]').forEach(btn => {
  btn.addEventListener('click', () => {
    galleryOverlay.classList.add('active');
    galleryOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    galleryOverlay.scrollTop = 0;
  });
});
function closeGallery() {
  galleryOverlay.classList.remove('active');
  galleryOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
if (closeGalleryBtn) closeGalleryBtn.addEventListener('click', closeGallery);
if (galleryOverlay) galleryOverlay.addEventListener('click', e => { if (e.target === galleryOverlay) closeGallery(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && galleryOverlay && galleryOverlay.classList.contains('active')) closeGallery(); });
