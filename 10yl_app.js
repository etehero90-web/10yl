/* =========================================================
   10YL — app.js
   10 Years Later: 10년 후 나의 미래 유형 테스트
   =========================================================
   교훈 반영:
   - 마일스톤 화면 없음 (카테고리 헤더 배지로 대체)
   - CAT_OF 정확히 일치
   - 광고 ins 태그 HTML에 직접 배치
   - 인코딩 정상 (UTF-8)
   ========================================================= */

// ── CAT_OF 배열 ───────────────────────────────────────────
// 총 37문항 (i18n.js 한국어 질문 수와 반드시 일치)
// CAT 0 나이:        1개  → 0
// CAT 1 재정&자산:   4개  → 1~4
// CAT 2 커리어:      5개  → 5~9
// CAT 3 AI&기술:     4개  → 10~13
// CAT 4 관계:        4개  → 14~17
// CAT 5 건강:        5개  → 18~22
// CAT 6 식습관생활:  6개  → 23~28
// CAT 7 소비여가:    3개  → 29~31
// CAT 8 미디어성장:  5개  → 32~36
const CAT_OF = [0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6,7,7,7,8,8,8,8];

// ── 점수 계산 ─────────────────────────────────────────────
function calcScores(answers) {
  const avg = (indices) => {
    let sum = 0, cnt = 0;
    indices.forEach(i => {
      if (answers[i] !== undefined) { sum += answers[i] + 1; cnt++; }
    });
    return cnt > 0 ? Math.min(5, Math.max(1, Math.round(sum / cnt))) : 3;
  };
  return {
    age:       answers[0] !== undefined ? answers[0] : 1,
    financial: avg([1,2,3,4]),
    career:    avg([5,6,7,8,9]),
    tech:      avg([10,11,12,13]),
    relation:  avg([14,15,16,17]),
    exercise:  avg([18,19,20,21,22]),
    lifestyle: avg([23,24,25,26,27,28]),
    spending:  avg([29,30,31]),
    growth:    avg([32,33,34,35,36]),
  };
}

// ── 유형 판정 ─────────────────────────────────────────────
function detectType(scores) {
  const { age, financial, career, tech, relation, exercise, lifestyle, spending, growth } = scores;

  // 6개 축 점수 합산으로 우세 축 판별
  const axes = {
    financial, career, tech, relation, exercise, growth
  };
  const top = Object.entries(axes).sort((a, b) => b[1] - a[1]);
  const first  = top[0][0];
  const second = top[1][0];

  // 나이 그룹: 0=10대, 1=20대, 2=30대, 3=40대, 4=50대+
  const ageGroup = age;

  // 유형 판정 — 상위 2개 축 조합 기반
  if (first === 'financial' || second === 'financial') {
    if (financial >= 4 && career >= 3) return ageGroup <= 1 ? 'TYPE_1A' : 'TYPE_1B';
    if (financial >= 4) return 'TYPE_2A';
    return 'TYPE_2B';
  }
  if (first === 'tech' || second === 'tech') {
    if (tech >= 4 && career >= 4) return 'TYPE_3A';
    if (tech >= 4 && growth >= 3) return 'TYPE_3B';
    return 'TYPE_4A';
  }
  if (first === 'career' || second === 'career') {
    if (career >= 4 && relation >= 3) return 'TYPE_4B';
    if (career >= 4) return ageGroup <= 2 ? 'TYPE_5A' : 'TYPE_5B';
    return 'TYPE_5A';
  }
  if (first === 'exercise' || second === 'exercise') {
    if (exercise >= 4 && lifestyle >= 3) return 'TYPE_6A';
    return 'TYPE_6B';
  }
  if (first === 'growth' || second === 'growth') {
    if (growth >= 4 && tech >= 3) return 'TYPE_3B';
    if (growth >= 4) return 'TYPE_7A';
    return 'TYPE_7B';
  }
  if (first === 'relation') {
    if (relation >= 4) return ageGroup <= 2 ? 'TYPE_8A' : 'TYPE_8B';
    return 'TYPE_7B';
  }
  return 'TYPE_5A';
}

