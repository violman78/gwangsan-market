// 메뉴 시트 / 오늘의 진행 / 상세 접기
(function(){
  var b=document.getElementById('menuBtn'),s=document.getElementById('sheet');
  if(b&&s){b.addEventListener('click',function(){var o=s.classList.toggle('open');b.textContent=o?'닫기':'메뉴';document.body.style.overflow=o?'hidden':''});}
  // 일정 하이라이트 (행사 당일 휴대폰 시계 기준)
  var items=[].slice.call(document.querySelectorAll('[data-s]'));
  if(items.length){
    var d=new Date(),isDay=(d.getFullYear()===2026&&d.getMonth()===9&&d.getDate()===3),
        now=d.getHours()*60+d.getMinutes(),cur=null,nxt=null;
    items.forEach(function(el){var s=+el.dataset.s,e=+el.dataset.e;
      if(isDay){if(now>=e)el.classList.add('done');else if(now>=s&&now<e){el.classList.add('on');cur=el;}else if(!nxt&&now<s){nxt=el;}}});
    var box=document.getElementById('nowBox');
    if(box){
      var t=function(el){return el.querySelector('b').textContent};
      if(!isDay){box.innerHTML='<div class="k">행사 안내</div><div class="big">10월 3일 토요일 오후 2시</div><div class="sm">행사 당일에는 지금 진행 중인 순서가 이곳에 자동으로 표시됩니다.</div>';}
      else if(cur){box.innerHTML='<div class="k">지금 진행 중</div><div class="big">'+t(cur)+'</div><div class="sm">'+cur.dataset.t+(nxt?' · 다음 '+nxt.dataset.t.split(' ')[0]+' '+t(nxt):'')+'</div>';}
      else if(nxt){box.innerHTML='<div class="k">다음 순서</div><div class="big">'+t(nxt)+'</div><div class="sm">'+nxt.dataset.t+'</div>';}
      else{box.innerHTML='<div class="k">행사 안내</div><div class="big">오늘 행사가 모두 끝났습니다</div><div class="sm">함께해 주셔서 감사합니다.</div>';}
    }
    if(isDay&&cur&&document.getElementById('tl')){setTimeout(function(){cur.scrollIntoView({block:'center',behavior:'smooth'})},400)}
  }
  // 상세 모두 펼치기/접기
  var all=document.getElementById('toggleAll');
  if(all){all.addEventListener('click',function(){var ds=[].slice.call(document.querySelectorAll('details.seg')),open=ds.some(function(x){return !x.open});ds.forEach(function(x){x.open=open});all.textContent=open?'모두 접기':'모두 펼치기'})}
})();
