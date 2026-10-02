// 메뉴 · 일정(실시간 반영) · 지금/다음 순서 · 긴급 알림 켜기
(function(){
  var b=document.getElementById('menuBtn'),s=document.getElementById('sheet');
  if(b&&s){b.addEventListener('click',function(){var o=s.classList.toggle('open');b.textContent=o?'닫기':'메뉴';document.body.style.overflow=o?'hidden':''});}
  function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function mins(t){var a=String(t).split(':');return (+a[0])*60+(+a[1]||0)}
  var DEF=window.SCHEDULE_DEFAULT||[],S=DEF,first=true;
  function toast(m){var t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(function(){t.remove()},3500)}
  function build(){
    var ul=document.getElementById('tl');if(!ul)return;
    var all=ul.getAttribute('data-all')==='1';
    var list=S.slice().sort(function(a,c){return mins(a.s)-mins(c.s)}).filter(function(x){return all||x.k!=='pre'});
    ul.innerHTML=list.map(function(x){return '<li data-s="'+mins(x.s)+'" data-e="'+mins(x.e)+'" data-t="'+esc(x.s+' – '+x.e)+'"><time>'+esc(x.s)+'</time><div class="b"><b>'+esc(x.t)+'</b>'+(x.w?'<span>'+esc(x.w)+'</span>':'')+'</div></li>'}).join('');
    mark();
  }
  function mark(){
    var items=[].slice.call(document.querySelectorAll('#tl li'));if(!items.length)return;
    var d=new Date(),isDay=(d.getFullYear()===2026&&d.getMonth()===9&&d.getDate()===3)||/[?&]day=1/.test(location.search),now=d.getHours()*60+d.getMinutes(),cur=null,nxt=null;
    items.forEach(function(el){var s=+el.dataset.s,e=+el.dataset.e;el.classList.remove('on','done');
      if(isDay){if(e>s&&now>=e)el.classList.add('done');else if(e>s&&now>=s&&now<e){el.classList.add('on');cur=cur||el}else if(!nxt&&now<s){nxt=el}}});
    var box=document.getElementById('nowBox');
    if(box){var t=function(el){return esc(el.querySelector('b').textContent)};
      if(!isDay)box.innerHTML='<div class="k">행사 안내</div><div class="big">10월 3일 토요일 오후 2시</div><div class="sm">행사 당일에는 지금 진행 중인 순서가 이곳에 자동으로 표시됩니다.</div>';
      else if(cur)box.innerHTML='<div class="k">지금 진행 중</div><div class="big">'+t(cur)+'</div><div class="sm">'+esc(cur.dataset.t)+(nxt?' · 다음 '+esc(nxt.dataset.t.split(' ')[0])+' '+t(nxt):'')+'</div>';
      else if(nxt)box.innerHTML='<div class="k">다음 순서</div><div class="big">'+t(nxt)+'</div><div class="sm">'+esc(nxt.dataset.t)+'</div>';
      else box.innerHTML='<div class="k">행사 안내</div><div class="big">오늘 행사가 모두 끝났습니다</div><div class="sm">함께해 주셔서 감사합니다.</div>';}
    if(isDay&&cur&&first&&document.getElementById('tl')&&document.getElementById('tl').getAttribute('data-all')==='1'){setTimeout(function(){cur.scrollIntoView({block:'center',behavior:'smooth'})},400)}
  }
  build();setInterval(mark,30000);
  // 총괄이 일정을 수정하면 즉시 반영
  if(window.Live&&Live.mode!=='off'){
    Live.onSchedule(function(items){var prev=JSON.stringify(S);S=(items&&items.length)?items:DEF;build();if(!first&&JSON.stringify(S)!==prev)toast('총괄이 일정을 수정했습니다');first=false});
    var ac=document.getElementById('alertCard');if(ac){ac.style.display='';var ab=document.getElementById('alertOn');
      if(localStorage.getItem('alert_on')==='1'){ab.textContent='긴급 알림 켜짐 (진동 테스트)'}
      ab.addEventListener('click',function(){Live.enableAlerts();ab.textContent='긴급 알림 켜짐 (진동 테스트)';toast('긴급 공지가 오면 진동과 함께 표시됩니다')})}
  }
  var all=document.getElementById('toggleAll');
  if(all){all.addEventListener('click',function(){var ds=[].slice.call(document.querySelectorAll('details.seg')),open=ds.some(function(x){return !x.open});ds.forEach(function(x){x.open=open});all.textContent=open?'모두 접기':'모두 펼치기'})}
})();