// ── 광고 설정 ─────────────────────────────────────────────
const AD_CONFIG = {
  kakao: {
    unitId_top:    'DAN-dIpvXD89rtv58vDe',
    unitId_bottom: 'DAN-UYorlfW7Ou8EcvKw',
    unitId_mid:    'DAN-qpCC5PtwOYM0L7MY',
    unitId_result: 'DAN-2CLeWJW0SFaYkj6I',
    width: 320, height_sm: 50, height_lg: 100,
  },
  google: {
    publisherId: 'ca-pub-3386645467399209',
    slotId: 'XXXXXXXXXX',
  },
};

// ── 전역 상태 ─────────────────────────────────────────────
let curQ = 0, answers = {};
let _currentResult = null, _cdTimer = null;
let _sharePlatform = '', _shareImageData = '';

// ── 앱 빌드 ───────────────────────────────────────────────
function rebuildApp() {
  const ui = t().ui;
  document.title = `${ui.title} — ${ui.subtitle}`;
  document.getElementById('app').innerHTML =
    buildLangScreen() + buildIntroScreen() + buildPrivacyScreen() + buildQuizScreen() + buildResultScreen();
  showScreen('lang');
}

// ── 언어 선택 ─────────────────────────────────────────────
function buildLangScreen() {
  const langs = Object.entries(I18N).map(([code, l]) =>
    `<button class="lang-btn" onclick="setLang('${code}')">
       <span class="lang-flag">${l.flag}</span>
       <span class="lang-name">${l.langName}</span>
     </button>`).join('');
  return `<div class="screen" id="screen-lang">
    <div class="lang-wrap">
      <div class="lang-brand">10YL</div>
      <div class="lang-title">10년 후 나의 미래는 어떻게 변할까?</div>
      <div class="lang-sub">언어를 선택하세요 · Select your language</div>
      <div class="lang-grid">${langs}</div>
    </div>
  </div>`;
}

function setLang(code) {
  LANG = code;
  document.body.style.fontFamily = I18N[code]?.font || "'Noto Sans KR', sans-serif";
  rebuildApp();
  showScreen('intro');
}

// ── 인트로 ────────────────────────────────────────────────
function buildIntroScreen() {
  const ui = t().ui, cats = t().cats;
  const catChips = cats.map(c =>
    `<div class="cat-chip"><span class="chip-icon">${c.icon}</span>${c.name}</div>`).join('');
  const notices = ui.notice.map(n => `<div class="notice-item">${n}</div>`).join('');
  const warns   = ui.noticeWarn.map(n => `<div class="notice-item warn">${n}</div>`).join('');
  return `<div class="screen" id="screen-intro">
    <div class="intro-eyebrow">AI FUTURE PREDICTION TEST</div>
    <div class="intro-title"><span>${ui.title}</span></div>
    <p class="intro-subtitle">${ui.subtitle}</p>
    <div class="cat-grid">${catChips}</div>
    <div class="free-badge-wrap"><span class="free-badge">${ui.freeBadge}</span></div>
    <div class="notice-box">
      <div class="notice-title">📋 NOTICE</div>
      ${notices}${warns}
    </div>
    <span class="privacy-link" onclick="showScreen('privacy')">${ui.privacy}</span>
    <button class="btn-primary" onclick="startQuiz()">${ui.startBtn}</button>
    <p class="hint">${ui.hint}</p>
  </div>`;
}

// ── 개인정보처리방침 ──────────────────────────────────────
function buildPrivacyScreen() {
  return `<div class="screen" id="screen-privacy">
    <div class="priv-wrap">
      <h2>📋 개인정보처리방침</h2>
      <div class="priv-section"><h3>1. 수집하는 정보</h3><p>본 서비스는 테스트 응답 데이터만 처리하며, 결과 생성 후 즉시 삭제됩니다. 이름, 이메일 등 개인 식별 정보는 수집하지 않습니다.</p></div>
      <div class="priv-section"><h3>2. 광고</h3><p>본 서비스는 카카오 애드핏 및 구글 애드센스 광고를 게재합니다.</p></div>
      <div class="priv-section"><h3>3. 면책 조항</h3><p>본 테스트 결과는 오락 목적으로만 제공됩니다. 실제 금융, 커리어 상담을 대체하지 않습니다.</p></div>
      <button class="btn-ghost" onclick="showScreen('intro')">← 돌아가기</button>
    </div>
  </div>`;
}

