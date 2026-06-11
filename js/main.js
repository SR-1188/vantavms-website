// VANTA VMS - shared site JS. All blocks guard for element existence.

// RETICLE CURSOR
(function(){
  const ret=document.getElementById('reticle'),lbl=document.getElementById('ret-label');
  if(!ret||window.matchMedia('(pointer:coarse)').matches)return;
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
  const lockSel='a,button,input,textarea,.cam-feed,.tbadge,.feat-card,.case-card';
  document.addEventListener('mouseover',e=>{
    if(e.target.closest(lockSel)){ret.classList.add('lock');lbl.classList.add('on');lbl.textContent='LOCKED'}
  });
  document.addEventListener('mouseout',e=>{
    if(e.target.closest(lockSel)){ret.classList.remove('lock');lbl.classList.remove('on')}
  });
  (function loop(){
    rx+=(mx-rx)*.22;ry+=(my-ry)*.22;
    ret.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    lbl.style.transform=`translate(${rx}px,${ry}px) translate(22px,18px)`;
    requestAnimationFrame(loop);
  })();
})();

// PARTICLE CANVAS
(function(){
  const c=document.getElementById('hero-canvas');if(!c)return;
  const x=c.getContext('2d');
  let W,H,P=[];
  const resize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight};
  window.addEventListener('resize',resize);resize();
  for(let i=0;i<55;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28,r:Math.random()*1.8+.8});
  const draw=()=>{
    x.clearRect(0,0,W,H);
    P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1});
    x.lineWidth=.5;
    for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
      const dx=P[i].x-P[j].x,dy=P[i].y-P[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<130){x.strokeStyle=`rgba(14,165,233,${(1-d/130)*.35})`;x.beginPath();x.moveTo(P[i].x,P[i].y);x.lineTo(P[j].x,P[j].y);x.stroke()}
    }
    P.forEach(p=>{x.beginPath();x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fillStyle='rgba(14,165,233,.55)';x.fill()});
    requestAnimationFrame(draw);
  };draw();
})();

