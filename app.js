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

// Guided Speaking Lab: Parts 1 and 2.
const lifeQuestions=[
 'What do you enjoy doing in your free time?',
 'Tell me about a subject you enjoy at school.',
 'What would you like to do after finishing school?',
 'Do you prefer spending your weekend indoors or outdoors?',
 'How important is English in your life?',
 'Tell me about a place you enjoy visiting.',
 'What kind of music do you enjoy and why?',
 'How do you usually use technology for studying?'
];
const lifeSamples={
 'What do you enjoy doing in your free time?':['I’m really into playing strategy games.','The main reason is that they make me think and solve problems.','For example, I often play online with my friends at the weekend.'],
 'Tell me about a subject you enjoy at school.':['One of my favourite subjects is computer science.','I enjoy it because I like understanding how technology works.','For instance, we recently created a simple game in class.'],
 'What would you like to do after finishing school?':['I’d like to study something connected with technology.','This is mainly because I enjoy solving practical problems.','For example, I’m interested in learning how apps and websites are built.'],
 'Do you prefer spending your weekend indoors or outdoors?':['I generally prefer spending it outdoors.','The main reason is that I need a break after sitting in class all week.','For example, I often go cycling or meet my friends in town.'],
 'How important is English in your life?':['English is very important to me.','It gives me access to more information and lets me communicate with people abroad.','For instance, I watch tutorials and films in English.'],
 'Tell me about a place you enjoy visiting.':['I really enjoy visiting the park near my home.','I like it because it is quiet and helps me relax.','For example, I sometimes go there to walk and listen to music.'],
 'What kind of music do you enjoy and why?':['I mostly listen to rock and electronic music.','I enjoy it because it gives me energy and helps me focus.','For example, I often listen to it while travelling to school.'],
 'How do you usually use technology for studying?':['I mainly use my laptop to research topics and organise my notes.','It is useful because I can find explanations quickly.','For example, I often watch short video lessons before a test.']
};
let lifeIndex=0,lifeTimer=null,photoTimer=null,currentRecognition=null,coachStep=0;const compareNotes=['','','','',''];
const coachSteps=[
 {short:'Open',label:'STEP 1 · OPEN',task:'Start with what both photos have in common.',phrases:['Both photos show…','In both pictures, we can see…','The two photos depict…']},
 {short:'A',label:'STEP 2 · PHOTO A',task:'Describe the first situation briefly. Focus on the person, place and atmosphere.',phrases:['In the first photo,…','The student seems to be…','The atmosphere looks…']},
 {short:'B',label:'STEP 3 · PHOTO B',task:'Move to the second situation and connect it to the first.',phrases:['Whereas in the second photo,…','The other picture shows…','By contrast,…']},
 {short:'Compare',label:'STEP 4 · COMPARE',task:'Make one clear comparison. Avoid two separate lists.',phrases:['While the first student…, the group…','Unlike the person in Photo A,…','The main difference is that…']},
 {short:'Why?',label:'STEP 5 · ANSWER',task:'Answer why they chose these ways of studying. Speculate—certainty is not required.',phrases:['They might have chosen… because…','Perhaps the student prefers…','I imagine the group wanted…']}
];
function openSpeaking(mode){showSpeakingMode(mode);modal('#speakingModal',true)}
$$('[data-speaking-mode]').forEach(b=>b.onclick=()=>openSpeaking(b.dataset.speakingMode));
$$('[data-speak-tab]').forEach(b=>b.onclick=()=>showSpeakingMode(b.dataset.speakTab));
function showSpeakingMode(mode){$('#lifeTrainer').classList.toggle('hidden',mode!=='life');$('#photosTrainer').classList.toggle('hidden',mode!=='photos');$$('[data-speak-tab]').forEach(b=>b.classList.toggle('active',b.dataset.speakTab===mode));if(mode==='photos')renderCoach()}
$('#closeSpeaking').onclick=()=>{stopSpeakingTools();modal('#speakingModal',false)};
function stopSpeakingTools(){clearInterval(lifeTimer);clearInterval(photoTimer);lifeTimer=photoTimer=null;if(currentRecognition){try{currentRecognition.stop()}catch{}currentRecognition=null}}

