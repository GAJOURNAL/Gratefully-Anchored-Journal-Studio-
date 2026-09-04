 const app = document.getElementById('app');
const bar = document.getElementById('bar');
const result = document.getElementById('result');
const output = document.getElementById('output');

const PROJECTS_KEY = 'gracefullyAnchoredProjectsV1';
const CHARACTERS_KEY = 'gracefullyAnchoredCharactersV1';
const CLOUD_SESSION_KEY = 'gracefullyAnchoredCloudSessionV1';
const GUEST_MIGRATION_KEY = 'gracefullyAnchoredGuestProjectsForMigrationV1';
const MARKETING_OPTIN_KEY = 'gracefullyAnchoredPendingMarketingOptInV1';

const state = {
  step: 0,
  answers: {},
  blueprint: '',
  currentProjectId: null,
  currentCharacterId: null,
  titlePool: [],
  titleOffset: 0,
  titleTheme: '',
  lastTextAction: '',
  lastGeneratedText: '',
  lastImagePrompt: '',
  lastImageDataUrl: ''
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

      q.push({ id:'framingChoice', q:'Would you like to choose how the woman is framed?', kind:'single', options:['Yes — show me framing options','Choose for Me','Surprise Me','Keep the framing simple and natural',"I'll describe the framing myself"] });

      if (a.framingChoice === 'Yes — show me framing options') q.push({ id:'framing', q:'Choose the character framing.', kind:'paged-single', groups:framingGroups });
      if (a.framingChoice === "I'll describe the framing myself") q.push({ id:'framingCustom', q:'Describe the framing.', kind:'text' });

      q.push({ id:'lightingChoice', q:'Would you like to choose the lighting or atmosphere?', kind:'single', options:['Yes — show me lighting options','Choose for Me','Surprise Me','Keep the lighting soft and natural',"I'll describe the lighting myself"] });

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
    ${state.step === 0 ? `
      <div class="nav">
        <button id="accountButton">${html(accountButtonLabel())}</button>
        <button id="savedProjects">Open My Saved Projects</button>
      </div>
    ` : ''}
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

  const accountButton = document.getElementById('accountButton');
  if (accountButton) accountButton.onclick = () => renderAccountHome();

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
        <button id="savedProjects">Open My Saved Projects</button>
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
  if (loading) {
    loading.classList.remove('hidden');
    loading.textContent = action === 'generate-image'
      ? 'Generating your image preview...'
      : 'Creating your result...';
  }

  try {
    const payload = {
      answers: state.answers,
      action,
      blueprint: state.blueprint,
      sourceText: state.lastGeneratedText || state.blueprint || output.dataset.rawText || '',
      sourceAction: state.lastTextAction || 'blueprint'
    };

    const endpoint =
      action === 'generate-image'
        ? '/.netlify/functions/generate-image'
        : '/.netlify/functions/generate';

    const r = await fetch(endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });

    const raw = await r.text();
    let data;

    try { data = JSON.parse(raw); }
    catch { throw new Error('The Netlify function returned an unexpected response.'); }

    if (!r.ok) throw new Error(data.error || 'Generation failed');

    if (action === 'generate-image') {
      const mimeType = data.mime_type || 'image/png';
      const imageBase64 = data.image_base64;
      const imagePrompt = data.image_prompt || '';

      if (!imageBase64) {
        throw new Error('No image was returned.');
      }

      state.lastImagePrompt = imagePrompt;
      state.lastImageDataUrl = `data:${mimeType};base64,${imageBase64}`;

      renderImagePreview(state.lastImageDataUrl, imagePrompt, data.source_label || 'Preview Image');
      result.classList.remove('hidden');
      renderNextStepButtons();
      return;
    }

    const generatedText = data.output || 'No output returned';

    if (action === 'blueprint') {
      state.blueprint = generatedText;

      try {
        await saveCurrentProject({ silent: true });
      } catch (saveError) {
        console.warn('Cloud auto-save failed:', saveError);
      }
    }

    state.lastTextAction = action;
    state.lastGeneratedText = generatedText;
    clearImagePreview();
    renderStyledOutput(generatedText, action);

    result.classList.remove('hidden');
    renderNextStepButtons();
  } catch (e) {
    resetOutputToPlainText();
    clearImagePreview();
    output.textContent = 'Error: ' + e.message;
    result.classList.remove('hidden');
  }

  if (loading) loading.classList.add('hidden');
}

