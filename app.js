// app.js — Main application logic
//
// Structure:
//   Utils        — helpers
//   Template     — default worksheet sections
//   Router       — view switching (home ↔ session)
//   HomeView     — session list
//   SessionView  — worksheet editor

'use strict';

// ── UTILS ─────────────────────────────────────────────────────

const Utils = {
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },
  today() {
    return new Date().toISOString().split('T')[0];
  },
  formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  },
  timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  },
  esc(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },
  debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
};

// ── DEFAULT TEMPLATE ──────────────────────────────────────────
// This is what every new session starts with.
// Edit mode lets users add/remove sections and fields per-session.

const Template = {
  sections() {
    return [
      {
        id: Utils.uid(), title: 'Before Reading', ref: 'Para. 5, 13', hint: '',
        items: [
          { id: Utils.uid(), type: 'check', label: 'Pray for concentration and holy spirit before you begin. (Mangabay kay Jehova nga hatagan ka sang balaan nga espiritu antes ka magsugod.)', checked: false },
          { id: Utils.uid(), type: 'field', question: 'Am I approaching this sincerely and teachably, without a critical or proud spirit? (Gina-approach ko bala ini nga wala sang pagka-bugalon nga kinaiya kag para lamang ngitaan sang sala ang iban?)', answer: '', size: 'short' }
        ]
      },
      {
        id: Utils.uid(), title: 'Comprehension', ref: 'Para. 5–6',
        hint: 'Read slowly. Read aloud or use audio if it helps. (Basaha sing mahinay(slowly,) matunog(loud), ukon gamita ang audio recording kung kinahanglan.)',
        items: [
          { id: Utils.uid(), type: 'field', question: 'Who are the main characters? Who is speaking and to whom? (Sin-o ang mga main karakter? Sin-o ang gahambal kag sin-o ang iya kaistorya?)', answer: '', size: 'normal' },
          { id: Utils.uid(), type: 'field', question: 'What is happening, and why? (Ano ang gakalatabo kag ngaa?)', answer: '', size: 'normal' },
          { id: Utils.uid(), type: 'field', question: 'Where and when is this taking place? (Diin kag san-o ini gakatabo?)', answer: '', size: 'short' },
          { id: Utils.uid(), type: 'field', question: 'What is the main idea in one sentence? (Ano ang main idea sini sa isa lang ka sentence?)', answer: '', size: 'short' },
          { id: Utils.uid(), type: 'field', question: 'Notes — questions, insights, feelings, things to research', answer: '', size: 'tall' }
        ]
      },
      {
        id: Utils.uid(), title: 'Discernment', ref: 'Para. 7–8',
        hint: 'Carefully analyze what you read. Note how it connects to other things you know. (Analisaha sing maayo ang imo ginbasa. Talupangda kon paano ini nakakonekta sa iban nga butang nga imo nahibal-an.)',
        items: [
          { id: Utils.uid(), type: 'field', question: 'How does this passage connect to something else I already know in the Bible? (Paano nakakonekta ang passage nga ini sa iban nga butang nga nahibal-an ko na sa Biblia?)', answer: '', size: 'normal' },
          { id: Utils.uid(), type: 'field', question: 'What is not immediately obvious here that I had to think about? (Ano ang wala gilayon maklaro sa akon nga kinahanglan ko pa nga hunahunaonn?)', answer: '', size: 'normal' }
        ]
      },
      {
        id: Utils.uid(), title: 'Four Filters', ref: 'Para. 10–11 · 2 Tim. 3:16–17',
        hint: 'Run every passage through all four of these. (Iagi ang kada passage sa ining apat ka filter.)',
        items: [
          { id: Utils.uid(), type: 'field', question: '1 · Teach — What does this teach me about Jehovah or his purpose? (Ano ang ginatudlo sini sa imo parte kay Jehova, parte sa iya katuyuan, ukon parte sa iya mga prinisipio?)', answer: '', size: 'normal' },
          { id: Utils.uid(), type: 'field', question: '2 · Reprove — What wrong tendency or attitude in me does this identify? (Talupangda kon paano ka ginabuligan sang mga bersikulo nga imo ginabasa nga mabal-an ang imo indi husto nga handum ukon pamatasan kag kon paano mo ini madula.)', answer: '', size: 'normal' },
          { id: Utils.uid(), type: 'field', question: '3 · Correct — What wrong viewpoint does this set straight? (Hibalua kon paano ini makabulig sa imo nga matadlong ang sala nga pagpati nga posible nasambit sang imo ginbantalaan.)', answer: '', size: 'normal' },
          { id: Utils.uid(), type: 'field', question: '4 · Discipline — What training does this give me to reflect Jehovah\'s thinking? (Hibalua kon paano ka ginadisiplina sang mga bersikulo nga imo ginabasa para mailog mo ang panghunahuna ni Jehova.)', answer: '', size: 'normal' }
        ]
      },
      {
        id: Utils.uid(), title: 'After Reading', ref: 'Para. 5, 14',
        hint: 'Self-examination — does your reading show in how you treat others? (Pagusisa sa imo kaugalingon — makita bala sa paagi sang imo pagtrato sa iban ang imo nabasa?)',
        items: [
          { id: Utils.uid(), type: 'check', label: 'Pray to thank Jehovah for his Word and ask for help to apply what you read. (Mangamuyo para magpasalamat kay Jehova para sa iya Pulong kag mangayo sang bulig para maaplikar ang imo nabasa.)', checked: false },
          { id: Utils.uid(), type: 'field', question: 'Am I inclined to see good in others, or quick to point out their flaws? (Naluyag bala ako nga makita ang maayo sa iban, ukon madali ko sila nga sentensyahan sa akon hunahuna bahin sa ila mga kakulangan?)', answer: '', size: 'normal' },
          { id: Utils.uid(), type: 'field', question: 'Am I merciful and forgiving, or critical and holding grudges? (Maluluy-on kag mapinatawaron bala ako, ukon kritikal kag may ginatanom nga dumot?)', answer: '', size: 'normal' }
        ]
      }
    ];
  }
};