function showLifeQuestion(){const q=lifeQuestions[lifeIndex];$('#lifeQuestion').textContent=q;['#lifeAnswer','#lifeReason','#lifeDetail'].forEach(s=>$(s).value='');updateLifePreview();$('#lifeSpeechStage').classList.add('hidden')}
$('#newLifeQuestion').onclick=()=>{lifeIndex=(lifeIndex+1)%lifeQuestions.length;showLifeQuestion()};
['#lifeAnswer','#lifeReason','#lifeDetail'].forEach(s=>$(s).addEventListener('input',updateLifePreview));
function updateLifePreview(){const parts=[$('#lifeAnswer').value,$('#lifeReason').value,$('#lifeDetail').value].filter(Boolean);$('#lifePreview').textContent=parts.length?parts.join(' '):'Complete the three boxes. Your answer plan will appear here.'}
$('#lifeSample').onclick=()=>{const s=lifeSamples[lifeQuestions[lifeIndex]];$('#lifeAnswer').value=s[0];$('#lifeReason').value=s[1];$('#lifeDetail').value=s[2];updateLifePreview()};
$('#startLifeSpeaking').onclick=()=>{$('#lifeSpeechStage').classList.remove('hidden');$('#lifeTranscript').focus();$('#lifeSpeechStage').scrollIntoView({behavior:'smooth',block:'nearest'})};

function startCountdown(display,seconds,onDone){let left=seconds;display.textContent=`00:${String(left).padStart(2,'0')}`;const t=setInterval(()=>{left--;display.textContent=`00:${String(Math.max(0,left)).padStart(2,'0')}`;if(left<=0){clearInterval(t);onDone?.()}},1000);return t}
function startRecognition(button,textarea,duration,kind){stopRecognitionOnly();const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;button.classList.add('recording');button.textContent='■ Stop';let finalText=textarea.value?textarea.value+' ':'';if(kind==='life'){clearInterval(lifeTimer);lifeTimer=startCountdown($('#lifeClock'),duration,()=>stopRecognitionOnly())}else{clearInterval(photoTimer);photoTimer=startCountdown($('#photoClock'),duration,()=>stopRecognitionOnly())}if(!Recognition){textarea.placeholder='Speech recognition is unavailable in this browser. Speak with the timer, then type a short self-review.';setTimeout(()=>stopRecognitionOnly(),duration*1000);return}const rec=new Recognition();currentRecognition=rec;rec.lang='en-GB';rec.continuous=true;rec.interimResults=true;rec.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const text=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=text+' ';else interim+=text}textarea.value=finalText+interim};rec.onerror=()=>{textarea.placeholder='Speech recognition stopped. You can type a self-review here.';stopRecognitionOnly()};rec.onend=()=>{if(currentRecognition===rec)stopRecognitionOnly()};try{rec.start()}catch{stopRecognitionOnly()}}
function stopRecognitionOnly(){if(currentRecognition){const r=currentRecognition;currentRecognition=null;try{r.stop()}catch{}}$$('.record-btn.recording').forEach(b=>{b.classList.remove('recording');b.textContent='● Start speaking'})}
$('#lifeRecord').onclick=()=>$('#lifeRecord').classList.contains('recording')?stopRecognitionOnly():startRecognition($('#lifeRecord'),$('#lifeTranscript'),30,'life');

function renderCoach(){const s=coachSteps[coachStep];$('#coachTrack').innerHTML=coachSteps.map((x,i)=>`<button data-coach="${i}" data-short="${x.short}" class="${i===coachStep?'active':''} ${compareNotes[i]?'done':''}">${i+1}. ${x.short}</button>`).join('');$$('[data-coach]').forEach(b=>b.onclick=()=>{saveCoachNote();coachStep=+b.dataset.coach;renderCoach()});$('#coachLabel').textContent=s.label;$('#coachTask').textContent=s.task;$('#coachPhrases').innerHTML=s.phrases.map(p=>`<button>${p}</button>`).join('');$$('#coachPhrases button').forEach(b=>b.onclick=()=>{$('#coachNote').value=($('#coachNote').value+' '+b.textContent).trim();$('#coachNote').focus()});$('#coachNote').value=compareNotes[coachStep];$('#nextCoachStep').textContent=coachStep===4?'Start the 60-second task →':'Next step →'}
function saveCoachNote(){compareNotes[coachStep]=$('#coachNote').value.trim()}
$('#nextCoachStep').onclick=()=>{saveCoachNote();if(coachStep<4){coachStep++;renderCoach()}else{$('#photoRun').classList.remove('hidden');$('#photoRun').scrollIntoView({behavior:'smooth',block:'nearest'})}};
$('#photoRecord').onclick=()=>$('#photoRecord').classList.contains('recording')?stopRecognitionOnly():startRecognition($('#photoRecord'),$('#photoTranscript'),60,'photo');
function saveSpeakingAttempt(kind){stopSpeakingTools();const root=kind==='life'?$('#lifeSpeechStage'):$('#photoRun'),checks=$$('input[type="checkbox"]',root),done=checks.filter(x=>x.checked).length;saved.speakingAttempts=(saved.speakingAttempts||0)+1;saved.speakingChecks=(saved.speakingChecks||0)+done;logActivity('speaking',done);persist();const toast=document.createElement('div');toast.className='save-toast';toast.textContent=`Attempt saved · ${done}/${checks.length} structure points`;document.body.appendChild(toast);setTimeout(()=>toast.remove(),2600)}
$('#finishLife').onclick=()=>saveSpeakingAttempt('life');$('#finishPhotos').onclick=()=>saveSpeakingAttempt('photos');showLifeQuestion();renderCoach();

