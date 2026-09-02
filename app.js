const app = document.getElementById('app');
const bar = document.getElementById('bar');
const result = document.getElementById('result');
const output = document.getElementById('output');

const state = {
  i: 0,
  a: {},
  titleGroup: 0
};

const qs = [
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
    o: [
      '6 x 9',
      '8 x 10',
      '8.5 x 11',
      'A4',
      'Surprise Me'
    ]
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
    o: [
      'Yes',
      'No',
      'Let the studio decide',
      'Surprise Me'
    ]
  },

  {
    id: 'font',
    q: 'Choose your font direction.',
    o: [
      'Elegant Serif + Delicate Script',
      'Modern Serif + Clean Sans-Serif',
      'Soft Handwritten + Classic Serif',
      'Classic Serif',
      'Surprise Me'
    ]
  },

  {
    id: 'details',
    q: 'Any additional details?',
    t: 'textarea'
  }
];


/* =========================
   TITLE OPTIONS
========================= */

function getTitleGroups() {
  const theme = (state.a.theme || '').toLowerCase();

  if (theme.includes('healing')) {
    return [
      [
        'Healing in His Presence',
        'Grace for the Healing Journey',
        'Held While I Heal',
        'Restored by Faith'
      ],
      [
        'God Meets Me Here',
        'Healing One Day at a Time',
        'Grace in the Broken Places',
        'Renewed in His Presence'
      ]
    ];
  }

  if (theme.includes('prayer')) {
    return [
      [
        'In His Presence',
        'A Life of Prayer',
        'Draw Near',
        'Prayers from the Heart'
      ],
      [
        'My Quiet Place with God',
        'Grace in the Secret Place',
        'Covered in Prayer',
        'When I Talk to God'
      ]
    ];
  }

  if (theme.includes('gratitude')) {
    return [
      [
        'Counting Blessings',
        'A Grateful Heart',
        'Grace & Gratitude',
        'Thankful in His Presence'
      ],
      [
        'Blessed Beyond Measure',
        'Everyday Gratitude',
        'Gifts of Grace',
        'Joy in the Little Things'
      ]
    ];
  }

  if (theme.includes('faith')) {
    return [
      [
        'Faith Over Fear',
        'Anchored in Faith',
        'Walking by Faith',
        'Courage Through Christ'
      ],
      [
        'Fearless Through Him',
        'Rooted in His Promises',
        'Faith That Holds',
        'Standing on His Word'
      ]
    ];
  }

  if (theme.includes('spiritual growth')) {
    return [
      [
        'Rooted, Refined & Renewed',
        'Growing in Grace',
        'Becoming Who God Called Me to Be',
        'Deeper with God'
      ],
      [
        'Rooted in His Word',
        'A Journey of Spiritual Growth',
        'Grace for the Becoming',
        'Growing Stronger in Faith'
      ]
    ];
  }

  return [
    [
      'Gracefully Anchored',
      'Rooted in Grace',
      'Held by His Promises',
      'A Journey with God'
    ],
    [
      'Faithfully Becoming',
      'Grace for the Journey',
      'Anchored in His Love',
      'Walking with God'
    ]
  ];
}


/* =========================
   MAIN RENDER
========================= */

