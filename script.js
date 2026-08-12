const inputs=document.getElementById('inputs');
const gamesEl=document.getElementById('games');
const leader=document.getElementById('leader');
const DIVISIONS=['Premier','Division 1','Academy','Division 2','Division 3'];
const DIV_SCORE={'Premier':5,'Division 1':4,'Academy':3,'Division 2':2,'Division 3':1};
let players=[],games=[];

for(let i=0;i<6;i++){
  const row=document.createElement('div');
  row.className='player-row';
  row.innerHTML=`<div class="row-num">${i+1}</div><input id="p${i}" maxlength="20" placeholder="Player ${i+1}"><select id="d${i}">${DIVISIONS.map(d=>`<option value="${d}" ${d==='Division 3'?'selected':''}>${d}</option>`).join('')}</select>`;
  inputs.appendChild(row);
}

function getPlayers(){
  return Array.from({length:6},(_,i)=>({
    name:document.getElementById('p'+i).value.trim()||`Player ${i+1}`,
    division:document.getElementById('d'+i).value,
    strength:DIV_SCORE[document.getElementById('d'+i).value]
  }));
}

// All 10 unique 3v3 splits are used. The game order and the three-player
// positions are randomized, while each split remains a unique matchup.
function generate(){
  players=getPlayers();
  const raw=[];
  for(let b=1;b<6;b++) for(let c=b+1;c<6;c++){
    const a=[0,b,c], o=[0,1,2,3,4,5].filter(x=>!a.includes(x));
    raw.push({a,o,sa:'',sb:'',fairness:Math.abs(a.reduce((n,x)=>n+players[x].strength,0)-o.reduce((n,x)=>n+players[x].strength,0))});
  }
  // Put the stronger side in either color at random, then shuffle all 10 games.
  games=raw.map(g=>{
    if(Math.random()<.5)[g.a,g.o]=[g.o,g.a];
    g.a=[...g.a].sort(()=>Math.random()-.5); g.o=[...g.o].sort(()=>Math.random()-.5);
    return g;
  }).sort(()=>Math.random()-.5);
  render();update();
}

function render(){
  gamesEl.innerHTML=games.map((g,i)=>`<tr data-i="${i}"><td class="num">${i+1}</td>${g.a.map(x=>`<td class="player p${x}">${esc(players[x].name)}</td>`).join('')}<td class="score-cell"><input class="score-input sa" type="number" min="0" max="99" inputmode="numeric" value="${g.sa}"></td><td class="score-cell"><input class="score-input sb" type="number" min="0" max="99" inputmode="numeric" value="${g.sb}"></td>${g.o.map(x=>`<td class="player p${x}">${esc(players[x].name)}</td>`).join('')}<td class="num">${i+1}</td></tr>`).join('');
  games.forEach((g,i)=>{const r=gamesEl.querySelector(`[data-i="${i}"]`);r.querySelector('.sa').oninput=e=>{g.sa=e.target.value;update()};r.querySelector('.sb').oninput=e=>{g.sb=e.target.value;update()}});
}

function update(){
  if(!players.length)return;
  const s=players.map((p,i)=>({name:p.name,i,w:0,l:0,gf:0,ga:0,gd:0}));
  games.forEach((g,i)=>{
    const a=Number(g.sa),b=Number(g.sb),r=gamesEl.querySelector(`[data-i="${i}"]`);
    const ca=r.querySelector('.sa').parentElement,cb=r.querySelector('.sb').parentElement;
    ca.classList.remove('win');cb.classList.remove('win');
    if(g.sa===''||g.sb===''||a<0||b<0)return;
    g.a.forEach(x=>{s[x].gf+=a;s[x].ga+=b;s[x].gd+=a-b});
    g.o.forEach(x=>{s[x].gf+=b;s[x].ga+=a;s[x].gd+=b-a});
    if(a>b){g.a.forEach(x=>s[x].w++);g.o.forEach(x=>s[x].l++);ca.classList.add('win')}
    else if(b>a){g.o.forEach(x=>s[x].w++);g.a.forEach(x=>s[x].l++);cb.classList.add('win')}
  });
  s.sort((a,b)=>b.w-a.w||b.gd-a.gd||b.gf-a.gf);
  leader.innerHTML=s.map((x,i)=>`<tr><td>${i+1}</td><td class="p${x.i}">${esc(x.name)}</td><td>${x.w}</td><td>${x.l}</td><td>${x.gd>0?'+':''}${x.gd}</td></tr>`).join('');
}

function reset(){
  for(let i=0;i<6;i++){document.getElementById('p'+i).value='';document.getElementById('d'+i).value='Division 3'}
  players=[];games=[];gamesEl.innerHTML='';leader.innerHTML='<tr><td colspan="5" class="muted">Generate a mixup first.</td></tr>';
}
function esc(x){return String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
document.getElementById('generate').onclick=generate;
document.getElementById('reset').onclick=reset;
