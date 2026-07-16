const stage=document.querySelector('#stage');
const character=document.querySelector('#character');
const stressFill=document.querySelector('#stressFill');
const scoreEl=document.querySelector('#score');
const particles=document.querySelector('#particles');
let stress=0,score=0,recoverTimer;

function hit(e){
  const power=Math.min(25,8+Math.round(Math.random()*17));
  stress=Math.min(100,stress+power);
  score+=power;
  scoreEl.textContent=score;
  stressFill.style.width=stress+'%';

  const rect=stage.getBoundingClientRect();
  const x=('clientX' in e?e.clientX:rect.left+rect.width/2)-rect.left;
  const direction=x<rect.width/2?-1:1;
  stage.style.setProperty('--rot',(direction*7)+'deg');
  stage.classList.add('hit');
  navigator.vibrate?.(25);

  for(let i=0;i<5;i++){
    const p=document.createElement('b');
    p.className='particle';
    p.textContent=['★','✦','·'][Math.floor(Math.random()*3)];
    p.style.left=x+'px';
    p.style.top=((('clientY' in e?e.clientY:rect.top+rect.height/2)-rect.top))+'px';
    p.style.setProperty('--x',((Math.random()-.5)*180)+'px');
    p.style.setProperty('--y',(-50-Math.random()*130)+'px');
    particles.appendChild(p);
    setTimeout(()=>p.remove(),600);
  }

  setTimeout(()=>stage.classList.remove('hit'),110);
  clearTimeout(recoverTimer);
  recoverTimer=setTimeout(recover,3000);
}
function recover(){
  const timer=setInterval(()=>{
    stress=Math.max(0,stress-4);
    stressFill.style.width=stress+'%';
    if(stress===0)clearInterval(timer);
  },80);
}
stage.addEventListener('pointerdown',hit);
