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
if(page==='index'){
 const fixNewsImages=()=>{
  if(document.getElementById('gse-news-image-fix'))return;
  const style=document.createElement('style');style.id='gse-news-image-fix';
  style.textContent='#latestNews .news-card img{object-fit:contain !important;background:#1a1a1a;}';
  document.head.appendChild(style);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fixNewsImages);else fixNewsImages();
}
if(page==='gallery'){
 const esc=(v)=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const PAGE_SIZE=15;
 let currentPage=1;
 let items=[];
 const grid=document.getElementById('galleryGrid');
 const prev=document.getElementById('prevBtn');
 const next=document.getElementById('nextBtn');
 const info=document.getElementById('pageInfo');
 const render=()=>{
  if(!grid)return;
  const total=Math.max(1,Math.ceil(items.length/PAGE_SIZE));
  if(currentPage>total)currentPage=total;
  const start=(currentPage-1)*PAGE_SIZE;
  const pageItems=items.slice(start,start+PAGE_SIZE);
  grid.innerHTML=pageItems.length?pageItems.map(item=>{
   const g=item.data||{};const title=esc(g.title||'');const place=esc(g.place||'');const date=esc(g.date||'');const content=esc(g.content||'');
   const image=g.image||'';
   const imageHTML=image?`<img src="${esc(image)}" alt="${title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="no-image" style="display:none;">사진 없음</div>`:'<div class="no-image">사진 없음</div>';
   return `<article class="gallery-card" data-id="${esc(item.id)}" tabindex="0" role="button"><div class="gallery-image">${imageHTML}</div><div class="gallery-info"><div class="gallery-title">사진 제목 : ${title}</div>${place?`<div class="gallery-date">📍 ${place}</div>`:''}${date?`<div class="gallery-date">📅 ${date}</div>`:''}${content?`<div class="gallery-content">${content}</div>`:''}<button type="button" class="detail-btn">자세히 보기</button></div></article>`;
  }).join(''):'<div style="grid-column:1/-1;text-align:center;padding:70px 20px;color:#888;">등록된 사진이 없습니다.</div>';
  if(info)info.textContent=currentPage+' / '+total;
  if(prev)prev.disabled=currentPage<=1;
  if(next)next.disabled=currentPage>=total;
 };
 const load=async()=>{try{
  const snap=await getDocs(collection(db,'gallery'));
  items=[];snap.forEach(d=>items.push({id:d.id,data:d.data()}));
  items.sort((a,b)=>{const ap=a.data.pinned===true?1:0;const bp=b.data.pinned===true?1:0;if(ap!==bp)return bp-ap;return (b.data.timestamp||0)-(a.data.timestamp||0)});
  currentPage=1;render();
 }catch(e){console.error('gallery page error',e)}};
 const bind=()=>{
  if(prev)prev.onclick=()=>{if(currentPage>1){currentPage--;render();window.scrollTo({top:0,behavior:'smooth'})}};
  if(next)next.onclick=()=>{const total=Math.max(1,Math.ceil(items.length/PAGE_SIZE));if(currentPage<total){currentPage++;render();window.scrollTo({top:0,behavior:'smooth'})}};
  if(grid){grid.onclick=event=>{const card=event.target.closest('.gallery-card');if(card)location.href='gallery_view.html?id='+encodeURIComponent(card.dataset.id)};grid.onkeydown=event=>{if(event.key!=='Enter'&&event.key!==' ')return;const card=event.target.closest('.gallery-card');if(!card)return;event.preventDefault();location.href='gallery_view.html?id='+encodeURIComponent(card.dataset.id)}}
 };
 const start=()=>{bind();load()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
}
if(page==='projects'){
 const esc=(v)=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
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
 let reordering=false;
 const sortArtistsByRegistration=async()=>{
  if(reordering)return;
  const grid=document.getElementById('artistGrid');
  if(!grid)return;
  try{
   const snap=await getDocs(collection(db,'artists'));
   const orderMap=new Map();
   snap.forEach(d=>{
    const a=d.data();
    const name=(a.stageName||a.name||'').trim();
    if(name)orderMap.set(name,{pinned:a.pinned===true,registeredAt:a.registeredAt||a.timestamp||0});
   });
   const cards=[...grid.querySelectorAll('.artist-card')].filter(card=>!card.classList.contains('artist-empty-slot'));
   const artistCards=cards.filter(card=>orderMap.has((card.querySelector('h3')?.textContent||'').trim()));
   artistCards.sort((a,b)=>{
    const aa=orderMap.get((a.querySelector('h3')?.textContent||'').trim());
    const bb=orderMap.get((b.querySelector('h3')?.textContent||'').trim());
    if(aa.pinned!==bb.pinned)return aa.pinned?-1:1;
    return aa.registeredAt-bb.registeredAt;
   });
   if(!artistCards.length)return;
   const alreadyCorrect=artistCards.every((card,index)=>card===cards[index]);
   if(alreadyCorrect)return;
   reordering=true;
   const fragment=document.createDocumentFragment();
   artistCards.forEach(card=>fragment.appendChild(card));
   const firstGridCard=grid.querySelector('.artist-card');
   if(firstGridCard)grid.insertBefore(fragment,firstGridCard);else grid.appendChild(fragment);
  }catch(e){console.error('artist registration order error',e)}finally{reordering=false}
 };
 const start=()=>{
  const grid=document.getElementById('artistGrid');
  if(!grid)return;
  normalizeArtistGrid();
  sortArtistsByRegistration();
  const observer=new MutationObserver(()=>{normalizeArtistGrid();sortArtistsByRegistration()});
  observer.observe(grid,{childList:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
}
