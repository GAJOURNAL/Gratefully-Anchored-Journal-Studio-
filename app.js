const app = document.getElementById('app');
const bar = document.getElementById('bar');
const result = document.getElementById('result');
const output = document.getElementById('output');

const PROJECTS_KEY = 'gracefullyAnchoredProjectsV1';
const CHARACTERS_KEY = 'gracefullyAnchoredCharactersV1';

const state = {
  step: 0,
  answers: {},
  blueprint: '',
  currentProjectId: null,
  currentCharacterId: null,
  titlePool: [],
  titleOffset: 0,
  titleTheme: ''
};

const ui = {
  pageByQuestion: {},
  multiByQuestion: {}
};

/* ---------------------------
   QUESTION DATA
---------------------------- */

const baseQuestions = [
  { id:'type', q:'What would you like to create today?', kind:'single', options:['Complete Christian journal','Devotional or workbook','Front + back journal cover','Surprise Me'] },
  { id:'size', q:'What size would you like?', kind:'single', options:['6 x 9','8 x 10','8.5 x 11','A4','Surprise Me'] },
  { id:'style', q:'Choose your overall style.', kind:'single', options:['Elegant Feminine','Luxury Christian','Soft Botanical','Modern Minimal','Surprise Me'] },
  { id:'theme', q:'What theme fits this project best?', kind:'single', options:['Healing','Prayer','Gratitude','Faith','Spiritual Growth','Surprise Me'] },
  { id:'audience', q:'Who is this for?', kind:'single', options:['Women of Faith','Teen Girls','Christian Entrepreneurs','Women in Ministry','General Christian Audience','Surprise Me'] },
  { id:'title', q:'Choose a title for your project.', kind:'title' },
  { id:'character', q:'Would you like a female character included?', kind:'single', options:['Yes','No','Let the studio decide','Surprise Me'] }
];

const skinToneGroups = [
  ['Deep Ebony','Deep Espresso','Deep Cocoa','Rich Brown','Medium Brown','Surprise Me'],
  ['Caramel','Honey','Olive','Let me describe it']
];

const hairGroups = [
  ['Messy Updo Bun','Locs','Long Soft Waves','Long Curls','Natural Afro','Surprise Me'],
  ['Box Braids','Long Braids','Twist-Out','Soft Low Bun','High Bun','Shoulder-Length Curls'],
  ['Long Straight Hair','Shoulder-Length Waves','Short Curly Style','Sleek Bob','Ponytail','Short Pixie'],
  ['Silver or Salt-and-Pepper Hair','Let me describe my own hairstyle']
];

const clothingGroups = [
  ['Soft feminine casual','Elegant modest fashion','Cozy faith-journal style','Professional polished','Boho feminine','Contemporary chic'],
  ['Relaxed everyday','Flowing dresses and skirts','Church-ready elegant','Luxurious loungewear','Soft feminine dress','Business chic'],
  ['Let me describe the outfit','Surprise Me']
];

const moodGroups = [
  ['Peaceful and prayerful','Warm and encouraging','Joyful and uplifting','Reflective and thoughtful','Hopeful and confident','Soft and feminine'],
  ['Calm and elegant','Quietly strong','Gentle and vulnerable','Focused and purposeful','Match the mood to the journal page','Surprise Me']
];

const illustrationGroups = [
  ['Soft Watercolor','Semi-Realistic Watercolor','Soft Painterly','Semi-Realistic Digital Illustration','Soft Realistic Portrait','Luxury Editorial Illustration'],
  ['Surprise Me']
];

const accessoryGroups = [
  ['Small gold hoops','Small silver hoops','Stud earrings','Pearl earrings','Delicate necklace','Cross necklace'],
  ['Layered necklaces','Gold bracelet','Silver bracelet','Watch','Glasses','Headband'],
  ['Scarf','Hair accessory','Handbag or tote','No accessories','Let me describe my own','Surprise Me']
];

const outfitColorOptions = [
  'Ivory',
  'Cream',
  'White',
  'Black',
  'Navy',
  'Royal Blue',
  'Powder Blue',
  'Lavender',
  'Royal Purple',
  'Blush Pink',
  'Dusty Rose',
  'Burgundy',
  'Sage Green',
  'Emerald Green',
  'Taupe',
  'Camel',
  'Champagne',
  'Soft Gold',
  'Silver',
  'Rose Gold'
];

const accessoryOptions = [
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
  'No accessories',
  'Let me describe my own',
  'Surprise Me'
];