function renderNextStepButtons() {
  const old = document.getElementById('nextStepPanel');
  if (old) old.remove();

  const canGenerateImage =
    !!(state.lastGeneratedText || state.blueprint) &&
    ['blueprint', 'page-prompts', 'cover-prompts', 'revise'].includes(state.lastTextAction || 'blueprint');

  const imageButtonLabel =
    state.lastTextAction === 'cover-prompts'
      ? 'F. Generate Cover Image'
      : state.lastTextAction === 'page-prompts'
      ? 'F. Generate Page Preview Image'
      : 'F. Generate Preview Image';

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
      ${canGenerateImage ? `<button class="choice" id="generateImageBtn">${imageButtonLabel}</button>` : ''}
      <button class="choice" id="saveProjectNow">Save Project</button>
      <button class="choice" id="openSavedProjects">Open My Saved Projects</button>
    </div>
  `;
  result.appendChild(panel);

  document.querySelectorAll('.next-step').forEach(btn => {
    btn.onclick = () => generate(btn.dataset.action);
  });

  const generateImageBtn = document.getElementById('generateImageBtn');
  if (generateImageBtn) {
    generateImageBtn.onclick = () => generate('generate-image');
  }

  document.getElementById('saveProjectNow').onclick = async () => {
    const button = document.getElementById('saveProjectNow');
    const oldText = button.textContent;

    try {
      button.disabled = true;
      button.textContent = 'Saving to cloud...';

      await saveCurrentProject();

      button.textContent = 'Project Saved ✓';
      button.style.background = '#e8f5e9';
      button.style.borderColor = '#8abf8d';
      button.style.color = '#1f5f2c';
    } catch (error) {
      alert('Cloud save failed: ' + error.message);
      button.textContent = oldText;
    } finally {
      button.disabled = false;
    }
  };

  document.getElementById('openSavedProjects').onclick = renderSavedProjects;
}


/* ---------------------------
   STYLED OUTPUT
---------------------------- */

function resetOutputToPlainText() {
  output.dataset.rawText = '';
  output.style.whiteSpace = 'pre-wrap';
  output.style.fontFamily = 'inherit';
  output.style.background = '';
  output.style.padding = '';
  output.style.borderRadius = '';
  output.innerHTML = '';
}

function renderStyledOutput(text, action = 'blueprint') {
  const raw = String(text || '');
  output.dataset.rawText = raw;

  output.style.whiteSpace = 'normal';
  output.style.fontFamily = 'inherit';
  output.style.background = 'transparent';
  output.style.padding = '0';
  output.style.borderRadius = '0';

  const sections = splitIntoSections(raw);

  if (!sections.length) {
    output.innerHTML = styledParagraphs(raw);
    return;
  }

  const title =
    action === 'blueprint'
      ? 'Your Gracefully Anchored Blueprint'
      : action === 'page-prompts'
      ? 'Detailed Page Prompts'
      : action === 'cover-prompts'
      ? 'Front + Back Cover Prompts'
      : action === 'print-map'
      ? 'Print Map'
      : action === 'marketing'
      ? 'Marketing Extras'
      : action === 'revise'
      ? 'Revised Blueprint'
      : 'Your Results';

  output.innerHTML = `
    <span style="
      display:block;
      margin:0 0 18px;
      padding:18px 20px;
      border:1px solid rgba(36,56,95,.16);
      border-radius:18px;
      background:linear-gradient(180deg,#fffdf9 0%,#f8f5ef 100%);
      box-shadow:0 8px 24px rgba(36,56,95,.07);
    ">
      <span style="
        display:block;
        font-family:Georgia,'Times New Roman',serif;
        font-size:1.4rem;
        line-height:1.25;
        font-weight:700;
        color:#24385f;
        margin-bottom:5px;
      ">${html(title)}</span>

      <span style="
        display:block;
        font-size:.92rem;
        line-height:1.5;
        opacity:.72;
      ">Organized into clean sections for easier reading and copying.</span>
    </span>

    ${sections.map((section, index) => `
      <span style="
        display:block;
        margin:0 0 16px;
        padding:18px 20px;
        border:1px solid rgba(36,56,95,.14);
        border-radius:16px;
        background:#ffffff;
        box-shadow:0 6px 18px rgba(36,56,95,.055);
      ">
        <span style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-bottom:12px;
          padding-bottom:10px;
          border-bottom:1px solid rgba(36,56,95,.10);
        ">
          <span style="
            display:block;
            font-family:Georgia,'Times New Roman',serif;
            font-size:1.08rem;
            line-height:1.3;
            font-weight:700;
            color:#24385f;
          ">${html(cleanHeading(section.heading || `Section ${index + 1}`))}</span>

          <button
            type="button"
            class="section-copy-button"
            data-section-index="${index}"
            style="
              flex:0 0 auto;
              border:1px solid rgba(36,56,95,.20);
              border-radius:999px;
              padding:7px 11px;
              background:#f7f3ea;
              color:#24385f;
              font-size:.78rem;
              font-weight:700;
              cursor:pointer;
            "
          >Copy</button>
        </span>

        <span style="
          display:block;
          font-size:.96rem;
          line-height:1.68;
          color:#333;
        ">${styledParagraphs(section.body)}</span>
      </span>
    `).join('')}
  `;

  document.querySelectorAll('.section-copy-button').forEach(button => {
    button.onclick = async () => {
      const index = Number(button.dataset.sectionIndex);
      const section = sections[index];
      if (!section) return;

      const copyText =
        `${cleanHeading(section.heading || '')}\n\n${stripMarkdown(section.body)}`.trim();

      await navigator.clipboard.writeText(copyText);

      const oldText = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = oldText;
      }, 1200);
    };
  });
}

function splitIntoSections(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const sections = [];

  let currentHeading = '';
  let currentBody = [];

  const pushCurrent = () => {
    const body = currentBody.join('\n').trim();

    if (currentHeading || body) {
      sections.push({
        heading: currentHeading || 'Overview',
        body
      });
    }

    currentBody = [];
  };

  for (const line of lines) {
    const headingMatch =
      line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);

    if (headingMatch) {
      pushCurrent();
      currentHeading = headingMatch[1].trim();
      continue;
    }

    const allCapsHeading =
      line.trim().length >= 4 &&
      line.trim().length <= 70 &&
      /^[A-Z0-9 &+\-/:()]+$/.test(line.trim()) &&
      !line.trim().startsWith('-');

    if (allCapsHeading && currentBody.length) {
      pushCurrent();
      currentHeading = line.trim();
      continue;
    }

    currentBody.push(line);
  }

  pushCurrent();

  return sections.filter(section =>
    section.heading.trim() || section.body.trim()
  );
}

function styledParagraphs(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  let htmlOut = '';
  let inList = false;

  const closeList = () => {
    if (inList) {
      htmlOut += '</span>';
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      htmlOut += '<span style="display:block;height:8px;"></span>';
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);

    if (bullet) {
      if (!inList) {
        htmlOut += '<span style="display:block;margin:5px 0 8px;">';
        inList = true;
      }

      htmlOut += `
        <span style="
          display:block;
          position:relative;
          padding-left:18px;
          margin:5px 0;
        ">
          <span style="
            position:absolute;
            left:2px;
            top:0;
            color:#8a7448;
            font-weight:700;
          ">•</span>
          ${inlineMarkdown(bullet[1])}
        </span>
      `;
      continue;
    }

    closeList();

    htmlOut += `
      <span style="display:block;margin:5px 0;">
        ${inlineMarkdown(line)}
      </span>
    `;
  }

  closeList();
  return htmlOut;
}

function inlineMarkdown(text) {
  let safe = html(text);

  safe = safe.replace(
    /\*\*(.+?)\*\*/g,
    '<strong style="color:#24385f;">$1</strong>'
  );

  safe = safe.replace(
    /\*(.+?)\*/g,
    '<em>$1</em>'
  );

  return safe;
}

function cleanHeading(text) {
  return String(text || '')
    .replace(/^[#\s]+/, '')
    .replace(/\*\*/g, '')
    .trim();
}

function stripMarkdown(text) {
  return String(text || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .trim();
}



/* ---------------------------
   IMAGE PREVIEW
---------------------------- */

function clearImagePreview() {
  const existing = document.getElementById('imagePreviewPanel');
  if (existing) existing.remove();
  state.lastImagePrompt = '';
  state.lastImageDataUrl = '';
}

function renderImagePreview(dataUrl, promptText, title = 'Preview Image') {
  clearImagePreview();

  const panel = document.createElement('div');
  panel.id = 'imagePreviewPanel';
  panel.style.marginTop = '18px';
  panel.style.padding = '20px';
  panel.style.border = '1px solid rgba(36,56,95,.14)';
  panel.style.borderRadius = '18px';
  panel.style.background = '#ffffff';
  panel.style.boxShadow = '0 6px 18px rgba(36,56,95,.055)';

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
      <div>
        <div style="font-family:Georgia,serif;font-size:1.08rem;font-weight:700;color:#24385f;">${html(title)}</div>
        <div style="font-size:.9rem;opacity:.72;">Your image preview was created from the current project result.</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button type="button" id="downloadImageBtn" style="border:1px solid rgba(36,56,95,.20);border-radius:999px;padding:10px 14px;background:#f7f3ea;color:#24385f;font-size:.82rem;font-weight:700;cursor:pointer;">Download Image</button>
        <button type="button" id="copyImagePromptBtn" style="border:1px solid rgba(36,56,95,.20);border-radius:999px;padding:10px 14px;background:#f7f3ea;color:#24385f;font-size:.82rem;font-weight:700;cursor:pointer;">Copy Image Prompt</button>
      </div>
    </div>

    <img
      src="${dataUrl}"
      alt="Gracefully Anchored generated preview"
      style="display:block;width:100%;max-width:540px;margin:0 auto 16px;border-radius:16px;border:1px solid rgba(36,56,95,.14);box-shadow:0 12px 28px rgba(36,56,95,.10);"
    >

    <details>
      <summary style="cursor:pointer;font-weight:700;color:#24385f;margin-bottom:10px;">Show image prompt</summary>
      <div style="margin-top:10px;padding:14px;border-radius:14px;background:#faf8f3;border:1px solid rgba(36,56,95,.10);line-height:1.55;font-size:.95rem;color:#333;">${styledParagraphs(promptText || 'No image prompt returned.')}</div>
    </details>
  `;

  result.appendChild(panel);

  document.getElementById('downloadImageBtn').onclick = () => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'gracefully-anchored-preview.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  document.getElementById('copyImagePromptBtn').onclick = async () => {
    await navigator.clipboard.writeText(promptText || '');
    const btn = document.getElementById('copyImagePromptBtn');
    const oldText = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => btn.textContent = oldText, 1200);
  };
}