function render() {
  result.classList.add('hidden');

  if (state.i >= qs.length) {
    summary();
    return;
  }

  bar.style.width = ((state.i + 1) / qs.length * 100) + '%';

  const q = qs[state.i];

  /* TITLE STEP */
  if (q.type === 'title-choice') {
    renderTitleChoice(q);
    return;
  }

  /* NORMAL CHOICE QUESTIONS */
  if (q.o) {
    app.innerHTML = `
      <h2>${q.q}</h2>

      <div class="choices">
        ${q.o.map((x, n) => `
          <button class="choice" data-v="${x}">
            <b>${String.fromCharCode(65 + n)}.</b> ${x}
          </button>
        `).join('')}
      </div>

      <div class="nav">
        <button id="back" ${state.i === 0 ? 'disabled' : ''}>
          Back
        </button>
      </div>
    `;

    document.querySelectorAll('.choice').forEach(button => {
      button.onclick = () => {
        state.a[q.id] = button.dataset.v;
        state.i++;
        render();
      };
    });
  }

  /* TEXT / TEXTAREA QUESTIONS */
  else {
    const control =
      q.t === 'textarea'
        ? `<textarea id="entry">${state.a[q.id] || ''}</textarea>`
        : `<input id="entry" value="${state.a[q.id] || ''}">`;

    app.innerHTML = `
      <h2>${q.q}</h2>

      ${control}

      <div class="nav">
        <button id="back">Back</button>

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

  if (back) {
    back.onclick = () => {
      if (state.i > 0) {
        state.i--;
        render();
      }
    };
  }
}


/* =========================
   TITLE SCREEN
========================= */

function renderTitleChoice(q) {
  const groups = getTitleGroups();

  const titles = groups[state.titleGroup];

  app.innerHTML = `
    <h2>${q.q}</h2>

    <p>
      Choose one, let Gracefully Anchored surprise you,
      or enter your own title.
    </p>

    <div class="choices">

      ${titles.map((title, index) => `
        <button class="choice title-option" data-v="${title}">
          <b>${String.fromCharCode(65 + index)}.</b>
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
      <button id="back">Back</button>
    </div>
  `;

  document
    .querySelectorAll('.title-option')
    .forEach(button => {
      button.onclick = () => {
        state.a.title = button.dataset.v;
        state.i++;
        render();
      };
    });

  document.getElementById('surpriseTitle').onclick = () => {
    const allTitles = groups.flat();

    const selected =
      allTitles[Math.floor(Math.random() * allTitles.length)];

    state.a.title = selected;

    state.i++;
    render();
  };

  document.getElementById('customTitle').onclick = () => {
    renderCustomTitle();
  };

  document.getElementById('moreTitles').onclick = () => {
    state.titleGroup =
      (state.titleGroup + 1) % groups.length;

    render();
  };

  document.getElementById('back').onclick = () => {
    if (state.i > 0) {
      state.i--;
      render();
    }
  };
}


/* =========================
   CUSTOM TITLE
========================= */

function renderCustomTitle() {
  app.innerHTML = `
    <h2>Enter your title.</h2>

    <input
      id="customTitleInput"
      type="text"
      placeholder="Example: Faith Over Fear"
      value="${state.a.title || ''}"
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

  document.getElementById('backToTitles').onclick = () => {
    render();
  };

  document.getElementById('saveTitle').onclick = () => {
    const title =
      document
        .getElementById('customTitleInput')
        .value
        .trim();

    if (!title) {
      alert('Please enter a title.');
      return;
    }

    state.a.title = title;

    state.i++;

    render();
  };
}


/* =========================
   SUMMARY
========================= */

function summary() {
  bar.style.width = '100%';

  app.innerHTML = `
    <h2>Your Project Summary</h2>

    ${Object.entries(state.a)
      .map(([k, v]) => `
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
        Create My Blueprint
      </button>

    </div>

    <p id="loading" class="hidden">
      Creating your blueprint...
    </p>
  `;

  document.getElementById('back').onclick = () => {
    state.i--;
    render();
  };

  document.getElementById('gen').onclick = generate;
}


/* =========================
   GENERATE BLUEPRINT
========================= */

async function generate() {
  document
    .getElementById('loading')
    .classList
    .remove('hidden');

  try {
    const r = await fetch(
      '/.netlify/functions/generate',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          answers: state.a
        })
      }
    );

    const rawText = await r.text();

    let d;

    try {
      d = JSON.parse(rawText);
    }

    catch {
      throw new Error(
        'The Netlify function returned an unexpected response.'
      );
    }

    if (!r.ok) {
      throw new Error(
        d.error || 'Generation failed'
      );
    }

    output.textContent =
      d.output || 'No output returned';

    result.classList.remove('hidden');
  }

  catch (e) {
    output.textContent =
      'Error: ' + e.message;

    result.classList.remove('hidden');
  }

  document
    .getElementById('loading')
    .classList
    .add('hidden');
}


/* =========================
   COPY BUTTON
========================= */

document
  .getElementById('copyBtn')
  .onclick = () => {
    navigator.clipboard.writeText(
      output.textContent
    );
  };


/* =========================
   START APP
========================= */

render();
