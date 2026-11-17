const AGENTS=[
 {id:'scout',icon:'🔎',name:'Scout Agent',desc:'Finds data scraps everywhere.',base:15,rate:0.2},
 {id:'coder',icon:'💻',name:'Coder Agent',desc:'Ships tools that sell themselves.',base:120,rate:1.2},
 {id:'trader',icon:'📈',name:'Trader Agent',desc:'Turns data into deals, day and night.',base:1100,rate:7},
 {id:'manager',icon:'🧭',name:'Manager Agent',desc:'Runs whole teams while you sleep.',base:12000,rate:42},
 {id:'oracle',icon:'🔮',name:'Oracle Agent',desc:'Predicts markets before they move.',base:130000,rate:260}];
const UPGRADES=[
 {id:'tap2',icon:'👆',name:'Reinforced Core',desc:'Tap power ×2',cost:500,need:()=>true,apply:s=>s.tap*=2},
 {id:'scout2',icon:'🛰️',name:'Scout Satellites',desc:'Scouts earn ×2',cost:2500,need:s=>s.owned.scout>=5,apply:s=>s.mult.scout*=2},
 {id:'coder2',icon:'⚡',name:'Overclocked Coders',desc:'Coders earn ×2',cost:15000,need:s=>s.owned.coder>=5,apply:s=>s.mult.coder*=2},
 {id:'all2',icon:'🌐',name:'Nexus Network',desc:'All agents earn ×2',cost:90000,need:s=>totalAgents(s)>=20,apply:s=>s.global*=2}];
