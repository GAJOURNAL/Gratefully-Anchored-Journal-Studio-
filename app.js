const app = document.getElementById('app');
const bar = document.getElementById('bar');
const result = document.getElementById('result');
const output = document.getElementById('output');

const PROJECTS_KEY = 'gracefullyAnchoredProjectsV1';
const CHARACTERS_KEY = 'gracefullyAnchoredCharactersV1';

const state = {
  i: 0,
  a: {},
  titleGroup: 0,
  blueprint: '',
  currentProjectId: null,
  currentCharacterId: null
};

/* =========================================================
   BASE QUESTIONS
========================================================= */

const baseQuestions = [
  {
    id: 'type',
    q: 'What would you like to create today?',
    o: [
      'Complete Christian journal',
      'Devotional or workbook',
      'Front + back journal cover',
      'Surprise Me'
    ]
  },
  {
    id: 'size',
    q: 'What size would you like?',
    o: ['6 x 9', '8 x 10', '8.5 x 11', 'A4', 'Surprise Me']
  },
  {
    id: 'style',
    q: 'Choose your overall style.',
    o: [
      'Elegant Feminine',
      'Luxury Christian',
      'Soft Botanical',
      'Modern Minimal',
      'Surprise Me'
    ]
  },
  {
    id: 'theme',
    q: 'What theme fits this project best?',
    o: [
      'Healing',
      'Prayer',
      'Gratitude',
      'Faith',
      'Spiritual Growth',
      'Surprise Me'
    ]
  },
  {
    id: 'audience',
    q: 'Who is this for?',
    o: [
      'Women of Faith',
      'Teen Girls',
      'Christian Entrepreneurs',
      'Women in Ministry',
      'General Christian Audience',
      'Surprise Me'
    ]
  },
  {
    id: 'title',
    q: 'Choose a title for your project.',
    type: 'title-choice'
  },
  {
    id: 'character',
    q: 'Would you like a female character included?',
    o: ['Yes', 'No', 'Let the studio decide', 'Surprise Me']
  }
];

/* =========================================================
   CHARACTER BUILDER MENUS
========================================================= */

const skinTones = [
  'Honey',
  'Caramel',
  'Medium Brown',
  'Rich Brown',
  'Deep Cocoa',
  'Deep Espresso',
  'Deep Ebony',
  'Olive',
  'Let me describe it',
  'Surprise Me'
];

const hairGroups = [
  ['Messy Updo Bun', 'Locs', 'Long Soft Waves', 'Long Curls', 'Natural Afro', 'Surprise Me'],
  ['Box Braids', 'Long Braids', 'Twist-Out', 'Soft Low Bun', 'High Bun', 'Shoulder-Length Curls'],
  ['Long Straight Hair', 'Shoulder-Length Waves', 'Short Curly Style', 'Sleek Bob', 'Ponytail', 'Short Pixie'],
  ['Silver or Salt-and-Pepper Hair', 'Let me describe my own hairstyle']
];

const clothingStyles = [
  'Soft feminine casual',
  'Elegant modest fashion',
  'Cozy faith-journal style',
  'Professional polished',
  'Boho feminine',
  'Contemporary chic',
  'Relaxed everyday',
  'Flowing dresses and skirts',
  'Church-ready elegant',
  'Luxurious loungewear',
  'Soft feminine dress',
  'Business chic',
  'Let me describe the outfit',
  'Surprise Me'
];

const moods = [
  'Peaceful and prayerful',
  'Warm and encouraging',
  'Joyful and uplifting',
  'Reflective and thoughtful',
  'Hopeful and confident',
  'Soft and feminine',
  'Calm and elegant',
  'Quietly strong',
  'Gentle and vulnerable',
  'Focused and purposeful',
  'Match the mood to the journal page',
  'Surprise Me'
];

const illustrationStyles = [
  'Soft Watercolor',
  'Semi-Realistic Watercolor',
  'Soft Painterly',
  'Semi-Realistic Digital Illustration',
  'Soft Realistic Portrait',
  'Luxury Editorial Illustration',
  'Surprise Me'
];

const outfitColorChoices = [
  'Soft neutrals and feminine pastels',
  'Give me a wider color selection',
  'Let me type the exact colors I want',
  'Surprise Me'
];