const settingsGroups = [
  ['Cozy prayer room','Peaceful bedroom','Elegant home office','Sunlit reading nook','Garden','Church interior'],
  ['Quiet café','Living room','Balcony or patio','Beach or lakeside','Nature trail','Soft studio background'],
  ['Walking forward with self confidence','Let me describe it','Surprise Me']
];

const poseGroups = [
  ['Praying','Journaling','Reading the Bible','Reading a devotional','Sitting quietly','Standing peacefully'],
  ['Walking outdoors','Looking toward natural light','Holding a journal','Holding a Bible','Drinking tea or coffee','Sitting in a garden'],
  ['Reflecting by a window','Hands gently clasped','Working at a desk','Let me describe it','Surprise Me']
];

const faithGroups = [
  ['Open Bible','Closed Bible','Cross necklace','Small wall cross','Scripture card','Prayer journal'],
  ['Candle beside Bible','Church window light','Devotional book','Hands resting near an open Bible','Floral Scripture bookmark','Subtle cross in the background'],
  ['Butterflies','Sparkles','Soft flowers','Gold Foil Accents','Let me describe it','Surprise Me']
];

const framingGroups = [
  ['Head-and-shoulders portrait','Bust portrait','Waist-up','Three-quarter body','Full-body','Seated waist-up'],
  ['Seated full-body','Side-profile portrait','Over-the-shoulder view','Walking full-body view','Let me describe the framing','Surprise Me']
];

const lightingGroups = [
  ['Soft morning light','Warm golden-hour light','Bright natural window light','Cozy indoor lamp light','Soft candlelit atmosphere','Gentle sunrise glow'],
  ['Peaceful sunset light','Clean bright studio lighting','Soft diffused light','Moody but peaceful lighting','Let me describe it','Surprise Me']
];

const decorGroups = [
  ['Soft florals','Greenery and leaves','Blush florals','Lavender florals','White flowers','Gold accents'],
  ['Rose-gold accents','Soft sparkles or light glow','Butterflies','Botanical border details','Delicate vines','Minimal corner florals'],
  ['Soft watercolor shapes','Elegant frames, ribbon, and subtle stars','Let me describe it','Surprise Me']
];

function getCharacterModeOptions() {
  const options = ['Full Customization','Quick Customization','Surprise Me'];
  if (getSavedCharacters().length) options.push('Reuse a Saved Character');
  return options;
}

