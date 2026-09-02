const app = document.getElementById('app');
const bar = document.getElementById('bar');
const result = document.getElementById('result');
const output = document.getElementById('output');

const STORAGE_KEY = 'gracefullyAnchoredProjectsV1';

const state = {
  i: 0,
  a: {},
  titleGroup: 0,
  blueprint: '',
  currentProjectId: null
};

const qs = [
  {id:'type',q:'What would you like to create today?',o:['Complete Christian journal','Devotional or workbook','Front + back journal cover','Surprise Me']},
  {id:'size',q:'What size would you like?',o:['6 x 9','8 x 10','8.5 x 11','A4','Surprise Me']},
  {id:'style',q:'Choose your overall style.',o:['Elegant Feminine','Luxury Christian','Soft Botanical','Modern Minimal','Surprise Me']},
  {id:'theme',q:'What theme fits this project best?',o:['Healing','Prayer','Gratitude','Faith','Spiritual Growth','Surprise Me']},
  {id:'audience',q:'Who is this for?',o:['Women of Faith','Teen Girls','Christian Entrepreneurs','Women in Ministry','General Christian Audience','Surprise Me']},
  {id:'title',q:'Choose a title for your project.',type:'title-choice'},
  {id:'character',q:'Would you like a female character included?',o:['Yes','No','Let the studio decide','Surprise Me']},
  {id:'font',q:'Choose your font direction.',o:['Elegant Serif + Delicate Script','Modern Serif + Clean Sans-Serif','Soft Handwritten + Classic Serif','Classic Serif','Surprise Me']},
  {id:'details',q:'Any additional details?',t:'textarea'}
];

