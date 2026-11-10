const U=id=>`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;
const IMG={e:U('1504328345606-18bbc8c9d7d1'),c:U('1504307651254-35680f356dfd'),p:U('1581092160562-40aa08e78837'),pt:U('1503387762-592deb58ef4e')};
const DATA={
 Islamabad:[
  {n:'Kamran Ahmed',t:'Electrician',r:'Master Electrician',d:'0.7 km',s:4.98,j:127,p:2200,a:'Available today',tg:['Solar systems','Rewiring'],i:IMG.e,ab:'12 saal ka tajurba. Solar panel, wiring aur load-shedding backup ka kaam saaf suthra aur safety ke saath.'},
  {n:'Babar Imran',t:'Carpenter',r:'Finish Carpenter',d:'1.2 km',s:4.97,j:98,p:2550,a:'Available tomorrow',tg:['Built-ins','Woodwork'],i:IMG.c,ab:'Kitchen cabinets, wardrobes aur custom furniture — naap se le kar fitting tak.'},
  {n:'Iftikhar Ali',t:'Plumber',r:'Licensed Plumber',d:'1.7 km',s:4.96,j:143,p:2900,a:'Available today',tg:['Emergency','Installations'],i:IMG.p,ab:'Leakage, geyser aur bathroom fittings. Emergency mein bhi jaldi pohanchte hain.'},
  {n:'Saad Malik',t:'Painter',r:'Interior & Exterior Painter',d:'2.2 km',s:4.95,j:76,p:3250,a:'Available today',tg:['Interiors','Weatherproofing'],i:IMG.pt,ab:'Andar aur bahar ki painting, damp-proofing aur weatherproof finish.'}],
 Rawalpindi:[
  {n:'Zeeshan Tariq',t:'Electrician',r:'Certified Electrician',d:'0.9 km',s:4.97,j:112,p:2000,a:'Available today',tg:['Wiring','Inverters'],i:IMG.e,ab:'Ghar aur dukaan ki wiring, DB panel aur inverter ki installation.'},
  {n:'Usman Ghani',t:'Plumber',r:'Licensed Plumber',d:'1.4 km',s:4.96,j:131,p:2600,a:'Available tomorrow',tg:['Leakage','Water tanks'],i:IMG.p,ab:'Pipe fitting, tank safai aur pani ke masail ka pakka hal.'},
  {n:'Hamza Qureshi',t:'Carpenter',r:'Furniture Carpenter',d:'1.9 km',s:4.94,j:89,p:2400,a:'Available today',tg:['Doors','Furniture'],i:IMG.c,ab:'Darwaze, khirkiyan aur lakri ka custom furniture, waqt par delivery.'},
  {n:'Rizwan Butt',t:'Painter',r:'Interior & Exterior Painter',d:'2.5 km',s:4.93,j:64,p:3000,a:'Available today',tg:['Interiors','Polish'],i:IMG.pt,ab:'Saaf suthri painting, texture walls aur wood polish.'}]
};
const $=s=>document.querySelector(s), ic=n=>`<svg><use href="#i-${n}"/></svg>`;
const fmt=n=>n.toLocaleString('en-US');
let city='Islamabad', trade='all', term='', favs=new Set(), heroI=0;

const imgTag=(src,alt='')=>`<img src="${src}" alt="${alt}" loading="lazy" onerror="this.style.display='none'">`;

function render(){
  $('#around').textContent='AROUND '+city.toUpperCase();
  const list=DATA[city].filter(p=>(trade==='all'||p.t===trade)&&(!term||(p.n+p.r+p.t+p.tg.join(' ')).toLowerCase().includes(term)));
  $('#grid').innerHTML=list.length?list.map((p,k)=>`
   <article class="card" style="animation-delay:${k*70}ms">
    <div class="ph">${imgTag(p.i,p.n)}
      <button class="heart" data-fav="${p.n}" aria-pressed="${favs.has(p.n)}" aria-label="Save ${p.n}">${ic('heart')}</button>
      <span class="avail ${p.a.includes('tomorrow')?'later':''}">${p.a}</span></div>
    <div class="body">
      <div class="row"><h3>${p.n}</h3><span class="star">${ic('star')}${p.s}</span></div>
      <div class="role">${p.r} · ${p.d} away</div>
      <div class="tags">${p.tg.map(t=>`<span>${t}</span>`).join('')}</div>
      <div class="foot row"><span class="rate">Rs ${fmt(p.p)} <small>/ hr</small></span>
        <button class="vp" data-open="${p.n}">View profile ${ic('arrow')}</button></div>
    </div></article>`).join('')
   :`<div class="empty"><b>Koi maahir nahi mila</b>Doosra kaam ya shehar try karein.</div>`;
}

function toast(msg){const t=$('#toast');t.querySelector('span').textContent=msg;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2800)}

function openPro(name){
  const p=DATA[city].find(x=>x.n===name),m=$('#modal');
  const slots=['Aaj, 4 PM','Aaj, 7 PM','Kal, 10 AM','Kal, 2 PM','Parson, 11 AM'];
  m.innerHTML=`<button class="x" aria-label="Close" data-close>${ic('x')}</button><div class="m">
   <div class="ph">${imgTag(p.i,p.n)}<span class="avail">${p.a}</span></div>
   <div class="m-body"><div class="eyebrow">${city.toUpperCase()}</div><h2 id="mName">${p.n}</h2>
    <div class="role" style="margin-bottom:0">${p.r} · ${p.d} away</div>
    <div class="stats"><div><b>${p.s}</b><small>Rating</small></div><div><b>${p.j}</b><small>Jobs</small></div><div><b>Rs ${fmt(p.p)}</b><small>Per hour</small></div></div>
    <p class="about">${p.ab}</p>
    <div class="tags">${p.tg.map(t=>`<span style="background:#fff">${t}</span>`).join('')}<span style="background:var(--mint)">License verified</span></div>
    <h4>Apni marzi ka waqt chunein</h4>
    <div class="slots">${slots.map((s,i)=>`<button class="slot" aria-pressed="${i===0}">${s}</button>`).join('')}</div>
    <button class="btn-coral" data-book="${p.n}">${p.n.split(' ')[0]} ko book karein</button></div></div>`;
  m.showModal();
}

/* hero rotator */
function hero(){
  const all=[...DATA[city]],p=all[heroI%all.length],f=$('#feat'),im=$('#heroImg');
  f.classList.add('swap');im.style.opacity=0;
  setTimeout(()=>{im.src=p.i;im.onload=()=>im.style.opacity=1;im.onerror=()=>im.style.opacity=0;
    f.innerHTML=`<div class="r">★ ${p.s} <span style="opacity:.7">(${p.j} jobs)</span></div><h3>${p.n.split(' ')[0]}, ${p.t}</h3><p>${(parseFloat(p.d)/1.6).toFixed(1)} miles away</p>`;
    f.classList.remove('swap')},420);
}
function countUp(){const el=$('#jobs');let v=0;const end=2400,st=performance.now();
  (function f(t){const k=Math.min((t-st)/1400,1);el.textContent=fmt(Math.round(end*(1-Math.pow(1-k,3))))+(k===1?'+':'');if(k<1)requestAnimationFrame(f)})(st)}

function setCity(c){city=c;$('#city').value=c;render();heroI=0;hero();toast(c+' ke maahir dikha rahe hain')}

/* events */
$('#city').addEventListener('change',e=>setCity(e.target.value));
$('#q').addEventListener('input',e=>{term=e.target.value.trim().toLowerCase();render()});
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();term=$('#q').value.trim().toLowerCase();render();$('#maahir').scrollIntoView({behavior:'smooth'})});
$('#filters').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
  document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b));trade=b.dataset.t;render()});
$('#grid').addEventListener('click',e=>{
  const h=e.target.closest('[data-fav]');
  if(h){const n=h.dataset.fav;favs.has(n)?favs.delete(n):(favs.add(n),toast(n+' save ho gaye'));h.setAttribute('aria-pressed',favs.has(n));return}
  const c=e.target.closest('.card');if(c)openPro(c.querySelector('[data-open]').dataset.open)});
$('#modal').addEventListener('click',e=>{
  const m=$('#modal');
  if(e.target===m||e.target.closest('[data-close]'))return m.close();
  const s=e.target.closest('.slot');
  if(s){m.querySelectorAll('.slot').forEach(x=>x.setAttribute('aria-pressed',x===s))}
  const b=e.target.closest('[data-book]');
  if(b){const sl=m.querySelector('.slot[aria-pressed=true]').textContent;m.close();toast(`${b.dataset.book} book ho gaye — ${sl}`)}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-toast]');if(t){e.preventDefault();toast(t.dataset.toast)}});

render();hero();countUp();
if(!matchMedia('(prefers-reduced-motion:reduce)').matches)setInterval(()=>{heroI++;hero()},4500);