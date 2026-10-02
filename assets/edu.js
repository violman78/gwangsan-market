
var K=new URLSearchParams(location.search).get('c')||'common';var C=EDU[K]||EDU.common;K=EDU[K]?K:'common';
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var v=document.getElementById('v');
var h='<div class="hero" style="padding-top:30px"><div class="eyebrow">안전교육 · 약 '+C.min+'분</div><h1>'+esc(C.name)+'</h1><p class="lead">대상: '+esc(C.who)+'</p></div>';
C.slides.forEach(function(s,i){h+='<div class="card"><h3>'+(i+1)+'. '+esc(s.t)+'</h3><ul>'+s.b.map(function(b){return '<li>'+esc(b)+'</li>'}).join('')+'</ul></div>'});
h+='<h2>이해도 퀴즈</h2><p class="lead" style="font-size:16px">5문항 중 4개 이상 맞히면 이수됩니다.</p>';
C.quiz.forEach(function(q,i){h+='<div class="q"><b>Q'+(i+1)+'. '+esc(q.q)+'</b>'+q.o.map(function(o,j){return '<label class="opt"><input type="radio" name="q'+i+'" value="'+j+'"><span>'+esc(o)+'</span></label>'}).join('')+'</div>'});
h+='<div class="q"><b>이수자 정보</b><input class="tx" id="nm" placeholder="성명"><input class="tx" id="og" placeholder="소속 (업체 · 팀 · 부스명)"></div><button class="btn block" type="button" onclick="grade()" style="width:100%">제출하고 이수 확인 받기</button><div id="res"></div>';
v.innerHTML=h;var NN=new URLSearchParams(location.search).get('n');if(NN)document.getElementById('nm').value=NN;
function grade(){var nm=document.getElementById('nm').value.trim(),og=document.getElementById('og').value.trim();if(!nm||!og){alert('성명과 소속을 입력해 주세요.');return}
 var sc=0;C.quiz.forEach(function(q,i){var r=document.querySelector('input[name=q'+i+']:checked');if(r&&+r.value===q.a)sc++});
 var r=document.getElementById('res');
 if(sc<4){r.innerHTML='<div class="note bad"><b>'+sc+' / 5 — 미이수</b><br>자료를 다시 읽고 재응시해 주세요. (4개 이상 정답 시 이수)</div>';r.scrollIntoView({behavior:'smooth'});return}
 var d=new Date(),ds=d.getFullYear()+'. '+(d.getMonth()+1)+'. '+d.getDate()+'. '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
 var no='SF-'+K.toUpperCase().slice(0,3)+'-'+d.getTime().toString(36).toUpperCase().slice(-5);
 var rec={no:no,name:nm,org:og,course:C.name,key:K,score:sc,date:ds};var L=[];try{L=JSON.parse(localStorage.getItem('edu_records'))||[]}catch(e){}L.push(rec);try{localStorage.setItem('edu_records',JSON.stringify(L))}catch(e){}
 r.innerHTML='<div class="note ok"><b>이수 완료 ('+sc+' / 5)</b><br>아래 확인서를 화면 캡처하거나 인쇄해 총괄본부에 제시해 주세요.</div><div class="cert"><h3>안전교육 이수 확인서</h3><table><tr><th>성명</th><td><b>'+esc(nm)+'</b></td></tr><tr><th>소속</th><td>'+esc(og)+'</td></tr><tr><th>이수 과정</th><td>'+esc(C.name)+'</td></tr><tr><th>이수 일시</th><td>'+ds+'</td></tr><tr><th>점수</th><td>'+sc+' / 5</td></tr><tr><th>확인 번호</th><td>'+no+'</td></tr></table><p style="font-size:13px;margin:10px 0 0">제3회 광산세계야시장 · 주최 광주광역시 광산구 / 주관 협동조합 효성</p></div><button class="btn ghost noprint" type="button" onclick="window.print()">인쇄</button>';
 r.scrollIntoView({behavior:'smooth'})}
