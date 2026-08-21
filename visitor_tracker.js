import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getFirestore, doc, setDoc, increment, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
const firebaseConfig={apiKey:"AIzaSyDTiST7xB7YFnuzdPJ8q418qmx_d5LJupo",authDomain:"gasuinent.firebaseapp.com",projectId:"gasuinent",storageBucket:"gasuinent.firebasestorage.app",messagingSenderId:"122370674182",appId:"1:122370674182:web:3bb831917d8d6ed36d7d87",measurementId:"G-39M5K1M6K7"};
const db=getFirestore(initializeApp(firebaseConfig));
const day=new Date().toISOString().slice(0,10);
const page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
let visitorId=localStorage.getItem('gse_visitor_id');
if(!visitorId){visitorId=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);localStorage.setItem('gse_visitor_id',visitorId)}
setDoc(doc(db,'visitor_stats',day),{date:day,views:increment(1),['pages.'+page]:increment(1)},{merge:true}).catch(()=>{});
setDoc(doc(db,'visitor_unique',day+'_'+visitorId),{date:day,visitorId,updatedAt:Date.now()},{merge:true}).catch(()=>{});
if(page==='projects'){
 const esc=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
 const label=(name)=>`<strong style="display:block;color:#FFD700;font-size:18px;font-weight:800;margin-bottom:8px;letter-spacing:.02em">${name}</strong>`;
 const loadProjects=async()=>{try{
  const snap=await getDocs(collection(db,'projects'));const items=[];snap.forEach(d=>items.push({id:d.id,...d.data()}));
  items.sort((a,b)=>Boolean(a.pinned)!==Boolean(b.pinned)?(a.pinned?-1:1):(b.createdAt||0)-(a.createdAt||0));
  const grid=document.querySelector('.projects-grid');
  if(grid){grid.innerHTML='';items.forEach(p=>{const article=document.createElement('article');article.className='project-card';article.innerHTML=`${p.pinned?'<span class="tag">📌 상단 고정</span>':''}<span class="tag">${esc(p.category||'실적')}</span><h3>${esc(p.title)}</h3><p><strong>주최·주관</strong><br>${esc(p.organizer||'')}<br><br><strong>기간·날짜</strong><br>${esc(p.date||'')}</p><button class="detail-btn" type="button">자세히 보기</button><div class="project-detail"><div>${label('내용')}${esc(p.content||'')}</div><div style="margin-top:22px">${label('실적')}${esc(p.result||'')}</div><div style="margin-top:22px">${label('자세한 내용')}${esc(p.detail||p.content||'')}</div></div>`;const btn=article.querySelector('.detail-btn');btn.addEventListener('click',()=>{const open=article.classList.toggle('open');btn.textContent=open?'접기':'자세히 보기'});grid.appendChild(article)})}
  const tbody=document.querySelector('.project-list tbody');if(tbody){tbody.innerHTML='';items.forEach((p,index)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${index+1}</td><td>${p.pinned?'📌':''}</td><td>${esc(p.category||'실적')}</td><td>${esc(p.title||'')}</td><td>${esc(p.date||'')}</td><td><button class="list-btn" type="button">자세히 보기</button></td>`;const detailTr=document.createElement('tr');detailTr.className='project-detail-row';detailTr.style.display='none';detailTr.innerHTML=`<td colspan="6"><div class="project-list-detail" style="padding:28px 35px;text-align:center;line-height:1.9"><div>${label('주최·주관')}${esc(p.organizer||'')}</div><div style="margin-top:22px">${label('기간·날짜')}${esc(p.date||'')}</div><div style="margin-top:22px">${label('내용')}${esc(p.content||'')}</div><div style="margin-top:22px">${label('실적')}${esc(p.result||'')}</div><div style="margin-top:22px">${label('자세한 내용')}${esc(p.detail||p.content||'')}</div></div></td>`;const btn=tr.querySelector('.list-btn');btn.addEventListener('click',()=>{const open=detailTr.style.display!=='none';detailTr.style.display=open?'none':'table-row';btn.textContent=open?'자세히 보기':'접기'});tbody.appendChild(tr);tbody.appendChild(detailTr)})}
 }catch(e){console.error('projects load error',e)}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadProjects);else loadProjects();
}
if(page==='artists'){
 const normalizeArtistGrid=()=>{
  const grid=document.getElementById('artistGrid');
  if(!grid)return;
  const first=grid.querySelector('.artist-card[data-artist-index="0"]');
  if(first && !first.classList.contains('artist-empty-slot')){
   const img=first.querySelector('img');
   const title=first.querySelector('h3');
   if(img && title && img.getAttribute('src')==='lee-myungro.jpg' && title.textContent.trim()==='이명로'){
    first.remove();
    const cards=grid.querySelectorAll('.artist-card');
    if(cards.length%4!==0){
     const empty=document.createElement('div');
     empty.className='artist-card artist-empty-slot';
     empty.setAttribute('aria-hidden','true');
     empty.innerHTML='<img src="logo.png" alt=""><h3>아티스트 준비중</h3><p>새로운 아티스트 영입 진행 중<br>Coming Soon</p>';
     grid.appendChild(empty);
    }
   }
  }
 };
 const start=()=>{
  const grid=document.getElementById('artistGrid');
  if(!grid)return;
  normalizeArtistGrid();
  new MutationObserver(normalizeArtistGrid).observe(grid,{childList:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
}
