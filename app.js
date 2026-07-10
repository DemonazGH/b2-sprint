const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
if('serviceWorker' in navigator && location.protocol.startsWith('http')) addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));

const saved=JSON.parse(localStorage.getItem('b2-sprint')||'{}');
if(saved.theme==='light') document.body.classList.add('light');
$('#themeBtn').onclick=()=>{document.body.classList.toggle('light'); saved.theme=document.body.classList.contains('light')?'light':'dark'; persist()};

$$('[data-task]').forEach(box=>{box.checked=(saved.tasks||[]).includes(box.dataset.task);box.onchange=()=>{saved.tasks=$$('[data-task]:checked').map(x=>x.dataset.task);persist();updateProgress()}});
function updateProgress(){const n=$$('[data-task]:checked').length,p=Math.round(n/3*100);$('.mission-ring').style.setProperty('--progress',p);$('#progressNumber').textContent=p+'%'}
function persist(){localStorage.setItem('b2-sprint',JSON.stringify(saved))} updateProgress();

$$('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open) $$('details',d.parentElement).filter(x=>x!==d).forEach(x=>x.open=false)}));

const phrases=[['GIVE A REASON','This is mainly because…'],['ADD A POINT','Another point worth considering is…'],['GIVE AN EXAMPLE','A good example of this would be…'],['CONTRAST','On the other hand,…'],['CONCLUDE','Taking everything into account,…'],['SPEAK · THINK','That’s an interesting question. Let me think…'],['SPEAK · REACT','That’s a good point. How about…?'],['RECOMMEND','I would highly recommend… to anyone who…']];let phrase=0;
function showPhrase(){const p=phrases[phrase];$('#phraseType').textContent=p[0];$('#phraseText').textContent=p[1];$('#phraseCount').textContent=`${phrase+1} / ${phrases.length}`}
function movePhrase(n){phrase=(phrase+n+phrases.length)%phrases.length;showPhrase()} $('#flashcard').onclick=()=>movePhrase(1);$('#nextPhrase').onclick=()=>movePhrase(1);$('#prevPhrase').onclick=()=>movePhrase(-1);showPhrase();

const types={review:{title:'Review',desc:'Describe, evaluate and recommend. A clear personal opinion and an engaging tone work well.',steps:['Hook + object','Describe it','Pros + cons','Recommendation']},article:{title:'Article',desc:'Catch the reader’s attention, address them directly and keep the style lively and appropriate for a school publication.',steps:['Strong title','Hook the reader','Develop ideas','Memorable ending']},email:{title:'Email / Letter',desc:'Cover every prompt and match the tone to the reader. Do not mix formal and informal language.',steps:['Greeting','Reason for writing','Cover all points','Sign-off']},story:{title:'Story',desc:'Build a clear sequence with a problem or turning point. Use past tenses accurately and finish the story properly.',steps:['Set the scene','Build action','Turning point','Resolution']}};
function showType(key){const t=types[key];$('#typePanel').innerHTML=`<div><h3>${t.title}</h3><p>${t.desc}</p></div><div class="panel-steps">${t.steps.map((x,i)=>`<div><span>0${i+1}</span><b>${x}</b></div>`).join('')}</div>`;$$('.type-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.type===key))}
$$('.type-tabs button').forEach(b=>b.onclick=()=>showType(b.dataset.type));showType('review');

let seconds=60,tick=null;function renderTime(){const s=String(seconds).padStart(2,'0');$('#speakTimer').textContent=`00:${s}`}
$('#timerBtn').onclick=()=>{if(tick){clearInterval(tick);tick=null;seconds=60;renderTime();$('#timerBtn').textContent='Start 60 seconds';return}seconds=60;renderTime();$('#timerBtn').textContent='Reset';tick=setInterval(()=>{seconds--;renderTime();if(seconds<=0){clearInterval(tick);tick=null;$('#timerBtn').textContent='Try again'}},1000)};

const questions=[{q:'In Writing Part 1, what must you discuss?',a:['Any two ideas you prefer','Both given ideas and one idea of your own','Only your own idea'],c:1,x:'Exactly. Both notes are compulsory, plus one idea of your own.'},{q:'Which task is NOT part of B2 First for Schools Writing?',a:['Review','Story','Report'],c:2,x:'Report belongs to standard B2 First, not B2 First for Schools.'},{q:'Part 4 transformation: how many words go in the gap?',a:['Exactly one','Two to five','Up to ten'],c:1,x:'Use 2–5 words and do not change the key word.'}];let qi=0,score=0,locked=false;
function loadQuestion(){locked=false;const q=questions[qi];$('#qNum').textContent=`QUESTION ${qi+1} / ${questions.length}`;$('#scoreLabel').textContent=`SCORE ${score}`;$('#quizBar').style.width=`${(qi+1)/questions.length*100}%`;$('#question').textContent=q.q;$('#feedback').textContent='';$('#nextQuestion').classList.add('hidden');$('#answers').innerHTML=q.a.map((a,i)=>`<button data-i="${i}">${String.fromCharCode(65+i)} · ${a}</button>`).join('');$$('#answers button').forEach(b=>b.onclick=()=>answer(+b.dataset.i))}
function answer(i){if(locked)return;locked=true;const q=questions[qi],buttons=$$('#answers button');buttons[q.c].classList.add('correct');if(i===q.c){score++;saved.best=Math.max(saved.best||0,score);persist()}else buttons[i].classList.add('wrong');$('#scoreLabel').textContent=`SCORE ${score}`;$('#feedback').textContent=q.x;$('#nextQuestion').classList.remove('hidden');$('#nextQuestion').textContent=qi===questions.length-1?'Restart drill ↻':'Next question →'}
$('#nextQuestion').onclick=()=>{if(qi===questions.length-1){qi=0;score=0}else qi++;loadQuestion()};loadQuestion();
