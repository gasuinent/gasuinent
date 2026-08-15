import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getFirestore, doc, setDoc, increment } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyDTiST7xB7YFnuzdPJ8q418qmx_d5LJupo",authDomain:"gasuinent.firebaseapp.com",projectId:"gasuinent",storageBucket:"gasuinent.firebasestorage.app",messagingSenderId:"122370674182",appId:"1:122370674182:web:3bb831917d8d6ed36d7d87",measurementId:"G-39M5K1M6K7"};
const db=getFirestore(initializeApp(firebaseConfig));
const day=new Date().toISOString().slice(0,10);
const page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
let visitorId=localStorage.getItem('gse_visitor_id');
if(!visitorId){visitorId=crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);localStorage.setItem('gse_visitor_id',visitorId)}

setDoc(doc(db,'visitor_stats',day),{date:day,views:increment(1),['pages.'+page]:increment(1)},{merge:true}).catch(()=>{});
setDoc(doc(db,'visitor_unique',day+'_'+visitorId),{date:day,visitorId,updatedAt:Date.now()},{merge:true}).catch(()=>{});
