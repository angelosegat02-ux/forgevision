const canvas=document.getElementById('particles');const ctx=canvas.getContext('2d');let w,h,particles=[];function resize(){w=canvas.width=innerWidth;h=canvas.height=innerHeight;particles=Array.from({length:Math.min(95,Math.floor(w/16))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,r:Math.random()*1.8+0.5}))}function draw(){ctx.clearRect(0,0,w,h);particles.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(180,210,255,.65)';ctx.fill();for(let j=i+1;j<particles.length;j++){const q=particles[j];const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);if(d<125){ctx.strokeStyle=`rgba(110,168,254,${(1-d/125)*.18})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}});requestAnimationFrame(draw)}addEventListener('resize',resize);resize();draw();

const overlay=document.getElementById('studioOverlay');const stepBox=document.getElementById('studioStep');const stepTitle=document.getElementById('stepTitle');const stepCounter=document.getElementById('stepCounter');const progressBar=document.getElementById('progressBar');const prevBtn=document.getElementById('prevStep');const nextBtn=document.getElementById('nextStep');const quickIdea=document.getElementById('quickIdea');
let step=0;const data={path:'',description:'',size:'',material:'',color:'',quantity:1,delivery:'',designerApproved:false,designerAnswers:[],designerNotes:[]};
const designerState={stage:'intro',qIndex:0,currentAnswer:''};
const steps=[
{title:'Come possiamo aiutarti?',render:()=>cards('path',[['idea','💡 Ho un\'idea','Descrivici quello che immagini. Pensiamo noi al resto.'],['stl','📦 Ho un file STL','Carica il tuo modello e scegli materiale, colore e quantità.'],['modify','🛠️ Voglio modificare un oggetto','Partiamo da un oggetto esistente e lo adattiamo.']])},
{title:'Raccontaci il tuo progetto',render:()=>`<textarea id="descInput" placeholder="Descrivi cosa vuoi realizzare, a cosa serve, dove verrà usato...">${data.description||quickIdea.value||''}</textarea><button class="secondary" style="margin-top:12px" id="helpIdea">✨ Aiutami a descrivere meglio l'idea</button>`},
{title:'Quanto sarà grande?',render:()=>cards('size',[['Piccolo','📏 Piccolo','Fino a circa 10 cm'],['Medio','📐 Medio','Tra 10 e 20 cm'],['Grande','📦 Grande','Oltre 20 cm'],['Non lo so','❔ Non lo so','Ti aiutiamo noi a definirlo']])},
{title:'Quale materiale preferisci?',render:()=>cards('material',[['PLA','🧱 PLA','Perfetto per la maggior parte dei progetti'],['PETG','💪 PETG','Più resistente e durevole'],['ABS','⚙️ ABS','Per utilizzi tecnici'],['Resina','💎 Resina','Massima precisione e dettaglio'],['Non lo so','❔ Non lo so','Lo consigliamo noi']])},
{title:'Scegli un colore',render:()=>`<div class="color-row">${['Bianco','Nero','Rosso','Blu','Verde','Giallo','Altro'].map((c,i)=>`<button class="option ${data.color===c?'selected':''}" data-key="color" data-val="${c}"><b>${['⚪','⚫','🔴','🔵','🟢','🟡','🎨'][i]} ${c}</b></button>`).join('')}</div>`},
{title:'Quanti pezzi vuoi?',render:()=>`<div class="quantity"><button id="minusQty">−</button><strong id="qtyValue">${data.quantity}</strong><button id="plusQty">+</button></div>`},
{title:'Consegna',render:()=>cards('delivery',[['Standard','🚚 Standard','Tempi normali'],['Espressa','⚡ Espressa','Priorità nella produzione'],['Ritiro','📍 Ritiro','Ritira di persona']])},
{title:'ForgeVision Designer',render:()=>renderDesigner()},
{title:'Riepilogo finale',render:()=>`<div class="summary"><p><b>Percorso:</b> ${label(data.path)||'Non selezionato'}</p><p><b>Descrizione:</b> ${data.description||'Non inserita'}</p><p><b>Dimensione:</b> ${data.size||'Non selezionata'}</p><p><b>Materiale scelto:</b> ${data.material||'Non selezionato'}</p><p><b>Colore:</b> ${data.color||'Non selezionato'}</p><p><b>Quantità:</b> ${data.quantity}</p><p><b>Consegna:</b> ${data.delivery||'Non selezionata'}</p><p><b>Stato Designer:</b> ${data.designerApproved?'Analisi confermata':'Da confermare'}</p>${designerSummaryHtml()}</div><button class="primary large" style="margin-top:18px" id="sendRequest">Richiedi preventivo</button>`}
];

function designerQuestions(){
  const idea=(data.description||'il tuo progetto').toLowerCase();
  const base=[
    'Qual è l’uso principale dell’oggetto nella vita reale?',
    'Dove verrà usato: in casa, in auto, in ufficio, all’esterno o in un ambiente tecnico?',
    'Deve sopportare peso, urti, calore o movimento?',
    'Preferisci un design minimal, tecnico, robusto o più scenico?',
    'Ci sono misure, vincoli o dettagli che non devono assolutamente mancare?'
  ];
  if(idea.includes('auto')||idea.includes('macchina')) base[1]='In auto sarà esposto al sole o al calore? Dove andrà posizionato?';
  if(idea.includes('supporto')) base[2]='Il supporto dovrà reggere peso? L’oggetto sarà appoggiato, agganciato o fissato con viti/adesivo?';
  if(data.path==='stl') base[0]='Il file STL è già definitivo o vuoi modificarlo prima della stampa?';
  if(data.path==='modify') base[0]='Quale parte dell’oggetto esistente vuoi cambiare o migliorare?';
  return base;
}
function renderDesigner(){
  const q=designerQuestions();
  if(designerState.stage==='intro'){
    return `<div class="designer-layout"><aside class="designer-rail"><b>Avanzamento</b><span class="done">✔ Idea raccolta</span><span class="done">✔ Informazioni di base</span><span class="active">🔄 Analisi del progetto</span><span>⬜ Definizione design</span><span>⬜ Conferma finale</span></aside><div class="designer-chat"><div class="designer-message bot"><b>✨ ForgeVision Designer</b><p>Ciao! Sono il progettista virtuale di ForgeVision. Ho letto le informazioni che hai inserito nello Studio e ora ti farò alcune domande mirate per capire meglio il pezzo che vuoi realizzare.</p><p>Alla fine ti mostrerò una proposta ragionata, senza immagini per ora: prima vogliamo capire se la direzione progettuale è corretta.</p></div><button class="primary" id="startDesigner">Iniziamo</button></div></div>`;
  }
  if(designerState.stage==='questions'){
    const history=data.designerAnswers.map((a,i)=>`<div class="designer-message bot"><b>Domanda ${i+1}</b><p>${q[i]}</p></div><div class="designer-message user"><p>${a}</p></div>`).join('');
    return `<div class="designer-layout"><aside class="designer-rail"><b>Avanzamento</b><span class="done">✔ Idea raccolta</span><span class="done">✔ Informazioni di base</span><span class="active">🔄 Domande mirate</span><span>⬜ Analisi</span><span>⬜ Conferma finale</span></aside><div class="designer-chat">${history}<div class="designer-message bot"><b>Domanda ${designerState.qIndex+1} di ${q.length}</b><p>${q[designerState.qIndex]}</p></div><textarea id="designerAnswer" placeholder="Scrivi la tua risposta..."></textarea><button class="primary" id="sendDesignerAnswer">Invia risposta</button></div></div>`;
  }
  if(designerState.stage==='analysis'){
    return `<div class="designer-layout"><aside class="designer-rail"><b>Avanzamento</b><span class="done">✔ Idea raccolta</span><span class="done">✔ Domande completate</span><span class="done">✔ Analisi progetto</span><span class="active">🔄 Conferma direzione</span><span>⬜ Preventivo</span></aside><div class="designer-chat"><div class="designer-message bot"><b>Analisi del progetto</b><p>Perfetto. Credo di aver compreso la direzione del progetto. Ecco come lo realizzerei.</p></div>${designerSummaryHtml()}<div class="designer-actions"><button class="primary" id="approveDesigner">Sì, è corretto</button><button class="secondary" id="editDesigner">Vorrei modificare qualcosa</button></div></div></div>`;
  }
  return `<div class="designer-layout"><aside class="designer-rail"><b>Avanzamento</b><span class="done">✔ Analisi completata</span><span class="active">🔄 Modifica richiesta</span><span>⬜ Nuova conferma</span></aside><div class="designer-chat"><div class="designer-message bot"><b>Va bene.</b><p>Dimmi cosa cambieresti: stile, dimensioni, resistenza, forma, fissaggio o qualsiasi altro dettaglio.</p></div><textarea id="designerNote" placeholder="Es. Lo vorrei più piccolo, più robusto, fissabile al muro..."></textarea><button class="primary" id="saveDesignerNote">Aggiorna analisi</button></div></div>`;
}
function designerSummaryHtml(){
  const answers=data.designerAnswers;
  const use=answers[0]||'Da definire con il cliente';
  const place=answers[1]||'Ambiente non specificato';
  const stress=answers[2]||'Sollecitazioni non specificate';
  const style=answers[3]||'Stile da definire';
  const constraints=answers[4]||'Nessun vincolo indicato';
  const recommendedMaterial=data.material && data.material!=='Non lo so' ? data.material : (stress.toLowerCase().includes('peso')||stress.toLowerCase().includes('urti')||place.toLowerCase().includes('sole') ? 'PETG' : 'PLA');
  const notes=data.designerNotes.length?`<li><b>Modifiche richieste:</b> ${data.designerNotes.join(' · ')}</li>`:'';
  return `<div class="designer-analysis"><h3>Proposta ragionata</h3><ul><li><b>Utilizzo previsto:</b> ${use}</li><li><b>Ambiente d’uso:</b> ${place}</li><li><b>Resistenza richiesta:</b> ${stress}</li><li><b>Materiale consigliato:</b> ${recommendedMaterial}</li><li><b>Motivazione:</b> materiale scelto per bilanciare resistenza, costo e qualità di stampa.</li><li><b>Direzione estetica:</b> ${style}</li><li><b>Vincoli importanti:</b> ${constraints}</li><li><b>Produzione:</b> progetto realizzabile tramite modellazione 3D e stampa, da verificare con misure definitive.</li>${notes}</ul></div>`;
}

function label(v){return {idea:'Ho un\'idea',stl:'Ho un file STL',modify:'Modifica oggetto',}[v]||v}
function cards(key,arr){return `<div class="option-grid">${arr.map(a=>`<button class="option ${data[key]===a[0]?'selected':''}" data-key="${key}" data-val="${a[0]}"><b>${a[1]}</b><span>${a[2]}</span></button>`).join('')}</div>`}
function openStudio(path){overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(path)data.path=path;if(quickIdea.value&&!data.description)data.description=quickIdea.value;renderStep()}
function closeStudio(){overlay.classList.remove('active');overlay.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function renderStep(){const total=steps.length;stepTitle.textContent=steps[step].title;stepCounter.textContent=`${step+1} / ${total}`;progressBar.style.width=`${((step+1)/total)*100}%`;stepBox.innerHTML=steps[step].render();prevBtn.style.visibility=step===0?'hidden':'visible';nextBtn.style.display=step===7?'none':'inline-flex';nextBtn.textContent=step===total-1?'Fine':'Avanti';overlay.scrollTop=0;bindDynamic()}
function bindDynamic(){stepBox.querySelectorAll('[data-key]').forEach(el=>el.addEventListener('click',()=>{data[el.dataset.key]=el.dataset.val;renderStep()}));const desc=document.getElementById('descInput');if(desc)desc.addEventListener('input',e=>data.description=e.target.value);const help=document.getElementById('helpIdea');if(help)help.addEventListener('click',()=>{data.description=(desc.value?desc.value+'\n\n':'')+'Mi aiuti a trasformare questa idea in un progetto chiaro, definendo uso, dimensioni, stile e dettagli funzionali.';renderStep()});const minus=document.getElementById('minusQty');const plus=document.getElementById('plusQty');if(minus)minus.onclick=()=>{data.quantity=Math.max(1,data.quantity-1);renderStep()};if(plus)plus.onclick=()=>{data.quantity++;renderStep()};const startDesigner=document.getElementById('startDesigner');if(startDesigner)startDesigner.onclick=()=>{designerState.stage='questions';designerState.qIndex=0;data.designerAnswers=[];renderStep()};const sendDesignerAnswer=document.getElementById('sendDesignerAnswer');if(sendDesignerAnswer)sendDesignerAnswer.onclick=()=>{const a=document.getElementById('designerAnswer').value.trim();if(!a){alert('Scrivi una risposta prima di continuare.');return}data.designerAnswers.push(a);designerState.qIndex++;if(designerState.qIndex>=designerQuestions().length){designerState.stage='analysis'}renderStep()};const approveDesigner=document.getElementById('approveDesigner');if(approveDesigner)approveDesigner.onclick=()=>{data.designerApproved=true;step++;renderStep()};const editDesigner=document.getElementById('editDesigner');if(editDesigner)editDesigner.onclick=()=>{designerState.stage='edit';renderStep()};const saveDesignerNote=document.getElementById('saveDesignerNote');if(saveDesignerNote)saveDesignerNote.onclick=()=>{const note=document.getElementById('designerNote').value.trim();if(note)data.designerNotes.push(note);designerState.stage='analysis';renderStep()};const send=document.getElementById('sendRequest');if(send)send.onclick=()=>alert('Richiesta pronta. Nel prossimo step collegheremo email, WhatsApp o database ordini.')} 
document.querySelectorAll('[data-open-studio]').forEach(btn=>btn.addEventListener('click',()=>openStudio(btn.dataset.path||'')));document.getElementById('closeStudio').addEventListener('click',closeStudio);overlay.addEventListener('click',e=>{if(e.target===overlay)closeStudio()});prevBtn.onclick=()=>{if(step>0){step--;renderStep()}};nextBtn.onclick=()=>{if(step<steps.length-1){step++;renderStep()}else closeStudio()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('active'))closeStudio()});


// V9.1 Gallery popup
const galleryOverlay = document.getElementById('galleryOverlay');
const closeGalleryBtn = document.getElementById('closeGallery');
document.querySelectorAll('[data-open-gallery]').forEach(btn => {
  btn.addEventListener('click', () => {
    galleryOverlay.classList.add('active');
    galleryOverlay.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    galleryOverlay.scrollTop = 0;
  });
});
function closeGallery(){
  galleryOverlay.classList.remove('active');
  galleryOverlay.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
if(closeGalleryBtn) closeGalleryBtn.addEventListener('click', closeGallery);
if(galleryOverlay) galleryOverlay.addEventListener('click', e => { if(e.target === galleryOverlay) closeGallery(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && galleryOverlay && galleryOverlay.classList.contains('active')) closeGallery(); });
