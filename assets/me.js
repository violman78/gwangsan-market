// 내 역할 찾기: 성명 또는 휴대폰 번호 → 본인 배치·안전교육만 표시 (이 기기에서만 복호화, 서버 전송 없음)
(function(){
  var box=document.getElementById('meBox'); if(!box) return;
  var base=box.getAttribute('data-base')||'', inp=document.getElementById('meIn'), out=document.getElementById('meOut'), btn=document.getElementById('meGo');
  var enc=new TextEncoder(), dec=new TextDecoder();
  function load(src){return new Promise(function(res,rej){if(window[src.v]){return res()}var s=document.createElement('script');s.src=base+src.f;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function b64(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
  function keyOf(v){var s=v.trim();var d=s.replace(/\D/g,'');if(d.length>=8&&/^[0-9\s\-+().]+$/.test(s))return 'p:'+d.slice(-8);return 'n:'+s.replace(/\s/g,'')}
  async function sha(k){var h=await crypto.subtle.digest('SHA-256',enc.encode(LOOKUP.salt+k));return Array.from(new Uint8Array(h)).map(function(b){return b.toString(16).padStart(2,'0')}).join('').slice(0,24)}
  async function open(k,it){var km=await crypto.subtle.importKey('raw',enc.encode(k),'PBKDF2',false,['deriveKey']);
    var key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:enc.encode(LOOKUP.salt),iterations:LOOKUP.iter,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
    var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(it.iv)},key,b64(it.ct));return JSON.parse(dec.decode(pt))}
  function done(name,key){try{var L=JSON.parse(localStorage.getItem('edu_records'))||[];return L.some(function(r){return r.key===key&&r.name===name})}catch(e){return false}}
  function render(list){
    var h='';
    list.forEach(function(p){
      h+='<div class="card" style="margin:12px 0 0"><div class="eyebrow">내 역할</div><h3 style="font-size:24px;margin:2px 0 8px">'+esc(p.name)+' 님</h3>';
      (p.notes||[]).forEach(function(n){h+='<div class="note info" style="margin:8px 0">'+esc(n)+'</div>'});
      (p.cards||[]).forEach(function(c){
        h+='<div style="border-top:.5px solid var(--line);padding:12px 0 2px"><b>'+esc(c.part)+' · '+esc(c.no)+'</b>'+(c.shift?' <span class="pill" style="margin-left:6px">'+esc(c.shift)+'</span>':'')+'<dl class="kv" style="margin-top:8px">'+(c.sym?'<dt>지도 기호</dt><dd>'+esc(c.sym)+'</dd>':'')+'<dt>위치</dt><dd>'+esc(c.loc)+'</dd>'+(c.time?'<dt>시간</dt><dd>'+esc(c.time)+'</dd>':'')+'<dt>업무</dt><dd>'+esc(c.role)+'</dd></dl></div>';
      });
      h+='<h3 style="margin:18px 0 8px">내가 받을 안전교육</h3><div class="list">';
      (p.edu||[]).forEach(function(k,i){var nm=(window.EDU&&EDU[k])?EDU[k].name:k;var ok=done(p.name,k);
        h+='<a class="row" href="'+base+'edu/course.html?c='+k+'&n='+encodeURIComponent(p.name)+'"><span class="t">'+esc(nm)+(k==='common'?' (필수 · 먼저)':'')+'</span><span class="s">'+(ok?'이수 완료':'약 '+((window.EDU&&EDU[k])?EDU[k].min:10)+'분 · 퀴즈 5문항')+'</span></a>'});
      h+='</div>';
      if((p.links||[]).length){h+='<h3 style="margin:18px 0 8px">내 파트 자료</h3><div class="list">';
        p.links.forEach(function(l){var t=l.indexOf('crew/')===0?'내 시나리오':l.indexOf('staff/')===0?'내 파트 배치도':'안내 보기';h+='<a class="row" href="'+base+l+'"><span class="t">'+t+'</span></a>'});h+='</div>'}
      h+='</div>';
    });
    out.innerHTML=h;
  }
  async function go(){
    var v=inp.value.trim(); if(v.length<2){out.innerHTML='<div class="note warn">성명 또는 휴대폰 번호를 입력해 주세요.</div>';return}
    btn.disabled=true;btn.textContent='확인 중…';out.innerHTML='';
    try{
      await load({v:'LOOKUP',f:'assets/lookup-data.js'}); await load({v:'EDU',f:'assets/edu-data.js'});
      var k=keyOf(v),id=await sha(k),items=(LOOKUP.e[id]||[]),res=[];
      for(var i=0;i<items.length;i++){try{res.push(await open(k,items[i]))}catch(e){}}
      if(!res.length){out.innerHTML='<div class="note warn"><b>일치하는 명단을 찾지 못했습니다.</b><br>성명은 띄어쓰기 없이 정확히, 번호는 숫자만 입력해 보세요. 그래도 안 되면 아래 목록에서 직접 선택하거나 종합상황실로 문의해 주세요.</div>'}
      else{render(res);try{localStorage.setItem('me_last',v)}catch(e){}if(res.length>1){out.insertAdjacentHTML('afterbegin','<div class="note info">같은 이름이 여러 명 있어 모두 표시합니다. 본인 항목을 확인하세요. (휴대폰 번호로 입력하면 한 명만 표시됩니다)</div>')}}
    }catch(e){out.innerHTML='<div class="note bad">확인 중 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.</div>'}
    btn.disabled=false;btn.textContent='내 역할 확인';
  }
  btn.addEventListener('click',go); inp.addEventListener('keydown',function(e){if(e.key==='Enter')go()});
  try{var last=localStorage.getItem('me_last');if(last)inp.value=last}catch(e){}
})();
