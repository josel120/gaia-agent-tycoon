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
AGENTS.forEach(a=>{const d=document.createElement('div');d.className='item';d.innerHTML=`<div><h3>${a.icon} ${a.name} <span class="own" id="own-${a.id}"></span></h3><p>${a.desc} +${a.rate}/s each</p></div><button id="buy-${a.id}"></button>`;shop.appendChild(d);d.querySelector('button').onclick=()=>buy(a);});
UPGRADES.forEach(u=>{const d=document.createElement('div');d.className='item';d.id='up-'+u.id;d.innerHTML=`<div><h3>${u.icon} ${u.name}</h3><p>${u.desc}</p></div><button></button>`;upEl.appendChild(d);d.querySelector('button').onclick=()=>{if(s.data>=u.cost&&!s.bought[u.id]){s.data-=u.cost;s.bought[u.id]=1;u.apply(s);say(u.icon+' '+u.name+' installed!');render();save();}};});
function buy(a){const c=cost(a);if(s.data<c)return;s.data-=c;s.owned[a.id]++;say(a.icon+' '+a.name+' hired — '+s.owned[a.id]+' on the team.');render();save();}
let audio;function blip(f){try{audio=audio||new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=f;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.08,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.start();o.stop(audio.currentTime+.13);}catch{}}
$('core').onclick=e=>{const gain=s.tap*(1+s.prestige*0.25);s.data+=gain;s.lifetime+=gain;const f=document.createElement('div');f.className='float';f.textContent='+'+fmt(gain);f.style.left=e.clientX+'px';f.style.top=e.clientY+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),900);blip(620+Math.random()*120);render();};
$('prestige').onclick=()=>{if(s.lifetime<1e6){say('Nexus Reset needs 1M lifetime Data. You have '+fmt(s.lifetime)+'.');return;}const gain=Math.floor(Math.sqrt(s.lifetime/1e6));const keep=s.prestige+gain;const nf=fresh();nf.prestige=keep;s=nf;AGENTS.forEach(a=>{s.owned[a.id]=0;s.mult[a.id]=1;});say('🌌 Nexus Reset! +'+gain+' Nexus Shards — all earnings +25% each, forever.');render();save();};
$('wipe').onclick=()=>{if(confirm('Erase your company and start from zero?')){s=fresh();AGENTS.forEach(a=>{s.owned[a.id]=0;s.mult[a.id]=1;});render();save();say('Fresh start. One laptop, big dreams.');}};
function say(t){$('status').textContent=t;}
function render(){$('data').textContent=fmt(s.data);$('perTap').textContent=fmt(s.tap*(1+s.prestige*0.25));$('perSec').textContent=fmt(perSec());$('value').textContent='$'+fmt(s.lifetime*1.7+s.prestige*5000);
AGENTS.forEach(a=>{$('own-'+a.id).textContent='×'+s.owned[a.id];const b=$('buy-'+a.id);b.textContent='Hire · '+fmt(cost(a));b.disabled=s.data<cost(a);});
UPGRADES.forEach(u=>{const d=$('up-'+u.id);if(s.bought[u.id]){d.style.display='none';return;}const ok=u.need(s);d.style.display=ok?'flex':'none';const b=d.querySelector('button');b.textContent='Buy · '+fmt(u.cost);b.disabled=s.data<u.cost;});
const g=GOALS.find(([t])=>s.lifetime<t);if(g){$('goal').textContent='Goal: '+g[1];const prev=[...GOALS].reverse().find(([t])=>s.lifetime>=t);$('barFill').style.width=Math.min(100,(s.lifetime/g[0])*100)+'%';}else{$('goal').textContent='Empire status: Nexus legend. Reset for shards, or keep growing.';$('barFill').style.width='100%';}}
function save(){s.last=Date.now();localStorage.gnTycoon=JSON.stringify(s);}
const offline=Math.min(8*3600,(Date.now()-s.last)/1000);const earned=perSec()*offline;if(earned>=10){s.data+=earned;s.lifetime+=earned;setTimeout(()=>say('While you were away your agents earned '+fmt(earned)+' Data. ⏰'),300);}
setInterval(()=>{const p=perSec()/10;if(p>0){s.data+=p;s.lifetime+=p;}render();},100);
setInterval(save,5000);render();