/* ---------------------------
   SAVED PROJECTS / CHARACTERS
---------------------------- */

function getCloudSession() {
  try {
    return JSON.parse(localStorage.getItem(CLOUD_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function storeCloudSession(session) {
  localStorage.setItem(
    CLOUD_SESSION_KEY,
    JSON.stringify(session)
  );
}

function clearCloudSession() {
  localStorage.removeItem(CLOUD_SESSION_KEY);
}

function isRealAccountSession(session = getCloudSession()) {
  return !!(
    session?.access_token &&
    session?.email
  );
}

function accountButtonLabel() {
  const session = getCloudSession();

  if (isRealAccountSession(session)) {
    return `My Account · ${session.email}`;
  }

  return 'Sign Up / Log In';
}

function cloudSessionIsFresh(session) {
  if (!session?.access_token || !session?.expires_at) return false;

  return session.expires_at >
    Math.floor(Date.now() / 1000) + 90;
}

async function requestCloudSession(action, payload = {}) {
  const previousSession = getCloudSession();

  const response = await fetch(
    '/.netlify/functions/cloud-auth',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        ...payload
      })
    }
  );

  const raw = await response.text();

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      'Cloud sign-in returned an unexpected response.'
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error || 'Cloud sign-in failed.'
    );
  }

  // With email confirmation turned on, signup can succeed
  // before Supabase returns a login session.
  if (
    action === 'signup' &&
    data.needs_confirmation &&
    !data.access_token
  ) {
    return data;
  }

  // These actions succeed without returning a normal login session.
  if (
    action === 'forgot-password' ||
    action === 'update-password'
  ) {
    return data;
  }

  if (!data.access_token) {
    throw new Error(
      'Cloud sign-in did not return a session.'
    );
  }

  const session = {
    ...data,
    email:
      data.email ||
      (
        action === 'refresh'
          ? previousSession?.email || null
          : null
      ),
    auth_mode:
      data.email || previousSession?.email
        ? 'account'
        : 'anonymous'
  };

  storeCloudSession(session);

  return session;
}

async function ensureCloudSession(forceRefresh = false) {
  const session = getCloudSession();

  if (
    !forceRefresh &&
    cloudSessionIsFresh(session)
  ) {
    return session;
  }

  if (session?.refresh_token) {
    try {
      return await requestCloudSession(
        'refresh',
        {
          refresh_token: session.refresh_token
        }
      );
    } catch (refreshError) {
      // Never silently switch a signed-in customer to a new
      // anonymous user. That could make their projects appear missing.
      if (isRealAccountSession(session)) {
        clearCloudSession();

        throw new Error(
          'Your sign-in has expired. Please log in again.'
        );
      }

      console.warn(
        'Guest cloud session refresh failed; creating a new anonymous session.',
        refreshError
      );
    }
  }

  return await requestCloudSession(
    'anonymous'
  );
}