const accessories = [
  'Small gold hoops',
  'Small silver hoops',
  'Stud earrings',
  'Pearl earrings',
  'Delicate necklace',
  'Cross necklace',
  'Layered necklaces',
  'Gold bracelet',
  'Silver bracelet',
  'Watch',
  'Glasses',
  'Headband',
  'Scarf',
  'Hair accessory',
  'Handbag or tote',
  'Combination of accessories',
  'No accessories',
  'Let me describe my own',
  'Surprise Me'
];

const settings = [
  'Cozy prayer room',
  'Peaceful bedroom',
  'Elegant home office',
  'Sunlit reading nook',
  'Garden',
  'Church interior',
  'Quiet café',
  'Living room',
  'Balcony or patio',
  'Beach or lakeside',
  'Nature trail',
  'Soft studio background',
  'Walking forward with self confidence',
  'Let me describe it',
  'Surprise Me'
];

const poses = [
  'Praying',
  'Journaling',
  'Reading the Bible',
  'Reading a devotional',
  'Sitting quietly',
  'Standing peacefully',
  'Walking outdoors',
  'Looking toward natural light',
  'Holding a journal',
  'Holding a Bible',
  'Drinking tea or coffee',
  'Sitting in a garden',
  'Reflecting by a window',
  'Hands gently clasped',
  'Working at a desk',
  'Let me describe it',
  'Surprise Me'
];

const faithElements = [
  'Open Bible',
  'Closed Bible',
  'Cross necklace',
  'Small wall cross',
  'Scripture card',
  'Prayer journal',
  'Candle beside Bible',
  'Church window light',
  'Devotional book',
  'Hands resting near an open Bible',
  'Floral Scripture bookmark',
  'Subtle cross in the background',
  'Butterflies',
  'Sparkles',
  'Soft flowers',
  'Gold Foil Accents',
  'Let me describe it',
  'Surprise Me'
];

const framings = [
  'Head-and-shoulders portrait',
  'Bust portrait',
  'Waist-up',
  'Three-quarter body',
  'Full-body',
  'Seated waist-up',
  'Seated full-body',
  'Side-profile portrait',
  'Over-the-shoulder view',
  'Walking full-body view',
  'Let me describe the framing',
  'Surprise Me'
];

const lightingOptions = [
  'Soft morning light',
  'Warm golden-hour light',
  'Bright natural window light',
  'Cozy indoor lamp light',
  'Soft candlelit atmosphere',
  'Gentle sunrise glow',
  'Peaceful sunset light',
  'Clean bright studio lighting',
  'Soft diffused light',
  'Moody but peaceful lighting',
  'Let me describe it',
  'Surprise Me'
];

const decorativeElements = [
  'Soft florals',
  'Greenery and leaves',
  'Blush florals',
  'Lavender florals',
  'White flowers',
  'Gold accents',
  'Rose-gold accents',
  'Soft sparkles or light glow',
  'Butterflies',
  'Botanical border details',
  'Delicate vines',
  'Minimal corner florals',
  'Soft watercolor shapes',
  'Elegant frames, ribbon, and subtle stars',
  'Let me describe it',
  'Surprise Me'
];

const textOptions = [
  'Page title',
  'Short faith-based phrase',
  'Scripture reference only',
  'Full Scripture verse',
  'Affirmation',
  'Prayer prompt',
  'Reflection prompt',
  'Section heading',
  'Closing phrase',
  'Title + short phrase',
  'Let me type my own text',
  'Surprise Me'
];

const groupSizes = [
  'Two women',
  'Three women',
  'Four women',
  'Small group of 5–6 women',
  'Let me choose the exact number',
  'Surprise Me'
];

/* =========================================================
   DYNAMIC QUESTION LIST
========================================================= */