function buildQuestions() {
  const q = [...baseQuestions];
  const a = state.answers;

  const characterActive =
    a.character === 'Yes' ||
    a.character === 'Let the studio decide' ||
    a.character === 'Surprise Me';

  if (characterActive) {
    q.push({ id:'characterMode', q:'How would you like to create your female character?', kind:'single', options:getCharacterModeOptions() });

    if (a.characterMode === 'Reuse a Saved Character') {
      q.push({ id:'savedCharacterChoice', q:'Which saved character would you like to reuse?', kind:'saved-character' });
    }

    if (a.characterMode === 'Quick Customization') {
      q.push(
        { id:'skinTone', q:'What complexion / skin tone would you like?', kind:'paged-single', groups:skinToneGroups },
        { id:'hair', q:'What hair look would you like?', kind:'paged-single', groups:hairGroups },
        { id:'clothingStyle', q:'What clothing style would you like?', kind:'paged-single', groups:clothingGroups },
        { id:'mood', q:'What mood or expression would you like?', kind:'paged-single', groups:moodGroups },
        { id:'illustrationStyle', q:'What illustration style would you like?', kind:'paged-single', groups:illustrationGroups },
        { id:'outfitColors', q:'How would you like to choose her outfit colors?', kind:'single', options:['Soft neutrals and feminine pastels','Give me a wider color selection','Let me type the exact colors I want','Surprise Me'] }
      );

      if (a.outfitColors === 'Give me a wider color selection') {
        q.push({ id:'outfitColorSelections', q:'Choose one or more outfit colors by letter, then click Done.', kind:'letter-multi', options:outfitColorOptions });
      }

      if (a.outfitColors === 'Let me type the exact colors I want') {
        q.push({ id:'outfitColorCustom', q:'Type the exact outfit colors you want.', kind:'text' });
      }

      q.push({ id:'accessories', q:'Choose one or more accessories by letter, then click Done.', kind:'letter-multi', options:accessoryOptions });
    }

    if (a.characterMode === 'Full Customization') {
      q.push(
        { id:'ageAppearance', q:'What age appearance would you like?', kind:'single', options:['20s','30s','40s','50s','60+','Let the studio choose','Surprise Me'] },
        { id:'skinTone', q:'What complexion / skin tone would you like?', kind:'paged-single', groups:skinToneGroups },
        { id:'hair', q:'What hair look would you like?', kind:'paged-single', groups:hairGroups },
        { id:'clothingStyle', q:'What clothing style would you like?', kind:'paged-single', groups:clothingGroups },
        { id:'outfitColors', q:'How would you like to choose her outfit colors?', kind:'single', options:['Soft neutrals and feminine pastels','Give me a wider color selection','Let me type the exact colors I want','Surprise Me'] },
        { id:'mood', q:'What mood or expression would you like?', kind:'paged-single', groups:moodGroups },
        { id:'illustrationStyle', q:'What illustration style would you like?', kind:'paged-single', groups:illustrationGroups },
        { id:'backgroundChoice', q:'Would you like to choose the background or setting?', kind:'single', options:['Yes — show me setting options','No — let the studio choose','No background / simple clean background',"I'll describe the setting myself"] }
      );

      if (a.outfitColors === 'Give me a wider color selection') {
        q.splice(q.length - 3, 0, { id:'outfitColorSelections', q:'Choose one or more outfit colors by letter, then click Done.', kind:'letter-multi', options:outfitColorOptions });
      }

      if (a.outfitColors === 'Let me type the exact colors I want') {
        q.splice(q.length - 3, 0, { id:'outfitColorCustom', q:'Type the exact outfit colors you want.', kind:'text' });
      }

      q.splice(q.length - 3, 0, { id:'accessories', q:'Choose one or more accessories by letter, then click Done.', kind:'letter-multi', options:accessoryOptions });

      if (a.backgroundChoice === 'Yes — show me setting options') q.push({ id:'background', q:'Choose the background or setting.', kind:'paged-single', groups:settingsGroups });
      if (a.backgroundChoice === "I'll describe the setting myself") q.push({ id:'backgroundCustom', q:'Describe the background or setting.', kind:'text' });

      q.push({ id:'poseChoice', q:'Would you like to choose what the woman is doing?', kind:'single', options:['Yes — show me pose/activity options','No — let the studio choose based on the journal page','Keep the pose simple and natural',"I'll describe the pose myself"] });

      if (a.poseChoice === 'Yes — show me pose/activity options') q.push({ id:'pose', q:'Choose the pose or activity.', kind:'paged-single', groups:poseGroups });
      if (a.poseChoice === "I'll describe the pose myself") q.push({ id:'poseCustom', q:'Describe the pose or activity.', kind:'text' });

      q.push({ id:'faithElementChoice', q:'Would you like to include a Christian faith element?', kind:'single', options:['Yes — show me faith-element options','No — let the studio decide when appropriate','No faith element on this image',"I'll describe the faith element myself"] });

      if (a.faithElementChoice === 'Yes — show me faith-element options') q.push({ id:'faithElement', q:'Choose a faith element.', kind:'paged-single', groups:faithGroups });
      if (a.faithElementChoice === "I'll describe the faith element myself") q.push({ id:'faithElementCustom', q:'Describe the faith element.', kind:'text' });

      q.push({ id:'framingChoice', q:'Would you like to choose how the woman is framed?', kind:'single', options:['Yes — show me framing options','No — let the studio choose what fits the page best','Keep the framing simple and natural',"I'll describe the framing myself"] });

      if (a.framingChoice === 'Yes — show me framing options') q.push({ id:'framing', q:'Choose the character framing.', kind:'paged-single', groups:framingGroups });
      if (a.framingChoice === "I'll describe the framing myself") q.push({ id:'framingCustom', q:'Describe the framing.', kind:'text' });

      q.push({ id:'lightingChoice', q:'Would you like to choose the lighting or atmosphere?', kind:'single', options:['Yes — show me lighting options','No — let the studio choose what fits the page best','Keep the lighting soft and natural',"I'll describe the lighting myself"] });

      if (a.lightingChoice === 'Yes — show me lighting options') q.push({ id:'lighting', q:'Choose the lighting or atmosphere.', kind:'paged-single', groups:lightingGroups });
      if (a.lightingChoice === "I'll describe the lighting myself") q.push({ id:'lightingCustom', q:'Describe the lighting or atmosphere.', kind:'text' });

      q.push({ id:'decorChoice', q:'Would you like decorative elements in the image?', kind:'single', options:['Yes — show me decorative options','No — let the studio choose if needed','No decorative elements',"I'll describe the decorations myself"] });

      if (a.decorChoice === 'Yes — show me decorative options') q.push({ id:'decorativeElements', q:'Choose decorative elements.', kind:'paged-single', groups:decorGroups });
      if (a.decorChoice === "I'll describe the decorations myself") q.push({ id:'decorativeCustom', q:'Describe the decorations.', kind:'text' });
    }

    q.push({
      id:'recurringCharacter',
      q:'Would you like to reuse this woman on future pages?',
      kind:'single',
      options:[
        'Yes — keep her identity consistent',
        'Yes — keep her face, hair, and skin tone but allow new outfits and scenes',
        'No — create a new woman next time',
        'Let the studio decide based on the journal flow'
      ]
    });
  }

  q.push(
    { id:'font', q:'Choose your font direction.', kind:'single', options:['Elegant Serif + Delicate Script','Modern Serif + Clean Sans-Serif','Soft Handwritten + Classic Serif','Classic Serif','Surprise Me'] },
    { id:'details', q:'Any additional details?', kind:'text' }
  );

  return q;
}

