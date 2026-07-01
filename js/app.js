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
{title:'ForgeVision Designer',render:()=>`<div class="designer-intro"><span>✨ ForgeVision Designer</span><h3>Ecco 3 proposte ragionate per il tuo progetto</h3><p>Ho usato le informazioni che mi hai dato per creare tre direzioni diverse. Non siamo ancora al preventivo: prima scegliamo insieme la soluzione più vicina a ciò che vuoi realizzare.</p></div><div class="proposal-grid">${proposalCards()}</div>`},
{title:'Conferma proposta',render:()=>confirmProposal()}
];
function getProposalInfo(id){
  const baseMaterial = data.material && data.material !== 'Non lo so' ? data.material : 'PETG';
  const color = data.color || 'Nero';
  const size = data.size || 'Medio';
  const common = {material:baseMaterial,color,size};
  const proposals={
    minimal:{
      name:'Design Minimal', tag:'Pulito ed essenziale', badge:'Più semplice', icon:'minimal',
      desc:'Una soluzione compatta, elegante e facile da produrre, pensata per un risultato ordinato e moderno.',
      reasoning:`Ho scelto una forma essenziale perché riduce ingombro, tempi di stampa e complessità. È ideale se vuoi un oggetto funzionale, discreto e con un costo più controllato.`,
      points:['Ingombro ridotto','Linee pulite','Produzione più semplice',`Materiale consigliato: ${baseMaterial}`]
    },
    modern:{
      name:'Design Moderno', tag:'Consigliata', badge:'Consigliata', icon:'modern',
      desc:'Una proposta più curata, con una forma dinamica e una base stabile, pensata per un aspetto più distintivo.',
      reasoning:`Ho bilanciato estetica e funzionalità: una base più stabile, spessori regolari e un profilo più moderno. È la scelta migliore se vuoi un oggetto bello da vedere ma comunque pratico.`,
      points:['Base stabile','Aspetto più premium','Buona resistenza',`Colore ideale: ${color}`]
    },
    technical:{
      name:'Design Tecnico', tag:'Più resistente', badge:'Robusta', icon:'technical',
      desc:'Una versione più strutturata e rinforzata, adatta quando servono resistenza, durata e affidabilità.',
      reasoning:`Ho aggiunto rinforzi e geometrie più tecniche perché il pezzo sia più robusto. Questa proposta è indicata se l’oggetto deve sopportare peso, urti o utilizzo frequente.`,
      points:['Struttura rinforzata','Massima resistenza','Design funzionale',`Dimensione: ${size}`]
    }
  };
  return {...proposals[id],...common};
}
function proposalCards(){
  return ['minimal','modern','technical'].map(id=>{
    const p=getProposalInfo(id);
    return `<button class="proposal-card ${data.concept===id?'selected':''}" data-key="concept" data-val="${id}">
      <div class="proposal-top"><small>${p.tag}</small><strong>${p.name}</strong></div>
      <div class="proposal-render ${p.icon}" aria-label="Render concettuale ${p.name}">
        <div class="render-base"></div><div class="render-arm"></div><div class="render-head"></div><div class="render-shadow"></div>
      </div>
      <p>${p.desc}</p>
      <div class="reasoning"><b>Ragionamento</b><span>${p.reasoning}</span></div>
      <ul>${p.points.map(x=>`<li>✔ ${x}</li>`).join('')}</ul>
      <span class="select-proposal">Seleziona questa proposta →</span>
    </button>`;
  }).join('')
}
function confirmProposal(){
  if(!data.concept){
    return `<div class="designer-intro"><span>✨ ForgeVision Designer</span><h3>Scegli una proposta prima di continuare</h3><p>Torna indietro e seleziona il design che senti più vicino alla tua idea. Dopo la scelta potrai confermarlo oppure chiedere modifiche.</p></div>`;
  }
  const p=getProposalInfo(data.concept);
  return `<div class="summary proposal-summary">
    <span class="eyebrow">Proposta selezionata</span>
    <h3>${p.name}</h3>
    <div class="proposal-render ${p.icon} large-render"><div class="render-base"></div><div class="render-arm"></div><div class="render-head"></div><div class="render-shadow"></div></div>
    <p>${p.desc}</p>
    <div class="reasoning"><b>Perché l'ho pensato così</b><span>${p.reasoning}</span></div>
    <p><b>Materiale:</b> ${p.material}</p>
    <p><b>Colore:</b> ${p.color}</p>
    <p><b>Dimensione:</b> ${p.size}</p>
  </div>
  <div class="confirm-actions">
    <button class="primary large" id="confirmDesign">Sì, questa proposta è corretta</button>
    <button class="secondary large" id="editDesign">Vorrei modificarla con il Designer</button>
  </div>`;
}
function label(v){return {idea:'Ho un\'idea',stl:'Ho un file STL',modify:'Modifica oggetto',minimal:'Design Minimal',modern:'Design Moderno',technical:'Design Tecnico'}[v]||v}
function cards(key,arr){return `<div class="option-grid">${arr.map(a=>`<button class="option ${data[key]===a[0]?'selected':''}" data-key="${key}" data-val="${a[0]}"><b>${a[1]}</b><span>${a[2]}</span></button>`).join('')}</div>`}
function openStudio(path){overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(path)data.path=path;if(quickIdea.value&&!data.description)data.description=quickIdea.value;renderStep()}
function closeStudio(){overlay.classList.remove('active');overlay.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function renderStep(){const total=steps.length;stepTitle.textContent=steps[step].title;stepCounter.textContent=`${step+1} / ${total}`;progressBar.style.width=`${((step+1)/total)*100}%`;stepBox.innerHTML=steps[step].render();prevBtn.style.visibility=step===0?'hidden':'visible';nextBtn.textContent=step===total-1?'Fine':'Avanti';overlay.scrollTop=0;bindDynamic()}
function bindDynamic(){stepBox.querySelectorAll('[data-key]').forEach(el=>el.addEventListener('click',()=>{data[el.dataset.key]=el.dataset.val;renderStep()}));const desc=document.getElementById('descInput');if(desc)desc.addEventListener('input',e=>data.description=e.target.value);const help=document.getElementById('helpIdea');if(help)help.addEventListener('click',()=>{data.description=(desc.value?desc.value+'\n\n':'')+'Mi aiuti a trasformare questa idea in un progetto chiaro, definendo uso, dimensioni, stile e dettagli funzionali.';renderStep()});const minus=document.getElementById('minusQty');const plus=document.getElementById('plusQty');if(minus)minus.onclick=()=>{data.quantity=Math.max(1,data.quantity-1);renderStep()};if(plus)plus.onclick=()=>{data.quantity++;renderStep()};const confirm=document.getElementById('confirmDesign');if(confirm)confirm.onclick=()=>alert('Perfetto: proposta confermata. Nel prossimo step collegheremo questa conferma al preventivo intelligente.');const edit=document.getElementById('editDesign');if(edit)edit.onclick=()=>{step=7;renderStep();}} 
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