function getQuestions() {
  const q = [...baseQuestions];

  const characterAnswer = state.a.character;
  const characterActive =
    characterAnswer === 'Yes' ||
    characterAnswer === 'Let the studio decide' ||
    characterAnswer === 'Surprise Me';

  if (characterActive) {
    q.push({
      id: 'characterMode',
      q: 'How would you like to create your female character?',
      o: getCharacterModeOptions()
    });

    if (state.a.characterMode === 'Reuse a Saved Character') {
      q.push({
        id: 'savedCharacterChoice',
        q: 'Which saved character would you like to reuse?',
        type: 'saved-character-choice'
      });
    }

    if (state.a.characterMode === 'Quick Customization') {
      q.push(
        { id:'skinTone', q:'What skin tone would you like?', type:'paged-choice', groups:chunk(skinTones, 6) },
        { id:'hair', q:'What hair look would you like?', type:'paged-choice', groups:hairGroups },
        { id:'clothingStyle', q:'What clothing style would you like?', type:'paged-choice', groups:chunk(clothingStyles, 6) },
        { id:'mood', q:'What mood or expression would you like?', type:'paged-choice', groups:chunk(moods, 6) },
        { id:'illustrationStyle', q:'What illustration style would you like?', type:'paged-choice', groups:chunk(illustrationStyles, 6) },
        { id:'outfitColors', q:'How would you like to choose her outfit colors?', o:outfitColorChoices },
        { id:'accessories', q:'What accessories would you like?', type:'paged-choice', groups:chunk(accessories, 6) }
      );
    }

    if (state.a.characterMode === 'Full Customization') {
      q.push(
        {
          id:'ageAppearance',
          q:'What age appearance would you like?',
          o:['20s','30s','40s','50s','60+','Let the studio choose','Surprise Me']
        },
        { id:'skinTone', q:'What skin tone would you like?', type:'paged-choice', groups:chunk(skinTones, 6) },
        { id:'hair', q:'What hair look would you like?', type:'paged-choice', groups:hairGroups },
        { id:'clothingStyle', q:'What clothing style would you like?', type:'paged-choice', groups:chunk(clothingStyles, 6) },
        { id:'outfitColors', q:'How would you like to choose her outfit colors?', o:outfitColorChoices },
        { id:'accessories', q:'What accessories would you like?', type:'paged-choice', groups:chunk(accessories, 6) },
        { id:'mood', q:'What mood or expression would you like?', type:'paged-choice', groups:chunk(moods, 6) },
        { id:'illustrationStyle', q:'What illustration style would you like?', type:'paged-choice', groups:chunk(illustrationStyles, 6) },
        {
          id:'backgroundChoice',
          q:'Would you like to choose the background or setting?',
          o:['Yes — show me setting options','No — let the studio choose','No background / simple clean background',"I'll describe the setting myself"]
        }
      );

      if (state.a.backgroundChoice === 'Yes — show me setting options') {
        q.push({ id:'background', q:'Choose the background or setting.', type:'paged-choice', groups:chunk(settings, 6) });
      } else if (state.a.backgroundChoice === "I'll describe the setting myself") {
        q.push({ id:'backgroundCustom', q:'Describe the background or setting.', t:'textarea' });
      }

      q.push({
        id:'poseChoice',
        q:'Would you like to choose what the woman is doing?',
        o:['Yes — show me pose/activity options','No — let the studio choose based on the journal page','Keep the pose simple and natural',"I'll describe the pose myself"]
      });

      if (state.a.poseChoice === 'Yes — show me pose/activity options') {
        q.push({ id:'pose', q:'Choose the pose or activity.', type:'paged-choice', groups:chunk(poses, 6) });
      } else if (state.a.poseChoice === "I'll describe the pose myself") {
        q.push({ id:'poseCustom', q:'Describe the pose or activity.', t:'textarea' });
      }

      q.push({
        id:'faithElementChoice',
        q:'Would you like to include a Christian faith element?',
        o:['Yes — show me faith-element options','No — let the studio decide when appropriate','No faith element on this image',"I'll describe the faith element myself"]
      });

      if (state.a.faithElementChoice === 'Yes — show me faith-element options') {
        q.push({ id:'faithElement', q:'Choose a faith element.', type:'paged-choice', groups:chunk(faithElements, 6) });
      } else if (state.a.faithElementChoice === "I'll describe the faith element myself") {
        q.push({ id:'faithElementCustom', q:'Describe the faith element.', t:'textarea' });
      }

      q.push({
        id:'framingChoice',
        q:'Would you like to choose how the woman is framed?',
        o:['Yes — show me framing options','No — let the studio choose what fits the page best','Keep the framing simple and natural',"I'll describe the framing myself"]
      });

      if (state.a.framingChoice === 'Yes — show me framing options') {
        q.push({ id:'framing', q:'Choose the character framing.', type:'paged-choice', groups:chunk(framings, 6) });
      } else if (state.a.framingChoice === "I'll describe the framing myself") {
        q.push({ id:'framingCustom', q:'Describe the framing.', t:'textarea' });
      }

      q.push({
        id:'lightingChoice',
        q:'Would you like to choose the lighting or atmosphere?',
        o:['Yes — show me lighting options','No — let the studio choose what fits the page best','Keep the lighting soft and natural',"I'll describe the lighting myself"]
      });

      if (state.a.lightingChoice === 'Yes — show me lighting options') {
        q.push({ id:'lighting', q:'Choose the lighting or atmosphere.', type:'paged-choice', groups:chunk(lightingOptions, 6) });
      } else if (state.a.lightingChoice === "I'll describe the lighting myself") {
        q.push({ id:'lightingCustom', q:'Describe the lighting or atmosphere.', t:'textarea' });
      }

      q.push({
        id:'decorChoice',
        q:'Would you like decorative elements in the image?',
        o:['Yes — show me decorative options','No — let the studio choose if needed','No decorative elements',"I'll describe the decorations myself"]
      });

      if (state.a.decorChoice === 'Yes — show me decorative options') {
        q.push({ id:'decorativeElements', q:'Choose decorative elements.', type:'paged-choice', groups:chunk(decorativeElements, 6) });
      } else if (state.a.decorChoice === "I'll describe the decorations myself") {
        q.push({ id:'decorativeCustom', q:'Describe the decorations.', t:'textarea' });
      }

      q.push({
        id:'textChoice',
        q:'Would you like text included with the character image?',
        o:['Yes — show me text options','No — image only','Let the studio decide if text is appropriate',"I'll provide my own wording"]
      });

      if (state.a.textChoice === 'Yes — show me text options') {
        q.push({ id:'characterText', q:'Choose the text type.', type:'paged-choice', groups:chunk(textOptions, 6) });
      } else if (state.a.textChoice === "I'll provide my own wording") {
        q.push({ id:'characterTextCustom', q:'Type the exact wording you want.', t:'textarea' });
      }

      q.push({
        id:'multipleWomenChoice',
        q:'Would you like more than one woman in the image?',
        o:['Yes — show me group-size options','No — one woman only','Let the studio decide if multiple women fit the page',"I'll describe the group myself"]
      });

      if (state.a.multipleWomenChoice === 'Yes — show me group-size options') {
        q.push({ id:'groupSize', q:'Choose the group size.', o:groupSizes });
      } else if (state.a.multipleWomenChoice === "I'll describe the group myself") {
        q.push({ id:'groupCustom', q:'Describe the group you want.', t:'textarea' });
      }
    }

    if (state.a.characterMode === 'Surprise Me') {
      q.push({
        id:'surpriseCharacterNote',
        q:'Gracefully Anchored will create an original woman that fits your project.',
        o:['Continue']
      });
    }

    q.push({
      id:'recurringCharacter',
      q:'Would you like to reuse this woman on future pages?',
      o:[
        'Yes — keep her identity consistent',
        'Yes — keep her face, hair, and skin tone but allow new outfits and scenes',
        'No — create a new woman next time',
        'Let the studio decide based on the journal flow'
      ]
    });
  }

  q.push(
    {
      id:'font',
      q:'Choose your font direction.',
      o:[
        'Elegant Serif + Delicate Script',
        'Modern Serif + Clean Sans-Serif',
        'Soft Handwritten + Classic Serif',
        'Classic Serif',
        'Surprise Me'
      ]
    },
    {
      id:'details',
      q:'Any additional details?',
      t:'textarea'
    }
  );

  return q;
}