function getSavedProjects(){
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeSavedProjects(projects){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function saveCurrentProject(){
  if(!state.blueprint) return;

  const projects = getSavedProjects();
  const id = state.currentProjectId || `ga-${Date.now()}`;

  const item = {
    id,
    title: state.a.title || 'Untitled Project',
    type: state.a.type || '',
    theme: state.a.theme || '',
    answers: {...state.a},
    blueprint: state.blueprint,
    updatedAt: new Date().toISOString()
  };

  const idx = projects.findIndex(p => p.id === id);

  if(idx >= 0) {
    projects[idx] = item;
  } else {
    projects.unshift(item);
  }

  writeSavedProjects(projects);
  state.currentProjectId = id;
}

function startNewProject(){
  state.i = 0;
  state.a = {};
  state.titleGroup = 0;
  state.blueprint = '';
  state.currentProjectId = null;

  output.textContent = '';
  result.classList.add('hidden');

  render();
}

function renderSavedProjects(){
  const projects = getSavedProjects();

  result.classList.add('hidden');
  bar.style.width = '100%';

  app.innerHTML = `
    <h2>Saved Projects</h2>

    <p>These projects are saved in this browser on this device.</p>

    <div class="nav">
      <button id="newProject" class="primary">
        + Create New Project
      </button>
    </div>

    <div class="choices">
      ${
        projects.length
          ? projects.map(p => `
              <div class="choice" style="cursor:default">
                <div>
                  <b>${escapeHtml(p.title)}</b>
                </div>

                <div style="font-size:.9rem;opacity:.8">
                  ${escapeHtml(p.type)}
                  ${p.theme ? ' · ' + escapeHtml(p.theme) : ''}
                </div>

                <div class="nav">
                  <button class="openSaved" data-id="${p.id}">
                    Open
                  </button>

                  <button class="deleteSaved" data-id="${p.id}">
                    Delete
                  </button>
                </div>
              </div>
            `).join('')
          : `
            <div class="choice" style="cursor:default">
              No saved projects yet.
            </div>
          `
      }
    </div>

    <div class="nav">
      <button id="backHome">
        Back
      </button>
    </div>
  `;

  document.getElementById('newProject').onclick = startNewProject;
  document.getElementById('backHome').onclick = startNewProject;

  document.querySelectorAll('.openSaved').forEach(btn => {
    btn.onclick = () => {
      const p = projects.find(x => x.id === btn.dataset.id);

      if(!p) return;

      state.a = {...p.answers};
      state.blueprint = p.blueprint || '';
      state.currentProjectId = p.id;
      state.i = qs.length;

      output.textContent = state.blueprint;

      summary();

      result.classList.remove('hidden');

      renderNextStepButtons();
    };
  });

  document.querySelectorAll('.deleteSaved').forEach(btn => {
    btn.onclick = () => {
      if(!confirm('Delete this saved project?')) return;

      writeSavedProjects(
        projects.filter(p => p.id !== btn.dataset.id)
      );

      renderSavedProjects();
    };
  });
}

function getTitleGroups(){
  const theme = (state.a.theme || '').toLowerCase();

  if(theme.includes('healing')) {
    return [
      ['Healing in His Presence','Grace for the Healing Journey','Held While I Heal','Restored by Faith'],
      ['God Meets Me Here','Healing One Day at a Time','Grace in the Broken Places','Renewed in His Presence']
    ];
  }

  if(theme.includes('prayer')) {
    return [
      ['In His Presence','A Life of Prayer','Draw Near','Prayers from the Heart'],
      ['My Quiet Place with God','Grace in the Secret Place','Covered in Prayer','When I Talk to God']
    ];
  }

  if(theme.includes('gratitude')) {
    return [
      ['Counting Blessings','A Grateful Heart','Grace & Gratitude','Thankful in His Presence'],
      ['Blessed Beyond Measure','Everyday Gratitude','Gifts of Grace','Joy in the Little Things']
    ];
  }

  if(theme.includes('faith')) {
    return [
      ['Faith Over Fear','Anchored in Faith','Walking by Faith','Courage Through Christ'],
      ['Fearless Through Him','Rooted in His Promises','Faith That Holds','Standing on His Word']
    ];
  }

  if(theme.includes('spiritual growth')) {
    return [
      ['Rooted, Refined & Renewed','Growing in Grace','Becoming Who God Called Me to Be','Deeper with God'],
      ['Rooted in His Word','A Journey of Spiritual Growth','Grace for the Becoming','Growing Stronger in Faith']
    ];
  }

  return [
    ['Gracefully Anchored','Rooted in Grace','Held by His Promises','A Journey with God'],
    ['Faithfully Becoming','Grace for the Journey','Anchored in His Love','Walking with God']
  ];
}

function render(){
  result.classList.add('hidden');

  if(state.i >= qs.length){
    summary();
    return;
  }

  bar.style.width =
    ((state.i + 1) / qs.length * 100) + '%';

  const q = qs[state.i];

  if(q.type === 'title-choice'){
    renderTitleChoice(q);
    return;
  }

  if(q.o){
    app.innerHTML = `
      <h2>${q.q}</h2>

      <div class="choices">
        ${q.o.map((x,n)=>`
          <button class="choice" data-v="${x}">
            <b>${String.fromCharCode(65+n)}.</b> ${x}
          </button>
        `).join('')}
      </div>

      ${
        state.i === 0 && getSavedProjects().length
          ? `
            <div class="nav">
              <button id="savedProjects">
                Saved Projects (${getSavedProjects().length})
              </button>
            </div>
          `
          : ''
      }

      <div class="nav">
        <button id="back" ${state.i===0?'disabled':''}>
          Back
        </button>
      </div>
    `;

    document.querySelectorAll('.choice').forEach(b => {
      b.onclick = () => {
        state.a[q.id] = b.dataset.v;
        state.i++;
        render();
      };
    });

    const savedProjects = document.getElementById('savedProjects');

    if(savedProjects){
      savedProjects.onclick = renderSavedProjects;
    }
  }

  else {
    const control =
      q.t === 'textarea'
        ? `<textarea id="entry">${state.a[q.id]||''}</textarea>`
        : `<input id="entry" value="${state.a[q.id]||''}">`;

    app.innerHTML = `
      <h2>${q.q}</h2>

      ${control}

      <div class="nav">
        <button id="back">
          Back
        </button>

        <button id="next" class="primary">
          Next
        </button>
      </div>
    `;

    document.getElementById('next').onclick = () => {
      state.a[q.id] =
        document.getElementById('entry').value.trim() || 'None';

      state.i++;
      render();
    };
  }

  const back = document.getElementById('back');

  if(back){
    back.onclick = () => {
      if(state.i > 0){
        state.i--;
        render();
      }
    };
  }
}

function renderTitleChoice(q){
  const groups = getTitleGroups();
  const titles = groups[state.titleGroup];

  app.innerHTML = `
    <h2>${q.q}</h2>

    <p>
      Choose one, let Gracefully Anchored surprise you,
      or enter your own title.
    </p>

    <div class="choices">

      ${titles.map((title,index)=>`
        <button class="choice title-option" data-v="${title}">
          <b>${String.fromCharCode(65+index)}.</b>
          ${title}
        </button>
      `).join('')}

      <button class="choice" id="surpriseTitle">
        <b>E.</b> Surprise Me
      </button>

      <button class="choice" id="customTitle">
        <b>F.</b> Let Me Type My Own Title
      </button>

      <button class="choice" id="moreTitles">
        <b>G.</b> Show Me More Choices
      </button>

    </div>

    <div class="nav">
      <button id="back">
        Back
      </button>
    </div>
  `;

  document.querySelectorAll('.title-option').forEach(b => {
    b.onclick = () => {
      state.a.title = b.dataset.v;
      state.i++;
      render();
    };
  });

  document.getElementById('surpriseTitle').onclick = () => {
    const all = groups.flat();

    state.a.title =
      all[Math.floor(Math.random()*all.length)];

    state.i++;
    render();
  };

  document.getElementById('customTitle').onclick =
    renderCustomTitle;

  document.getElementById('moreTitles').onclick = () => {
    state.titleGroup =
      (state.titleGroup + 1) % groups.length;

    render();
  };

  document.getElementById('back').onclick = () => {
    if(state.i > 0){
      state.i--;
      render();
    }
  };
}

function renderCustomTitle(){
  app.innerHTML = `
    <h2>Enter your title.</h2>

    <input
      id="customTitleInput"
      type="text"
      placeholder="Example: Faith Over Fear"
      value="${state.a.title||''}"
    >

    <div class="nav">

      <button id="backToTitles">
        Back
      </button>

      <button id="saveTitle" class="primary">
        Use This Title
      </button>

    </div>
  `;

  document.getElementById('backToTitles').onclick =
    render;

  document.getElementById('saveTitle').onclick = () => {
    const title =
      document
        .getElementById('customTitleInput')
        .value
        .trim();

    if(!title){
      alert('Please enter a title.');
      return;
    }

    state.a.title = title;
    state.i++;
    render();
  };
}

function summary(){
  bar.style.width = '100%';

  app.innerHTML = `
    <h2>Your Project Summary</h2>

    ${Object.entries(state.a)
      .map(([k,v])=>`
        <p>
          <b>${k}:</b> ${v}
        </p>
      `)
      .join('')}

    <div class="nav">

      <button id="back">
        Back
      </button>

      <button id="gen" class="primary">
        ${state.blueprint ? 'Regenerate Blueprint' : 'Create My Blueprint'}
      </button>

    </div>

    ${
      state.blueprint
        ? `
          <div class="nav">
            <button id="savedProjects">
              Saved Projects (${getSavedProjects().length})
            </button>

            <button id="newProject">
              Start New Project
            </button>
          </div>
        `
        : ''
    }

    <p id="loading" class="hidden">
      Creating your blueprint...
    </p>
  `;

  document.getElementById('back').onclick = () => {
    state.i--;
    render();
  };

  document.getElementById('gen').onclick = () => {
    generate('blueprint');
  };

  const savedProjects =
    document.getElementById('savedProjects');

  if(savedProjects){
    savedProjects.onclick = renderSavedProjects;
  }

  const newProject =
    document.getElementById('newProject');

  if(newProject){
    newProject.onclick = startNewProject;
  }
}

async function generate(action){
  const loading =
    document.getElementById('loading');

  if(loading){
    loading.classList.remove('hidden');
  }

  try{
    const r = await fetch(
      '/.netlify/functions/generate',
      {
        method:'POST',

        headers:{
          'Content-Type':'application/json'
        },

        body:JSON.stringify({
          answers:state.a,
          action,
          blueprint:state.blueprint
        })
      }
    );

    const rawText =
      await r.text();

    let d;

    try{
      d = JSON.parse(rawText);
    }

    catch{
      throw new Error(
        'The Netlify function returned an unexpected response.'
      );
    }

    if(!r.ok){
      throw new Error(
        d.error || 'Generation failed'
      );
    }

    output.textContent =
      d.output || 'No output returned';

    if(action === 'blueprint'){
      state.blueprint =
        d.output || '';

      saveCurrentProject();
    }

    result.classList.remove('hidden');

    renderNextStepButtons();
  }

  catch(e){
    output.textContent =
      'Error: ' + e.message;

    result.classList.remove('hidden');
  }

  if(loading){
    loading.classList.add('hidden');
  }
}

function renderNextStepButtons(){
  const old =
    document.getElementById('nextStepPanel');

  if(old){
    old.remove();
  }

  const panel =
    document.createElement('div');

  panel.id =
    'nextStepPanel';

  panel.innerHTML = `
    <h3>What would you like to create next?</h3>

    <div class="choices">

      <button class="choice next-step" data-action="page-prompts">
        A. Create Detailed Page Prompts
      </button>

      <button class="choice next-step" data-action="cover-prompts">
        B. Create Front + Back Cover Prompts
      </button>

      <button class="choice next-step" data-action="print-map">
        C. Create Print Map
      </button>

      <button class="choice next-step" data-action="marketing">
        D. Create Marketing Extras
      </button>

      <button class="choice next-step" data-action="revise">
        E. Revise Blueprint
      </button>

      <button class="choice" id="saveProjectNow">
        Save Project
      </button>

      <button class="choice" id="openSavedProjects">
        Saved Projects (${getSavedProjects().length})
      </button>

    </div>

    <p id="nextLoading" class="hidden">
      Creating your next section...
    </p>
  `;

  result.appendChild(panel);

  document.querySelectorAll('.next-step').forEach(b => {
    b.onclick = async () => {
      const nextLoading =
        document.getElementById('nextLoading');

      if(nextLoading){
        nextLoading.classList.remove('hidden');
      }

      await generate(b.dataset.action);

      if(nextLoading){
        nextLoading.classList.add('hidden');
      }
    };
  });

  document.getElementById('saveProjectNow').onclick = () => {
    saveCurrentProject();

    alert('Project saved in this browser.');
  };

  document.getElementById('openSavedProjects').onclick =
    renderSavedProjects;
}

document.getElementById('copyBtn').onclick = () => {
  navigator.clipboard.writeText(
    output.textContent
  );
};

function escapeHtml(value){
  return String(value ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

render();