/* ---------------------------
   TITLE SYSTEM
---------------------------- */

function titleBank() {
  const theme = (state.answers.theme || '').toLowerCase();

  const banks = {
    healing: [
      'Healing in His Presence','Grace for the Healing Journey','Held While I Heal','Restored by Faith',
      'God Meets Me Here','Healing One Day at a Time','Grace in the Broken Places','Renewed in His Presence',
      'Held by Grace','The Gentle Healing Journey','Rest for My Heart','Restored in His Love',
      'Hope for the Healing Heart','Where Grace Meets Healing','Mended in His Presence','Healing with God'
    ],
    prayer: [
      'In His Presence','A Life of Prayer','Draw Near','Prayers from the Heart',
      'My Quiet Place with God','Grace in the Secret Place','Covered in Prayer','When I Talk to God',
      'Anchored in Prayer','Whispers to Heaven','Praying Through the Journey','At His Feet',
      'A Heart That Prays','Sacred Conversations','Still Before Him','Prayer Changes Everything'
    ],
    gratitude: [
      'Counting Blessings','A Grateful Heart','Grace & Gratitude','Thankful in His Presence',
      'Blessed Beyond Measure','Everyday Gratitude','Gifts of Grace','Joy in the Little Things',
      'Grateful for Today','Blessings I Almost Missed','Thankful Always','A Life of Thanksgiving',
      'Grace Upon Grace','Gathering God’s Goodness','My Gratitude Journey','Joyfully Thankful'
    ],
    faith: [
      'Faith Over Fear','Anchored in Faith','Walking by Faith','Courage Through Christ',
      'Fearless Through Him','Rooted in His Promises','Faith That Holds','Standing on His Word',
      'Unshaken Faith','Trusting God Again','Faith for the Journey','Held by His Promises',
      'Brave Because He Is Near','Rooted in Trust','Faith When I Cannot See','Anchored in His Truth'
    ],
    growth: [
      'Rooted, Refined & Renewed','Growing in Grace','Becoming Who God Called Me to Be','Deeper with God',
      'Rooted in His Word','A Journey of Spiritual Growth','Grace for the Becoming','Growing Stronger in Faith',
      'Becoming Rooted','Renewed Day by Day','Closer to God','Growing with Grace',
      'Deeply Rooted','Formed by Faith','The Becoming Journey','Rooted for the Journey'
    ]
  };

  if (theme.includes('healing')) return banks.healing;
  if (theme.includes('prayer')) return banks.prayer;
  if (theme.includes('gratitude')) return banks.gratitude;
  if (theme.includes('faith')) return banks.faith;
  if (theme.includes('spiritual growth')) return banks.growth;

  return ['Gracefully Anchored','Rooted in Grace','Held by His Promises','A Journey with God','Faithfully Becoming','Grace for the Journey','Anchored in His Love','Walking with God'];
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ensureTitlePool() {
  const theme = state.answers.theme || '';
  if (state.titleTheme !== theme || !state.titlePool.length) {
    state.titleTheme = theme;
    state.titlePool = shuffle(titleBank());
    state.titleOffset = 0;
  }
}

function currentTitles() {
  ensureTitlePool();
  let titles = state.titlePool.slice(state.titleOffset, state.titleOffset + 4);
  if (titles.length < 4) {
    state.titlePool = shuffle(titleBank());
    state.titleOffset = 0;
    titles = state.titlePool.slice(0, 4);
  }
  return titles;
}

/* ---------------------------
   RENDER ENGINE
---------------------------- */

function render() {
  result.classList.add('hidden');
  const questions = buildQuestions();

  if (state.step >= questions.length) {
    renderSummary();
    return;
  }

  bar.style.width = `${((state.step + 1) / questions.length) * 100}%`;
  const q = questions[state.step];

  if (q.kind === 'single') return renderSingle(q);
  if (q.kind === 'paged-single') return renderPagedSingle(q);
  if (q.kind === 'letter-multi') return renderLetterMulti(q);
  if (q.kind === 'multi') return renderMulti(q);
  if (q.kind === 'title') return renderTitle(q);
  if (q.kind === 'text') return renderText(q);
  if (q.kind === 'saved-character') return renderSavedCharacter(q);
}

function renderSingle(q) {
  app.innerHTML = `
    <h2>${q.q}</h2>
    <div class="choices">
      ${q.options.map((x,i)=>`
        <button type="button" class="choice single-option" data-value="${attr(x)}">
          <b>${String.fromCharCode(65+i)}.</b> ${html(x)}
        </button>
      `).join('')}
    </div>
    ${state.step === 0 && getSavedProjects().length ? `<div class="nav"><button id="savedProjects">Saved Projects (${getSavedProjects().length})</button></div>` : ''}
    <div class="nav"><button id="back" ${state.step===0?'disabled':''}>Back</button></div>
  `;

  document.querySelectorAll('.single-option').forEach(btn => {
    btn.addEventListener('click', () => {
      state.answers[q.id] = btn.dataset.value;
      state.step += 1;
      render();
    });
  });

  bindBack();
  const sp = document.getElementById('savedProjects');
  if (sp) sp.onclick = renderSavedProjects;
}

function renderPagedSingle(q) {
  const page = ui.pageByQuestion[q.id] || 0;
  const options = q.groups[page] || q.groups[0];

  app.innerHTML = `
    <h2>${q.q}</h2>
    <div class="choices">
      ${options.map((x,i)=>`
        <button type="button" class="choice paged-option" data-value="${attr(x)}">
          <b>${String.fromCharCode(65+i)}.</b> ${html(x)}
        </button>
      `).join('')}
      ${q.groups.length > 1 ? `<button type="button" class="choice" id="moreChoices"><b>+</b> Show Me More Choices</button>` : ''}
    </div>
    <div class="nav"><button id="back">Back</button></div>
  `;

  document.querySelectorAll('.paged-option').forEach(btn => {
    btn.addEventListener('click', () => {
      state.answers[q.id] = btn.dataset.value;
      delete ui.pageByQuestion[q.id];
      state.step += 1;
      render();
    });
  });

  const more = document.getElementById('moreChoices');
  if (more) {
    more.addEventListener('click', (e) => {
      e.preventDefault();
      ui.pageByQuestion[q.id] = (page + 1) % q.groups.length;
      renderPagedSingle(q); // IMPORTANT: stays on the SAME question
    });
  }

  bindBack(q.id);
}


function renderLetterMulti(q) {
  const currentValue = state.answers[q.id] || '';

  app.innerHTML = `
    <h2>${q.q}</h2>

    <p>
      Type the letters for every choice you want.
      Example: <b>A, F, K</b>
    </p>

    <div class="choices" style="cursor:default;">
      ${q.options.map((x,i)=>`
        <div class="choice" style="cursor:default;">
          <b>${letterForIndex(i)}.</b> ${html(x)}
        </div>
      `).join('')}
    </div>

    <label for="letterEntry" style="display:block;margin-top:18px;font-weight:700;">
      Enter your letters:
    </label>

    <input
      id="letterEntry"
      type="text"
      placeholder="Example: A, F, K"
      value=""
      autocomplete="off"
    >

    ${currentValue ? `<p><b>Current selection:</b> ${html(currentValue)}</p>` : ''}

    <div class="nav">
      <button type="button" id="back">Back</button>
      <button type="button" id="doneLetters" class="primary">Done</button>
    </div>
  `;

  document.getElementById('doneLetters').onclick = () => {
    const raw = document.getElementById('letterEntry').value.trim();

    if (!raw) {
      alert('Please enter at least one letter, such as A, F, K.');
      return;
    }

    const letters = raw
      .toUpperCase()
      .split(/[^A-Z]+/)
      .map(x => x.trim())
      .filter(Boolean);

    const uniqueLetters = [...new Set(letters)];
    const selected = [];

    for (const letter of uniqueLetters) {
      const index = indexForLetter(letter);

      if (index < 0 || index >= q.options.length) {
        alert(`"${letter}" is not one of the available choices. Please use only the letters shown on this screen.`);
        return;
      }

      selected.push(q.options[index]);
    }

    if (selected.includes('No accessories') && selected.length > 1) {
      alert('Choose either No accessories by itself, or choose the accessories you want.');
      return;
    }

    if (selected.includes('Surprise Me') && selected.length > 1) {
      alert('Choose Surprise Me by itself, or choose the specific options you want.');
      return;
    }

    state.answers[q.id] = selected.join(', ');
    state.step += 1;
    render();
  };

  bindBack();
}

function letterForIndex(index) {
  // Supports A-Z, then AA, AB, AC...
  let n = index + 1;
  let result = '';

  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }

  return result;
}

