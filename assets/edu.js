
var K=new URLSearchParams(location.search).get('c')||'common';var C=EDU[K]||EDU.common;K=EDU[K]?K:'common';
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var v=document.getElementById('v');
var NN=new URLSearchParams(location.search).get('n')||'';
try{if(!NN)NN=localStorage.getItem('edu_name')||''}catch(e){}
var h='<div class="hero" style="padding-top:30px"><div class="eyebrow">안전교육 · 약 '+C.min+'분</div><h1>'+esc(C.name)+'</h1><p class="lead">대상: '+esc(C.who)+'</p></div>';
h+='<div class="note info">아래 내용을 끝까지 읽고, 맨 아래에서 <b>이수 확인</b>을 눌러 주세요. 퀴즈는 없습니다.</div>';
C.slides.forEach(function(s,i){h+='<div class="card"><h3>'+(i+1)+'. '+esc(s.t)+'</h3><ul>'+s.b.map(function(b){return '<li>'+esc(b)+'</li>'}).join('')+'</ul></div>'});
h+='<h2>교육 이수 확인</h2><div class="q"><label class="opt" style="border-top:0;padding-top:0"><input type="checkbox" id="ck"><span>위 안전교육 내용을 모두 읽고 이해했으며, 현장에서 지키겠습니다.</span></label><input class="tx" id="nm" placeholder="성명" value="'+esc(NN)+'"></div><button class="btn block" type="button" onclick="confirmEdu()" style="width:100%">교육 이수 확인</button><div id="res"></div>';
v.innerHTML=h;
function confirmEdu(){var nm=document.getElementById('nm').value.trim();
 if(!document.getElementById('ck').checked){alert('내용을 읽고 이해했다는 항목에 체크해 주세요.');return}
 if(!nm){alert('성명을 입력해 주세요.');return}
 var d=new Date(),ds=d.getFullYear()+'. '+(d.getMonth()+1)+'. '+d.getDate()+'. '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
 var no='SF-'+K.toUpperCase().slice(0,3)+'-'+d.getTime().toString(36).toUpperCase().slice(-5);
 var rec={no:no,name:nm,course:C.name,key:K,date:ds};var L=[];try{L=JSON.parse(localStorage.getItem('edu_records'))||[]}catch(e){}L.push(rec);try{localStorage.setItem('edu_records',JSON.stringify(L));localStorage.setItem('edu_name',nm)}catch(e){}
 var r=document.getElementById('res');
 r.innerHTML='<div class="note ok"><b>이수 완료</b><br>아래 확인서를 화면 하단 “캡처하기”로 저장해 총괄본부에 제시해 주세요.</div><div class="cert" id="certBox"><h3>안전교육 이수 확인서</h3><table><tr><th>성명</th><td><b>'+esc(nm)+'</b></td></tr><tr><th>이수 과정</th><td>'+esc(C.name)+'</td></tr><tr><th>이수 일시</th><td>'+ds+'</td></tr><tr><th>확인 번호</th><td>'+no+'</td></tr></table><p style="font-size:13px;margin:10px 0 0">제3회 광산세계야시장 · 주최 광주광역시 광산구 / 주관 협동조합 효성</p></div>';
 r.scrollIntoView({behavior:'smooth'});
 if(window.Capture)Capture.bar(function(){return document.getElementById('certBox')},'안전교육_이수확인서_'+nm);}