const GOALS=[[15,'hire your first Scout (15 Data)'],[120,'hire a Coder (120 Data)'],[1100,'hire a Trader (1,100 Data)'],[12000,'hire a Manager (12,000 Data)'],[130000,'hire an Oracle (130,000 Data)'],[1000000,'reach 1M lifetime Data — then Nexus Reset!']];
let s=load();
function fresh(){return{data:0,lifetime:0,tap:1,global:1,prestige:0,owned:{},mult:{},bought:{},last:Date.now()};}
function load(){try{const r=JSON.parse(localStorage.gnTycoon);if(r&&r.owned)return Object.assign(fresh(),r);}catch{}return fresh();}
AGENTS.forEach(a=>{s.owned[a.id]=s.owned[a.id]||0;s.mult[a.id]=s.mult[a.id]||1;});
function totalAgents(st){return AGENTS.reduce((n,a)=>n+st.owned[a.id],0);}
function perSec(){return AGENTS.reduce((n,a)=>n+s.owned[a.id]*a.rate*s.mult[a.id],0)*s.global*(1+s.prestige*0.25);}
function cost(a){return Math.ceil(a.base*Math.pow(1.15,s.owned[a.id]));}
function fmt(n){if(n>=1e9)return(n/1e9).toFixed(2)+'B';if(n>=1e6)return(n/1e6).toFixed(2)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return Math.floor(n).toString();}
const $=id=>document.getElementById(id);
const shop=$('shop'),upEl=$('upgrades');
const COLORS={scout:'#ffd166',coder:'#3ddc97',trader:'#6fc3ff',manager:'#ff9f68',oracle:'#e8b4ff'};
const STAGES=[[0,'Garage HQ','Just you and a laptop'],[1,'Startup Office','Your first agents move in'],[8,'Gaia Office','Departments are humming'],[20,'Nexus HQ','A real headquarters now'],[45,'Nexus Tower','A tower full of agents']];
const floorsEl=$('floors');const floorEls={};
[...AGENTS].reverse().forEach(a=>{const f=document.createElement('div');f.className='floor locked';f.innerHTML=`<div class="tag">${a.icon}<b>${a.name}</b><span class="fcount">Locked</span></div><div class="room"><span class="locked-note">🔒 Hire a ${a.name} to open this floor</span><div class="agents"></div></div>`;floorsEl.appendChild(f);floorEls[a.id]={root:f,agents:f.querySelector('.agents'),count:f.querySelector('.fcount'),cache:-1};});
const ACCESSORY={
scout:"<circle cx='52' cy='38' r='9' fill='#bfe8f5' fill-opacity='.75' stroke='#7a4b12' stroke-width='3'/><line x1='58' y1='45' x2='64' y2='56' stroke='#7a4b12' stroke-width='4' stroke-linecap='round'/><path d='M8 34 q-6 16 2 24 l8 0 q-4-12 -2-24 z' fill='#b08954'/>",
coder:"<path d='M14 22 a18 14 0 0 1 36 0' fill='none' stroke='#263238' stroke-width='5'/><rect x='10' y='20' width='9' height='14' rx='4' fill='#263238'/><rect x='45' y='20' width='9' height='14' rx='4' fill='#263238'/><rect x='38' y='46' width='24' height='16' rx='2' fill='#263238'/><rect x='41' y='49' width='18' height='10' fill='#7ce8c3'/>",
trader:"<path d='M26 40 l6 8 6-8-6-4z' fill='#174a7a'/><rect x='40' y='44' width='24' height='17' rx='2' fill='#bfe4ff' stroke='#174a7a' stroke-width='2'/><polyline points='43,57 49,51 54,54 61,47' fill='none' stroke='#1769aa' stroke-width='2'/>",
manager:"<path d='M14 22 a18 14 0 0 1 34-2' fill='none' stroke='#263238' stroke-width='5'/><rect x='45' y='20' width='9' height='14' rx='4' fill='#263238'/><path d='M48 32 q-2 8-12 8' fill='none' stroke='#263238' stroke-width='3'/><circle cx='35' cy='40' r='2.5' fill='#263238'/><rect x='6' y='44' width='17' height='22' rx='2' fill='#f5e6c8' stroke='#8a6d3b' stroke-width='2'/><path d='M10 51h9M10 56h9M10 61h6' stroke='#8a6d3b' stroke-width='1.6'/>",
oracle:"<path d='M14 26 q18-22 36 0 l4 34 q-22 10-44 0z' fill='#8f7cc9'/><path d='M14 26 q18-22 36 0' fill='none' stroke='#ffd166' stroke-width='2.5'/><circle cx='44' cy='50' r='10' fill='#cdbcf7'/><circle cx='40' cy='46' r='3' fill='#fff' fill-opacity='.8'/><path d='M20 18l1.5 3 3 1.5-3 1.5L20 27l-1.5-3-3-1.5 3-1.5z' fill='#ffd166'/>"};
function spriteSVG(a){const c=COLORS[a.id];return `<svg viewBox='0 0 72 84' role='img' aria-label='${a.name}'><ellipse cx='34' cy='78' rx='18' ry='4' fill='#000' fill-opacity='.28'/><line x1='32' y1='6' x2='32' y2='14' stroke='#20242a' stroke-width='3' stroke-linecap='round'/><circle cx='32' cy='5' r='4' fill='${c}' stroke='#20242a' stroke-width='2'/><rect x='13' y='13' width='38' height='32' rx='11' fill='${c}' stroke='#20242a' stroke-width='2.5'/><circle cx='25' cy='29' r='3.2' fill='#20242a'/><circle cx='39' cy='29' r='3.2' fill='#20242a'/><circle cx='26' cy='28' r='1' fill='#fff'/><circle cx='40' cy='28' r='1' fill='#fff'/><path d='M28 37 q4 3 8 0' fill='none' stroke='#20242a' stroke-width='2' stroke-linecap='round'/><circle cx='19' cy='36' r='3' fill='#ff9d9d' fill-opacity='.65'/><circle cx='45' cy='36' r='3' fill='#ff9d9d' fill-opacity='.65'/><path d='M18 45 h28 l4 22 q-18 6-36 0z' fill='${c}' stroke='#20242a' stroke-width='2.5'/><path d='M18 45 h28 l1.5 8 h-31z' fill='#fff' fill-opacity='.22'/><rect x='21' y='67' width='8' height='9' fill='#39424e'/><rect x='35' y='67' width='8' height='9' fill='#39424e'/><path d='M19 76 h11 M33 76 h11' stroke='#20242a' stroke-width='4' stroke-linecap='round'/>${ACCESSORY[a.id]||''}</svg>`;}
function agentEl(a,i){const el=document.createElement('span');el.className='agent'+(i%3===1?' walk':'');el.style.left=(6+i*46)+'px';el.style.animationDelay=(i*0.22)+'s';el.innerHTML=spriteSVG(a);el.title=a.name;return el;}
function renderScene(){const total=totalAgents(s);const stage=[...STAGES].reverse().find(([n])=>total>=n);$('hqName').textContent=stage[1];$('hqMeta').textContent=stage[2]+' · '+total+' agents';$('scene').className='scene stage-'+STAGES.indexOf(stage);
AGENTS.forEach(a=>{const F=floorEls[a.id];const n=s.owned[a.id];F.root.className='floor '+(n?'unlocked':'locked');F.count.textContent=n?('×'+n+' working · +'+fmt(n*a.rate*s.mult[a.id])+'/s'):'Locked';if(F.cache===n)return;F.cache=n;F.agents.innerHTML='';const show=Math.min(n,8);for(let i=0;i<show;i++)F.agents.appendChild(agentEl(a,i));if(n>show){const m=document.createElement('span');m.className='more';m.textContent='+'+(n-show)+' more';F.agents.appendChild(m);}});}
AGENTS.forEach(a=>{const d=document.createElement('div');d.className='item';d.innerHTML=`<span class="portrait" id="portrait-${a.id}"></span><div><h3>${a.name} <span class="own" id="own-${a.id}"></span></h3><p>${a.desc} +${a.rate}/s each</p></div><button id="buy-${a.id}"></button>`;shop.appendChild(d);d.querySelector('button').onclick=()=>buy(a);});
AGENTS.forEach(a=>{const p=$('portrait-'+a.id);if(p)p.innerHTML=spriteSVG(a);});
UPGRADES.forEach(u=>{const d=document.createElement('div');d.className='item';d.id='up-'+u.id;d.innerHTML=`<div><h3>${u.icon} ${u.name}</h3><p>${u.desc}</p></div><button></button>`;upEl.appendChild(d);d.querySelector('button').onclick=()=>{if(s.data>=u.cost&&!s.bought[u.id]){s.data-=u.cost;s.bought[u.id]=1;u.apply(s);say(u.icon+' '+u.name+' installed!');render();save();}};});
function buy(a){const c=cost(a);if(s.data<c)return;s.data-=c;s.owned[a.id]++;say(a.icon+' '+a.name+' hired — '+s.owned[a.id]+' on the team.');render();save();}
let audio;function blip(f){try{audio=audio||new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.08,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.start();o.stop(audio.currentTime+.13);}catch{}}
$('core').onclick=e=>{const gain=s.tap*(1+s.prestige*0.25);s.data+=gain;s.lifetime+=gain;const f=document.createElement('div');f.className='float';f.textContent='+'+fmt(gain);f.style.left=e.clientX+'px';f.style.top=e.clientY+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),900);blip(620+Math.random()*120);render();};
$('prestige').onclick=()=>{if(s.lifetime<1e6){say('Nexus Reset needs 1M lifetime Data. You have '+fmt(s.lifetime)+'.');return;}const gain=Math.floor(Math.sqrt(s.lifetime/1e6));const keep=s.prestige+gain;const nf=fresh();nf.prestige=keep;s=nf;AGENTS.forEach(a=>{s.owned[a.id]=0;s.mult[a.id]=1;});say('🌌 Nexus Reset! +'+gain+' Nexus Shards — all earnings +25% each, forever.');render();save();};
$('wipe').onclick=()=>{if(confirm('Erase your company and start from zero?')){s=fresh();AGENTS.forEach(a=>{s.owned[a.id]=0;s.mult[a.id]=1;});render();save();say('Fresh start. One laptop, big dreams.');}};
function say(t){$('status').textContent=t;}
function render(){renderScene();$('data').textContent=fmt(s.data);$('perTap').textContent=fmt(s.tap*(1+s.prestige*0.25));$('perSec').textContent=fmt(perSec());$('value').textContent='$'+fmt(s.lifetime*1.7+s.prestige*5000);
AGENTS.forEach(a=>{$('own-'+a.id).textContent='×'+s.owned[a.id];const b=$('buy-'+a.id);b.textContent='Hire · '+fmt(cost(a));b.disabled=s.data<cost(a);});
UPGRADES.forEach(u=>{const d=$('up-'+u.id);if(s.bought[u.id]){d.style.display='none';return;}const ok=u.need(s);d.style.display=ok?'flex':'none';const b=d.querySelector('button');b.textContent='Buy · '+fmt(u.cost);b.disabled=s.data<u.cost;});
const g=GOALS.find(([t])=>s.lifetime<t);if(g){$('goal').textContent='Goal: '+g[1];const prev=[...GOALS].reverse().find(([t])=>s.lifetime>=t);$('barFill').style.width=Math.min(100,(s.lifetime/g[0])*100)+'%';}else{$('goal').textContent='Empire status: Nexus legend. Reset for shards, or keep growing.';$('barFill').style.width='100%';}}
function save(){s.last=Date.now();localStorage.gnTycoon=JSON.stringify(s);}
const offline=Math.min(8*3600,(Date.now()-s.last)/1000);const earned=perSec()*offline;if(earned>=10){s.data+=earned;s.lifetime+=earned;setTimeout(()=>say('While you were away your agents earned '+fmt(earned)+' Data. ⏰'),300);}
setInterval(()=>{const p=perSec()/10;if(p>0){s.data+=p;s.lifetime+=p;}render();},100);
setInterval(save,5000);render();
