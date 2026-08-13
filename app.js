const requests=[
{id:1,title:'Facebook Brand Awareness Post - Test 6',product:'KAANAGAN Open Concept Wardrobe',objective:'Brand Awareness',date:'10 Aug 2026, 3:53 PM',status:'Review'},
{id:2,title:'Facebook Brand Awareness Post - Test 5',product:'KAANAGAN Open Concept Wardrobe with Drawers',objective:'Brand Awareness',date:'10 Aug 2026, 3:02 PM',status:'Review'},
{id:3,title:'Facebook Brand Awareness Post – KAANAGAN',product:'KAANAGAN Open Concept Wardrobe with Drawers',objective:'Brand Awareness',date:'10 Aug 2026, 2:53 PM',status:'Review'},
{id:4,title:'TEST - Rebuilt Notion Module 2026-08-10',product:'AHTAM XL Shelving Rack',objective:'Brand Awareness',date:'10 Aug 2026, 2:31 PM',status:'Review'},
{id:5,title:'AHTAM XL Product Feature',product:'AHTAM XL Shelving Rack',objective:'Product Highlight',date:'9 Aug 2026, 4:18 PM',status:'Draft'},
{id:6,title:'BRUTTI Storage Awareness',product:'PUSMA Display Rack',objective:'Brand Awareness',date:'9 Aug 2026, 11:25 AM',status:'Review'},
{id:7,title:'Facebook Educational Test',product:'General / No Product',objective:'Educational',date:'8 Aug 2026, 5:10 PM',status:'Draft'}];

const drafts=[
{id:101,requestId:1,title:'Facebook Brand Awareness Post - Test 6',product:'KAANAGAN Open Concept Wardrobe',status:'Review',copy:`Ruang yang kemas bukan sekadar nampak cantik — ia buat rutin harian terasa lebih mudah.\n\nKenali KAANAGAN Open Concept Wardrobe, rekaan BRUTTI yang menggabungkan susunan terbuka, fungsi praktikal dan karakter minimal untuk ruang moden.\n\nSesuai untuk anda yang sukakan wardrobe yang mudah dicapai, mudah disusun dan tetap nampak kemas.\n\n#BRUTTI #KAANAGAN #FurnitureSabah`},
{id:102,requestId:2,title:'Facebook Brand Awareness Post - Test 5',product:'KAANAGAN Open Concept Wardrobe with Drawers',status:'Review',copy:`Kalau semuanya ada tempat sendiri, ruang pun terasa lebih tenang.\n\nKAANAGAN Open Concept Wardrobe with Drawers memberi ruang gantung, susunan terbuka dan laci tambahan dalam satu rekaan yang kemas. Dibina untuk fungsi harian, dengan identiti BRUTTI yang ringkas dan praktikal.\n\nDM BRUTTI untuk maklumat lanjut.`},
{id:103,requestId:3,title:'Facebook Brand Awareness Post – KAANAGAN',product:'KAANAGAN Open Concept Wardrobe with Drawers',status:'Review',copy:`Satu wardrobe, banyak cara untuk susun ruang anda.\n\nKAANAGAN direka untuk mereka yang mahu akses mudah tanpa menjadikan ruang nampak berat. Struktur terbuka membantu anda nampak, capai dan susun barang dengan lebih cepat.\n\nPractical. Clean. BRUTTI.`},
{id:104,requestId:4,title:'TEST - Rebuilt Notion Module 2026-08-10',product:'AHTAM XL Shelving Rack',status:'Approved',copy:`Bila ruang perlukan lebih banyak storage, AHTAM XL hadir dengan struktur rak terbuka yang praktikal dan mudah disesuaikan.\n\nSesuai untuk rumah, studio, stor atau ruang komersial yang perlukan susunan lebih teratur tanpa mengorbankan akses.\n\n#BRUTTI #AHTAMXL #StorageSolution`}];