/* =========================================================
   SAVED CHARACTERS
========================================================= */

function getSavedCharacters() {
  try {
    return JSON.parse(localStorage.getItem(CHARACTERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCharacterIfNeeded() {
  const choice = state.a.recurringCharacter || '';
  if (!choice.startsWith('Yes —')) return;

  const characters = getSavedCharacters();

  if (state.currentCharacterId) return;

  const nextNumber = characters.length + 1;
  const id = `Woman ${String(nextNumber).padStart(2, '0')}`;

  const profile = {
    id,
    skinTone: state.a.skinTone || '',
    hair: state.a.hair || '',
    ageAppearance: state.a.ageAppearance || '',
    clothingStyle: state.a.clothingStyle || '',
    accessories: state.a.accessories || '',
    mood: state.a.mood || '',
    illustrationStyle: state.a.illustrationStyle || '',
    reuseMode: choice
  };

  characters.push(profile);
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
  state.currentCharacterId = id;
  state.a.savedCharacterId = id;
}

function getCharacterModeOptions() {
  const options = [
    'Full Customization',
    'Quick Customization',
    'Surprise Me'
  ];

  if (getSavedCharacters().length) {
    options.push('Reuse a Saved Character');
  }

  return options;
}

/* =========================================================
   SAVED PROJECTS
========================================================= */

function getSavedProjects() {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeSavedProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function saveCurrentProject() {
  if (!state.blueprint) return;

  saveCharacterIfNeeded();

  const projects = getSavedProjects();
  const id = state.currentProjectId || `ga-${Date.now()}`;

  const item = {
    id,
    title: state.a.title || 'Untitled Project',
    type: state.a.type || '',
    theme: state.a.theme || '',
    answers: { ...state.a },
    blueprint: state.blueprint,
    updatedAt: new Date().toISOString()
  };

  const idx = projects.findIndex(p => p.id === id);

  if (idx >= 0) projects[idx] = item;
  else projects.unshift(item);

  writeSavedProjects(projects);
  state.currentProjectId = id;
}

function startNewProject() {
  state.i = 0;
  state.a = {};
  state.titleGroup = 0;
  state.blueprint = '';
  state.currentProjectId = null;
  state.currentCharacterId = null;
  output.textContent = '';
  result.classList.add('hidden');
  render();
}

function renderSavedProjects() {
  const projects = getSavedProjects();

  result.classList.add('hidden');
  bar.style.width = '100%';

  app.innerHTML = `
    <h2>Saved Projects</h2>
    <p>These projects are saved in this browser on this device.</p>

    <div class="nav">
      <button id="newProject" class="primary">+ Create New Project</button>
    </div>

    <div class="choices">
      ${
        projects.length
          ? projects.map(p => `
              <div class="choice" style="cursor:default">
                <div><b>${escapeHtml(p.title)}</b></div>
                <div style="font-size:.9rem;opacity:.8">
                  ${escapeHtml(p.type)}
                  ${p.theme ? ' · ' + escapeHtml(p.theme) : ''}
                </div>
                <div class="nav">
                  <button class="openSaved" data-id="${p.id}">Open</button>
                  <button class="deleteSaved" data-id="${p.id}">Delete</button>
                </div>
              </div>
            `).join('')
          : '<div class="choice" style="cursor:default">No saved projects yet.</div>'
      }
    </div>

    <div class="nav">
      <button id="backHome">Back</button>
    </div>
  `;

  document.getElementById('newProject').onclick = startNewProject;
  document.getElementById('backHome').onclick = startNewProject;

  document.querySelectorAll('.openSaved').forEach(btn => {
    btn.onclick = () => {
      const p = projects.find(x => x.id === btn.dataset.id);
      if (!p) return;

      state.a = { ...p.answers };
      state.blueprint = p.blueprint || '';
      state.currentProjectId = p.id;
      state.i = getQuestions().length;

      output.textContent = state.blueprint;
      summary();
      result.classList.remove('hidden');
      renderNextStepButtons();
    };
  });

  document.querySelectorAll('.deleteSaved').forEach(btn => {
    btn.onclick = () => {
      if (!confirm('Delete this saved project?')) return;
      writeSavedProjects(projects.filter(p => p.id !== btn.dataset.id));
      renderSavedProjects();
    };
  });
}

/* =========================================================
   TITLE OPTIONS
========================================================= */

function getTitleGroups() {
  const theme = (state.a.theme || '').toLowerCase();

  if (theme.includes('healing')) return [
    ['Healing in His Presence','Grace for the Healing Journey','Held While I Heal','Restored by Faith'],
    ['God Meets Me Here','Healing One Day at a Time','Grace in the Broken Places','Renewed in His Presence']
  ];

  if (theme.includes('prayer')) return [
    ['In His Presence','A Life of Prayer','Draw Near','Prayers from the Heart'],
    ['My Quiet Place with God','Grace in the Secret Place','Covered in Prayer','When I Talk to God']
  ];

  if (theme.includes('gratitude')) return [
    ['Counting Blessings','A Grateful Heart','Grace & Gratitude','Thankful in His Presence'],
    ['Blessed Beyond Measure','Everyday Gratitude','Gifts of Grace','Joy in the Little Things']
  ];

  if (theme.includes('faith')) return [
    ['Faith Over Fear','Anchored in Faith','Walking by Faith','Courage Through Christ'],
    ['Fearless Through Him','Rooted in His Promises','Faith That Holds','Standing on His Word']
  ];

  if (theme.includes('spiritual growth')) return [
    ['Rooted, Refined & Renewed','Growing in Grace','Becoming Who God Called Me to Be','Deeper with God'],
    ['Rooted in His Word','A Journey of Spiritual Growth','Grace for the Becoming','Growing Stronger in Faith']
  ];

  return [
    ['Gracefully Anchored','Rooted in Grace','Held by His Promises','A Journey with God'],
    ['Faithfully Becoming','Grace for the Journey','Anchored in His Love','Walking with God']
  ];
}

/* =========================================================
   RENDER
========================================================= */

function render() {
  result.classList.add('hidden');

  const qs = getQuestions();

  if (state.i >= qs.length) {
    summary();
    return;
  }

  bar.style.width = ((state.i + 1) / qs.length * 100) + '%';

  const q = qs[state.i];

  if (q.type === 'title-choice') {
    renderTitleChoice(q);
    return;
  }

  if (q.type === 'paged-choice') {
    renderPagedChoice(q);
    return;
  }

  if (q.type === 'saved-character-choice') {
    renderSavedCharacterChoice(q);
    return;
  }

  if (q.o) {
    renderChoiceQuestion(q);
    return;
  }

  renderTextQuestion(q);
}

function renderChoiceQuestion(q) {
  app.innerHTML = `
    <h2>${q.q}</h2>

    <div class="choices">
      ${q.o.map((x,n)=>`
        <button class="choice" data-v="${escapeAttr(x)}">
          <b>${String.fromCharCode(65+n)}.</b> ${escapeHtml(x)}
        </button>
      `).join('')}
    </div>

    ${
      state.i === 0 && getSavedProjects().length
        ? `<div class="nav"><button id="savedProjects">Saved Projects (${getSavedProjects().length})</button></div>`
        : ''
    }

    <div class="nav">
      <button id="back" ${state.i===0?'disabled':''}>Back</button>
    </div>
  `;

  document.querySelectorAll('.choice').forEach(btn => {
    btn.onclick = () => {
      state.a[q.id] = btn.dataset.v;
      state.i++;
      render();
    };
  });

  const savedProjects = document.getElementById('savedProjects');
  if (savedProjects) savedProjects.onclick = renderSavedProjects;

  const back = document.getElementById('back');
  if (back) back.onclick = () => {
    if (state.i > 0) {
      state.i--;
      render();
    }
  };
}

function renderPagedChoice(q) {
  const pageKey = `${q.id}Page`;
  if (state.a[pageKey] === undefined) state.a[pageKey] = 0;

  const page = state.a[pageKey];
  const options = q.groups[page] || q.groups[0];

  app.innerHTML = `
    <h2>${q.q}</h2>

    <div class="choices">
      ${options.map((x,n)=>`
        <button class="choice paged-option" data-v="${escapeAttr(x)}">
          <b>${String.fromCharCode(65+n)}.</b> ${escapeHtml(x)}
        </button>
      `).join('')}

      ${
        q.groups.length > 1
          ? `<button class="choice" id="moreChoices"><b>+</b> Show Me More Choices</button>`
          : ''
      }
    </div>

    <div class="nav">
      <button id="back">Back</button>
    </div>
  `;

  document.querySelectorAll('.paged-option').forEach(btn => {
    btn.onclick = () => {
      state.a[q.id] = btn.dataset.v;
      delete state.a[pageKey];
      state.i++;
      render();
    };
  });

  const more = document.getElementById('moreChoices');
  if (more) {
    more.onclick = () => {
      state.a[pageKey] = (page + 1) % q.groups.length;
      render();
    };
  }

  document.getElementById('back').onclick = () => {
    delete state.a[pageKey];
    if (state.i > 0) {
      state.i--;
      render();
    }
  };
}

function renderSavedCharacterChoice(q) {
  const characters = getSavedCharacters();

  app.innerHTML = `
    <h2>${q.q}</h2>

    <div class="choices">
      ${
        characters.length
          ? characters.map((c,n)=>`
              <button class="choice saved-character" data-id="${escapeAttr(c.id)}">
                <b>${String.fromCharCode(65+n)}.</b>
                ${escapeHtml(c.id)}
                ${c.skinTone ? ' · ' + escapeHtml(c.skinTone) : ''}
                ${c.hair ? ' · ' + escapeHtml(c.hair) : ''}
              </button>
            `).join('')
          : '<div class="choice" style="cursor:default">No saved characters yet.</div>'
      }
    </div>

    <div class="nav">
      <button id="back">Back</button>
    </div>
  `;

  document.querySelectorAll('.saved-character').forEach(btn => {
    btn.onclick = () => {
      const c = characters.find(x => x.id === btn.dataset.id);
      if (!c) return;

      state.currentCharacterId = c.id;
      state.a.savedCharacterId = c.id;
      state.a.skinTone = c.skinTone || '';
      state.a.hair = c.hair || '';
      state.a.ageAppearance = c.ageAppearance || '';
      state.a.clothingStyle = c.clothingStyle || '';
      state.a.accessories = c.accessories || '';
      state.a.mood = c.mood || '';
      state.a.illustrationStyle = c.illustrationStyle || '';

      state.i++;
      render();
    };
  });

  document.getElementById('back').onclick = () => {
    if (state.i > 0) {
      state.i--;
      render();
    }
  };
}

function renderTextQuestion(q) {
  const control =
    q.t === 'textarea'
      ? `<textarea id="entry">${escapeHtml(state.a[q.id]||'')}</textarea>`
      : `<input id="entry" value="${escapeAttr(state.a[q.id]||'')}">`;

  app.innerHTML = `
    <h2>${q.q}</h2>
    ${control}

    <div class="nav">
      <button id="back">Back</button>
      <button id="next" class="primary">Next</button>
    </div>
  `;

  document.getElementById('next').onclick = () => {
    state.a[q.id] = document.getElementById('entry').value.trim() || 'None';
    state.i++;
    render();
  };

  document.getElementById('back').onclick = () => {
    if (state.i > 0) {
      state.i--;
      render();
    }
  };
}

/* =========================================================
   TITLE
========================================================= */

function renderTitleChoice(q) {
  const groups = getTitleGroups();
  const titles = groups[state.titleGroup];

  app.innerHTML = `
    <h2>${q.q}</h2>

    <p>Choose one, let Gracefully Anchored surprise you, or enter your own title.</p>

    <div class="choices">
      ${titles.map((title,index)=>`
        <button class="choice title-option" data-v="${escapeAttr(title)}">
          <b>${String.fromCharCode(65+index)}.</b>
          ${escapeHtml(title)}
        </button>
      `).join('')}

      <button class="choice" id="surpriseTitle"><b>E.</b> Surprise Me</button>
      <button class="choice" id="customTitle"><b>F.</b> Let Me Type My Own Title</button>
      <button class="choice" id="moreTitles"><b>G.</b> Show Me More Choices</button>
    </div>

    <div class="nav">
      <button id="back">Back</button>
    </div>
  `;

  document.querySelectorAll('.title-option').forEach(btn => {
    btn.onclick = () => {
      state.a.title = btn.dataset.v;
      state.i++;
      render();
    };
  });

  document.getElementById('surpriseTitle').onclick = () => {
    const all = groups.flat();
    state.a.title = all[Math.floor(Math.random() * all.length)];
    state.i++;
    render();
  };

  document.getElementById('customTitle').onclick = renderCustomTitle;

  document.getElementById('moreTitles').onclick = () => {
    state.titleGroup = (state.titleGroup + 1) % groups.length;
    render();
  };

  document.getElementById('back').onclick = () => {
    if (state.i > 0) {
      state.i--;
      render();
    }
  };
}

function renderCustomTitle() {
  app.innerHTML = `
    <h2>Enter your title.</h2>

    <input
      id="customTitleInput"
      type="text"
      placeholder="Example: Faith Over Fear"
      value="${escapeAttr(state.a.title || '')}"
    >

    <div class="nav">
      <button id="backToTitles">Back</button>
      <button id="saveTitle" class="primary">Use This Title</button>
    </div>
  `;

  document.getElementById('backToTitles').onclick = render;

  document.getElementById('saveTitle').onclick = () => {
    const title = document.getElementById('customTitleInput').value.trim();

    if (!title) {
      alert('Please enter a title.');
      return;
    }

    state.a.title = title;
    state.i++;
    render();
  };
}

/* =========================================================
   SUMMARY / GENERATION
========================================================= */

function summary() {
  const qs = getQuestions();
  bar.style.width = '100%';

  const visibleAnswers = Object.entries(state.a)
    .filter(([key]) => !key.endsWith('Page'));

  app.innerHTML = `
    <h2>Your Project Summary</h2>

    ${visibleAnswers.map(([k,v])=>`
      <p><b>${escapeHtml(prettyLabel(k))}:</b> ${escapeHtml(v)}</p>
    `).join('')}

    <div class="nav">
      <button id="back">Back</button>
      <button id="gen" class="primary">
        ${state.blueprint ? 'Regenerate Blueprint' : 'Create My Blueprint'}
      </button>
    </div>

    ${
      state.blueprint
        ? `
          <div class="nav">
            <button id="savedProjects">Saved Projects (${getSavedProjects().length})</button>
            <button id="newProject">Start New Project</button>
          </div>
        `
        : ''
    }

    <p id="loading" class="hidden">Creating your blueprint...</p>
  `;

  document.getElementById('back').onclick = () => {
    state.i = Math.max(0, qs.length - 1);
    render();
  };

  document.getElementById('gen').onclick = () => generate('blueprint');

  const savedProjects = document.getElementById('savedProjects');
  if (savedProjects) savedProjects.onclick = renderSavedProjects;

  const newProject = document.getElementById('newProject');
  if (newProject) newProject.onclick = startNewProject;
}

async function generate(action) {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.remove('hidden');

  try {
    const r = await fetch('/.netlify/functions/generate', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        answers:state.a,
        action,
        blueprint:state.blueprint
      })
    });

    const rawText = await r.text();
    let d;

    try {
      d = JSON.parse(rawText);
    } catch {
      throw new Error('The Netlify function returned an unexpected response.');
    }

    if (!r.ok) throw new Error(d.error || 'Generation failed');

    output.textContent = d.output || 'No output returned';

    if (action === 'blueprint') {
      state.blueprint = d.output || '';
      saveCurrentProject();
    }

    result.classList.remove('hidden');
    renderNextStepButtons();

  } catch (e) {
    output.textContent = 'Error: ' + e.message;
    result.classList.remove('hidden');
  }

  if (loading) loading.classList.add('hidden');
}

function renderNextStepButtons() {
  const old = document.getElementById('nextStepPanel');
  if (old) old.remove();

  const panel = document.createElement('div');
  panel.id = 'nextStepPanel';

  panel.innerHTML = `
    <h3>What would you like to create next?</h3>

    <div class="choices">
      <button class="choice next-step" data-action="page-prompts">A. Create Detailed Page Prompts</button>
      <button class="choice next-step" data-action="cover-prompts">B. Create Front + Back Cover Prompts</button>
      <button class="choice next-step" data-action="print-map">C. Create Print Map</button>
      <button class="choice next-step" data-action="marketing">D. Create Marketing Extras</button>
      <button class="choice next-step" data-action="revise">E. Revise Blueprint</button>
      <button class="choice" id="saveProjectNow">Save Project</button>
      <button class="choice" id="openSavedProjects">Saved Projects (${getSavedProjects().length})</button>
    </div>

    <p id="nextLoading" class="hidden">Creating your next section...</p>
  `;

  result.appendChild(panel);

  document.querySelectorAll('.next-step').forEach(btn => {
    btn.onclick = async () => {
      const nl = document.getElementById('nextLoading');
      if (nl) nl.classList.remove('hidden');
      await generate(btn.dataset.action);
      if (nl) nl.classList.add('hidden');
    };
  });

  document.getElementById('saveProjectNow').onclick = () => {
    saveCurrentProject();
    alert('Project saved in this browser.');
  };

  document.getElementById('openSavedProjects').onclick = renderSavedProjects;
}

/* =========================================================
   HELPERS
========================================================= */

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function prettyLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

document.getElementById('copyBtn').onclick = () => {
  navigator.clipboard.writeText(output.textContent);
};

render();
