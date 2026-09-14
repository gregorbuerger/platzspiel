const people=[['a','👩🏻'],['b','👨🏽'],['c','👩🏿'],['d','👨🏻'],['e','👩🏼'],['f','👨🏾']];
const solution=['c','a','f','e','b','d'];
const board=document.querySelector('#board'),tray=document.querySelector('#tray'),status=document.querySelector('#status');
function makeSeat(i){const s=document.createElement('div');s.className='seat';s.dataset.seat=i;s.innerHTML=`<span class="seat-num">${i+1}</span>`;return s}
function makePerson([id,face]){const p=document.createElement('div');p.className='person';p.dataset.id=id;p.textContent=face;p.setAttribute('role','button');p.setAttribute('aria-label',`Figur ${face}`);bindDrag(p);return p}
function shuffled(a){return [...a].sort(()=>Math.random()-.5)}
function reset(){board.replaceChildren(...solution.map((_,i)=>makeSeat(i)));tray.replaceChildren(...shuffled(people).map(makePerson));status.textContent='';status.className='status'}
function bindDrag(p){
  p.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const startX=e.clientX,startY=e.clientY;
    const home=p.parentElement,next=p.nextSibling;
    let dragging=false;

    function begin(ev){
      dragging=true;
      p.setPointerCapture(ev.pointerId);
      p.classList.add('dragging');
      moveGhost(ev);
    }
    function moveGhost(ev){p.style.left=ev.clientX+'px';p.style.top=ev.clientY+'px'}
    function move(ev){
      const dx=ev.clientX-startX,dy=ev.clientY-startY;
      if(!dragging){
        if(Math.hypot(dx,dy)<9)return;
        // Horizontale Bewegung bleibt ein nativer Swipe durch die Figurenleiste.
        if(Math.abs(dx)>Math.abs(dy))return cleanup();
        ev.preventDefault();
        begin(ev);
      }else{
        ev.preventDefault();
        moveGhost(ev);
      }
    }
    function end(ev){
      if(!dragging)return cleanup();
      p.classList.remove('dragging');p.style.left=p.style.top='';
      const under=document.elementFromPoint(ev.clientX,ev.clientY);
      const seat=under?.closest('.seat');
      if(seat){
        const seatIndex=Number(seat.dataset.seat);
        if(solution[seatIndex]!==p.dataset.id){
          home.insertBefore(p,next);status.textContent='Dieser Platz passt nicht zu den Hinweisen.';status.className='status bad';if(navigator.vibrate)navigator.vibrate(40)
        }else{
          const occupant=seat.querySelector('.person');if(occupant&&occupant!==p)home.insertBefore(occupant,next);
          seat.appendChild(p);status.textContent='Richtig platziert!';status.className='status good';checkComplete()
        }
      }else if(under?.closest('.tray')) tray.appendChild(p);else home.insertBefore(p,next);
      cleanup();
    }
    function cancel(){if(dragging){p.classList.remove('dragging');p.style.left=p.style.top='';home.insertBefore(p,next)}cleanup()}
    function cleanup(){p.removeEventListener('pointermove',move);p.removeEventListener('pointerup',end);p.removeEventListener('pointercancel',cancel)}
    p.addEventListener('pointermove',move,{passive:false});p.addEventListener('pointerup',end);p.addEventListener('pointercancel',cancel)
  })
}
function checkComplete(){const seats=[...document.querySelectorAll('.seat')];if(seats.every((s,i)=>s.querySelector('.person')?.dataset.id===solution[i])){status.textContent='Geschafft! Alle sitzen richtig. 🎉';status.className='status good';if(navigator.vibrate)navigator.vibrate([50,40,80])}}document.querySelector('#reset').onclick=reset;if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=0.2.4',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{}));}reset();