function indexForLetter(letter) {
  let n = 0;

  for (const ch of letter) {
    if (ch < 'A' || ch > 'Z') return -1;
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }

  return n - 1;
}

function renderMulti(q) {
  const page = ui.pageByQuestion[q.id] || 0;
  const options = q.groups[page] || q.groups[0];

  if (!Array.isArray(ui.multiByQuestion[q.id])) {
    ui.multiByQuestion[q.id] = [];
  }

  const selected = ui.multiByQuestion[q.id];

  app.innerHTML = `
    <h2>${q.q}</h2>
    <p>Select as many as you like. Press <b>Done</b> only when you are finished.</p>

    <div id="selectedAccessorySummary" style="margin:10px 0 14px;">
      ${selected.length ? `<b>Selected:</b> ${selected.map(html).join(', ')}` : '<b>Selected:</b> None yet'}
    </div>

    <div class="choices">
      ${options.map((x,i)=>{
        const on = selected.includes(x);
        return `
          <button type="button" class="choice multi-option" data-value="${attr(x)}"
            style="${on ? 'border:2px solid #24385f;background:#eef3fb;' : ''}">
            <b class="mark">${on ? '✓' : String.fromCharCode(65+i)+'.'}</b>
            ${html(x)}
          </button>
        `;
      }).join('')}

      ${q.groups.length > 1 ? `<button type="button" class="choice" id="moreChoices"><b>+</b> Show Me More Choices</button>` : ''}
    </div>

    <div class="nav">
      <button type="button" id="back">Back</button>
      <button type="button" id="doneMulti" class="primary">Done (${selected.length} selected)</button>
    </div>
  `;

  document.querySelectorAll('.multi-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const value = btn.dataset.value;
      let current = [...ui.multiByQuestion[q.id]];

      if (value === 'No accessories' || value === 'Surprise Me') {
        current = [value];
      } else {
        current = current.filter(x => x !== 'No accessories' && x !== 'Surprise Me');
        current = current.includes(value)
          ? current.filter(x => x !== value)
          : [...current, value];
      }

      ui.multiByQuestion[q.id] = current;
      renderMulti(q); // IMPORTANT: stays on the SAME accessories screen
    });
  });

  const more = document.getElementById('moreChoices');
  if (more) {
    more.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      ui.pageByQuestion[q.id] = (page + 1) % q.groups.length;
      renderMulti(q); // IMPORTANT: stays on the SAME accessories screen
    });
  }

  document.getElementById('doneMulti').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const current = ui.multiByQuestion[q.id];
    if (!current.length) {
      alert('Choose at least one accessory, or choose No accessories.');
      return;
    }

    state.answers[q.id] = current.join(', ');
    delete ui.multiByQuestion[q.id];
    delete ui.pageByQuestion[q.id];
    state.step += 1;
    render();
  });

  bindBack(q.id);
}

