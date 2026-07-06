// ForgeVision V11 — UI Controller

// Background particles
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let w, h, particles = [];
function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  particles = Array.from({ length: Math.min(95, Math.floor(w / 16)) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - .5) * .45,
    vy: (Math.random() - .5) * .45,
    r: Math.random() * 1.8 + 0.5
  }));
}
function draw() {
  ctx.clearRect(0, 0, w, h);
  particles.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180,210,255,.65)';
    ctx.fill();
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
      if (d < 125) {
        ctx.strokeStyle = `rgba(110,168,254,${(1 - d / 125) * .18})`;
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

// Studio state
const overlay = document.getElementById('studioOverlay');
const stepBox = document.getElementById('studioStep');
const stepTitle = document.getElementById('stepTitle');
const stepCounter = document.getElementById('stepCounter');
const progressBar = document.getElementById('progressBar');
const prevBtn = document.getElementById('prevStep');
const nextBtn = document.getElementById('nextStep');
const quickIdea = document.getElementById('quickIdea');

let step = 0;
const data = {
  path: '',
  description: '',
  size: '',
  material: '',
  color: '',
  quantity: 1,
  delivery: '',
  files: []
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
    title: 'Passaggio al Designer',
    render: () => `<div class="handoff-card"><span>✨</span><h3>ForgeVision Designer è pronto</h3><p>Abbiamo raccolto le informazioni base. Ora il Designer analizzerà il progetto, farà domande mirate e ti proporrà diverse soluzioni progettuali con render concettuali.</p><button class="primary large" id="startDesigner">Avvia ForgeVision Designer</button></div>`
  }
];

function label(v) {
  return { idea: 'Ho un\'idea', stl: 'Ho un file STL', modify: 'Modifica oggetto' }[v] || v;
}
function cards(key, arr) {
  return `<div class="option-grid">${arr.map(a => `<button class="option ${data[key] === a[0] ? 'selected' : ''}" data-key="${key}" data-val="${a[0]}"><b>${a[1]}</b><span>${a[2]}</span></button>`).join('')}</div>`;
}
function getProjectData() {
  return {
    path: data.path,
    pathLabel: label(data.path),
    description: data.description || quickIdea.value || '',
    size: data.size,
    material: data.material,
    color: data.color,
    quantity: data.quantity,
    delivery: data.delivery
  };
}
function openStudio(path) {
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (path) data.path = path;
  if (quickIdea.value && !data.description) data.description = quickIdea.value;
  step = 0;
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
  nextBtn.textContent = step === total - 1 ? 'Avvia Designer' : 'Avanti';
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
    const value = desc ? desc.value : '';
    data.description = (value ? value + '\n\n' : '') + 'Vorrei essere guidato nella definizione di uso, dimensioni, stile, resistenza e dettagli funzionali.';
    renderStep();
  });
  const minus = document.getElementById('minusQty');
  const plus = document.getElementById('plusQty');
  if (minus) minus.onclick = () => { data.quantity = Math.max(1, data.quantity - 1); renderStep(); };
  if (plus) plus.onclick = () => { data.quantity++; renderStep(); };
  const startDesigner = document.getElementById('startDesigner');
  if (startDesigner) startDesigner.onclick = () => startForgeDesigner();
}

document.querySelectorAll('[data-open-studio]').forEach(btn => btn.addEventListener('click', () => openStudio(btn.dataset.path || '')));
document.getElementById('closeStudio').addEventListener('click', closeStudio);
overlay.addEventListener('click', e => { if (e.target === overlay) closeStudio(); });
prevBtn.onclick = () => { if (step > 0) { step--; renderStep(); } };
nextBtn.onclick = () => {
  if (step < steps.length - 1) { step++; renderStep(); }
  else startForgeDesigner();
};
document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) closeStudio(); });