// ── 퀴즈 ──────────────────────────────────────────────────
function buildQuizScreen() {
  return `<div class="screen" id="screen-quiz"><div id="quiz-inner"></div></div>`;
}

function renderQ() {
  const qs = getQs(), ui = t().ui, cats = t().cats;
  if (curQ >= qs.length) { finishQuiz(); return; }

  const catIdx   = CAT_OF[curQ];
  const cat      = cats[catIdx] || cats[0];
  const q        = qs[curQ];
  const total    = qs.length;
  const pct      = Math.round((curQ / total) * 100);
  const selected = answers[curQ];
  const isCatStart = curQ > 0 && CAT_OF[curQ] !== CAT_OF[curQ - 1];

  const opts = q.opts.map((o, i) =>
    `<div class="opt${selected === i ? ' selected' : ''}" onclick="selectOpt(${i})">
       <div class="opt-radio"></div><span>${o}</span>
     </div>`).join('');

  document.getElementById('quiz-inner').innerHTML = `
    <div class="progress-wrap">
      <div class="progress-top">
        <span class="progress-label">${ui.catLabel} ${cat.icon} ${cat.name}</span>
        <span class="progress-pct">${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    ${isCatStart ? `
    <div class="cat-header" style="border-color:rgba(99,102,241,0.4);background:rgba(99,102,241,0.08);">
      <div class="cat-header-icon">${cat.icon}</div>
      <div><div class="cat-header-name" style="color:#a5b4fc;">${cat.name}</div>
           <div class="cat-header-msg">${cat.msg}</div></div>
    </div>` : ''}
    <div class="quiz-mid-banner">
      <div class="ad-banner-label">광고 · AD</div>
      <ins class="kakao_ad_area"
           data-ad-unit="DAN-qpCC5PtwOYM0L7MY"
           data-ad-width="320"
           data-ad-height="100"></ins>
    </div>
    <div class="q-card">
      <div class="q-num">Q${curQ + 1} / ${total}</div>
      <div class="q-text">${q.q}</div>
      <div class="options">${opts}</div>
    </div>
    <div class="quiz-nav">
      <button class="btn-back" onclick="prevQ()" ${curQ === 0 ? 'style="opacity:0.3;pointer-events:none"' : ''}>${ui.back}</button>
      <button class="btn-next" id="btn-next" onclick="nextQ()" ${selected === undefined ? 'disabled' : ''}>${ui.next}</button>
    </div>`;
}

function selectOpt(i) {
  answers[curQ] = i;
  document.querySelectorAll('.opt').forEach((el, idx) => el.classList.toggle('selected', idx === i));
  const btn = document.getElementById('btn-next');
  if (btn) btn.disabled = false;
}
function nextQ() { if (answers[curQ] === undefined) return; curQ++; renderQ(); }
function prevQ() { if (curQ > 0) { curQ--; renderQ(); } }

