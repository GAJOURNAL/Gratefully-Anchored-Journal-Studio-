const app=document.getElementById('app'),bar=document.getElementById('bar'),result=document.getElementById('result'),output=document.getElementById('output');
const state={i:0,a:{}};
const qs=[
{id:'type',q:'What would you like to create today?',o:['Complete Christian journal','Devotional or workbook','Front + back journal cover','Surprise Me']},
{id:'size',q:'What size would you like?',o:['6 x 9','8 x 10','8.5 x 11','A4','Surprise Me']},
{id:'style',q:'Choose your overall style.',o:['Elegant Feminine','Luxury Christian','Soft Botanical','Modern Minimal','Surprise Me']},
{id:'theme',q:'What theme fits this project best?',o:['Healing','Prayer','Gratitude','Faith','Spiritual Growth','Surprise Me']},
{id:'audience',q:'Who is this for?',o:['Women of Faith','Teen Girls','Christian Entrepreneurs','Women in Ministry','General Christian Audience','Surprise Me']},
{id:'title',q:'What title would you like to use?',t:'text'},
{id:'character',q:'Would you like a female character included?',o:['Yes','No','Let the studio decide','Surprise Me']},
{id:'font',q:'Choose your font direction.',o:['Elegant Serif + Delicate Script','Modern Serif + Clean Sans-Serif','Soft Handwritten + Classic Serif','Classic Serif','Surprise Me']},
{id:'details',q:'Any additional details?',t:'textarea'}
];
function render(){
 result.classList.add('hidden');
 if(state.i>=qs.length){summary();return}
 bar.style.width=((state.i+1)/qs.length*100)+'%';
 const q=qs[state.i];
 if(q.o){
  app.innerHTML=`<h2>${q.q}</h2><div class="choices">${q.o.map((x,n)=>`<button class="choice" data-v="${x}"><b>${String.fromCharCode(65+n)}.</b> ${x}</button>`).join('')}</div><div class="nav"><button id="back"${state.i===0?' disabled':''}>Back</button></div>`;
  document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{state.a[q.id]=b.dataset.v;state.i++;render()});
 }else{
  const control=q.t==='textarea'?`<textarea id="entry">${state.a[q.id]||''}</textarea>`:`<input id="entry" value="${state.a[q.id]||''}">`;
  app.innerHTML=`<h2>${q.q}</h2>${control}<div class="nav"><button id="back">Back</button><button id="next" class="primary">Next</button></div>`;
  document.getElementById('next').onclick=()=>{state.a[q.id]=document.getElementById('entry').value.trim()||'None';state.i++;render()};
 }
 const back=document.getElementById('back'); if(back) back.onclick=()=>{if(state.i>0){state.i--;render()}};
}
function summary(){
 bar.style.width='100%';
 app.innerHTML=`<h2>Your Project Summary</h2>${Object.entries(state.a).map(([k,v])=>`<p><b>${k}:</b> ${v}</p>`).join('')}<div class="nav"><button id="back">Back</button><button id="gen" class="primary">Create My Blueprint</button></div><p id="loading" class="hidden">Creating your blueprint...</p>`;
 document.getElementById('back').onclick=()=>{state.i--;render()};
 document.getElementById('gen').onclick=generate;
}
async function generate(){
 document.getElementById('loading').classList.remove('hidden');
 try{
  const r=await fetch('/.netlify/functions/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers:state.a})});
  const d=await r.json();
  if(!r.ok) throw new Error(d.error||'Generation failed');
  output.textContent=d.output||'No output returned';
  result.classList.remove('hidden');
 }catch(e){output.textContent='Error: '+e.message;result.classList.remove('hidden')}
 document.getElementById('loading').classList.add('hidden');
}
document.getElementById('copyBtn').onclick=()=>navigator.clipboard.writeText(output.textContent);
render();