/* ---------------------------
   USER ACCOUNTS
---------------------------- */

function renderAccountHome(message = '') {
  result.classList.add('hidden');
  bar.style.width = '0%';

  const session = getCloudSession();

  if (isRealAccountSession(session)) {
    app.innerHTML = `
      <h2>My Account</h2>

      ${message ? `
        <p style="
          padding:12px 14px;
          border-radius:12px;
          background:#f5f7fb;
          border:1px solid rgba(36,56,95,.12);
        ">${html(message)}</p>
      ` : ''}

      <p>
        You are signed in as
        <b>${html(session.email)}</b>.
      </p>

      <p>
        Projects saved to this account can be opened again
        after you sign in on another browser or device.
      </p>

      <div class="choices">
        <button type="button" class="choice" id="accountSavedProjects">
          A. Open My Saved Projects
        </button>

        <button type="button" class="choice" id="accountContinue">
          B. Continue Creating
        </button>

        <button type="button" class="choice" id="accountMarketingPreferences">
          C. Marketing Preferences
        </button>

        <button type="button" class="choice" id="accountSignOut">
          D. Sign Out
        </button>
      </div>
    `;

    document.getElementById('accountSavedProjects').onclick =
      renderSavedProjects;

    document.getElementById('accountContinue').onclick =
      render;

    document.getElementById('accountMarketingPreferences').onclick =
      () => renderMarketingPreferences();

    document.getElementById('accountSignOut').onclick = () => {
      clearCloudSession();
      renderAccountHome(
        'You have been signed out on this device.'
      );
    };

    return;
  }

  app.innerHTML = `
    <h2>Save Your Work Across Devices</h2>

    ${message ? `
      <p style="
        padding:12px 14px;
        border-radius:12px;
        background:#f5f7fb;
        border:1px solid rgba(36,56,95,.12);
      ">${html(message)}</p>
    ` : ''}

    <p>
      Create a free account or log in to keep your Gracefully
      Anchored projects connected to you.
    </p>

    <div class="choices">
      <button type="button" class="choice" id="showSignup">
        A. Create My Account
      </button>

      <button type="button" class="choice" id="showLogin">
        B. Log In
      </button>

      <button type="button" class="choice" id="continueGuest">
        C. Continue Without an Account
      </button>
    </div>
  `;

  document.getElementById('showSignup').onclick =
    () => renderAuthForm('signup');

  document.getElementById('showLogin').onclick =
    () => renderAuthForm('login');

  document.getElementById('continueGuest').onclick =
    render;
}

function renderAuthForm(mode, message = '') {
  const isSignup = mode === 'signup';

  result.classList.add('hidden');
  bar.style.width = '0%';

  app.innerHTML = `
    <h2>${isSignup ? 'Create Your Account' : 'Welcome Back'}</h2>

    ${message ? `
      <p style="
        padding:12px 14px;
        border-radius:12px;
        background:#fff8ec;
        border:1px solid rgba(138,116,72,.20);
      ">${html(message)}</p>
    ` : ''}

    <p>
      ${isSignup
        ? 'Use an email address and password to create your Gracefully Anchored account.'
        : 'Log in to open projects saved to your account.'}
    </p>

    <label for="authEmail" style="display:block;margin:16px 0 6px;font-weight:700;">
      Email
    </label>

    <input
      id="authEmail"
      type="email"
      autocomplete="email"
      placeholder="you@example.com"
    >

    <label for="authPassword" style="display:block;margin:16px 0 6px;font-weight:700;">
      Password
    </label>

    <div style="position:relative;display:flex;align-items:center;width:100%;">
      <input
        id="authPassword"
        type="password"
        autocomplete="${isSignup ? 'new-password' : 'current-password'}"
        placeholder="${isSignup ? 'Create a password' : 'Enter your password'}"
        style="width:100%;padding-right:50px;box-sizing:border-box;"
      >

      <button
        type="button"
        id="togglePassword"
        aria-label="Show password"
        title="Show password"
        style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:transparent;cursor:pointer;font-size:1.2rem;padding:6px;line-height:1;"
      >👁</button>
    </div>

    ${isSignup ? `
      <label style="display:flex;gap:10px;align-items:flex-start;margin:16px 0 10px;line-height:1.45;cursor:pointer;">
        <input
          id="marketingOptIn"
          type="checkbox"
          style="width:auto;margin-top:4px;flex:0 0 auto;"
        >
        <span>
          Yes, send me Gracefully Anchored updates, new products, devotionals, and special offers.
          <span style="display:block;font-size:.84rem;opacity:.72;margin-top:4px;">
            Optional. You can unsubscribe anytime in My Account.
          </span>
        </span>
      </label>

      <p style="font-size:.9rem;opacity:.75;">
        After signup, check your email for the confirmation link when email confirmation is enabled.
      </p>
    ` : `
      <div style="margin-top:10px;">
        <button
          type="button"
          id="forgotPassword"
          style="
            border:none;
            background:transparent;
            color:#24385f;
            padding:0;
            font-weight:700;
            cursor:pointer;
            text-decoration:underline;
          "
        >Forgot Password?</button>
      </div>
    `}

    <p id="authStatus" class="hidden"></p>

    <div class="nav">
      <button type="button" id="authBack">Back</button>
      <button type="button" id="authSubmit" class="primary">
        ${isSignup ? 'Create Account' : 'Log In'}
      </button>
    </div>
  `;

  document.getElementById('authBack').onclick =
    () => renderAccountHome();

  document.getElementById('authSubmit').onclick =
    () => submitAccountForm(mode);

  const forgotPassword =
    document.getElementById('forgotPassword');

  if (forgotPassword) {
    forgotPassword.onclick = () => {
      const email =
        document.getElementById('authEmail').value.trim();

      renderForgotPasswordForm(email);
    };
  }

  const passwordInput =
    document.getElementById('authPassword');

  const togglePassword =
    document.getElementById('togglePassword');

  togglePassword.onclick = () => {
    const showing = passwordInput.type === 'text';

    passwordInput.type = showing ? 'password' : 'text';
    togglePassword.textContent = showing ? '👁' : '🙈';
    togglePassword.setAttribute(
      'aria-label',
      showing ? 'Show password' : 'Hide password'
    );
    togglePassword.setAttribute(
      'title',
      showing ? 'Show password' : 'Hide password'
    );
  };

  passwordInput.addEventListener(
    'keydown',
    event => {
      if (event.key === 'Enter') {
        submitAccountForm(mode);
      }
    }
  );
}