// ── 결과 화면 ─────────────────────────────────────────────
function buildResultScreen() {
  const ui = t().ui;
  const SHARE_BTNS = `
    <div class="share-btns">
      <button class="share-btn kakao"   onclick="shareKakao()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.632 5.07 4.09 6.48L5.1 21l5.1-2.52c.59.09 1.19.14 1.8.14 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z"/></svg>KakaoTalk
      </button>
      <button class="share-btn twitter" onclick="shareTwitter()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>X
      </button>
      <button class="share-btn facebook" onclick="shareFacebook()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>Facebook
      </button>
      <button class="share-btn insta"   onclick="shareInsta()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>Instagram
      </button>
      <button class="share-btn copy" onclick="copyLink()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Copy
      </button>
    </div>`;

  return `<div class="screen" id="screen-result">
    <div class="result-inline-banner">
      <div class="ad-banner-label">광고 · AD</div>
      <ins class="kakao_ad_area"
           data-ad-unit="DAN-2CLeWJW0SFaYkj6I"
           data-ad-width="320"
           data-ad-height="100"></ins>
    </div>
    <div class="result-preview-card">
      <div class="preview-emoji" id="r-emoji"></div>
      <div class="preview-eyebrow">${ui.resultLabel}</div>
      <div class="preview-type" id="r-type"></div>
      <div class="preview-subtitle" id="r-subtitle"></div>
      <div class="preview-oneline" id="r-oneline"></div>
      <div class="hashtag-wrap" id="r-hashtags"></div>
    </div>
    <div class="locked-wrap">
      <div id="locked-blur" class="locked-blur">
        <div class="sec-card">
          <div class="sec-label">${ui.secCurrent}</div>
          <div class="sec-text" id="r-charm"></div>
        </div>
        <div class="sec-card">
          <div class="sec-label">${ui.secStrengths}</div>
          <div class="item-list" id="r-strengths"></div>
        </div>
      </div>
      <div class="lock-overlay" id="lock-overlay">
        <div class="lock-icon">🔒</div>
        <div class="lock-msg">${ui.lockMsg}</div>
      </div>
    </div>
    <button class="unlock-btn" id="unlock-btn" onclick="showVideoAd()">${ui.unlockBtn}</button>
    <div class="result-full" id="result-full">
      <div class="sec-card">
        <div class="sec-label">${ui.secTimeline}</div>
        <div class="tl-list" id="r-timeline-full"></div>
      </div>
      <div class="banner-ad-wrap">
        <div class="ad-banner-label">광고 · AD</div>
        <ins class="kakao_ad_area"
             data-ad-unit="DAN-qpCC5PtwOYM0L7MY"
             data-ad-width="320"
             data-ad-height="100"></ins>
      </div>
      <div class="sec-card">
        <div class="sec-label">${ui.secRisks}</div>
        <div class="item-list" id="r-cautions"></div>
      </div>
      <div class="sec-card">
        <div class="sec-label">${ui.secMbti}</div>
        <div class="sec-text" id="r-mbti"></div>
      </div>
      <div class="sec-card">
        <div class="sec-label">${ui.secActions}</div>
        <div class="sec-text" id="r-where"></div>
      </div>
      <div class="closing-card">
        <div class="sec-text" id="r-closing"></div>
      </div>
      <div class="share-card">
        <div class="share-title">${ui.shareTitle}</div>
        <div class="share-msg" id="r-share-msg"></div>
        ${SHARE_BTNS}
      </div>
      <div class="banner-ad-wrap">
        <div class="ad-banner-label">광고 · AD</div>
        <ins class="kakao_ad_area"
             data-ad-unit="DAN-qpCC5PtwOYM0L7MY"
             data-ad-width="320"
             data-ad-height="100"></ins>
      </div>
      <div class="disclaimer-bottom">${ui.disclaimer}</div>
      <button class="btn-ghost" onclick="restart()" style="margin-bottom:2rem">${ui.restart}</button>
    </div>
    <!-- 15초 동영상 광고 모달 -->
    <div class="video-ad-overlay" id="video-ad-modal">
      <div class="video-ad-box">
        <div class="video-ad-topbar">
          <span class="video-ad-badge">AD</span>
          <span class="video-ad-skip" id="skip-btn">잠시 후 건너뛸 수 있어요</span>
        </div>
        <div class="video-ad-slot" id="video-ad-slot">
          <ins class="kakao_ad_area"
               data-ad-unit="DAN-qpCC5PtwOYM0L7MY"
               data-ad-width="320"
               data-ad-height="100"></ins>
        </div>
        <div class="video-progress-wrap">
          <div class="video-progress-bg">
            <div class="video-progress-fill" id="video-progress"></div>
          </div>
        </div>
        <div class="video-countdown-wrap">
          <span class="video-countdown-text"><span id="cd-num">15</span>초 후 결과 확인 가능</span>
        </div>
      </div>
    </div>
    <!-- 공유 이미지 모달 -->
    <div class="modal-overlay" id="modal-share-img">
      <div class="modal-box">
        <div class="modal-title" id="share-img-title">공유 이미지</div>
        <div class="modal-sub"  id="share-img-desc">이미지를 저장한 후 업로드하세요</div>
        <div class="share-img-preview-wrap"><img id="share-img-preview" src="" alt="공유 이미지" /></div>
        <button class="btn-share-save" onclick="downloadShareImage()">📥 이미지 저장하기</button>
        <div class="share-guide" id="share-guide"></div>
        <button class="btn-open-platform" id="btn-open-platform" onclick="openPlatform()"></button>
        <button class="modal-btn-close" onclick="closeShareModal()">닫기 · Close</button>
      </div>
    </div>
    <canvas id="share-canvas" style="display:none;"></canvas>
  </div>`;
}

