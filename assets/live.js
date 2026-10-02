// 실시간 기능: 일정 수정 반영 · 긴급공지(진동) · 공유 채팅 · 총괄 로그인
// 백엔드: Firebase(Firestore + Auth). 설정이 없으면 off, 주소에 ?demo=1 을 붙이면 이 기기 안에서만 동작하는 체험 모드.
(function(){
  var cfg=window.FIREBASE_CONFIG, demo=/[?&]demo=1/.test(location.search)||sessionStorage.getItem('live_demo')==='1';
  if(/[?&]demo=1/.test(location.search)) sessionStorage.setItem('live_demo','1');
  var mode=cfg?'firebase':(demo?'demo':'off');
  var L=window.Live={mode:mode,ready:mode!=='off'}, subs={sched:[],alert:[],chat:[],auth:[]};
  var V='10.12.2', U='https://www.gstatic.com/firebasejs/'+V+'/';
  // ───────── demo(로컬) ─────────
  var bc=('BroadcastChannel' in window)?new BroadcastChannel('gsm_demo'):null;
  function dget(k,d){try{return JSON.parse(localStorage.getItem('demo_'+k))||d}catch(e){return d}}
  function dset(k,v){localStorage.setItem('demo_'+k,JSON.stringify(v));if(bc)bc.postMessage(k)}
  if(mode==='demo'&&bc) bc.onmessage=function(e){fire(e.data)};
  function fire(k){
    if(k==='sched') subs.sched.forEach(function(f){f(dget('sched',null))});
    if(k==='alert') subs.alert.forEach(function(f){f(dget('alert',null))});
    if(k==='chat') subs.chat.forEach(function(f){f(dget('chat',[]))});
  }
  // ───────── firebase ─────────
  var FB=null;
  function fb(){
    if(FB) return FB;
    FB=(async function(){
      var a=await import(U+'firebase-app.js'),au=await import(U+'firebase-auth.js'),fs=await import(U+'firebase-firestore.js');
      var app=a.initializeApp(cfg),auth=au.getAuth(app),db=fs.getFirestore(app);
      au.onAuthStateChanged(auth,function(u){var adm=!!(u&&!u.isAnonymous);subs.auth.forEach(function(f){f(adm,u)})});
      if(!auth.currentUser){try{await au.signInAnonymously(auth)}catch(e){console.warn('anon',e)}}
      return {au:au,fs:fs,auth:auth,db:db};
    })();
    return FB;
  }
  L.onSchedule=function(cb){subs.sched.push(cb);
    if(mode==='demo')cb(dget('sched',null));
    if(mode==='firebase')fb().then(function(x){x.fs.onSnapshot(x.fs.doc(x.db,'config','schedule'),function(s){cb(s.exists()?s.data().items:null)},function(){})});};
  L.saveSchedule=async function(items){
    if(mode==='demo'){dset('sched',items);return}
    var x=await fb();await x.fs.setDoc(x.fs.doc(x.db,'config','schedule'),{items:items,ts:Date.now()});};
  L.resetSchedule=async function(){
    if(mode==='demo'){localStorage.removeItem('demo_sched');if(bc)bc.postMessage('sched');fire('sched');return}
    var x=await fb();await x.fs.deleteDoc(x.fs.doc(x.db,'config','schedule'));};
  L.onAlert=function(cb){subs.alert.push(cb);
    if(mode==='demo')cb(dget('alert',null));
    if(mode==='firebase')fb().then(function(x){x.fs.onSnapshot(x.fs.doc(x.db,'alerts','current'),function(s){cb(s.exists()?s.data():null)},function(){})});};
  L.sendAlert=async function(text,level){
    var o={id:Date.now().toString(36),text:text,level:level||'urgent',ts:Date.now(),active:true};
    if(mode==='demo'){dset('alert',o);fire('alert');return o}
    var x=await fb();await x.fs.setDoc(x.fs.doc(x.db,'alerts','current'),o);return o;};
  L.clearAlert=async function(){
    var o={id:Date.now().toString(36),text:'',ts:Date.now(),active:false};
    if(mode==='demo'){dset('alert',o);fire('alert');return}
    var x=await fb();await x.fs.setDoc(x.fs.doc(x.db,'alerts','current'),o);};
  L.onChat=function(cb){subs.chat.push(cb);
    if(mode==='demo')cb(dget('chat',[]));
    if(mode==='firebase')fb().then(function(x){var q=x.fs.query(x.fs.collection(x.db,'chat'),x.fs.orderBy('ts','desc'),x.fs.limit(100));
      x.fs.onSnapshot(q,function(s){var a=[];s.forEach(function(d){var o=d.data();o.id=d.id;a.push(o)});a.reverse();cb(a)},function(e){cb(null,e)})});};
  L.sendChat=async function(m){
    m.ts=Date.now();
    if(mode==='demo'){var a=dget('chat',[]);m.id='d'+m.ts;a.push(m);dset('chat',a.slice(-100));fire('chat');return}
    var x=await fb();await x.fs.addDoc(x.fs.collection(x.db,'chat'),m);};
  L.deleteChat=async function(id){
    if(mode==='demo'){dset('chat',dget('chat',[]).filter(function(m){return m.id!==id}));fire('chat');return}
    var x=await fb();await x.fs.deleteDoc(x.fs.doc(x.db,'chat',id));};
  L.onAuth=function(cb){subs.auth.push(cb);if(mode==='demo')cb(sessionStorage.getItem('demo_admin')==='1');if(mode==='firebase')fb();};
  L.login=async function(email,pw){
    if(mode==='demo'){if(pw!=='demo')throw new Error('demo 비밀번호는 demo 입니다');sessionStorage.setItem('demo_admin','1');subs.auth.forEach(function(f){f(true)});return}
    var x=await fb();await x.au.signInWithEmailAndPassword(x.auth,email,pw);};
  L.logout=async function(){
    if(mode==='demo'){sessionStorage.removeItem('demo_admin');subs.auth.forEach(function(f){f(false)});return}
    var x=await fb();await x.au.signOut(x.auth);};
  // ───────── 긴급공지 표시(모든 페이지) ─────────
  var timer=null,cur=null;
  function seen(){return localStorage.getItem('alert_seen')||''}
  function stop(){if(timer){clearInterval(timer);timer=null}if(navigator.vibrate)navigator.vibrate(0)}
  function beep(){try{var c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.15;o.connect(g);g.connect(c.destination);o.start();setTimeout(function(){o.stop();c.close()},400)}catch(e){}}
  function buzz(){if(navigator.vibrate)navigator.vibrate([600,200,600,200,1000]);}
  function show(a){
    if(document.getElementById('alertOv'))return;
    cur=a;var ov=document.createElement('div');ov.id='alertOv';
    var t=new Date(a.ts);var hm=('0'+t.getHours()).slice(-2)+':'+('0'+t.getMinutes()).slice(-2);
    ov.innerHTML='<div class="al-box"><div class="al-k">긴급 공지 · '+hm+'</div><div class="al-t"></div><button type="button" class="al-ok">확인했습니다</button><div class="al-s">종합상황실 010-6693-5720</div></div>';
    ov.querySelector('.al-t').textContent=a.text;
    ov.querySelector('.al-ok').onclick=function(){localStorage.setItem('alert_seen',a.id);stop();ov.remove();cur=null};
    document.body.appendChild(ov);buzz();beep();timer=setInterval(function(){buzz();beep()},4000);
    try{if('Notification' in window&&Notification.permission==='granted'&&document.hidden)new Notification('긴급 공지',{body:a.text,requireInteraction:true,vibrate:[600,200,600]})}catch(e){}
  }
  function onAlert(a){
    if(!a||!a.active||!a.id){var ov=document.getElementById('alertOv');if(ov&&cur){stop();ov.remove();cur=null}return}
    if(a.id===seen())return; if(cur&&cur.id===a.id)return; show(a);
  }
  L.enableAlerts=function(){try{if(navigator.vibrate)navigator.vibrate([200,100,200])}catch(e){}try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(e){}localStorage.setItem('alert_on','1')};
  if(mode!=='off'&&window.ENABLE_ALERTS){L.onAlert(onAlert);document.addEventListener('visibilitychange',function(){if(!document.hidden&&cur)buzz()})}
})();