function renderTitle(q) {
  const titles = currentTitles();

  app.innerHTML = `
    <h2>${q.q}</h2>
    <p>Choose one, type your own, or show a fresh set.</p>

    <div class="choices">
      ${titles.map((x,i)=>`
        <button type="button" class="choice title-option" data-value="${attr(x)}">
          <b>${String.fromCharCode(65+i)}.</b> ${html(x)}
        </button>
      `).join('')}
      <button type="button" class="choice" id="surpriseTitle"><b>E.</b> Surprise Me</button>
      <button type="button" class="choice" id="customTitle"><b>F.</b> Let Me Type My Own Title</button>
      <button type="button" class="choice" id="moreTitles"><b>G.</b> Show Me More Choices</button>
    </div>

    <div class="nav"><button id="back">Back</button></div>
  `;

  document.querySelectorAll('.title-option').forEach(btn => {
    btn.onclick = () => {
      state.answers.title = btn.dataset.value;
      state.step += 1;
      render();
    };
  });

  document.getElementById('surpriseTitle').onclick = () => {
    const bank = titleBank();
    state.answers.title = bank[Math.floor(Math.random()*bank.length)];
    state.step += 1;
    render();
  };

  document.getElementById('customTitle').onclick = renderCustomTitle;

  document.getElementById('moreTitles').onclick = () => {
    state.titleOffset += 4;
    renderTitle(q); // stays on title screen
  };

  bindBack();
}