// ── 결과 생성 ─────────────────────────────────────────────
function finishQuiz() {
  const scores   = calcScores(answers);
  const typeCode = detectType(scores);
  const result   = getResult(typeCode);
  _currentResult = result;
  showScreen('result');

  document.getElementById('r-emoji').textContent    = result.emoji;
  document.getElementById('r-type').textContent     = result.type_name;
  document.getElementById('r-subtitle').textContent = result.subtitle;
  document.getElementById('r-oneline').textContent  = result.one_line;
  document.getElementById('r-hashtags').innerHTML   =
    result.hashtags.map(h => `<span class="hashtag">${h}</span>`).join('');
  document.getElementById('r-charm').textContent    = result.charm;
  renderStrengths('r-strengths', result.strengths);
}

function renderStrengths(id, items) {
  document.getElementById(id).innerHTML = (items || []).map(s =>
    `<div class="item"><span class="item-icon">${s.icon}</span>
       <div><div class="item-title">${s.title}</div><div class="item-desc">${s.desc}</div></div>
     </div>`).join('');
}

// ── 15초 동영상 광고 ──────────────────────────────────────
function showVideoAd() {
  document.getElementById('video-ad-modal').classList.add('show');
  let sec = 15;
  document.getElementById('cd-num').textContent = sec;
  document.getElementById('video-progress').style.width = '0%';
  const skipBtn = document.getElementById('skip-btn');
  skipBtn.textContent = '잠시 후 건너뛸 수 있어요';
  skipBtn.classList.remove('active');
  skipBtn.onclick = null;

  _cdTimer = setInterval(() => {
    sec--;
    document.getElementById('cd-num').textContent = sec;
    document.getElementById('video-progress').style.width = `${((15 - sec) / 15) * 100}%`;
    if (sec <= 5) skipBtn.textContent = `건너뛰기 (${sec})`;
    if (sec <= 0) {
      clearInterval(_cdTimer);
      skipBtn.textContent = '결과 확인하기 ✅';
      skipBtn.classList.add('active');
      skipBtn.onclick = unlockResult;
    }
  }, 1000);
}

