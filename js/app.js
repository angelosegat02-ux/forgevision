const canvas=document.getElementById('particles');const ctx=canvas.getContext('2d');let w,h,particles=[];function resize(){w=canvas.width=innerWidth;h=canvas.height=innerHeight;particles=Array.from({length:Math.min(95,Math.floor(w/16))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45,r:Math.random()*1.8+0.5}))}function draw(){ctx.clearRect(0,0,w,h);particles.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(180,210,255,.65)';ctx.fill();for(let j=i+1;j<particles.length;j++){const q=particles[j];const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);if(d<125){ctx.strokeStyle=`rgba(110,168,254,${(1-d/125)*.18})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}});requestAnimationFrame(draw)}addEventListener('resize',resize);resize();draw();

const overlay=document.getElementById('studioOverlay');const stepBox=document.getElementById('studioStep');const stepTitle=document.getElementById('stepTitle');const stepCounter=document.getElementById('stepCounter');const progressBar=document.getElementById('progressBar');const prevBtn=document.getElementById('prevStep');const nextBtn=document.getElementById('nextStep');const quickIdea=document.getElementById('quickIdea');
let step=0;const data={path:'',description:'',size:'',material:'',color:'',quantity:1,delivery:'',concept:''};
const steps=[
{title:'Come possiamo aiutarti?',render:()=>cards('path',[['idea','💡 Ho un\'idea','Descrivici quello che immagini. Pensiamo noi al resto.'],['stl','📦 Ho un file STL','Carica il tuo modello e scegli materiale, colore e quantità.'],['modify','🛠️ Voglio modificare un oggetto','Partiamo da un oggetto esistente e lo adattiamo.']])},
{title:'Raccontaci il tuo progetto',render:()=>`<textarea id="descInput" placeholder="Descrivi cosa vuoi realizzare, a cosa serve, dove verrà usato...">${data.description||quickIdea.value||''}</textarea><button class="secondary" style="margin-top:12px" id="helpIdea">✨ Aiutami a descrivere meglio l'idea</button>`},
{title:'Quanto sarà grande?',render:()=>cards('size',[['Piccolo','📏 Piccolo','Fino a circa 10 cm'],['Medio','📐 Medio','Tra 10 e 20 cm'],['Grande','📦 Grande','Oltre 20 cm'],['Non lo so','❔ Non lo so','Ti aiutiamo noi a definirlo']])},
{title:'Quale materiale preferisci?',render:()=>cards('material',[['PLA','🧱 PLA','Perfetto per la maggior parte dei progetti'],['PETG','💪 PETG','Più resistente e durevole'],['ABS','⚙️ ABS','Per utilizzi tecnici'],['Resina','💎 Resina','Massima precisione e dettaglio'],['Non lo so','❔ Non lo so','Lo consigliamo noi']])},
{title:'Scegli un colore',render:()=>`<div class="color-row">${['Bianco','Nero','Rosso','Blu','Verde','Giallo','Altro'].map((c,i)=>`<button class="option ${data.color===c?'selected':''}" data-key="color" data-val="${c}"><b>${['⚪','⚫','🔴','🔵','🟢','🟡','🎨'][i]} ${c}</b></button>`).join('')}</div>`},
{title:'Quanti pezzi vuoi?',render:()=>`<div class="quantity"><button id="minusQty">−</button><strong id="qtyValue">${data.quantity}</strong><button id="plusQty">+</button></div>`},
{title:'Consegna',render:()=>cards('delivery',[['Standard','🚚 Standard','Tempi normali'],['Espressa','⚡ Espressa','Priorità nella produzione'],['Ritiro','📍 Ritiro','Ritira di persona']])},
{title:'ForgeVision Designer',render:()=>designerProposals()},
{title:'Riepilogo finale',render:()=>`<div class="summary"><p><b>Percorso:</b> ${label(data.path)||'Non selezionato'}</p><p><b>Descrizione:</b> ${data.description||'Non inserita'}</p><p><b>Dimensione:</b> ${data.size||'Non selezionata'}</p><p><b>Materiale:</b> ${data.material||'Non selezionato'}</p><p><b>Colore:</b> ${data.color||'Non selezionato'}</p><p><b>Quantità:</b> ${data.quantity}</p><p><b>Consegna:</b> ${data.delivery||'Non selezionata'}</p><p><b>Concept scelto:</b> ${label(data.concept)||'Non selezionato'}</p></div><button class="primary large" style="margin-top:18px" id="sendRequest">Conferma proposta e prosegui al preventivo</button>`}
];

function inferProjectType(){
  const d=(data.description||quickIdea.value||'').toLowerCase();
  if(d.includes('cuff')||d.includes('headphone')) return 'supporto per cuffie';
  if(d.includes('controller')||d.includes('joystick')) return 'supporto controller';
  if(d.includes('telefono')||d.includes('smartphone')) return 'supporto smartphone';
  if(d.includes('ricambio')||d.includes('pezzo')) return 'ricambio personalizzato';
  if(d.includes('chiave')||d.includes('portachiavi')) return 'portachiavi personalizzato';
  return 'oggetto personalizzato';
}
function designerProposals(){
  const project=inferProjectType();
  const mat=data.material&&data.material!=='Non lo so'?data.material:'PETG';
  const size=data.size||'Media';
  const proposals=[
    {
      id:'minimal',
      tag:'PROPOSTA 1',
      title:'Design Minimal',
      render:'minimal',
      desc:`Soluzione pulita ed essenziale per un ${project}. È pensata per occupare poco spazio, essere semplice da produrre e mantenere un aspetto elegante.`,
      reason:`Ho scelto linee semplici perché riducono il rischio di difetti in stampa e rendono il pezzo più facile da rifinire. Dimensione indicativa: ${size}. Materiale consigliato: ${mat}.`,
      points:['Ingombro ridotto','Stampa più rapida','Aspetto ordinato','Ottimo rapporto costo/qualità']
    },
    {
      id:'moderno',
      tag:'PROPOSTA 2',
      title:'Design Moderno',
      render:'modern',
      recommended:true,
      desc:`Soluzione più scenica e distintiva per trasformare il ${project} in un oggetto funzionale ma anche bello da vedere.`,
      reason:`Ho previsto una base più stabile e una forma leggermente inclinata per migliorare l’uso quotidiano. È la proposta più equilibrata tra estetica, resistenza e produzione.`,
      points:['Base stabile','Look più premium','Buona resistenza','Consigliato per uso quotidiano']
    },
    {
      id:'tecnico',
      tag:'PROPOSTA 3',
      title:'Design Tecnico',
      render:'technical',
      desc:`Soluzione più robusta e funzionale, ideale se il ${project} deve durare nel tempo o sopportare sollecitazioni.`,
      reason:`Ho aggiunto rinforzi strutturali e geometrie più tecniche per aumentare la rigidità. Richiede più materiale, ma offre maggiore sicurezza.`,
      points:['Struttura rinforzata','Massima stabilità','Più resistente','Ideale per uso intensivo']
    }
  ];
  return `<div class="designer-intro"><p>ForgeVision Designer ha analizzato le informazioni raccolte e ti propone tre direzioni progettuali. Ogni proposta include un ragionamento e un render indicativo dell’oggetto.</p></div><div class="proposal-grid">${proposals.map(p=>`<button class="proposal-card ${data.concept===p.id?'selected':''} ${p.recommended?'recommended':''}" data-key="concept" data-val="${p.id}">${p.recommended?'<span class="recommended-badge">★ consigliata</span>':''}<small>${p.tag}</small><h3>${p.title}</h3><p>${p.desc}</p><div class="render-frame"><div class="render-object render-${p.render}"><span></span><i></i><b></b></div></div><div class="reason-box"><strong>Perché l’ho pensata così</strong><span>${p.reason}</span></div><ul>${p.points.map(x=>`<li>✅ ${x}</li>`).join('')}</ul><em>Seleziona questa proposta →</em></button>`).join('')}</div><div class="designer-note"><b>Non è ancora il modello 3D definitivo.</b> È un render concettuale per scegliere la direzione. Dopo la tua conferma potremo passare al preventivo e alla progettazione finale.</div>`;
}

function label(v){return {idea:'Ho un\'idea',stl:'Ho un file STL',modify:'Modifica oggetto',minimal:'Design Minimal',moderno:'Design Moderno',tecnico:'Design Tecnico',premium:'Design Premium'}[v]||v}
function cards(key,arr){return `<div class="option-grid">${arr.map(a=>`<button class="option ${data[key]===a[0]?'selected':''}" data-key="${key}" data-val="${a[0]}"><b>${a[1]}</b><span>${a[2]}</span></button>`).join('')}</div>`}
function openStudio(path){overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(path)data.path=path;if(quickIdea.value&&!data.description)data.description=quickIdea.value;renderStep()}
function closeStudio(){overlay.classList.remove('active');overlay.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function renderStep(){const total=steps.length;stepTitle.textContent=steps[step].title;stepCounter.textContent=`${step+1} / ${total}`;progressBar.style.width=`${((step+1)/total)*100}%`;stepBox.innerHTML=steps[step].render();prevBtn.style.visibility=step===0?'hidden':'visible';nextBtn.textContent=step===total-1?'Fine':'Avanti';overlay.scrollTop=0;bindDynamic()}
function bindDynamic(){stepBox.querySelectorAll('[data-key]').forEach(el=>el.addEventListener('click',()=>{data[el.dataset.key]=el.dataset.val;renderStep()}));const desc=document.getElementById('descInput');if(desc)desc.addEventListener('input',e=>data.description=e.target.value);const help=document.getElementById('helpIdea');if(help)help.addEventListener('click',()=>{data.description=(desc.value?desc.value+'\n\n':'')+'Mi aiuti a trasformare questa idea in un progetto chiaro, definendo uso, dimensioni, stile e dettagli funzionali.';renderStep()});const minus=document.getElementById('minusQty');const plus=document.getElementById('plusQty');if(minus)minus.onclick=()=>{data.quantity=Math.max(1,data.quantity-1);renderStep()};if(plus)plus.onclick=()=>{data.quantity++;renderStep()};const send=document.getElementById('sendRequest');if(send)send.onclick=()=>alert('Proposta confermata. Nel prossimo step collegheremo il preventivo intelligente e l’invio richiesta.')} 
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