const questions=[
 {q:'In Writing Part 1, what must you discuss?',a:['Any two ideas you prefer','Both given ideas and one idea of your own','Only your own idea'],c:1,x:'Both notes are compulsory, plus one idea of your own.'},
 {q:'Which task is NOT part of B2 First for Schools Writing?',a:['Review','Story','Report'],c:2,x:'Report belongs to standard B2 First, not B2 First for Schools.'},
 {q:'Part 4 transformation: how many words go in the gap?',a:['Exactly one','Two to five','Up to ten'],c:1,x:'Use 2–5 words and do not change the key word.'},
 {q:'The conference was easily ___ by public transport.',a:['achieved','accessed','obtained'],c:1,x:'Accessible by transport is a standard collocation.'},
 {q:'His ___ to leave surprised everyone. [DECIDE]',a:['decisive','decision','deciding'],c:1,x:'A noun is required after the possessive “his”: decision.'},
 {q:'What should you do first in Reading Part 7?',a:['Translate the whole text','Read the questions','Read every text slowly'],c:1,x:'Read questions first, then scan the texts for paraphrases.'},
 {q:'What matters most in Speaking Part 3?',a:['Using rare vocabulary','Speaking longer than your partner','Interacting and reaching a decision'],c:2,x:'It is a collaborative task: react, invite, negotiate and decide.'},
 {q:'How many times is each Listening recording played?',a:['Once','Twice','Three times'],c:1,x:'Every recording in the Listening paper is heard twice.'}
];let qi=0,score=0,locked=false;
function loadQuestion(){locked=false;const q=questions[qi];$('#qNum').textContent=`QUESTION ${qi+1} / ${questions.length}`;$('#scoreLabel').textContent=`SCORE ${score}`;$('#quizBar').style.width=`${(qi+1)/questions.length*100}%`;$('#question').textContent=q.q;$('#feedback').textContent='';$('#nextQuestion').classList.add('hidden');$('#answers').innerHTML=q.a.map((a,i)=>`<button data-i="${i}">${String.fromCharCode(65+i)} · ${a}</button>`).join('');$$('#answers button').forEach(b=>b.onclick=()=>answer(+b.dataset.i))}
function answer(i){if(locked)return;locked=true;const q=questions[qi],buttons=$$('#answers button');buttons[q.c].classList.add('correct');saved.practiceAnswered=(saved.practiceAnswered||0)+1;if(i===q.c){score++;saved.practiceCorrect=(saved.practiceCorrect||0)+1;buttons[i].classList.add('correct')}else buttons[i].classList.add('wrong');logActivity('practice',i===q.c?1:0);persist();$('#scoreLabel').textContent=`SCORE ${score}`;$('#feedback').textContent=q.x;$('#nextQuestion').classList.remove('hidden');$('#nextQuestion').textContent=qi===questions.length-1?'Restart drill ↻':'Next question →'}
$('#nextQuestion').onclick=()=>{if(qi===questions.length-1){qi=0;score=0}else qi++;loadQuestion()};loadQuestion();

