// 화면 캡처 → 이미지로 저장/공유 (html2canvas)
window.Capture={
  load:function(){return new Promise(function(res,rej){if(window.html2canvas)return res();var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})},
  run:async function(el,name){
    try{await this.load();
      var bg=getComputedStyle(document.body).backgroundColor;
      var c=await html2canvas(el,{backgroundColor:bg,scale:2,useCORS:true,logging:false});
      var url=c.toDataURL('image/png');
      var ov=document.createElement('div');ov.id='capOv';
      ov.innerHTML='<p class="t">이미지가 만들어졌습니다. 아래 버튼으로 저장하거나, 이미지를 길게 눌러 사진에 저장하세요.</p><img alt="캡처 이미지"><div class="r"><button class="btn" type="button" id="cpS">저장 / 공유</button><button class="btn ghost" type="button" id="cpC">닫기</button></div>';
      ov.querySelector('img').src=url;document.body.appendChild(ov);
      ov.querySelector('#cpC').onclick=function(){ov.remove()};
      ov.querySelector('#cpS').onclick=function(){
        c.toBlob(function(b){var f=new File([b],name+'.png',{type:'image/png'});
          if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).catch(function(){})}
          else{var a=document.createElement('a');a.href=url;a.download=name+'.png';document.body.appendChild(a);a.click();a.remove()}});};
    }catch(e){alert('캡처를 만들지 못했습니다. 휴대폰의 화면 캡처 기능(전원+볼륨)을 이용해 주세요.')}
  },
  bar:function(getEl,name){
    var b=document.getElementById('capBar');if(!b){b=document.createElement('div');b.id='capBar';b.className='capbar noprint';b.innerHTML='<button class="btn" type="button">캡처하기</button>';document.body.appendChild(b);b.querySelector('button').addEventListener('click',function(){var el=b._get&&b._get();if(el)window.Capture.run(el,b._name||'capture')})}
    b._get=getEl;b._name=name;b.classList.add('on');document.body.classList.add('hascap');
  }
};