function unlockResult() {
  clearInterval(_cdTimer);
  document.getElementById('video-ad-modal').classList.remove('show');
  const result = _currentResult;
  document.getElementById('locked-blur').classList.remove('locked-blur');
  document.getElementById('lock-overlay').style.display = 'none';

  const btn = document.getElementById('unlock-btn');
  btn.textContent = t().ui.unlockComplete;
  btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'default';
  document.getElementById('result-full').classList.add('unlocked');

  const ui = t().ui, labs = ui.periodLabels;
  document.getElementById('r-timeline-full').innerHTML = [
    { label: labs[0], text: result.scenario_1yr },
    { label: labs[1], text: result.scenario_5yr },
    { label: labs[2], text: result.scenario_10yr },
  ].map(item =>
    `<div class="tl-item"><span class="tl-badge">${item.label}</span><span class="tl-text">${item.text}</span></div>`
  ).join('');

  document.getElementById('r-cautions').innerHTML = (result.cautions || []).map(c =>
    `<div class="item"><span class="item-icon">${c.icon}</span>
       <div><div class="item-title">${c.title}</div><div class="item-desc">${c.desc}</div></div>
     </div>`).join('');
  document.getElementById('r-mbti').textContent    = result.mbti;
  document.getElementById('r-where').textContent   = result.actions;
  document.getElementById('r-closing').textContent = result.closing;
  document.getElementById('r-share-msg').textContent = result.share;

  setTimeout(() =>
    document.getElementById('result-full').scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  showToast('🎉 ' + t().ui.unlockComplete);
}

// ── 공유 이미지 생성 (스토리형 9:16) ─────────────────────
function generateShareImage() {
  const r = _currentResult;
  if (!r) return '';
  const W = 1080, H = 1920;
  const canvas = document.getElementById('share-canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 배경
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0a14'); bg.addColorStop(1, '#080810');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W/2, H*0.25, 0, W/2, H*0.25, W*0.5);
  glow.addColorStop(0, 'rgba(99,102,241,0.15)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(129,140,248,0.9)';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText('10YL', W/2, 80);

  ctx.font = '180px serif';
  ctx.fillText(r.emoji, W/2, 380);

  ctx.font = '500 38px sans-serif';
  ctx.fillStyle = 'rgba(165,180,252,0.8)';
  ctx.fillText('나의 10년 후 유형', W/2, 470);

  ctx.font = 'bold 80px sans-serif';
  ctx.fillStyle = '#ffffff';
  wrapText(ctx, r.type_name, W/2, 590, W-100, 95);

  ctx.font = '400 36px sans-serif';
  ctx.fillStyle = 'rgba(165,180,252,0.7)';
  wrapText(ctx, r.subtitle, W/2, 720, W-120, 50);

  const lg = ctx.createLinearGradient(80, 0, W-80, 0);
  lg.addColorStop(0, 'rgba(99,102,241,0)'); lg.addColorStop(0.5, 'rgba(99,102,241,0.4)'); lg.addColorStop(1, 'rgba(99,102,241,0)');
  ctx.strokeStyle = lg; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(80, 800); ctx.lineTo(W-80, 800); ctx.stroke();

  ctx.font = 'bold 42px sans-serif';
  ctx.fillStyle = '#f0f0f0';
  wrapText(ctx, r.one_line, W/2, 870, W-120, 56);

  ctx.font = '500 30px sans-serif';
  ctx.fillStyle = 'rgba(129,140,248,0.8)';
  ctx.fillText((r.hashtags || []).slice(0,3).join(' '), W/2, 1020);

  // 특징 박스
  ctx.fillStyle = 'rgba(99,102,241,0.08)';
  roundRect(ctx, 60, 1060, W-120, 280, 16); ctx.fill();
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = 'rgba(165,180,252,0.8)';
  ctx.textAlign = 'left';
  ctx.fillText('✨ 10년 후 모습', 90, 1105);
  ctx.textAlign = 'center';
  ctx.font = '400 32px sans-serif';
  ctx.fillStyle = '#cccccc';
  const shortCharm = r.charm.length > 90 ? r.charm.slice(0, 90) + '…' : r.charm;
  wrapText(ctx, shortCharm, W/2, 1155, W-160, 48);

  // CTA
  const ctaG = ctx.createLinearGradient(0, 1520, 0, 1730);
  ctaG.addColorStop(0, 'rgba(99,102,241,0.2)'); ctaG.addColorStop(1, 'rgba(99,102,241,0.08)');
  ctx.fillStyle = ctaG;
  roundRect(ctx, 60, 1520, W-120, 210, 24); ctx.fill();
  ctx.strokeStyle = 'rgba(99,102,241,0.45)'; ctx.lineWidth = 2;
  roundRect(ctx, 60, 1520, W-120, 210, 24); ctx.stroke();

  ctx.font = 'bold 40px sans-serif';
  ctx.fillStyle = '#818cf8';
  ctx.fillText('나의 10년 후도 궁금하다면?', W/2, 1592);
  ctx.font = '400 30px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('지금 바로 테스트해보세요 🚀', W/2, 1640);
  ctx.font = '400 26px sans-serif';
  ctx.fillStyle = 'rgba(99,102,241,0.6)';
  ctx.fillText('10yltest.netlify.app', W/2, 1695);

  return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxW, lh) {
  if (!text) return y;
  let line = '', curY = y;
  text.split('').forEach(ch => {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, curY); line = ch; curY += lh; }
    else line = test;
  });
  if (line) ctx.fillText(line, x, curY);
  return curY;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y); ctx.closePath();
}