function renderForgotPasswordForm(prefilledEmail = '', message = '') {
  result.classList.add('hidden');
  bar.style.width = '0%';

  app.innerHTML = `
    <h2>Reset Your Password</h2>

    ${message ? `
      <p style="
        padding:12px 14px;
        border-radius:12px;
        background:#f5f7fb;
        border:1px solid rgba(36,56,95,.12);
      ">${html(message)}</p>
    ` : ''}

    <p>
      Enter the email address for your account.
      We will send you a password-reset link.
    </p>

    <label for="resetEmail" style="display:block;margin:16px 0 6px;font-weight:700;">
      Email
    </label>

    <input
      id="resetEmail"
      type="email"
      autocomplete="email"
      value="${attr(prefilledEmail)}"
      placeholder="you@example.com"
    >

    <p id="resetStatus" class="hidden"></p>

    <div class="nav">
      <button type="button" id="resetBack">Back to Log In</button>
      <button type="button" id="sendReset" class="primary">
        Send Reset Link
      </button>
    </div>
  `;

  document.getElementById('resetBack').onclick =
    () => renderAuthForm('login');

  document.getElementById('sendReset').onclick =
    sendPasswordResetEmail;

  document.getElementById('resetEmail').addEventListener(
    'keydown',
    event => {
      if (event.key === 'Enter') {
        sendPasswordResetEmail();
      }
    }
  );
}

async function sendPasswordResetEmail() {
  const email =
    document.getElementById('resetEmail').value.trim();

  const submit =
    document.getElementById('sendReset');

  const status =
    document.getElementById('resetStatus');

  if (!email) {
    status.classList.remove('hidden');
    status.textContent = 'Please enter your email address.';
    return;
  }

  submit.disabled = true;
  submit.textContent = 'Sending...';
  status.classList.remove('hidden');
  status.textContent = 'Sending your reset link...';

  try {
    await requestCloudSession(
      'forgot-password',
      {
        email,
        redirect_to:
          window.location.origin + window.location.pathname
      }
    );

    app.innerHTML = `
      <h2>Check Your Email</h2>

      <p>
        If an account exists for <b>${html(email)}</b>,
        a password-reset link has been sent.
      </p>

      <p>
        Open the email and tap the reset link.
        You will return to the studio to choose a new password.
      </p>

      <div class="choices">
        <button type="button" class="choice" id="backToLoginAfterReset">
          Back to Log In
        </button>
      </div>
    `;

    document.getElementById('backToLoginAfterReset').onclick =
      () => renderAuthForm('login');
  } catch (error) {
    submit.disabled = false;
    submit.textContent = 'Send Reset Link';
    status.textContent = error.message;
  }
}

function renderNewPasswordForm(accessToken) {
  result.classList.add('hidden');
  bar.style.width = '0%';

  app.innerHTML = `
    <h2>Choose a New Password</h2>

    <p>
      Enter your new password below.
    </p>

    <label for="newPassword" style="display:block;margin:16px 0 6px;font-weight:700;">
      New Password
    </label>

    <div style="position:relative;display:flex;align-items:center;width:100%;">
      <input
        id="newPassword"
        type="password"
        autocomplete="new-password"
        placeholder="Enter a new password"
        style="width:100%;padding-right:50px;box-sizing:border-box;"
      >
      <button
        type="button"
        id="toggleNewPassword"
        aria-label="Show password"
        title="Show password"
        style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:transparent;cursor:pointer;font-size:1.2rem;padding:6px;line-height:1;"
      >👁</button>
    </div>

    <label for="confirmNewPassword" style="display:block;margin:16px 0 6px;font-weight:700;">
      Confirm New Password
    </label>

    <div style="position:relative;display:flex;align-items:center;width:100%;">
      <input
        id="confirmNewPassword"
        type="password"
        autocomplete="new-password"
        placeholder="Enter the new password again"
        style="width:100%;padding-right:50px;box-sizing:border-box;"
      >
      <button
        type="button"
        id="toggleConfirmNewPassword"
        aria-label="Show password"
        title="Show password"
        style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:transparent;cursor:pointer;font-size:1.2rem;padding:6px;line-height:1;"
      >👁</button>
    </div>

    <p id="newPasswordStatus" class="hidden"></p>

    <div class="nav">
      <button type="button" id="saveNewPassword" class="primary">
        Save New Password
      </button>
    </div>
  `;

  bindPasswordToggle('newPassword', 'toggleNewPassword');
  bindPasswordToggle(
    'confirmNewPassword',
    'toggleConfirmNewPassword'
  );

  document.getElementById('saveNewPassword').onclick =
    () => submitNewPassword(accessToken);
}

function bindPasswordToggle(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);

  if (!input || !button) return;

  button.onclick = () => {
    const showing = input.type === 'text';

    input.type = showing ? 'password' : 'text';
    button.textContent = showing ? '👁' : '🙈';
    button.setAttribute(
      'aria-label',
      showing ? 'Show password' : 'Hide password'
    );
    button.setAttribute(
      'title',
      showing ? 'Show password' : 'Hide password'
    );
  };
}