const productNames=['AHTAM XL Shelving Rack','AHTAM M Shelving Rack','GANTUNG Open Concept Cloth Rack','BESPOKE RACK','BESPOKE RACK – Open Concept Modular Closet','ADUDU','AGATANG Display Rack','PALANGKO Pastry Rack','PUSMA Display Rack','POPO TV Console','SULOB Bespoke Shoe Rack','TOMODON Shawl/Sampin Organizer','KAANAGAN Open Concept Wardrobe','KAANAGAN Open Concept Wardrobe with Drawers','KOTAK Modular Storage','SUSUN Display Shelf'];
const products=productNames.map((name,i)=>({name,code:`BR-${String(i+1).padStart(3,'0')}`,photo:i<10,category:i%3===0?'Storage':i%3===1?'Wardrobe':'Display'}));
const snapshots=[
['Facebook marketing requests','7 records embedded'],['Facebook generated content','4 drafts embedded'],['Product database','88 products · 10 confirmed photos'],['Facebook followers','12,001 exported records'],['Facebook reactions','728 incoming records'],['Facebook media archive','7,062 photo + video files'],['Facebook analytics','7 unique source files verified']];
const dataCards=[['Facebook marketing requests','7','records embedded','＋'],['Facebook generated content','4','drafts embedded','✦'],['Product database','88','products · 10 confirmed photos','▦'],['Facebook followers','12,001','exported records','f'],['Facebook reactions','728','incoming records','♡'],['Facebook media archive','7,062','photo + video files','▧'],['Facebook analytics','7','unique source files verified','◫'],['Integration check','11 Aug 2026','Notion + Google Drive','✓']];
const planner=[
{day:'Monday',date:'10 Aug',items:[['Brand Awareness','KAANAGAN'],['Review draft','AHTAM XL']]},
{day:'Tuesday',date:'11 Aug',items:[['Product Highlight','PUSMA']]},
{day:'Wednesday',date:'12 Aug',items:[['Educational','Storage tips']]},
{day:'Thursday',date:'13 Aug',items:[['Brand Story','BRUTTI workshop']]},
{day:'Friday',date:'14 Aug',items:[['Product Highlight','GANTUNG']]}
];