// ── 공유 모달 ─────────────────────────────────────────────
function openShareModal(platform) {
  _sharePlatform = platform;
  _shareImageData = generateShareImage();
  document.getElementById('share-img-preview').src = _shareImageData;

  const configs = {
    kakao:    { title:'📤 카카오톡 공유', desc:'이미지를 저장한 후 카카오톡에서 전송하세요',
                guide:'① [이미지 저장하기] 버튼 클릭\n② 카카오톡 앱 열기\n③ 채팅창 → + → 사진 → 저장된 이미지', btnTxt:'📱 카카오톡 열기', btnUrl:'kakaotalk://' },
    twitter:  { title:'📤 X 공유', desc:'이미지를 저장한 후 X 앱에서 업로드하세요',
                guide:'① [이미지 저장하기] 버튼 클릭\n② X 앱 열기\n③ 새 게시물 → 이미지 첨부', btnTxt:'🐦 X 앱 열기', btnUrl:'twitter://' },
    facebook: { title:'📤 Facebook 공유', desc:'이미지를 저장한 후 Facebook에 업로드하세요',
                guide:'① [이미지 저장하기] 버튼 클릭\n② Facebook 앱 열기\n③ 스토리 만들기 → 저장된 이미지 선택', btnTxt:'📘 Facebook 열기', btnUrl:'fb://' },
    insta:    { title:'📤 Instagram 스토리 공유', desc:'이미지를 저장한 후 인스타그램 스토리에 업로드하세요',
                guide:'① [이미지 저장하기] 버튼 클릭\n② Instagram 앱 열기\n③ 스토리 → + → 저장된 이미지 선택', btnTxt:'📸 Instagram 열기', btnUrl:'instagram://' },
  };
  const cfg = configs[platform] || configs.insta;
  document.getElementById('share-img-title').textContent    = cfg.title;
  document.getElementById('share-img-desc').textContent     = cfg.desc;
  document.getElementById('share-guide').textContent        = cfg.guide;
  document.getElementById('btn-open-platform').textContent  = cfg.btnTxt;
  document.getElementById('btn-open-platform').dataset.url  = cfg.btnUrl;
  document.getElementById('modal-share-img').classList.add('show');
}

function openPlatform() {
  window.location.href = document.getElementById('btn-open-platform').dataset.url;
  setTimeout(() => showToast('앱이 설치된 경우 열립니다'), 800);
}

function downloadShareImage() {
  const a = document.createElement('a');
  a.download = `10YL_${_sharePlatform}.png`;
  a.href = _shareImageData; a.click();
  showToast('✅ ' + t().ui.toastImg);
}

function closeShareModal() { document.getElementById('modal-share-img').classList.remove('show'); }

function shareKakao()    { openShareModal('kakao'); }
function shareTwitter()  { openShareModal('twitter'); }
function shareFacebook() { openShareModal('facebook'); }
function shareInsta()    { openShareModal('insta'); }

function copyLink() {
  const text = `${_currentResult?.emoji} 10YL — "${_currentResult?.type_name}"\n${_currentResult?.one_line || ''}\n\n${window.location.href}`;
  navigator.clipboard.writeText(text)
    .then(() => showToast(t().ui.toastCopied))
    .catch(() => showToast('Copy failed'));
}

// ── 토스트 ─────────────────────────────────────────────────
function showToast(msg) {
  let el = document.getElementById('global-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-toast'; el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ── 화면 전환 ──────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`screen-${name}`);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
}

// ── 시작 / 재시작 ─────────────────────────────────────────
function startQuiz() { curQ = 0; answers = {}; showScreen('quiz'); renderQ(); }
function restart()   { curQ = 0; answers = {}; _currentResult = null; showScreen('intro'); }

// ── 초기화 ────────────────────────────────────────────────
rebuildApp();