// Listening: browser speech synthesis keeps the practice self-contained.
let listens=0;const listeningText='When our teacher first announced the trip to the science museum, I expected it to be rather dull. I was completely wrong. The experiments were hands-on, the guide was genuinely funny, and even the journey home was good fun. I would definitely go again.';
$('#playListening').onclick=()=>{if(listens>=2||!('speechSynthesis' in window))return;listens++;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(listeningText);u.lang='en-GB';u.rate=.92;u.onstart=()=>{$('.wave').classList.add('playing');$('#playStatus').textContent='Listening… focus on the speaker’s attitude'};u.onend=()=>{$('.wave').classList.remove('playing');$('#playStatus').textContent=listens<2?'You may listen once more':'Two plays used';if(listens>=2)$('#playListening').disabled=true};speechSynthesis.speak(u);$('#playCount').textContent=`${listens} / 2`};
$$('#listenAnswers button').forEach(b=>b.onclick=()=>{if($('#listenAnswers').dataset.done)return;$('#listenAnswers').dataset.done='1';const ok=b.dataset.answer==='correct';b.classList.add(ok?'correct':'wrong');if(!ok)$('#listenAnswers [data-answer="correct"]').classList.add('correct');$('#listenFeedback').textContent=ok?'Correct — “I expected it to be dull. I was completely wrong.”':'Listen for the contrast: the speaker expected boredom but enjoyed the trip.';saved.listeningAttempts=(saved.listeningAttempts||0)+1;saved.listeningCorrect=(saved.listeningCorrect||0)+(ok?1:0);logActivity('listening',ok?1:0);persist()});

// Activity and streak helpers.
function dayKey(d=new Date()){return d.toISOString().slice(0,10)}
function logActivity(type,points){saved.activity=saved.activity||{};const k=dayKey();saved.activity[k]=saved.activity[k]||{count:0,points:0};saved.activity[k].count++;saved.activity[k].points+=points;saved.lastType=type}
function streak(){const a=saved.activity||{};let n=0,d=new Date();for(;;){if(!a[dayKey(d)])break;n++;d.setDate(d.getDate()-1)}return n}