let selectedDraft=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>t.classList.remove('show'),2200)}
function go(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===view));$$('.nav-item[data-view]').forEach(n=>n.classList.toggle('active',n.dataset.view===view));$('#sidebar').classList.remove('open');scrollTo({top:0,behavior:'smooth'})}
$$('.nav-item[data-view]').forEach(n=>n.addEventListener('click',()=>go(n.dataset.view)));$$('[data-open]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.open)));
$('#menuBtn').onclick=()=>$('#sidebar').classList.add('open');$('#sidebarClose').onclick=()=>$('#sidebar').classList.remove('open');

function renderRecent(){const box=$('#recentRequests');box.innerHTML=requests.slice(0,4).map(r=>`<div class="request-row"><div class="request-fb">f</div><div><div class="request-title">${esc(r.title)}</div><div class="request-sub"><span>${esc(r.product)}</span><span>·</span><span>${esc(r.objective)}</span><span>Facebook · ${esc(r.date)}</span></div></div><div class="request-actions"><span class="status-tag">${r.status}</span><button class="text-btn" onclick="openFromRequest(${r.id})">Review</button></div></div>`).join('')}
function renderSnapshot(){ $('#snapshotGrid').innerHTML=snapshots.map(x=>`<div class="snapshot-item"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('') }
function renderRequests(){const q=($('#requestSearch')?.value||'').toLowerCase(),filter=$('#requestFilter')?.value||'all';const rows=requests.filter(r=>(!q||`${r.title} ${r.product} ${r.objective}`.toLowerCase().includes(q))&&(filter==='all'||r.status===filter));$('#requestTable').innerHTML=rows.map(r=>`<tr><td><strong>${esc(r.title)}</strong><span>Facebook</span></td><td>${esc(r.product)}</td><td>${esc(r.objective)}</td><td>${esc(r.date)}</td><td><button class="status-tag" onclick="openFromRequest(${r.id})">${r.status}</button></td></tr>`).join('')||'<tr><td colspan="5">No matching request.</td></tr>'}
function renderDrafts(){ $('#draftGrid').innerHTML=drafts.map(d=>`<article class="draft-card"><div class="draft-card-head"><div class="request-fb">f</div><span class="status-tag ${d.status==='Approved'?'approved':''}">${d.status}</span></div><h3>${esc(d.title)}</h3><div class="draft-meta">${esc(d.product)} · Facebook</div><div class="draft-copy">${esc(d.copy.slice(0,250))}${d.copy.length>250?'…':''}</div><div class="draft-actions"><button class="btn secondary" onclick="openDraft(${d.id})">Review content</button></div></article>`).join('') }
function renderProducts(){const q=($('#productSearch')?.value||'').toLowerCase();const list=products.filter(p=>!q||`${p.name} ${p.category}`.toLowerCase().includes(q));$('#productGrid').innerHTML=list.map(p=>`<article class="product-card"><div class="product-photo ${p.photo?'has-photo':''}">BRUTTI product</div><div class="product-body"><strong>${esc(p.name)}</strong><p>${p.code} · ${p.category}</p></div></article>`).join('')}
function renderPlanner(){ $('#weekGrid').innerHTML=planner.map(d=>`<article class="day-card"><div class="day-head"><strong>${d.day}</strong><small>${d.date}</small></div>${d.items.map(x=>`<div class="plan-item"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</article>`).join('') }
function renderData(){ $('#dataGrid').innerHTML=dataCards.map(d=>`<article class="data-card"><div><span>${d[0]}</span><strong>${d[1]}</strong><p>${d[2]}</p></div><div class="data-icon">${d[3]}</div></article>`).join('') }

function fillProductSelect(){const options=['General / No Product',...productNames].map(x=>`<option>${esc(x)}</option>`).join('');$('#requestProduct').innerHTML=options}
function openRequestModal(){ $('#requestModal').classList.add('open');$('#requestModal').setAttribute('aria-hidden','false');setTimeout(()=>$('#requestTitle').focus(),30) }
function closeRequestModal(){ $('#requestModal').classList.remove('open');$('#requestModal').setAttribute('aria-hidden','true') }
$('#newRequestBtn').onclick=openRequestModal;$('#newRequestBtn2').onclick=openRequestModal;$$('[data-close-modal]').forEach(b=>b.onclick=closeRequestModal);
$('#requestForm').onsubmit=e=>{e.preventDefault();const title=$('#requestTitle').value.trim();if(!title)return;requests.unshift({id:Date.now(),title,product:$('#requestProduct').value,objective:$('#requestType').value,date:new Date().toLocaleString('en-MY',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}),status:'Draft'});closeRequestModal();e.target.reset();renderRecent();renderRequests();toast('Facebook request added.');go('requests')}
function openDraft(id){selectedDraft=drafts.find(x=>x.id===id);if(!selectedDraft)return;$('#reviewTitle').textContent=selectedDraft.title;$('#reviewMeta').textContent=`${selectedDraft.product} · Facebook · ${selectedDraft.status}`;$('#reviewText').value=selectedDraft.copy;$('#reviewModal').classList.add('open')}
window.openDraft=openDraft;window.openFromRequest=id=>{const d=drafts.find(x=>x.requestId===id);if(d)openDraft(d.id);else{toast('No generated draft for this request yet.');go('requests')}};
$$('[data-close-review]').forEach(b=>b.onclick=()=>$('#reviewModal').classList.remove('open'));
$('#copyDraftBtn').onclick=async()=>{try{await navigator.clipboard.writeText($('#reviewText').value);toast('Copied to clipboard.')}catch{toast('Copy unavailable in this browser.')}};
$('#saveDraftBtn').onclick=()=>{if(!selectedDraft)return;selectedDraft.copy=$('#reviewText').value;renderDrafts();toast('Edits saved locally.')};
$('#approveDraftBtn').onclick=()=>{if(!selectedDraft)return;selectedDraft.copy=$('#reviewText').value;selectedDraft.status='Approved';$('#reviewMeta').textContent=`${selectedDraft.product} · Facebook · Approved`;renderDrafts();toast('Content approved.')};
$('#requestSearch').addEventListener('input',renderRequests);$('#requestFilter').addEventListener('change',renderRequests);$('#productSearch').addEventListener('input',renderProducts);
$('#addPlanBtn').onclick=()=>toast('Planner demo: connect this button to your Notion/Make workflow.');
$('#requestModal').addEventListener('click',e=>{if(e.target.id==='requestModal')closeRequestModal()});$('#reviewModal').addEventListener('click',e=>{if(e.target.id==='reviewModal')$('#reviewModal').classList.remove('open')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeRequestModal();$('#reviewModal').classList.remove('open');$('#sidebar').classList.remove('open')}});
renderRecent();renderSnapshot();renderRequests();renderDrafts();renderProducts();renderPlanner();renderData();fillProductSelect();
