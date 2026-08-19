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

/* 실적 페이지: 관리자에서 등록한 Firebase 실적을 기존 화면에 자동 추가 */
if(page==='projects'){
  const esc=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const text=(v)=>String(v??'').trim();
  const loadProjects=async()=>{
    try{
      const snap=await getDocs(collection(db,'projects'));
      const items=[];
      snap.forEach(d=>items.push({id:d.id,...d.data()}));
      items.sort((a,b)=>{
        if(Boolean(a.pinned)!==Boolean(b.pinned)) return a.pinned?-1:1;
        return (b.createdAt||0)-(a.createdAt||0);
      });
      if(!items.length)return;

      const grid=document.querySelector('.projects-grid');
      if(grid){
        items.forEach(p=>{
          const article=document.createElement('article');
          article.className='project-card';
          article.innerHTML=`
            ${p.pinned?'<span class="tag">📌 상단 고정</span>':''}
            <span class="tag">${esc(p.category||'실적')}</span>
            <h3>${esc(p.title)}</h3>
            <p><strong>주최·주관</strong><br>${esc(p.organizer||'')}<br><br>
            <strong>기간·날짜</strong><br>${esc(p.date||'')}<br><br>
            <strong>내용</strong><br>${esc(p.content||'')}<br><br>
            <strong>실적</strong><br>${esc(p.result||'')}</p>
            <button class="detail-btn" type="button">자세히 보기</button>
            <div class="project-detail">${esc(p.detail||p.content||'')}</div>`;
          const btn=article.querySelector('.detail-btn');
          btn.addEventListener('click',()=>{
            const open=article.classList.toggle('open');
            btn.textContent=open?'접기':'자세히 보기';
          });
          grid.prepend(article);
        });
      }

      const tbody=document.querySelector('.project-list tbody');
      if(tbody){
        items.slice().reverse().forEach(p=>{
          const tr=document.createElement('tr');
          tr.innerHTML=`<td>${p.pinned?'📌':''}</td><td>${esc(p.category||'실적')}</td><td>${esc(p.title)}</td><td>${esc(p.organizer||'')}</td><td>${esc(p.content||'')}</td><td>${esc(p.date||'')}</td><td><button class="list-btn" type="button">자세히 보기</button></td>`;
          const btn=tr.querySelector('.list-btn');
          btn.addEventListener('click',()=>alert((p.detail||p.content||'').trim()||'상세 내용이 없습니다.'));
          tbody.prepend(tr);
        });
      }
    }catch(e){console.error('projects load error',e)}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadProjects);else loadProjects();
}