// ── ROUTER ────────────────────────────────────────────────────

const Router = {
  // Switches between views. Add new views here.
  go(view, params = {}) {
    if (view === 'home')    HomeView.render();
    if (view === 'session') SessionView.render(params.id);
  }
};

// ── HOME VIEW ─────────────────────────────────────────────────

const HomeView = {
  async render() {
    const sessions = await DB.getSessions();
    const root = document.getElementById('app');
    root.innerHTML = `
      <div class="home">
        <header class="home-header">
          <h1>Bible Reading</h1>
          <button class="btn-new" id="btn-new">+ New Session</button>
        </header>
        <div class="session-list" id="session-list">
          ${sessions.length === 0 ? this._empty() : sessions.map(s => this._card(s)).join('')}
        </div>
      </div>
    `;
    document.getElementById('btn-new').addEventListener('click', () => this.newSession());
    document.querySelectorAll('.session-card').forEach(el => {
      el.querySelector('.sc-body').addEventListener('click', () =>
        Router.go('session', { id: el.dataset.id })
      );
      el.querySelector('.sc-delete').addEventListener('click', e => {
        e.stopPropagation();
        this.deleteSession(el.dataset.id, el);
      });
    });
  },

  _empty() {
    return `<div class="empty-state">
      <div class="empty-icon">📖</div>
      <p>No sessions yet.</p>
      <p>Tap <strong>+ New Session</strong> to start.</p>
    </div>`;
  },

  _card(s) {
    const preview = this._preview(s);
    return `
      <div class="session-card" data-id="${s.id}">
        <div class="sc-body">
          <div class="sc-passage">${Utils.esc(s.passage) || '<span class="sc-no-passage">No passage set</span>'}</div>
          <div class="sc-meta">
            <span>${Utils.formatDate(s.date)}</span>
            <span class="sc-dot">·</span>
            <span>${Utils.timeAgo(s.updatedAt)}</span>
          </div>
          ${preview ? `<div class="sc-preview">${Utils.esc(preview)}</div>` : ''}
        </div>
        <button class="sc-delete" title="Delete session">✕</button>
      </div>
    `;
  },

  // Show first non-empty answer as preview
  _preview(s) {
    if (!s.sections) return '';
    for (const sec of s.sections) {
      for (const item of sec.items) {
        if (item.type === 'field' && item.answer && item.answer.trim()) {
          return item.answer.trim().slice(0, 80) + (item.answer.length > 80 ? '…' : '');
        }
      }
    }
    return '';
  },

  async newSession() {
    const session = {
      id:        Utils.uid(),
      passage:   '',
      date:      Utils.today(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sections:  Template.sections()
    };
    await DB.saveSession(session);
    Router.go('session', { id: session.id });
  },

  async deleteSession(id, el) {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    await DB.deleteSession(id);
    el.style.transition = 'opacity .2s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
    // If list is now empty, show empty state
    const list = document.getElementById('session-list');
    if (list && list.querySelectorAll('.session-card').length === 0) {
      list.innerHTML = this._empty();
    }
  }
};

// ── SESSION VIEW ──────────────────────────────────────────────

const SessionView = {
  session: null,
  mode: 'write',
  _save: null, // debounced save function

  async render(id) {
    this.session = await DB.getSession(id);
    if (!this.session) { Router.go('home'); return; }

    this.mode = 'write';
    this._save = Utils.debounce(() => this._persist(), 400);

    const root = document.getElementById('app');
    root.innerHTML = `
      <div class="session-view">
        <div class="sv-topbar">
          <button class="btn-back" id="btn-back">← Back</button>
          <div class="sv-meta">
            <input id="sv-passage" type="text" placeholder="Passage…" value="${Utils.esc(this.session.passage)}">
            <input id="sv-date"    type="date"  value="${Utils.esc(this.session.date)}">
          </div>
          <div class="sv-actions">
            <span id="sv-status" class="sv-status"></span>
            <div class="mode-toggle">
              <button id="btn-write" class="active" data-mode="write">Write</button>
              <button id="btn-edit"                 data-mode="edit">Edit</button>
            </div>
          </div>
        </div>
        <div class="sv-body" id="sv-body"></div>
      </div>
    `;

    this._renderSections();
    this._attachTopbar();

    // Save on close/navigate away
    window.addEventListener('beforeunload', () => this._persist(), { once: true });
  },

  // ── SECTION RENDERING ────────────────────────────────────

  _renderSections() {
    const body = document.getElementById('sv-body');
    if (!body) return;

    const COLORS = ['ac0','ac1','ac2','ac3','ac4','ac5'];
    body.innerHTML = '';

    this.session.sections.forEach((sec, si) => {
      const color = COLORS[si % COLORS.length];
      const card  = document.createElement('div');
      card.className = 'section-card';
      card.dataset.sid = sec.id;

      card.innerHTML = `
        <div class="card-header">
          <div class="card-accent ${color}"></div>
          <div class="card-title e" contenteditable="true"
               data-sid="${sec.id}" data-field="s-title">${Utils.esc(sec.title)}</div>
          <div class="card-ref e" contenteditable="true"
               data-sid="${sec.id}" data-field="s-ref">${Utils.esc(sec.ref)}</div>
        </div>
        <div class="card-body" data-sid="${sec.id}">
          ${sec.hint ? `<div class="hint-text e" contenteditable="true"
            data-sid="${sec.id}" data-field="s-hint">${Utils.esc(sec.hint)}</div>` : ''}
        </div>
        <div class="card-edit-ctrl" data-sid="${sec.id}">
          <button class="ctrl-btn ctrl-add-field" data-sid="${sec.id}" data-action="add-field">+ Field</button>
          <button class="ctrl-btn ctrl-add-check" data-sid="${sec.id}" data-action="add-check">+ Checkbox</button>
          <button class="ctrl-btn ctrl-add-hint"  data-sid="${sec.id}" data-action="add-hint">+ Hint</button>
          <button class="ctrl-btn ctrl-del-sec"   data-sid="${sec.id}" data-action="del-sec">Delete section</button>
        </div>
      `;

      const cardBody = card.querySelector('.card-body');
      sec.items.forEach(item => {
        cardBody.appendChild(item.type === 'check'
          ? this._renderCheck(sec.id, item)
          : this._renderField(sec.id, item)
        );
      });

      body.appendChild(card);
    });

    // Add section button (edit mode only)
    const addSecBtn = document.createElement('button');
    addSecBtn.id = 'btn-add-sec';
    addSecBtn.className = 'btn-add-sec';
    addSecBtn.textContent = '+ Add section';
    addSecBtn.addEventListener('click', () => this._addSection());
    body.appendChild(addSecBtn);

    this._applyMode();
    this._attachBodyListeners();
  },

  _renderField(sid, item) {
    const wrap = document.createElement('div');
    wrap.className = 'field-row';
    wrap.dataset.iid = item.id;

    const sizeClass = item.size || 'normal';
    wrap.innerHTML = `
      <div class="field">
        <div class="field-q e" contenteditable="true"
             data-sid="${sid}" data-iid="${item.id}" data-field="i-question">${Utils.esc(item.question)}</div>
        <textarea class="field-a ${sizeClass}"
                  data-sid="${sid}" data-iid="${item.id}" data-field="i-answer"
                  placeholder="Write here…">${Utils.esc(item.answer)}</textarea>
      </div>
      <button class="del-item" data-sid="${sid}" data-iid="${item.id}" data-action="del-item" title="Delete">×</button>
    `;
    return wrap;
  },

  _renderCheck(sid, item) {
    const wrap = document.createElement('div');
    wrap.className = 'field-row';
    wrap.dataset.iid = item.id;

    wrap.innerHTML = `
      <label class="check-field">
        <input type="checkbox" ${item.checked ? 'checked' : ''}
               data-sid="${sid}" data-iid="${item.id}" data-field="i-checked">
        <span class="check-label e" contenteditable="true"
              data-sid="${sid}" data-iid="${item.id}" data-field="i-label">${Utils.esc(item.label)}</span>
      </label>
      <button class="del-item" data-sid="${sid}" data-iid="${item.id}" data-action="del-item" title="Delete">×</button>
    `;
    return wrap;
  },

  // ── EVENT WIRING ─────────────────────────────────────────

  _attachTopbar() {
    document.getElementById('btn-back').addEventListener('click', async () => {
      await this._persist();
      Router.go('home');
    });
    document.getElementById('sv-passage').addEventListener('input', e => {
      this.session.passage = e.target.value;
      this._save();
    });
    document.getElementById('sv-date').addEventListener('input', e => {
      this.session.date = e.target.value;
      this._save();
    });
    document.querySelectorAll('.mode-toggle button').forEach(btn => {
      btn.addEventListener('click', () => this._setMode(btn.dataset.mode));
    });
  },

  _attachBodyListeners() {
    const body = document.getElementById('sv-body');
    if (!body) return;

    // Textarea answers
    body.querySelectorAll('textarea[data-field="i-answer"]').forEach(el => {
      el.addEventListener('input', () => {
        this._autosize(el);
        this._updateItem(el.dataset.sid, el.dataset.iid, 'answer', el.value);
      });
      this._autosize(el);
    });

    // Checkboxes
    body.querySelectorAll('input[type="checkbox"]').forEach(el => {
      el.addEventListener('change', () => {
        this._updateItem(el.dataset.sid, el.dataset.iid, 'checked', el.checked);
      });
    });

    // Contenteditable fields (questions, labels, section titles, hints)
    body.querySelectorAll('.e[contenteditable="true"]').forEach(el => {
      el.addEventListener('input', () => {
        const { sid, iid, field } = el.dataset;
        const v = el.textContent;
        if (field.startsWith('s-')) {
          this._updateSection(sid, field.slice(2), v); // strip 's-' prefix
        } else {
          this._updateItem(sid, iid, field.slice(2), v); // strip 'i-' prefix
        }
      });
    });

    // Edit control buttons (delegated)
    body.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, sid, iid } = btn.dataset;
      if (action === 'add-field') this._addItem(sid, 'field');
      if (action === 'add-check') this._addItem(sid, 'check');
      if (action === 'add-hint')  this._addHint(sid);
      if (action === 'del-sec')   this._deleteSection(sid);
      if (action === 'del-item')  this._deleteItem(sid, iid);
    });
  },

  // ── STATE MUTATIONS ──────────────────────────────────────

  _updateSection(sid, field, value) {
    const sec = this.session.sections.find(s => s.id === sid);
    if (!sec) return;
    sec[field] = value;
    this._save();
  },

  _updateItem(sid, iid, field, value) {
    const sec = this.session.sections.find(s => s.id === sid);
    if (!sec) return;
    const item = sec.items.find(i => i.id === iid);
    if (!item) return;
    item[field] = value;
    this._save();
  },

  _addItem(sid, type) {
    const sec = this.session.sections.find(s => s.id === sid);
    if (!sec) return;
    if (type === 'check') {
      sec.items.push({ id: Utils.uid(), type: 'check', label: '', checked: false });
    } else {
      sec.items.push({ id: Utils.uid(), type: 'field', question: '', answer: '', size: 'normal' });
    }
    this._renderSections();
    this._save();
  },

  _addHint(sid) {
    const sec = this.session.sections.find(s => s.id === sid);
    if (!sec || sec.hint) return;
    sec.hint = 'Hint…';
    this._renderSections();
    this._save();
  },

  _addSection() {
    this.session.sections.push({
      id: Utils.uid(), title: 'New Section', ref: '', hint: '',
      items: [
        { id: Utils.uid(), type: 'field', question: 'Question', answer: '', size: 'normal' }
      ]
    });
    this._renderSections();
    this._save();
  },

  _deleteSection(sid) {
    if (!confirm('Delete this section?')) return;
    this.session.sections = this.session.sections.filter(s => s.id !== sid);
    this._renderSections();
    this._save();
  },

  _deleteItem(sid, iid) {
    const sec = this.session.sections.find(s => s.id === sid);
    if (!sec) return;
    sec.items = sec.items.filter(i => i.id !== iid);
    this._renderSections();
    this._save();
  },

  // ── HELPERS ──────────────────────────────────────────────

  _setMode(mode) {
    this.mode = mode;
    document.getElementById('btn-write').classList.toggle('active', mode === 'write');
    document.getElementById('btn-edit').classList.toggle('active',  mode === 'edit');
    this._applyMode();
  },

  _applyMode() {
    const body = document.getElementById('sv-body');
    if (!body) return;
    body.classList.toggle('mode-edit', this.mode === 'edit');
  },

  _autosize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  },

  async _persist() {
    if (!this.session) return;
    await DB.saveSession(this.session);
    const s = document.getElementById('sv-status');
    if (s) { s.textContent = 'Saved'; setTimeout(() => { if (s) s.textContent = ''; }, 1500); }
  }
};