async function submitNewPassword(accessToken) {
  const password =
    document.getElementById('newPassword').value;

  const confirmPassword =
    document.getElementById('confirmNewPassword').value;

  const submit =
    document.getElementById('saveNewPassword');

  const status =
    document.getElementById('newPasswordStatus');

  if (password.length < 6) {
    status.classList.remove('hidden');
    status.textContent =
      'Please choose a password with at least 6 characters.';
    return;
  }

  if (password !== confirmPassword) {
    status.classList.remove('hidden');
    status.textContent =
      'The two passwords do not match.';
    return;
  }

  submit.disabled = true;
  submit.textContent = 'Saving...';
  status.classList.remove('hidden');
  status.textContent = 'Updating your password...';

  try {
    await requestCloudSession(
      'update-password',
      {
        access_token: accessToken,
        password
      }
    );

    clearCloudSession();

    renderAuthForm(
      'login',
      'Your password was updated. Log in with your new password.'
    );
  } catch (error) {
    submit.disabled = false;
    submit.textContent = 'Save New Password';
    status.textContent = error.message;
  }
}

async function snapshotGuestProjectsForMigration() {
  const session = getCloudSession();

  if (isRealAccountSession(session)) {
    return;
  }

  try {
    const projects = await getSavedProjects();

    if (projects.length) {
      localStorage.setItem(
        GUEST_MIGRATION_KEY,
        JSON.stringify(projects)
      );
    }
  } catch (error) {
    console.warn(
      'Could not prepare guest projects for account migration:',
      error
    );
  }
}

async function migrateGuestProjectsToAccount() {
  if (!isRealAccountSession()) return 0;

  let projects = [];

  try {
    projects = JSON.parse(
      localStorage.getItem(GUEST_MIGRATION_KEY) || '[]'
    );
  } catch {
    projects = [];
  }

  if (!Array.isArray(projects) || !projects.length) {
    localStorage.removeItem(GUEST_MIGRATION_KEY);
    return 0;
  }

  let migrated = 0;

  for (const project of projects) {
    try {
      await cloudProjectRequest(
        'save',
        {
          project: {
            id: null,
            title: project.title || 'Untitled Project',
            type: project.type || '',
            theme: project.theme || '',
            answers: project.answers || {},
            blueprint: project.blueprint || ''
          }
        }
      );

      migrated += 1;
    } catch (error) {
      console.warn(
        'A guest project could not be copied into the signed-in account:',
        error
      );
    }
  }

  if (migrated === projects.length) {
    localStorage.removeItem(GUEST_MIGRATION_KEY);
  }

  return migrated;
}

async function submitAccountForm(mode) {
  const email =
    document.getElementById('authEmail').value.trim();

  const password =
    document.getElementById('authPassword').value;

  const submit =
    document.getElementById('authSubmit');

  const status =
    document.getElementById('authStatus');

  const marketingOptIn =
    mode === 'signup' &&
    !!document.getElementById('marketingOptIn')?.checked;

  if (!email || !password) {
    status.classList.remove('hidden');
    status.textContent =
      'Please enter both your email and password.';
    return;
  }

  if (mode === 'signup' && password.length < 6) {
    status.classList.remove('hidden');
    status.textContent =
      'Please create a password with at least 6 characters.';
    return;
  }

  submit.disabled = true;
  submit.textContent =
    mode === 'signup'
      ? 'Creating account...'
      : 'Logging in...';

  status.classList.remove('hidden');
  status.textContent =
    mode === 'signup'
      ? 'Creating your account...'
      : 'Signing you in...';

  try {
    await snapshotGuestProjectsForMigration();

    const data = await requestCloudSession(
      mode,
      {
        email,
        password
      }
    );

    if (mode === 'signup' && marketingOptIn) {
      localStorage.setItem(
        MARKETING_OPTIN_KEY,
        JSON.stringify({ email, consent: true, source: 'account_signup' })
      );
    }

    if (
      mode === 'signup' &&
      data.needs_confirmation &&
      !data.access_token
    ) {
      app.innerHTML = `
        <h2>Check Your Email</h2>

        <p>
          We created the account for
          <b>${html(email)}</b>.
        </p>

        <p>
          Open the confirmation email from Gracefully Anchored,
          click the confirmation link, and you will be returned
          to the studio.
        </p>

        <div class="choices">
          <button type="button" class="choice" id="confirmedThenLogin">
            A. I Confirmed My Email — Log In
          </button>

          <button type="button" class="choice" id="backToStudioAfterSignup">
            B. Back to the Studio
          </button>
        </div>
      `;

      document.getElementById('confirmedThenLogin').onclick =
        () => renderAuthForm(
          'login',
          'Enter the email and password you just created.'
        );

      document.getElementById('backToStudioAfterSignup').onclick =
        render;

      return;
    }

    const migrated =
      await migrateGuestProjectsToAccount();

    try {
      await syncPendingMarketingPreference();
    } catch (marketingError) {
      console.warn('Marketing preference could not be synced yet:', marketingError);
    }

    renderAccountHome(
      migrated
        ? `${migrated} earlier saved project${migrated === 1 ? '' : 's'} were added to your account.`
        : 'Your account is ready.'
    );
  } catch (error) {
    submit.disabled = false;
    submit.textContent =
      mode === 'signup'
        ? 'Create Account'
        : 'Log In';

    status.textContent = error.message;
  }
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];

    if (!payload) return {};

    const normalized =
      payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const padded =
      normalized.padEnd(
        normalized.length + (4 - normalized.length % 4) % 4,
        '='
      );

    return JSON.parse(
      decodeURIComponent(
        Array.prototype.map.call(
          atob(padded),
          char =>
            '%' +
            ('00' + char.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      )
    );
  } catch {
    return {};
  }
}