// Exam mode.
const examQuestions=[
 {cat:'USE OF ENGLISH',q:'We had to ___ a decision before Friday.',a:['do','make','take'],c:1},
 {cat:'OPEN CLOZE',q:'She succeeded ___ spite of the difficulties.',a:['in','on','at'],c:0},
 {cat:'WORD FORMATION',q:'The performance was extremely ___. [IMPRESS]',a:['impression','impressive','impressively'],c:1},
 {cat:'TRANSFORMATION',q:'“I last saw him two years ago.” Which version is correct?',a:['I haven’t seen him for two years.','I didn’t see him since two years.','I haven’t saw him for two years.'],c:0},
 {cat:'READING STRATEGY',q:'In Gapped Text, which clues are most useful?',a:['Only difficult vocabulary','Pronouns, linkers and idea development','The longest sentence'],c:1},
 {cat:'WRITING',q:'Which four criteria are used to assess Writing?',a:['Ideas, spelling, length, handwriting','Content, Communicative Achievement, Organisation, Language','Grammar, vocabulary, creativity, opinion'],c:1},
 {cat:'LISTENING PART 2',q:'What do candidates complete during the monologue?',a:['Sentences','A table with A/B/C answers only','A written summary'],c:0},
 {cat:'LISTENING STRATEGY',q:'If you miss one answer on the first listening, what should you do?',a:['Stop listening and think','Move on and target it on the second play','Leave the test'],c:1},
 {cat:'SPEAKING PART 2',q:'After your one-minute photo comparison, your partner gives…',a:['a 30-second response','another one-minute talk','no response'],c:0},
 {cat:'SPEAKING PART 3',q:'Choose the best interaction phrase.',a:['I have finished my answer.','That’s a valid point, but what about…?','You are wrong.'],c:1}
];let exIndex=0,exAnswers=[],exSeconds=600,exTick=null;
function modal(id,on){$(id).classList.toggle('open',on);$(id).setAttribute('aria-hidden',String(!on));document.body.style.overflow=on?'hidden':''}
$('#openExamTop').onclick=()=>{resetExam();modal('#examModal',true)};$('#closeExam').onclick=()=>{if(exTick&&!confirm('Leave the mini-exam? Your current answers will be lost.'))return;clearInterval(exTick);exTick=null;modal('#examModal',false)};
function resetExam(){$('#examIntro').classList.remove('hidden');$('#examRun').classList.add('hidden');$('#examResult').classList.add('hidden');$('#examClock').textContent='10:00';exAnswers=[];exIndex=0;exSeconds=600}
$('#startExam').onclick=()=>{$('#examIntro').classList.add('hidden');$('#examRun').classList.remove('hidden');renderExam();exTick=setInterval(()=>{exSeconds--;const m=Math.floor(exSeconds/60),s=String(exSeconds%60).padStart(2,'0');$('#examClock').textContent=`${m}:${s}`;if(exSeconds<=0)finishExam()},1000)};
function renderExam(){$('#examDots').innerHTML=examQuestions.map((_,i)=>`<i data-ex="${i}" class="${i===exIndex?'current':''} ${exAnswers[i]!=null?'done':''}">${i+1}</i>`).join('');$$('[data-ex]').forEach(x=>x.onclick=()=>{exIndex=+x.dataset.ex;renderExam()});const q=examQuestions[exIndex];$('#examQNum').textContent=`${q.cat} · QUESTION ${exIndex+1} / ${examQuestions.length}`;$('#examQuestion').textContent=q.q;$('#examAnswers').innerHTML=q.a.map((a,i)=>`<button class="${exAnswers[exIndex]===i?'selected':''}" data-choice="${i}">${String.fromCharCode(65+i)} · ${a}</button>`).join('');$$('[data-choice]').forEach(x=>x.onclick=()=>{exAnswers[exIndex]=+x.dataset.choice;renderExam()});$('#examNext').textContent=exIndex===9?'Review answers':'Next →'}
$('#examNext').onclick=()=>{if(exIndex<9)exIndex++;else exIndex=exAnswers.findIndex(x=>x==null);if(exIndex<0)exIndex=9;renderExam()};$('#finishExam').onclick=()=>{if(exAnswers.filter(x=>x!=null).length<10&&!confirm('Some questions are unanswered. Submit anyway?'))return;finishExam()};
function finishExam(){clearInterval(exTick);exTick=null;const correct=examQuestions.reduce((n,q,i)=>n+(exAnswers[i]===q.c),0),pct=correct*10;$('#examRun').classList.add('hidden');$('#examResult').classList.remove('hidden');saved.exams=(saved.exams||0)+1;saved.examCorrect=(saved.examCorrect||0)+correct;saved.examAnswered=(saved.examAnswered||0)+10;saved.bestExam=Math.max(saved.bestExam||0,pct);logActivity('exam',correct);persist();$('#examResult').innerHTML=`<div class="result-score"><b>${pct}%</b></div><h2>${pct>=70?'Target reached.':'Keep building.'}</h2><p>${correct} of 10 correct · ${pct>=70?'Solid B2 exam awareness.':'Review the red items and try again.'}</p><div class="result-review">${examQuestions.map((q,i)=>`<div><span class="${exAnswers[i]===q.c?'good':'bad'}">${exAnswers[i]===q.c?'✓':'×'}</span><b>${q.cat}</b><span>${q.a[q.c]}</span></div>`).join('')}</div><div class="result-actions"><button class="btn primary" id="examAgain">Try again</button><button class="btn ghost" id="resultClose">Close</button></div>`;$('#examAgain').onclick=()=>{resetExam();$('#startExam').click()};$('#resultClose').onclick=()=>modal('#examModal',false)}

// Statistics dashboard.
$('#openStats').onclick=()=>{renderStats();modal('#statsModal',true)};$('#closeStats').onclick=()=>modal('#statsModal',false);
function renderStats(){const answered=(saved.practiceAnswered||0)+(saved.examAnswered||0)+(saved.listeningAttempts||0),correct=(saved.practiceCorrect||0)+(saved.examCorrect||0)+(saved.listeningCorrect||0),accuracy=answered?Math.round(correct/answered*100):0,days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=dayKey(d),v=(saved.activity||{})[k];days.push({label:d.toLocaleDateString('en',{weekday:'short'}),count:v?.count||0})}const max=Math.max(1,...days.map(x=>x.count));$('#statsContent').innerHTML=`<div class="stat-cards"><div class="stat-card"><b>${saved.exams||0}</b><small>mini-exams</small></div><div class="stat-card"><b>${saved.speakingAttempts||0}</b><small>speaking attempts</small></div><div class="stat-card"><b>${accuracy}%</b><small>objective accuracy</small></div><div class="stat-card"><b>${saved.bestExam||0}%</b><small>best exam</small></div><div class="stat-card"><b>${streak()}</b><small>day streak</small></div></div>${answered||saved.speakingAttempts?`<div class="activity-chart"><h3>Last 7 days</h3><div class="bars">${days.map(x=>`<div><i style="height:${Math.max(4,x.count/max*100)}%"></i><small>${x.label}</small></div>`).join('')}</div></div>`:'<div class="no-activity">Complete a practice question, speaking task or mini-exam to start your chart.</div>'}`}