function renderCustomTitle() {
  app.innerHTML = `
    <h2>Enter your title.</h2>
    <input id="customTitleInput" value="${attr(state.answers.title || '')}" placeholder="Example: Faith Over Fear">
    <div class="nav">
      <button id="backToTitles">Back</button>
      <button id="saveTitle" class="primary">Use This Title</button>
    </div>
  `;

  document.getElementById('backToTitles').onclick = render;
  document.getElementById('saveTitle').onclick = () => {
    const value = document.getElementById('customTitleInput').value.trim();
    if (!value) return alert('Please enter a title.');
    state.answers.title = value;
    state.step += 1;
    render();
  };
}

function renderText(q) {
  app.innerHTML = `
    <h2>${q.q}</h2>
    <textarea id="entry">${html(state.answers[q.id] || '')}</textarea>
    <div class="nav">
      <button id="back">Back</button>
      <button id="next" class="primary">Next</button>
    </div>
  `;

  document.getElementById('next').onclick = () => {
    state.answers[q.id] = document.getElementById('entry').value.trim() || 'None';
    state.step += 1;
    render();
  };

  bindBack();
}

function renderSavedCharacter(q) {
  const chars = getSavedCharacters();

  app.innerHTML = `
    <h2>${q.q}</h2>
    <div class="choices">
      ${chars.map((c,i)=>`
        <button type="button" class="choice saved-character" data-id="${attr(c.id)}">
          <b>${String.fromCharCode(65+i)}.</b> ${html(c.id)}
          ${c.skinTone ? ' · ' + html(c.skinTone) : ''}
          ${c.hair ? ' · ' + html(c.hair) : ''}
        </button>
      `).join('')}
    </div>
    <div class="nav"><button id="back">Back</button></div>
  `;

  document.querySelectorAll('.saved-character').forEach(btn => {
    btn.onclick = () => {
      const c = chars.find(x => x.id === btn.dataset.id);
      if (!c) return;
      state.currentCharacterId = c.id;
      state.answers.savedCharacterId = c.id;
      ['skinTone','hair','ageAppearance','clothingStyle','accessories','mood','illustrationStyle'].forEach(k => {
        if (c[k]) state.answers[k] = c[k];
      });
      state.step += 1;
      render();
    };
  });

  bindBack();
}

function bindBack(questionId) {
  const btn = document.getElementById('back');
  if (!btn) return;

  btn.onclick = () => {
    if (questionId) {
      delete ui.pageByQuestion[questionId];
      delete ui.multiByQuestion[questionId];
    }
    if (state.step > 0) {
      state.step -= 1;
      render();
    }
  };
}

/* ---------------------------
   SUMMARY + API
---------------------------- */

function renderSummary() {
  const questions = buildQuestions();
  bar.style.width = '100%';

  app.innerHTML = `
    <h2>Your Project Summary</h2>
    ${Object.entries(state.answers).map(([k,v])=>`<p><b>${html(pretty(k))}:</b> ${html(v)}</p>`).join('')}

    <div class="nav">
      <button id="back">Back</button>
      <button id="gen" class="primary">${state.blueprint ? 'Regenerate Blueprint' : 'Create My Blueprint'}</button>
    </div>

    ${state.blueprint ? `
      <div class="nav">
        <button id="savedProjects">Saved Projects (${getSavedProjects().length})</button>
        <button id="newProject">Start New Project</button>
      </div>` : ''}

    <p id="loading" class="hidden">Creating your blueprint...</p>
  `;

  document.getElementById('back').onclick = () => {
    state.step = Math.max(0, questions.length - 1);
    render();
  };

  document.getElementById('gen').onclick = () => generate('blueprint');

  const sp = document.getElementById('savedProjects');
  if (sp) sp.onclick = renderSavedProjects;

  const np = document.getElementById('newProject');
  if (np) np.onclick = startNewProject;
}