function captureSupabaseSessionFromUrl() {
  const hash =
    window.location.hash?.replace(/^#/, '') || '';

  if (!hash) {
    return {
      captured: false,
      type: '',
      accessToken: ''
    };
  }

  const params = new URLSearchParams(hash);

  const accessToken =
    params.get('access_token');

  const refreshToken =
    params.get('refresh_token');

  const type =
    params.get('type') || '';

  if (!accessToken || !refreshToken) {
    return {
      captured: false,
      type,
      accessToken: accessToken || ''
    };
  }

  const jwt = decodeJwtPayload(accessToken);

  const expiresAt =
    Number(params.get('expires_at')) ||
    (
      Number(params.get('expires_in'))
        ? Math.floor(Date.now() / 1000) +
          Number(params.get('expires_in'))
        : Math.floor(Date.now() / 1000) + 3600
    );

  storeCloudSession({
    success: true,
    action: type === 'recovery' ? 'recovery' : 'login',
    auth_mode: 'account',
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
    user_id: jwt.sub || null,
    email: jwt.email || null
  });

  history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search
  );

  return {
    captured: true,
    type,
    accessToken
  };
}

async function cloudSubscriberRequest(action, payload = {}, retry = true) {
  const session = await ensureCloudSession();

  if (!isRealAccountSession(session)) {
    throw new Error('Please log in to manage marketing preferences.');
  }

  const response = await fetch(
    '/.netlify/functions/cloud-subscribers',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action,
        ...payload
      })
    }
  );

  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Marketing preferences returned an unexpected response.');
  }

  if (response.status === 401 && retry) {
    await ensureCloudSession(true);
    return cloudSubscriberRequest(action, payload, false);
  }

  if (!response.ok) {
    throw new Error(data.error || 'Marketing preference request failed.');
  }

  return data;
}

async function syncPendingMarketingPreference() {
  const session = getCloudSession();
  if (!isRealAccountSession(session)) return;

  let pending = null;

  try {
    pending = JSON.parse(localStorage.getItem(MARKETING_OPTIN_KEY) || 'null');
  } catch {
    pending = null;
  }

  if (!pending?.consent) return;

  if (
    pending.email &&
    session.email &&
    pending.email.toLowerCase() !== session.email.toLowerCase()
  ) {
    return;
  }

  await cloudSubscriberRequest('set', {
    consent: true,
    source: pending.source || 'account_signup'
  });

  localStorage.removeItem(MARKETING_OPTIN_KEY);
}

async function renderMarketingPreferences(message = '') {
  result.classList.add('hidden');
  bar.style.width = '0%';

  const session = getCloudSession();

  if (!isRealAccountSession(session)) {
    renderAccountHome('Please log in to manage marketing preferences.');
    return;
  }

  app.innerHTML = `
    <h2>Marketing Preferences</h2>
    <p>Loading your preference...</p>
  `;

  try {
    await syncPendingMarketingPreference();

    const data = await cloudSubscriberRequest('get');
    const subscribed = !!data.subscriber?.consent;

    app.innerHTML = `
      <h2>Marketing Preferences</h2>

      ${message ? `
        <p style="padding:12px 14px;border-radius:12px;background:#f5f7fb;border:1px solid rgba(36,56,95,.12);">
          ${html(message)}
        </p>
      ` : ''}

      <p>
        Signed in as <b>${html(session.email)}</b>.
      </p>

      <p style="padding:12px 14px;border-radius:12px;background:${subscribed ? '#e8f5e9' : '#f7f3ea'};border:1px solid rgba(36,56,95,.12);">
        <b>Status:</b> ${subscribed ? 'Subscribed ✓' : 'Not subscribed'}
      </p>

      <p>
        ${subscribed
          ? 'You are currently signed up for Gracefully Anchored updates, new products, devotionals, and special offers.'
          : 'You are not currently signed up for marketing emails. Your Journal Studio account still works normally.'}
      </p>

      <div class="choices">
        <button type="button" class="choice" id="toggleMarketingPreference">
          ${subscribed ? 'Unsubscribe from Marketing Emails' : 'Subscribe to Updates & Offers'}
        </button>

        <button type="button" class="choice" id="backToAccountFromMarketing">
          Back to My Account
        </button>
      </div>

      <p id="marketingPreferenceStatus" class="hidden"></p>
    `;

    document.getElementById('backToAccountFromMarketing').onclick =
      () => renderAccountHome();

    document.getElementById('toggleMarketingPreference').onclick = async () => {
      const button = document.getElementById('toggleMarketingPreference');
      const status = document.getElementById('marketingPreferenceStatus');

      button.disabled = true;
      status.classList.remove('hidden');
      status.textContent = subscribed ? 'Unsubscribing...' : 'Subscribing...';

      try {
        await cloudSubscriberRequest('set', {
          consent: !subscribed,
          source: subscribed ? 'account_preferences' : 'account_preferences'
        });

        renderMarketingPreferences(
          subscribed
            ? 'You have been unsubscribed from marketing emails.'
            : 'You are now subscribed to Gracefully Anchored updates and offers.'
        );
      } catch (error) {
        button.disabled = false;
        status.textContent = error.message;
      }
    };
  } catch (error) {
    app.innerHTML = `
      <h2>Marketing Preferences</h2>
      <p>${html(error.message)}</p>
      <div class="nav">
        <button type="button" id="backToAccountFromMarketing">Back to My Account</button>
      </div>
    `;

    document.getElementById('backToAccountFromMarketing').onclick =
      () => renderAccountHome();
  }
}

async function cloudProjectRequest(action, payload = {}, retry = true) {
  const session = await ensureCloudSession();

  const response = await fetch(
    '/.netlify/functions/cloud-projects',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action,
        ...payload
      })
    }
  );

  const raw = await response.text();

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      'Cloud projects returned an unexpected response.'
    );
  }

  if (
    response.status === 401 &&
    retry
  ) {
    await ensureCloudSession(true);

    return cloudProjectRequest(
      action,
      payload,
      false
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error || 'Cloud project request failed.'
    );
  }

  return data;
}

async function getSavedProjects() {
  const data = await cloudProjectRequest('list');

  return Array.isArray(data.projects)
    ? data.projects
    : [];
}