// ── LOGIN VIEW ────────────────────────────────────────────────

const LoginView = {
  render(msg = '') {
    document.getElementById('app').innerHTML = `
      <div class="login-wrap">
        <div class="login-card">
          <h1 class="login-title">Bible Reading</h1>
          <p class="login-sub">Sign in to sync your sessions across devices.</p>
          ${msg ? `<div class="login-error">${msg}</div>` : ''}
          <input id="l-email"    type="email"    placeholder="Email"    class="login-input">
          <input id="l-password" type="password" placeholder="Password" class="login-input">
          <button class="login-btn" id="btn-signin">Sign in</button>
          <button class="login-btn login-btn-sec" id="btn-signup">Create account</button>
        </div>
      </div>
    `;
    document.getElementById('btn-signin').addEventListener('click', () => this._attempt('signin'));
    document.getElementById('btn-signup').addEventListener('click', () => this._attempt('signup'));
    document.getElementById('l-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') this._attempt('signin');
    });
  },

  async _attempt(action) {
    const email    = document.getElementById('l-email').value.trim();
    const password = document.getElementById('l-password').value;
    if (!email || !password) { this.render('Please enter email and password.'); return; }
    try {
      if (action === 'signup') {
        await Auth.signUp(email, password);
        this.render('Account created — check your email to confirm, then sign in.');
      } else {
        await Auth.signIn(email, password);
        // onAuthChange will fire and route to home
      }
    } catch (err) {
      this.render(err.message || 'Something went wrong.');
    }
  }
};

// ── ROUTER UPDATE ─────────────────────────────────────────────

const _routerGo = Router.go.bind(Router);
Router.go = function(view, params = {}) {
  if (view === 'login') { LoginView.render(); return; }
  _routerGo(view, params);
};

// ── BOOT ──────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

// Listen for auth changes — this fires on page load too
Auth.onAuthChange(user => {
  if (user) {
    Router.go('home');
  } else {
    Router.go('login');
  }
});

// Add sign out button to home header once rendered
const _homeRender = HomeView.render.bind(HomeView);
HomeView.render = async function() {
  await _homeRender();
  const header = document.querySelector('.home-header');
  if (header) {
    const btn = document.createElement('button');
    btn.className = 'btn-signout';
    btn.textContent = 'Sign out';
    btn.addEventListener('click', async () => { await Auth.signOut(); });
    header.appendChild(btn);
  }
};