// CAMERA TIMESTAMPS
(function(){
  if(!document.getElementById('ts0'))return;
  function updateTS(){
    const n=new Date(),p=v=>String(v).padStart(2,'0');
    const t=`${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
    ['ts0','ts1','ts2','ts3'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=t});
    const sb=document.getElementById('sb-time');if(sb)sb.textContent='VANTA VMS v1.0';
  }
  setInterval(updateTS,1000);updateTS();
  const motionIds=['m0','m1','m2','m3'];
  function triggerMotion(){
    const id=motionIds[Math.floor(Math.random()*4)];
    const el=document.getElementById(id);
    if(el&&!el.classList.contains('on')){el.classList.add('on');setTimeout(()=>el.classList.remove('on'),2800)}
  }
  setInterval(triggerMotion,3500+Math.random()*2500);
  setTimeout(triggerMotion,1800);setTimeout(triggerMotion,5000);
})();

// BADGE STRIP
(function(){
  const track=document.getElementById('strip-track');if(!track)return;
  const badges=['WebRTC / WHEP','ONVIF Profile S','VAPIX API','Bosch RCP+','PTZ Control','IR Night Vision','Motion Detection','Enterprise RBAC','MediaMTX','PostgreSQL','Fastify 4.x','Docker','HTTPS','Smart Recording','SSE Alerts','Audit Logs'];
  let html='';
  for(let r=0;r<2;r++)badges.forEach(b=>{html+=`<div class="strip-item"><div class="strip-dot"></div>${b}</div>`});
  track.innerHTML=html;
})();

// SCROLL REVEAL
(function(){
  const rvObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');rvObs.unobserve(e.target)}});
  },{threshold:.12});
  document.querySelectorAll('.rv').forEach(el=>rvObs.observe(el));
})();

// STAT COUNTERS
(function(){
  const els=document.querySelectorAll('.stat-n');if(!els.length)return;
  const stObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){animStat(e.target);stObs.unobserve(e.target)}});
  },{threshold:.5});
  els.forEach(el=>stObs.observe(el));
  function animStat(el){
    const t=parseFloat(el.dataset.t),s=el.dataset.s||'',p=el.dataset.p||'',dec=parseInt(el.dataset.dec||'0');
    const dur=1600,start=Date.now();
    const tick=()=>{
      const prog=Math.min((Date.now()-start)/dur,1);
      const ease=1-Math.pow(1-prog,3);
      const v=t*ease;
      el.innerHTML=p+(dec?v.toFixed(dec):Math.round(v))+s;
      if(prog<1)requestAnimationFrame(tick);
    };requestAnimationFrame(tick);
  }
})();

// NAV SCROLL
window.addEventListener('scroll',()=>{
  const n=document.getElementById('nav');
  if(n)n.classList.toggle('scrolled',window.scrollY>50);
});

// HUMAN WALKER + TRACKING BOX
(function(){
  const stage=document.getElementById('detstage');if(!stage)return;
  const walker=document.getElementById('walker'),box=document.getElementById('detbox');
  const shadow=document.getElementById('wshadow');
  const chx=document.getElementById('chx'),chy=document.getElementById('chy');
  const lblEl=document.getElementById('dblbl'),tconf=document.getElementById('tconf'),tvel=document.getElementById('tvel'),tinf=document.getElementById('tinf');
  const legF=document.getElementById('legF'),legB=document.getElementById('legB');
  const armF=document.getElementById('armF'),armB=document.getElementById('armB');
  let px=-90,t=0,conf=98.2;
  function frame(){
    const W=stage.offsetWidth,H=stage.offsetHeight;
    t+=.085; px+=1.5;
    if(px>W+90){px=-90; conf=95+Math.random()*4.5;}
    const sw=Math.sin(t);
    legF.style.transform=`rotate(${sw*24}deg)`;
    legB.style.transform=`rotate(${-sw*24}deg)`;
    armF.style.transform=`rotate(${-sw*20}deg)`;
    armB.style.transform=`rotate(${sw*20}deg)`;
    const bob=Math.abs(sw)*2.6;
    walker.style.transform=`translateX(${px}px) translateY(${-bob}px)`;
    // getBoundingClientRect: reads actual rendered pixel position — no math assumptions
    const sr=stage.getBoundingClientRect();
    const wr=walker.getBoundingClientRect();
    // walker position relative to stage (accounts for all CSS, transforms, padding)
    const wL=wr.left-sr.left;
    const wT=wr.top-sr.top;
    const wW=wr.width;
    const wH=wr.height;
    // box: centered horizontally on walker, same vertical bounds with small padding
    box.style.left=(wL-4)+'px';
    box.style.top=(wT-4)+'px';
    box.style.width=(wW+8)+'px';
    box.style.height=(wH+8)+'px';
    // shadow
    if(shadow){shadow.style.left=(wL+wW/2-23)+'px';}
    // crosshairs through person center
    const cx=wL+wW/2;
    const cy=wT+wH/2;
    chx.style.transform=`translateX(${cx}px)`;
    chy.style.transform=`translateY(${cy}px)`;
    // telemetry
    if(Math.random()<.025){
      conf=Math.min(99.4,Math.max(94.5,conf+(Math.random()-.5)*1.6));
      const c=conf.toFixed(1)+'%';
      if(lblEl)lblEl.textContent='PERSON '+c;
      if(tconf)tconf.textContent=c;
      if(tvel)tvel.textContent=(1.1+Math.random()*.5).toFixed(1)+' m/s';
      if(tinf)tinf.textContent=(9+Math.floor(Math.random()*5))+'ms';
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// EVENT FEED
(function(){
  const list=document.getElementById('feedlist');if(!list)return;
  const cams=['CAM 01','CAM 02','CAM 03','CAM 04','CAM 05'];
  const evts=[
    {d:'mo',t:'Motion detected on <b>{c}</b> &mdash; recording started'},
    {d:'ok',t:'Recording saved from <b>{c}</b> &mdash; 42s clip'},
    {d:'in',t:'<b>{c}</b> health check passed &mdash; 30 FPS stable'},
    {d:'mo',t:'Person detected in <b>PERIMETER-E</b> zone'},
    {d:'in',t:'PTZ preset recalled on <b>{c}</b>'},
    {d:'ok',t:'IR mode switched to <b>NIGHT</b> on {c}'},
    {d:'in',t:'Operator <b>admin</b> viewed {c} stream'},
    {d:'ok',t:'Auto-cleanup completed &mdash; disk at 74%'}
  ];
  function addEvt(){
    const e=evts[Math.floor(Math.random()*evts.length)];
    const c=cams[Math.floor(Math.random()*cams.length)];
    const n=new Date(),p=v=>String(v).padStart(2,'0');
    const item=document.createElement('div');
    item.className='feed-item';
    item.innerHTML=`<div class="fi-dot ${e.d}"></div><div class="fi-txt">${e.t.replaceAll('{c}',c)}</div><div class="fi-time">${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}</div>`;
    list.prepend(item);
    while(list.children.length>5)list.removeChild(list.lastChild);
  }
  addEvt();addEvt();addEvt();
  setInterval(addEvt,2600);
})();

// TELEMETRY BARS
(function(){
  const el=document.querySelector('.feed-stats');if(!el)return;
  const data=[['fsb0','fsv0',87,'847 Mbps'],['fsb1','fsv1',98.6,'98.6%'],['fsb2','fsv2',92,'92%'],['fsb3','fsv3',99.9,'99.9%']];
  const obs=new IntersectionObserver(es=>{es.forEach(e=>{
    if(e.isIntersecting){
      data.forEach(([b,v,pct,txt],i)=>{setTimeout(()=>{document.getElementById(b).style.width=pct+'%';document.getElementById(v).textContent=txt},i*180)});
      obs.disconnect();
    }
  })},{threshold:.4});
  obs.observe(el);
})();

// 3D TILT CARDS
document.querySelectorAll('.feat-card,.case-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(800px) rotateY(${px*6}deg) rotateX(${-py*6}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave',()=>{card.style.transform=''});
});

// CONTACT FORM
function handleDemo(){
  const email=document.getElementById('demo-email');
  if(!email)return;
  if(!email.value||!email.value.includes('@')){email.style.borderColor='#ef4444';setTimeout(()=>email.style.borderColor='',2000);return}
  const btn=document.getElementById('demo-btn');
  btn.textContent='Request Sent';btn.style.background='#22c55e';
  setTimeout(()=>{btn.textContent='Request Demo';btn.style.background='';},3500);
}
function handleContact(){
  const nm=document.getElementById('cf-name'),em=document.getElementById('cf-email');
  let ok=true;
  [nm,em].forEach(f=>{if(f&&!f.value){f.style.borderColor='#ef4444';setTimeout(()=>f.style.borderColor='',2000);ok=false}});
  if(em&&em.value&&!em.value.includes('@')){em.style.borderColor='#ef4444';setTimeout(()=>em.style.borderColor='',2000);ok=false}
  if(!ok)return;
  const btn=document.getElementById('cf-btn');
  btn.textContent='Message Sent';btn.style.background='#22c55e';
  setTimeout(()=>{btn.textContent='Send Message';btn.style.background='';},3500);
}