async function saveCurrentProject(options = {}) {
  const { silent = false } = options;

  if (!state.blueprint) {
    if (!silent) {
      throw new Error(
        'Create a Blueprint before saving the project.'
      );
    }

    return null;
  }

  saveCharacterIfNeeded();

  const payload = {
    id: state.currentProjectId || null,
    title: state.answers.title || 'Untitled Project',
    type: state.answers.type || '',
    theme: state.answers.theme || '',
    answers: { ...state.answers },
    blueprint: state.blueprint
  };

  const data = await cloudProjectRequest(
    'save',
    { project: payload }
  );

  if (!data.project?.id) {
    throw new Error(
      'The cloud save completed without returning a project ID.'
    );
  }

  state.currentProjectId =
    data.project.id;

  return data.project;
}

async function deleteCloudProject(id) {
  await cloudProjectRequest(
    'delete',
    { id }
  );
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

async function renderSavedProjects() {
  result.classList.add('hidden');
  bar.style.width = '100%';

  app.innerHTML = `
    <h2>Saved Projects</h2>

    <p>
      Loading your cloud projects...
    </p>

    <div class="nav">
      <button id="newProject" class="primary">
        + Create New Project
      </button>
    </div>
  `;

  document.getElementById('newProject').onclick =
    startNewProject;

  try {
    const projects =
      await getSavedProjects();

    app.innerHTML = `
      <h2>Saved Projects</h2>

      <p>
        These projects are saved in your Gracefully Anchored cloud workspace.
      </p>

      <div class="nav">
        <button id="newProject" class="primary">
          + Create New Project
        </button>
      </div>

      <div class="choices">
        ${
          projects.length
            ? projects.map(project => `
                <div class="choice" style="cursor:default">
                  <div>
                    <b>${html(project.title || 'Untitled Project')}</b>
                  </div>

                  <div style="font-size:.9rem;opacity:.8;margin-top:4px;">
                    ${html(project.type || '')}
                    ${
                      project.theme
                        ? ' · ' + html(project.theme)
                        : ''
                    }
                  </div>

                  <div style="font-size:.78rem;opacity:.65;margin-top:5px;">
                    ${
                      project.updated_at
                        ? 'Updated ' +
                          html(
                            new Date(
                              project.updated_at
                            ).toLocaleString()
                          )
                        : ''
                    }
                  </div>

                  <div class="nav">
                    <button
                      class="openSaved"
                      data-id="${attr(project.id)}"
                    >
                      Open
                    </button>

                    <button
                      class="deleteSaved"
                      data-id="${attr(project.id)}"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              `).join('')
            : `
              <div
                class="choice"
                style="cursor:default"
              >
                No cloud projects yet.
              </div>
            `
        }
      </div>

      <div class="nav">
        <button id="backHome">
          Back to My Account
        </button>
      </div>
    `;

    document.getElementById('newProject').onclick =
      startNewProject;

    document.getElementById('backHome').onclick =
      renderAccountHome;

    document
      .querySelectorAll('.openSaved')
      .forEach(button => {
        button.onclick = () => {
          const project =
            projects.find(
              item =>
                item.id ===
                button.dataset.id
            );

          if (!project) return;

          state.answers = {
            ...(project.answers || {})
          };

          state.blueprint =
            project.blueprint || '';

          state.currentProjectId =
            project.id;

          state.step =
            buildQuestions().length;

          state.lastTextAction =
            'blueprint';

          state.lastGeneratedText =
            state.blueprint || '';

          clearImagePreview();

          renderStyledOutput(
            state.blueprint,
            'blueprint'
          );

          renderSummary();

          result.classList.remove(
            'hidden'
          );

          renderNextStepButtons();
        };
      });

    document
      .querySelectorAll('.deleteSaved')
      .forEach(button => {
        button.onclick = async () => {
          const project =
            projects.find(
              item =>
                item.id ===
                button.dataset.id
            );

          const projectTitle =
            project?.title ||
            'this project';

          if (
            !confirm(
              `Delete "${projectTitle}" from the cloud?`
            )
          ) {
            return;
          }

          button.disabled = true;
          button.textContent =
            'Deleting...';

          try {
            await deleteCloudProject(
              button.dataset.id
            );

            if (
              state.currentProjectId ===
              button.dataset.id
            ) {
              state.currentProjectId =
                null;
            }

            await renderSavedProjects();
          } catch (error) {
            alert(
              'Delete failed: ' +
                error.message
            );

            button.disabled = false;
            button.textContent =
              'Delete';
          }
        };
      });

  } catch (error) {
    app.innerHTML = `
      <h2>Saved Projects</h2>

      <p>
        We couldn't load your cloud projects.
      </p>

      <p style="color:#8b2d2d;">
        ${html(error.message)}
      </p>

      <div class="nav">
        <button id="retryCloud" class="primary">
          Try Again
        </button>

        <button id="newProject">
          Start New Project
        </button>
      </div>
    `;

    document.getElementById('retryCloud').onclick =
      renderSavedProjects;

    document.getElementById('newProject').onclick =
      startNewProject;
  }
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
  state.lastTextAction = '';
  state.lastGeneratedText = '';
  state.lastImagePrompt = '';
  state.lastImageDataUrl = '';
  ui.pageByQuestion = {};
  ui.multiByQuestion = {};
  resetOutputToPlainText();
  clearImagePreview();
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
  const textToCopy =
    state.lastGeneratedText ||
    output.dataset.rawText ||
    output.textContent ||
    '';

  navigator.clipboard.writeText(textToCopy);
};

async function initializeApp() {
  const authReturn =
    captureSupabaseSessionFromUrl();

  if (
    authReturn.captured &&
    authReturn.type === 'recovery'
  ) {
    renderNewPasswordForm(
      authReturn.accessToken
    );
    return;
  }

  if (
    authReturn.captured &&
    isRealAccountSession()
  ) {
    try {
      await migrateGuestProjectsToAccount();
    } catch (error) {
      console.warn(
        'Project migration after email confirmation could not finish:',
        error
      );
    }
  }

  render();
}

initializeApp();
