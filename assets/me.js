// 내 역할 찾기: 성명·휴대폰 번호(인력) / 팀명(출연팀) / 나라명(퍼레이드) / 파트명(제작) → 내 배치·위치(지도 줌인)·내 교육
(function(){
  var box=document.getElementById('meBox'); if(!box) return;
  var base=box.getAttribute('data-base')||'', inp=document.getElementById('meIn'), out=document.getElementById('meOut'), btn=document.getElementById('meGo');
  var enc=new TextEncoder(), dec=new TextDecoder();
  var PT={full:{w:960,img:'img/map-full.jpg',ox:0,oy:100,h:245},wolgok:{w:400,img:'img/map-wolgok.jpg',ox:560,oy:120,h:350}};
  function load(src){return new Promise(function(res,rej){if(window[src.v]){return res()}var s=document.createElement('script');s.src=base+src.f;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function b64(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
  function nz(s){return s.replace(/[\s·\-_.()]/g,'').toLowerCase()}
  function keyOf(v){var s=v.trim();var d=s.replace(/\D/g,'');if(d.length>=8&&/^[0-9\s\-+().]+$/.test(s))return 'p:'+d.slice(-8);return 'n:'+s.replace(/\s/g,'')}
  async function sha(k){var h=await crypto.subtle.digest('SHA-256',enc.encode(LOOKUP.salt+k));return Array.from(new Uint8Array(h)).map(function(b){return b.toString(16).padStart(2,'0')}).join('').slice(0,24)}
  async function open(k,it){var km=await crypto.subtle.importKey('raw',enc.encode(k),'PBKDF2',false,['deriveKey']);
    var key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:enc.encode(LOOKUP.salt),iterations:LOOKUP.iter,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
    var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(it.iv)},key,b64(it.ct));return JSON.parse(dec.decode(pt))}
  function done(name,key){try{var L=JSON.parse(localStorage.getItem('edu_records'))||[];return L.some(function(r){return r.key===key&&(r.name===name||!name)})}catch(e){return false}}
  function groupFind(v){var n=nz(v);if(!n)return null;var G=LOOKUP.g,i=G.aliases[n];if(i!=null)return G.items[i];
    if(n.length>=2){for(var a in G.aliases){if(a.length>=2&&(a.indexOf(n)===0||n.indexOf(a)===0))return G.items[G.aliases[a]]}}return null}
  // ───── 지도(줌인) ─────
  function mapBlock(p){
    var pts=(p.cards||[]).filter(function(c){return c.x!=null});if(!pts.length)return '';
    var id='mv'+Math.random().toString(36).slice(2,7);
    return '<div class="mapbox" id="'+id+'" data-b="'+pts[0].base+'" data-p="'+esc(JSON.stringify(pts.map(function(c){return{x:c.x,y:c.y,b:c.base,l:c.no}})))+'"></div><div class="mapctl" data-for="'+id+'"><button type="button" data-a="me">내 위치</button><button type="button" data-a="in">확대</button><button type="button" data-a="out">축소</button><button type="button" data-a="all">전체 지도</button></div>';
  }
  function initMap(el){
    var pts=JSON.parse(el.getAttribute('data-p')),b0=el.getAttribute('data-b'),cfg=PT[b0];
    var inner=document.createElement('div');inner.className='inner';var img=new Image();img.src=base+cfg.img;inner.appendChild(img);el.appendChild(inner);
    var s=1,tx=0,ty=0,W=0,H=0,vis=150,cur=0;
    function pxpt(){return W/cfg.w}
    function pos(i){var p=pts[i];return {x:(p.x-cfg.ox)*pxpt(),y:(p.y-cfg.oy)*pxpt()}}
    function apply(){inner.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')';[].forEach.call(inner.querySelectorAll('.mk'),function(m){m.style.transform='scale('+(1/s)+')'})}
    function zoomTo(v,i){vis=Math.max(40,Math.min(cfg.w,v));var cw=el.clientWidth,ch=el.clientHeight;s=cw/(vis*pxpt());var m=pos(i==null?cur:i);tx=cw/2-m.x*s;ty=ch/2-m.y*s;clamp();apply()}
    function clamp(){var cw=el.clientWidth,ch=el.clientHeight,iw=W*s,ih=H*s;tx=iw<=cw?(cw-iw)/2:Math.min(0,Math.max(cw-iw,tx));ty=ih<=ch?(ch-ih)/2:Math.min(0,Math.max(ch-ih,ty))}
    img.onload=function(){W=img.naturalWidth;H=img.naturalHeight;img.style.width=W+'px';img.style.height=H+'px';inner.style.width=W+'px';inner.style.height=H+'px';
      pts.forEach(function(p,i){if(p.b!==b0)return;var m=pos(i),d=document.createElement('div');d.className='mk';d.style.left=m.x+'px';d.style.top=m.y+'px';d.innerHTML='<i></i><b>'+esc(p.l)+'</b>';inner.appendChild(d)});
      zoomTo(150,0)};
    var ctl=document.querySelector('.mapctl[data-for="'+el.id+'"]');
    ctl.addEventListener('click',function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(!a)return;
      if(a==='me'){cur=(cur+1)%pts.length;if(pts.length===1)cur=0;zoomTo(150,cur)}
      if(a==='in')zoomTo(vis/1.6);if(a==='out')zoomTo(vis*1.6);if(a==='all')zoomTo(cfg.w,cur)});
    // 드래그 / 핀치
    var P={},last=null,dist=0;
    el.addEventListener('pointerdown',function(e){el.setPointerCapture(e.pointerId);P[e.pointerId]=e;last={x:e.clientX,y:e.clientY};dist=0});
    el.addEventListener('pointermove',function(e){if(!P[e.pointerId])return;P[e.pointerId]=e;var ids=Object.keys(P);
      if(ids.length===2){var a=P[ids[0]],c=P[ids[1]],d=Math.hypot(a.clientX-c.clientX,a.clientY-c.clientY);if(dist){var f=d/dist,ns=Math.max(.05,Math.min(8,s*f)),r=el.getBoundingClientRect(),cx=(a.clientX+c.clientX)/2-r.left,cy=(a.clientY+c.clientY)/2-r.top;tx=cx-(cx-tx)*(ns/s);ty=cy-(cy-ty)*(ns/s);s=ns;clamp();apply()}dist=d}
      else if(last){tx+=e.clientX-last.x;ty+=e.clientY-last.y;last={x:e.clientX,y:e.clientY};clamp();apply()}});
    function up(e){delete P[e.pointerId];dist=0;var ids=Object.keys(P);last=ids.length?{x:P[ids[0]].clientX,y:P[ids[0]].clientY}:null}
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    el.addEventListener('wheel',function(e){e.preventDefault();zoomTo(vis*(e.deltaY>0?1.2:1/1.2))},{passive:false});
  }
  // ───── 결과 ─────
  function render(list){
    var h='';
    list.forEach(function(p){
      var kindLabel=p.kind==='team'?'출연 · 퍼레이드 팀':p.kind==='country'?'퍼레이드 참가단체':p.kind==='part'?'제작 파트':'내 역할';
      h+='<div class="card" style="margin:12px 0 0"><div class="eyebrow">'+kindLabel+'</div><h3 style="font-size:26px;margin:2px 0 8px">'+esc(p.name)+(p.kind?'':' 님')+'</h3>';
      (p.notes||[]).forEach(function(n){h+='<div class="note info" style="margin:8px 0">'+esc(n)+'</div>'});
      h+=mapBlock(p);
      (p.cards||[]).forEach(function(c){
        h+='<div style="border-top:.5px solid var(--line);padding:12px 0 2px"><b>'+esc(c.part)+(c.no?' · '+esc(c.no):'')+'</b>'+(c.shift?' <span class="pill" style="margin-left:6px">'+esc(c.shift)+'</span>':'')+'<dl class="kv" style="margin-top:8px">'+(c.sym?'<dt>지도 기호</dt><dd>'+esc(c.sym)+'</dd>':'')+(c.loc?'<dt>위치</dt><dd>'+esc(c.loc)+'</dd>':'')+(c.time?'<dt>시간</dt><dd>'+esc(c.time)+'</dd>':'')+(c.role?'<dt>업무</dt><dd>'+esc(c.role)+'</dd>':'')+'</dl></div>';
      });
      h+='<h3 style="margin:18px 0 8px">내가 받을 안전교육</h3><div class="list">';
      (p.edu||[]).forEach(function(k){var nm=(window.EDU&&EDU[k])?EDU[k].name:k;var ok=done(p.kind?'':p.name,k);
        h+='<a class="row" href="'+base+'edu/course.html?c='+k+'&n='+encodeURIComponent(p.name)+'"><span class="t">'+esc(nm)+(k==='common'?' (필수 · 먼저)':'')+'</span><span class="s">'+(ok?'이수 완료':'읽고 이수 확인 · 약 '+((window.EDU&&EDU[k])?EDU[k].min:10)+'분')+'</span></a>'});
      h+='</div>';
      if((p.links||[]).length){h+='<h3 style="margin:18px 0 8px">내 자료</h3><div class="list">';
        p.links.forEach(function(l){var t=l.indexOf('crew/')===0?'내 시나리오':l.indexOf('staff/')===0?'내 파트 배치도':l.indexOf('parade/start')===0?'출발지점 사진':l.indexOf('parade/')===0&&l.indexOf('index')<0?'내 팀 안내':l.indexOf('performers/')===0?'내 팀 안내':l.indexOf('parade/index')===0?'퍼레이드 종합안내':'안내 보기';h+='<a class="row" href="'+base+l+'"><span class="t">'+t+'</span></a>'});h+='</div>'}
      h+='</div>';
    });
    out.innerHTML=h;
    [].forEach.call(out.querySelectorAll('.mapbox'),initMap);
    if(window.Capture){Capture.bar(function(){return out},'내역할')}
  }
  async function go(auto){
    var v=inp.value.trim(); if(v.length<2){if(!auto)out.innerHTML='<div class="note warn">성명, 휴대폰 번호, 팀명, 나라명 또는 파트명을 입력해 주세요.</div>';return}
    btn.disabled=true;btn.textContent='확인 중…';if(!auto)out.innerHTML='';
    try{
      await load({v:'LOOKUP',f:'assets/lookup-data.js'}); await load({v:'EDU',f:'assets/edu-data.js'});
      var g=groupFind(v),res=[];
      if(g){res=[g]}
      else{var k=keyOf(v),id=await sha(k),items=(LOOKUP.e[id]||[]);for(var i=0;i<items.length;i++){try{res.push(await open(k,items[i]))}catch(e){}}}
      if(!res.length){out.innerHTML='<div class="note warn"><b>일치하는 항목을 찾지 못했습니다.</b><br>성명(띄어쓰기 없이) · 휴대폰 번호 · 팀명(예: 크로스포맨) · 나라명(예: 중국) · 파트명(예: 조명)으로 입력해 보세요. 그래도 안 되면 종합상황실로 문의해 주세요.</div>'}
      else{render(res);try{localStorage.setItem('me_last',v)}catch(e){}if(res.length>1){out.insertAdjacentHTML('afterbegin','<div class="note info">같은 이름이 여러 명 있어 모두 표시합니다. 본인 항목을 확인하세요. (휴대폰 번호로 입력하면 한 명만 표시됩니다)</div>')}}
    }catch(e){out.innerHTML='<div class="note bad">확인 중 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.</div>'}
    btn.disabled=false;btn.textContent='내 역할 확인';
  }
  btn.addEventListener('click',function(){go(false)}); inp.addEventListener('keydown',function(e){if(e.key==='Enter')go(false)});
  // 처음부터 내 위치 표시: 저장된 입력이 있으면 자동 조회
  try{var last=localStorage.getItem('me_last');if(last){inp.value=last;go(true)}}catch(e){}
})();
