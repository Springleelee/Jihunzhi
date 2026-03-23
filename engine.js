// Particles
for (let i = 0; i < 15; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.left = Math.random() * 100 + 'vw';
  p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
  p.style.animationDuration = (Math.random() * 20 + 15) + 's';
  p.style.animationDelay = (Math.random() * 15) + 's';
  document.body.appendChild(p);
}

let playerName = '苏鸢';
let currentScene = 0;

function startGame() {
  const ts = document.getElementById('title-screen');
  ts.style.opacity = '0';
  ts.style.pointerEvents = 'none';
  setTimeout(() => {
    ts.style.display = 'none';
    document.getElementById('game-screen').classList.add('active');
    loadScene(0);
  }, 1500);
}

function transition(fn) {
  const t = document.getElementById('transition');
  t.classList.add('active');
  setTimeout(() => {
    fn();
    t.classList.remove('active');
  }, 800);
}

function loadScene(id) {
  currentScene = id;
  document.getElementById('scene-counter').textContent = '场景 ' + (id + 1);
  const scene = scenes[id];
  if (!scene) return;

  if (scene.chapter) {
    document.getElementById('chapter-tag').textContent = applyName(scene.chapter);
    document.getElementById('side-chapter').textContent = scene.chapterShort || '第一幕';
  }

  const content = document.getElementById('story-content');
  content.innerHTML = '';
  renderContent(scene.content, content);

  const choicesEl = document.getElementById('choices-container');
  choicesEl.innerHTML = '';
  if (scene.choices) {
    scene.choices.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-num">0${i + 1}</span>${applyName(c.text)}`;
      btn.onclick = () => {
        btn.style.borderColor = 'rgba(139,26,26,0.5)';
        btn.style.color = 'var(--red)';
        setTimeout(() => transition(() => {
          if (c.next === 'name_input') {
            showNameInput();
          } else {
            loadScene(c.next);
          }
        }), 200);
      };
      choicesEl.appendChild(btn);
    });
  }

  const scrollArea = document.getElementById('scroll-area');
  scrollArea.scrollTop = 0;

  const choiceArea = document.querySelector('.choice-area');
  const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (isMobile) {
    choiceArea.classList.remove('hidden');
    choiceArea.classList.add('visible');
  } else {
    choiceArea.classList.add('hidden');
    choiceArea.classList.remove('visible');

    const onScroll = () => {
      const nearBottom = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight < 80;
      if (nearBottom) {
        choiceArea.classList.remove('hidden');
        choiceArea.classList.add('visible');
        scrollArea.removeEventListener('scroll', onScroll);
      }
    };

    scrollArea.addEventListener('scroll', onScroll);

    setTimeout(() => {
      const noScroll = scrollArea.scrollHeight <= scrollArea.clientHeight + 20;
      if (noScroll) {
        choiceArea.classList.remove('hidden');
        choiceArea.classList.add('visible');
        scrollArea.removeEventListener('scroll', onScroll);
      }
    }, 400);
  }
}

function showNameInput() {
  const choicesEl = document.getElementById('choices-container');
  choicesEl.innerHTML = `
    <div class="name-input-wrap">
      <div class="atmos">她用了哪个名字……</div>
      <input class="name-input" id="name-input" placeholder="苏鸢" maxlength="6" />
      <button class="name-confirm" onclick="confirmName()">确认</button>
    </div>
  `;
  document.getElementById('name-input').focus();
  document.getElementById('name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmName();
  });
}

function confirmName() {
  const val = document.getElementById('name-input').value.trim();
  if (val) playerName = val;
  document.getElementById('player-name-display').textContent = playerName;
  transition(() => loadScene(1));
}

function applyName(text) {
  if (!text) return text;
  return text.replace(/苏鸢/g, playerName);
}

function renderContent(blocks, container) {
  blocks.forEach((block, i) => {
    const el = document.createElement('div');
    el.style.animationDelay = (i * 0.12) + 's';

    if (block.type === 'location') {
      el.className = 'scene-location';
      el.textContent = applyName(block.text);
    } else if (block.type === 'chapter-title') {
      el.className = 'scene-block';
      el.innerHTML = `<div class="chapter-title">${applyName(block.text)}</div><div class="chapter-sub">${applyName(block.sub || '')}</div>`;
    } else if (block.type === 'narration') {
      el.className = 'narration scene-block';
      el.innerHTML = applyName(block.text);
    } else if (block.type === 'thought') {
      el.className = 'inner-thought scene-block';
      el.innerHTML = applyName(block.text);
    } else if (block.type === 'dialogue') {
      el.className = 'dialogue-wrap scene-block';
      el.innerHTML = `<div class="speaker-tag">${applyName(block.speaker)}</div><div class="dialogue">「${applyName(block.text)}」</div>`;
    } else if (block.type === 'div') {
      el.className = 'section-div';
      el.innerHTML = `<span>${block.text || '◆'}</span>`;
    } else if (block.type === 'atmos') {
      el.className = 'atmos scene-block';
      el.textContent = applyName(block.text);
    }

    container.appendChild(el);
  });
}