async function generate(action) {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.remove('hidden');

  try {
    const r = await fetch('/.netlify/functions/generate', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        answers: state.answers,
        action,
        blueprint: state.blueprint
      })
    });

    const raw = await r.text();
    let data;

    try { data = JSON.parse(raw); }
    catch { throw new Error('The Netlify function returned an unexpected response.'); }

    if (!r.ok) throw new Error(data.error || 'Generation failed');

    output.textContent = data.output || 'No output returned';

    if (action === 'blueprint') {
      state.blueprint = data.output || '';
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
  `;
  result.appendChild(panel);

  document.querySelectorAll('.next-step').forEach(btn => {
    btn.onclick = () => generate(btn.dataset.action);
  });

  document.getElementById('saveProjectNow').onclick = () => {
    saveCurrentProject();
    alert('Project saved in this browser.');
  };

  document.getElementById('openSavedProjects').onclick = renderSavedProjects;
}

/* ---------------------------
   SAVED PROJECTS / CHARACTERS
---------------------------- */

function getSavedProjects() {
  try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
  catch { return []; }
}

function getSavedCharacters() {
  try { return JSON.parse(localStorage.getItem(CHARACTERS_KEY) || '[]'); }
  catch { return []; }
}

function saveCurrentProject() {
  if (!state.blueprint) return;

  saveCharacterIfNeeded();

  const projects = getSavedProjects();
  const id = state.currentProjectId || `ga-${Date.now()}`;

  const item = {
    id,
    title: state.answers.title || 'Untitled Project',
    type: state.answers.type || '',
    theme: state.answers.theme || '',
    answers: { ...state.answers },
    blueprint: state.blueprint,
    updatedAt: new Date().toISOString()
  };

  const i = projects.findIndex(p => p.id === id);
  if (i >= 0) projects[i] = item;
  else projects.unshift(item);

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  state.currentProjectId = id;
}

function saveCharacterIfNeeded() {
  const reuse = state.answers.recurringCharacter || '';
  if (!reuse.startsWith('Yes —') || state.currentCharacterId) return;

  const chars = getSavedCharacters();
  const id = `Woman ${String(chars.length + 1).padStart(2,'0')}`;

  chars.push({
    id,
    skinTone:state.answers.skinTone || '',
    hair:state.answers.hair || '',
    ageAppearance:state.answers.ageAppearance || '',
    clothingStyle:state.answers.clothingStyle || '',
    accessories:state.answers.accessories || '',
    mood:state.answers.mood || '',
    illustrationStyle:state.answers.illustrationStyle || '',
    reuseMode:reuse
  });

  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(chars));
  state.currentCharacterId = id;
  state.answers.savedCharacterId = id;
}

function renderSavedProjects() {
  const projects = getSavedProjects();
  result.classList.add('hidden');

  app.innerHTML = `
    <h2>Saved Projects</h2>
    <div class="nav"><button id="newProject" class="primary">+ Create New Project</button></div>
    <div class="choices">
      ${projects.length ? projects.map(p=>`
        <div class="choice" style="cursor:default">
          <b>${html(p.title)}</b>
          <div>${html(p.type)}${p.theme ? ' · ' + html(p.theme) : ''}</div>
          <div class="nav">
            <button class="openSaved" data-id="${attr(p.id)}">Open</button>
            <button class="deleteSaved" data-id="${attr(p.id)}">Delete</button>
          </div>
        </div>`).join('') : '<div class="choice">No saved projects yet.</div>'}
    </div>
    <div class="nav"><button id="backHome">Back</button></div>
  `;

  document.getElementById('newProject').onclick = startNewProject;
  document.getElementById('backHome').onclick = startNewProject;

  document.querySelectorAll('.openSaved').forEach(btn => {
    btn.onclick = () => {
      const p = projects.find(x => x.id === btn.dataset.id);
      if (!p) return;
      state.answers = {...p.answers};
      state.blueprint = p.blueprint || '';
      state.currentProjectId = p.id;
      state.step = buildQuestions().length;
      output.textContent = state.blueprint;
      renderSummary();
      result.classList.remove('hidden');
      renderNextStepButtons();
    };
  });

  document.querySelectorAll('.deleteSaved').forEach(btn => {
    btn.onclick = () => {
      if (!confirm('Delete this saved project?')) return;
      const updated = projects.filter(p => p.id !== btn.dataset.id);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
      renderSavedProjects();
    };
  });
}

function startNewProject() {
  state.step = 0;
  state.answers = {};
  state.blueprint = '';
  state.currentProjectId = null;
  state.currentCharacterId = null;
  state.titlePool = [];
  state.titleOffset = 0;
  state.titleTheme = '';
  ui.pageByQuestion = {};
  ui.multiByQuestion = {};
  output.textContent = '';
  result.classList.add('hidden');
  render();
}

/* ---------------------------
   HELPERS
---------------------------- */

function pretty(key) {
  return key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase());
}

function html(value) {
  return String(value ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function attr(value) {
  return html(value);
}

document.getElementById('copyBtn').onclick = () => {
  navigator.clipboard.writeText(output.textContent);
};

render();
