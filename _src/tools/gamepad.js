/* PS5 (DualSense) / any standard controller support for Blaze's Study Guides.
   D-pad or left stick: move the yellow highlight.  ✕: press it.  ○: back to Classroom.
   □: read the slide aloud.  △: flip card / "Got it down".  L1/R1: switch tabs.
   L2/R2: previous/next slide or question.  Right stick: scroll.  OPTIONS: show the controls. */
(function(){
  if(!("getGamepads" in navigator)) return;
  const css=document.createElement("style");
  css.textContent=`
  body.pad :focus{outline:4px solid #ffd54a!important;outline-offset:3px!important;box-shadow:0 0 0 8px rgba(255,213,74,.35)!important}
  #padtoast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:9999;background:#1d2b24;color:#f6f1e3;border:2px solid #ffd54a;border-radius:12px;padding:10px 16px;font:600 15px/1.3 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:opacity .3s;pointer-events:none}
  #padhelp{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;background:rgba(0,0,0,.55)}
  #padhelp .box{background:#1d2b24;color:#f6f1e3;border:3px solid #ffd54a;border-radius:16px;padding:20px 24px;max-width:440px;width:calc(100% - 32px);font:16px/1.45 system-ui,sans-serif}
  #padhelp h2{margin:0 0 10px;font-size:20px;color:#ffd54a}
  #padhelp table{border-collapse:collapse;width:100%}#padhelp td{padding:4px 6px;vertical-align:top}#padhelp td:first-child{font-weight:700;white-space:nowrap;color:#ffd54a}
  #padhelp p{margin:12px 0 0;font-size:14px;opacity:.85}`;
  document.head.appendChild(css);

  const FOCUSABLE='button,a[href],select,input:not([type=hidden]),textarea,[tabindex]:not([tabindex="-1"]),[role=button]';
  const visible=el=>{if(el.disabled||el.closest("[hidden],#padhelp"))return false;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;const s=getComputedStyle(el);return s.visibility!=="hidden"&&s.display!=="none"};
  const items=()=>[...document.querySelectorAll(FOCUSABLE)].filter(visible);
  const center=r=>({x:r.left+r.width/2,y:r.top+r.height/2});
  const $=s=>document.querySelector(s);
  const vis=s=>{const e=$(s);return e&&visible(e)?e:null};

  function padOn(){if(!document.body.classList.contains("pad"))document.body.classList.add("pad")}
  document.addEventListener("mousedown",()=>document.body.classList.remove("pad"),true);

  function focusEl(el){if(!el)return;padOn();el.focus({preventScroll:true});el.scrollIntoView({block:"nearest",inline:"nearest",behavior:"smooth"})}
  function firstInView(){const all=items();return all.find(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})||all[0]}

  /* Spatial move: nearest control in the pressed direction, preferring ones lined up with the current one. */
  function move(dx,dy){
    const cur=document.activeElement;
    if(!cur||cur===document.body||!visible(cur)){focusEl(firstInView());return}
    if(cur.type==="range"&&dx){dx>0?cur.stepUp():cur.stepDown();cur.dispatchEvent(new Event("input",{bubbles:true}));cur.dispatchEvent(new Event("change",{bubbles:true}));return}
    const A=cur.getBoundingClientRect(),a=center(A);let best=null,bs=Infinity;
    for(const el of items()){
      if(el===cur||cur.contains(el)||el.contains(cur))continue;
      const B=el.getBoundingClientRect(),b=center(B);
      if(dx>0?B.left<a.x:dx<0?B.right>a.x:dy>0?B.top<a.y:B.bottom>a.y)continue; /* must start past the current control's middle */
      if(dy&&B.left<A.right&&B.right>A.left&&B.top<A.bottom&&B.bottom>A.top)continue; /* up/down skips overlapping controls (e.g. a card's ✓) */
      const gap=Math.max(0,dx>0?B.left-A.right:dx<0?A.left-B.right:dy>0?B.top-A.bottom:A.top-B.bottom);
      const side=dx?Math.max(0,B.top-A.bottom,A.top-B.bottom):Math.max(0,B.left-A.right,A.left-B.right);
      const score=gap+side*4+Math.abs(dx?b.y-a.y:b.x-a.x)*0.15;   /* lined-up controls win */
      if(score<bs){bs=score;best=el}
    }
    if(best)focusEl(best);else if(dy)window.scrollBy({top:dy*240,behavior:"smooth"});
  }

  function press(){
    const el=document.activeElement;
    if(!el||el===document.body||!visible(el)){focusEl(firstInView());return}
    if(el.tagName==="SELECT"){el.selectedIndex=(el.selectedIndex+1)%el.options.length;el.dispatchEvent(new Event("change",{bubbles:true}));toast("Picked: "+el.options[el.selectedIndex].text);return}
    if(el.tagName==="TEXTAREA"||(el.tagName==="INPUT"&&/^(text|number|search|email)?$/.test(el.type))){toast("Type your answer on the keyboard");return}
    const key=memo(el),at=center(el.getBoundingClientRect());el.click();
    /* Rooms re-render after clicks, so put the highlight back on the same control (or the slide's Next button). */
    setTimeout(()=>{if(!document.activeElement||document.activeElement===document.body)focusEl(recall(key,at)||(document.querySelector(".opt:not([disabled])")?nearest(".opt"):nearest(FOCUSABLE,at))||firstInView())},60);
  }

  function memo(el){if(el.id)return "#"+CSS.escape(el.id);for(const k of ["room","t","i","mv","p"])if(el.dataset[k]!=null)return `[data-${k}="${CSS.escape(el.dataset[k])}"]`;return null}
  function recall(key,at){return key?nearest(key,at):null}
  function nearest(sel,at){const c=[...document.querySelectorAll(sel)].filter(visible);if(!at)return c[0];let best=null,bd=Infinity;for(const e of c){const p=center(e.getBoundingClientRect()),d=Math.hypot(p.x-at.x,p.y-at.y);if(d<bd){bd=d;best=e}}return best}
  function clickFirst(...sel){for(const s of sel){const e=vis(s);if(e){e.click();setTimeout(()=>{if(!document.activeElement||document.activeElement===document.body)focusEl(vis(s)||firstInView())},60);return true}}return false}
  function tab(step){
    const tabs=[...document.querySelectorAll("#tabs [data-room]")];if(!tabs.length)return;
    let i=tabs.findIndex(t=>t.getAttribute("aria-selected")==="true");i=(i+step+tabs.length)%tabs.length;
    tabs[i].click();setTimeout(()=>{padOn();const t=$(`#tabs [data-room="${tabs[i].dataset.room}"]`);if(t)t.focus({preventScroll:true})},60);
  }

  let tt;function toast(msg){let t=$("#padtoast");if(!t){t=document.createElement("div");t.id="padtoast";document.body.appendChild(t)}t.textContent=msg;t.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>t.style.opacity=0,2200)}

  function help(){
    const h=$("#padhelp");if(h){h.remove();return}
    const d=document.createElement("div");d.id="padhelp";
    d.innerHTML=`<div class="box"><h2>🎮 Controller</h2><table>
      <tr><td>D-pad / left stick</td><td>Move the yellow highlight</td></tr>
      <tr><td>✕</td><td>Press the highlighted button</td></tr>
      <tr><td>○</td><td>Back to the Classroom</td></tr>
      <tr><td>□</td><td>Read the slide aloud (again to stop)</td></tr>
      <tr><td>△</td><td>Flip the flashcard / "Got it down"</td></tr>
      <tr><td>L1 / R1</td><td>Previous / next tab</td></tr>
      <tr><td>L2 / R2</td><td>Previous / next slide or question</td></tr>
      <tr><td>Right stick</td><td>Scroll the page</td></tr>
      <tr><td>OPTIONS</td><td>Show or hide this</td></tr></table>
      <p>No sound? Click the page once with the mouse, then the controller can play it too.</p></div>`;
    d.addEventListener("click",()=>d.remove());document.body.appendChild(d);
  }

  const ACT={
    0:press,
    1:()=>{if($("#padhelp"))return help();const a=document.activeElement;if(a&&/^(TEXTAREA|INPUT)$/.test(a.tagName)){a.blur();return}const h=$('#tabs [data-room="home"]');if(h&&h.getAttribute("aria-selected")!=="true")h.click();else{const back=[...document.querySelectorAll("a[href]")].find(x=>/study guides/i.test(x.textContent));if(back)focusEl(back)}},
    2:()=>clickFirst("#read"),
    3:()=>clickFirst("#flip","#know"),
    4:()=>tab(-1),5:()=>tab(1),
    6:()=>clickFirst("#prev","#back"),
    7:()=>clickFirst("#next","#nq","#nt","#np","#nx"),
    8:help,9:help,
    12:()=>move(0,-1),13:()=>move(0,1),14:()=>move(-1,0),15:()=>move(1,0)
  };
  const REPEAT=new Set([12,13,14,15]);
  const held={};let raf=0,stickDir=null,stickT=0;

  function loop(){const t=performance.now();
    const pads=navigator.getGamepads?[...navigator.getGamepads()].filter(Boolean):[];
    if(!pads.length){clearInterval(raf);raf=0;return}
    for(const gp of pads){
      gp.buttons.forEach((b,i)=>{
        const on=b.pressed||b.value>0.6,k=gp.index+":"+i;
        if(on&&!held[k]){held[k]=t+380;if(ACT[i]){padOn();ACT[i]()}}
        else if(on&&REPEAT.has(i)&&t>held[k]){held[k]=t+110;ACT[i]()}
        else if(!on)delete held[k];
      });
      const [lx=0,ly=0,rx=0,ry=0]=gp.axes;
      let dir=null;if(Math.hypot(lx,ly)>0.55)dir=Math.abs(lx)>Math.abs(ly)?(lx>0?15:14):(ly>0?13:12);
      if(dir!==stickDir){stickDir=dir;stickT=t+380;if(dir)ACT[dir]()}else if(dir&&t>stickT){stickT=t+130;ACT[dir]()}
      if(Math.abs(ry)>0.2)window.scrollBy(0,ry*22);
      if(Math.abs(rx)>0.2)window.scrollBy(rx*22,0);
    }
  }
  function start(){if(!raf)raf=setInterval(loop,16)}
  addEventListener("gamepadconnected",e=>{start();toast("🎮 Controller connected — press OPTIONS for the controls")});
  addEventListener("gamepaddisconnected",()=>toast("Controller disconnected"));
  if([...navigator.getGamepads()].some(Boolean))start();
})();