// ForgeVision Designer UI
function startForgeDesigner() {
  const project = getProjectData();
  ForgeCore.reset(project);
  renderDesigner('loading');
  setTimeout(async () => {
    renderDesigner('intro');
    await delay(500);
    await ForgeCore.nextQuestion();
    renderDesigner('chat');
  }, 1200);
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function renderDesigner(view = 'chat') {
  stepTitle.textContent = 'ForgeVision Designer';
  stepCounter.textContent = designerCounter();
  progressBar.style.width = designerProgress();
  prevBtn.style.visibility = 'hidden';
  nextBtn.textContent = 'Chiudi';
  nextBtn.onclick = closeStudio;

  const state = ForgeCore.snapshot();
  if (view === 'loading') {
    stepBox.innerHTML = `<div class="designer-loading"><div class="designer-logo">FV</div><h3>Sto leggendo il tuo progetto...</h3><p>ForgeCore sta organizzando idea, vincoli e informazioni di base.</p><div class="loading-bar"><span></span></div></div>`;
    return;
  }

  stepBox.innerHTML = `
    <div class="designer-app">
      ${designerSidebar(state)}
      <div class="designer-main">
        <div class="designer-topline"><span>✨ ForgeVision Designer</span><small>${state.phase === 'proposals' ? 'Proposte di design' : state.phase === 'confirm' ? 'Conferma progetto' : 'Analisi guidata'}</small></div>
        ${state.phase === 'proposals' ? proposalsView(state) : state.phase === 'confirm' ? confirmView(state) : chatView(state)}
      </div>
    </div>`;
  bindDesignerEvents();
}
function designerCounter() {
  const phase = ForgeCore.state.phase;
  if (phase === 'proposals') return '4 / 6';
  if (phase === 'confirm') return '5 / 6';
  return '3 / 6';
}
function designerProgress() {
  const phase = ForgeCore.state.phase;
  if (phase === 'proposals') return '68%';
  if (phase === 'confirm') return '82%';
  return '48%';
}
function designerSidebar(state) {
  const items = [
    ['Idea iniziale', true],
    ['Informazioni di base', true],
    ['Domande Designer', state.answers.length > 0],
    ['Analisi progetto', !!state.analysis],
    ['Proposte di design', state.proposals.length > 0],
    ['Preventivo', state.phase === 'confirm']
  ];
  return `<aside class="designer-sidebar"><div class="designer-brand"><b>ForgeVision</b><span>DESIGNER</span></div><div class="designer-steps">${items.map((item, i) => `<div class="designer-step ${item[1] ? 'done' : ''} ${isActiveStep(i, state) ? 'active' : ''}"><span>${item[1] ? '✓' : i + 1}</span><p>${item[0]}</p></div>`).join('')}</div><div class="designer-help">💡<p>Stiamo trasformando la tua idea in un progetto concreto.</p><small>Puoi chiedere modifiche in qualsiasi momento.</small></div></aside>`;
}
function isActiveStep(i, state) {
  if (state.phase === 'questions') return i === 2;
  if (state.phase === 'proposals') return i === 4;
  if (state.phase === 'confirm') return i === 5;
  return i === 2;
}
function chatView(state) {
  return `<div class="chat-wrap"><div class="messages">${state.conversation.map(messageHtml).join('')}</div><form class="designer-input" id="designerForm"><input id="designerAnswer" type="text" placeholder="Scrivi la tua risposta..." autocomplete="off" /><button type="submit">➜</button></form></div>`;
}
function messageHtml(msg) {
  return `<div class="msg ${msg.role === 'user' ? 'user' : 'designer'}"><div class="avatar">${msg.role === 'user' ? 'TU' : 'FV'}</div><div class="bubble"><p>${escapeHtml(msg.content)}</p><small>${msg.time || ''}</small></div></div>`;
}
function proposalsView(state) {
  return `<div class="proposal-wrap"><div class="designer-note"><b>Analisi del progetto</b><p>${escapeHtml(state.analysis?.sintesi || 'Ho analizzato le informazioni raccolte e preparato tre possibili direzioni progettuali.')}</p><ul><li><b>Uso:</b> ${escapeHtml(state.analysis?.uso || '-')}</li><li><b>Materiale consigliato:</b> ${escapeHtml(state.analysis?.materialeConsigliato || '-')}</li><li><b>Nota tecnica:</b> ${escapeHtml(state.analysis?.notaTecnica || '-')}</li></ul></div><h3>Ecco le proposte di design per il tuo progetto</h3><div class="proposal-grid">${state.proposals.map((p, i) => proposalCard(p, i)).join('')}</div><div class="revision-box"><p>Non è ancora quello che avevi in mente?</p><form id="revisionForm"><input id="revisionInput" placeholder="Dimmi cosa vuoi cambiare..." /><button class="secondary" type="submit">Aggiorna proposte</button></form></div></div>`;
}
function proposalCard(p, index) {
  const recommended = index === 1 ? '<span class="recommended">★ Consigliata</span>' : '';
  return `<article class="proposal-card ${index === 1 ? 'highlight' : ''}">${recommended}<small>Proposta ${index + 1}</small><h4>${escapeHtml(p.title)}</h4><p>${escapeHtml(p.description)}</p><div class="render-box ${p.visual || 'modern'}"><div class="render-object"><span></span></div></div><div class="reasoning"><b>Ragionamento</b><p>${escapeHtml(p.reasoning)}</p></div><ul>${(p.strengths || []).map(s => `<li>✓ ${escapeHtml(s)}</li>`).join('')}</ul><p class="material"><b>Materiale:</b> ${escapeHtml(p.material)}</p><button class="primary select-proposal" data-proposal="${p.id}">Seleziona questa proposta</button></article>`;
}
function confirmView(state) {
  const proposal = state.selectedProposal;
  const quote = ForgeCore.getQuotePreview();
  return `<div class="confirm-wrap"><div class="designer-note success"><b>Proposta selezionata</b><h3>${escapeHtml(proposal?.title || 'Proposta')}</h3><p>${escapeHtml(proposal?.reasoning || '')}</p></div><div class="quote-preview"><h3>Anteprima prossimo step: preventivo intelligente</h3><div class="quote-grid"><div><span>Stima prezzo</span><b>${quote.range}</b></div><div><span>Tempi stimati</span><b>${quote.timing}</b></div><div><span>Complessità</span><b>${quote.complexity}</b></div></div><p>${quote.note}</p></div><div class="confirm-actions"><button class="secondary" id="backToProposals">Modifica proposta</button><button class="primary" id="goQuote">Continua al preventivo</button></div></div>`;
}
function bindDesignerEvents() {
  const form = document.getElementById('designerForm');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('designerAnswer');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    await ForgeCore.answer(text);
    renderDesigner('chat');
  });
  document.querySelectorAll('.select-proposal').forEach(btn => btn.addEventListener('click', () => {
    ForgeCore.selectProposal(btn.dataset.proposal);
    renderDesigner('confirm');
  }));
  const revisionForm = document.getElementById('revisionForm');
  if (revisionForm) revisionForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('revisionInput');
    ForgeCore.modifyRequest(input.value);
    renderDesigner('proposals');
  });
  const back = document.getElementById('backToProposals');
  if (back) back.onclick = () => { ForgeCore.state.phase = 'proposals'; renderDesigner('proposals'); };
  const quote = document.getElementById('goQuote');
  if (quote) quote.onclick = () => alert('Nel prossimo sprint collegheremo il preventivo ufficiale e il form contatti.');
}
function escapeHtml(str = '') {
  return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
}

// Gallery popup
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
