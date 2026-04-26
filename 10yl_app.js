/* =========================================================
   LOVETYPE — app.js
   38문항 (CAT 0: 2개 포함), 16가지 유형 판정
   ⚠️ 10YL 교훈 반영:
      - 아포스트로피 충돌 없음
      - CAT_OF 배열 정확히 일치
      - 결과 폴백 완벽하게
   ========================================================= */

// ── CAT_OF 배열 (39문항 기준) ─────────────────────────────
// CAT 0 기본정보:  2개 (나의성별, 이상형느낌)  → 인덱스 0~1
// CAT 1 연락스타일: 5개                        → 인덱스 2~6
// CAT 2 데이트취향: 5개                        → 인덱스 7~11
// CAT 3 감정표현:  5개                         → 인덱스 12~16
// CAT 4 끌리는외모: 5개                        → 인덱스 17~21
// CAT 5 성격취향:  5개                         → 인덱스 22~26
// CAT 6 라이프스타일: 6개                      → 인덱스 27~32
// CAT 7 연애가치관: 6개                        → 인덱스 33~38
const CAT_OF = [0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,7,7];

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
    // answers[0] = 나의 성별 (0=남성, 1=여성, 2=그 외)
    // answers[1] = 이상형 첫 느낌 (0~4)
    gender:    answers[0] !== undefined ? answers[0] : 0,
    feel:      answers[1] !== undefined ? answers[1] : 0,
    // 연락 스타일: 인덱스 2~6
    contact:   avg([2,3,4,5,6]),
    // 데이트 취향: 인덱스 7~11
    date:      avg([7,8,9,10,11]),
    // 감정 표현: 인덱스 12~16
    express:   avg([12,13,14,15,16]),
    // 끌리는 외모: 인덱스 17~21
    looks:     avg([17,18,19,20,21]),
    // 성격 취향: 인덱스 22~26
    personality: avg([22,23,24,25,26]),
    // 라이프스타일: 인덱스 27~32
    lifestyle: avg([27,28,29,30,31,32]),
    // 연애 가치관: 인덱스 33~37
    value:     avg([33,34,35,36,37]),
  };
}

// ── 유형 판정 ─────────────────────────────────────────────
// gender: 0=남성 이상형, 1=여성 이상형, 2=상관없음
// feel:   0=든든, 1=활발, 2=지적, 3=귀여움, 4=신비

function detectType(scores) {
  const { gender, feel, contact, express, personality, lifestyle, value, looks } = scores;

  // 여성 이상형 (gender === 1)
  if (gender === 1) {
    // feel 기반 우선 분기
    if (feel === 4) return 'TYPE_F6'; // 신비로운 → 레드와인형
    if (feel === 0) {
      // 든든 → 김치찌개형 or 건강한 그릭샐러드형
      if (lifestyle >= 4) return 'TYPE_F5';
      return 'TYPE_F4';
    }
    if (feel === 1) {
      // 활발 → 딸기타르트형 or 도넛형
      if (express >= 4) return 'TYPE_F1';
      return 'TYPE_F7';
    }
    if (feel === 2) {
      // 지적 → 오페라케이크형 or 레몬마들렌형
      if (personality >= 4) return 'TYPE_F8';
      return 'TYPE_F2';
    }
    if (feel === 3) {
      // 귀여움 → 흑당버블티형 or 딸기타르트형
      if (contact >= 4) return 'TYPE_F3';
      return 'TYPE_F1';
    }

    // feel 기반 분기 후 추가 분기
    if (express >= 4 && personality >= 4) return 'TYPE_F1';
    if (lifestyle >= 4 && personality <= 2) return 'TYPE_F5';
    if (value >= 4 && express >= 3) return 'TYPE_F3';
    if (personality >= 4 && looks >= 4) return 'TYPE_F6';
    if (contact >= 4 && express >= 3) return 'TYPE_F7';
    if (personality >= 3 && lifestyle <= 2) return 'TYPE_F8';
    if (express <= 2 && personality >= 3) return 'TYPE_F4';
    return 'TYPE_F2'; // 폴백
  }

  // 남성 이상형 (gender === 0 또는 2)
  // feel 기반 우선 분기
  if (feel === 0) {
    // 든든 → 에스프레소형 or 곰탕형
    if (express <= 2) return 'TYPE_M1';
    return 'TYPE_M7';
  }
  if (feel === 4) {
    // 신비 → 오마카세형 or 다크초콜릿형
    if (lifestyle >= 4) return 'TYPE_M2';
    return 'TYPE_M8';
  }
  if (feel === 1) {
    // 활발 → 페퍼로니피자형 or 컵케이크형
    if (express >= 4) return 'TYPE_M5';
    return 'TYPE_M4';
  }
  if (feel === 2) {
    // 지적 → 말차라떼형 or 오마카세형
    if (express >= 3) return 'TYPE_M6';
    return 'TYPE_M2';
  }
  if (feel === 3) {
    // 귀여움 → 크렘브륄레형 or 컵케이크형
    if (contact >= 4) return 'TYPE_M5';
    return 'TYPE_M3';
  }

  // 추가 분기 (feel 이외 점수 기반)
  if (express <= 2 && personality <= 2) return 'TYPE_M1';
  if (express >= 4 && contact >= 4)    return 'TYPE_M5';
  if (lifestyle >= 4 && personality >= 4) return 'TYPE_M2';
  if (personality >= 4 && express <= 2) return 'TYPE_M3';
  if (contact >= 4 && personality >= 3) return 'TYPE_M4';
  if (looks >= 4 && lifestyle <= 2)    return 'TYPE_M8';
  if (value >= 4 && lifestyle >= 3)    return 'TYPE_M6';
  if (express >= 3 && contact >= 3)    return 'TYPE_M7';
  return 'TYPE_M7'; // 최종 폴백
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
let curQ     = 0;
let answers  = {};
let _currentResult = null;
let _currentType   = null;
let _cdTimer       = null;
let _sharePlatform = '';
let _shareImageData = '';

// ── HTML 렌더링 ───────────────────────────────────────────
function rebuildApp() {
  const ui = t().ui;
  document.title = `${ui.title} — ${ui.subtitle}`;
  document.getElementById('app').innerHTML = `
    ${buildLangScreen()}
    ${buildIntroScreen()}
    ${buildPrivacyScreen()}
    ${buildQuizScreen()}
    ${buildResultScreen()}
  `;
  showScreen('lang');
}

// ── 언어 선택 화면 ────────────────────────────────────────
function buildLangScreen() {
  const langs = Object.entries(I18N).map(([code, l]) =>
    `<button class="lang-btn" onclick="setLang('${code}')">
       <span class="lang-flag">${l.flag}</span>
       <span class="lang-name">${l.langName}</span>
     </button>`
  ).join('');
  return `<div class="screen" id="screen-lang">
    <div class="lang-wrap">
      <div class="lang-brand">LOVETYPE</div>
      <div class="lang-title">나의 이상형은 어떤 사람일까?</div>
      <div class="lang-sub">언어를 선택하세요 · Select your language</div>
      <div class="lang-grid">${langs}</div>
    </div>
  </div>`;
}

function setLang(code) {
  LANG = code;
  const font = I18N[code]?.font || "'Noto Sans KR', sans-serif";
  document.body.style.fontFamily = font;
  rebuildApp();
  showScreen('intro');
}

// ── 인트로 화면 ───────────────────────────────────────────
function buildIntroScreen() {
  const ui   = t().ui;
  const cats = t().cats;
  const catChips = cats.map(c =>
    `<div class="cat-chip"><span class="chip-icon">${c.icon}</span>${c.name}</div>`
  ).join('');

  const notices = ui.notice.map(n =>
    `<div class="notice-item">${n}</div>`).join('');
  const warns = ui.noticeWarn.map(n =>
    `<div class="notice-item warn">${n}</div>`).join('');

  return `<div class="screen" id="screen-intro">
    <div class="intro-eyebrow">AI LOVE TYPE TEST</div>
    <div class="intro-title"><span>${ui.title}</span></div>
    <p class="intro-subtitle">${ui.subtitle}</p>

    <div class="cat-grid">${catChips}</div>

    <div class="free-badge-wrap">
      <span class="free-badge">${ui.freeBadge}</span>
    </div>

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
  const ui = t().ui;
  return `<div class="screen" id="screen-privacy">
    <div class="priv-wrap">
      <h2>📋 개인정보처리방침</h2>
      <div class="priv-section">
        <h3>1. 수집하는 정보</h3>
        <p>본 서비스는 테스트 응답 데이터만 처리하며, 결과 생성 후 즉시 삭제됩니다. 이름, 이메일, 전화번호 등 개인 식별 정보는 수집하지 않습니다.</p>
      </div>
      <div class="priv-section">
        <h3>2. 정보 이용 목적</h3>
        <p>응답 데이터는 러브타입 유형 판정에만 사용되며 외부로 전송되지 않습니다.</p>
      </div>
      <div class="priv-section">
        <h3>3. 광고</h3>
        <p>본 서비스는 카카오 애드핏 및 구글 애드센스 광고를 게재합니다. 해당 광고 서비스의 쿠키 정책이 적용될 수 있습니다.</p>
      </div>
      <div class="priv-section">
        <h3>4. 면책 조항</h3>
        <p>본 테스트 결과는 오락 및 자기 이해 목적으로만 제공됩니다. 실제 연애 상담이나 심리 진단을 대체하지 않습니다.</p>
      </div>
      <button class="btn-ghost" onclick="showScreen('intro')">← 돌아가기</button>
    </div>
  </div>`;
}

// ── 퀴즈 화면 ─────────────────────────────────────────────
function buildQuizScreen() {
  return `<div class="screen" id="screen-quiz">
    <div id="quiz-inner"></div>
  </div>`;
}

function renderQ() {
  const qs   = getQs();
  const ui   = t().ui;
  const cats = t().cats;
  if (curQ >= qs.length) { finishQuiz(); return; }

  const catIdx  = CAT_OF[curQ];
  const cat     = cats[catIdx] || cats[0];
  const q       = qs[curQ];
  const total   = qs.length;
  const pct     = Math.round((curQ / total) * 100);
  const selected = answers[curQ];

  renderQInner(q, ui, cat, pct, total, selected);
}

function renderQInner(q, ui, cat, pct, total, selected) {
  const qs = getQs();
  const opts = q.opts.map((o, i) =>
    `<div class="opt${selected === i ? ' selected' : ''}" onclick="selectOpt(${i})">
      <div class="opt-radio"></div>
      <span>${o}</span>
    </div>`
  ).join('');

  document.getElementById('quiz-inner').innerHTML = `
    <div class="progress-wrap">
      <div class="progress-top">
        <span class="progress-label">${ui.catLabel} ${cat.icon} ${cat.name}</span>
        <span class="progress-pct">${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>

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
    </div>
  `;
}



function selectOpt(i) {
  answers[curQ] = i;
  document.querySelectorAll('.opt').forEach((el, idx) =>
    el.classList.toggle('selected', idx === i));
  const btn = document.getElementById('btn-next');
  if (btn) btn.disabled = false;
}

function nextQ() {
  if (answers[curQ] === undefined) return;
  curQ++;
  renderQ();
}

function prevQ() {
  if (curQ > 0) { curQ--; renderQ(); }
}

// ── 결과 화면 ─────────────────────────────────────────────
function buildResultScreen() {
  const ui = t().ui;
  const SHARE_BTNS = `
    <div class="share-btns">
      <button class="share-btn kakao"   onclick="shareKakao()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.632 5.07 4.09 6.48L5.1 21l5.1-2.52c.59.09 1.19.14 1.8.14 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z"/></svg>
        KakaoTalk
      </button>
      <button class="share-btn twitter" onclick="shareTwitter()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X
      </button>
      <button class="share-btn facebook" onclick="shareFacebook()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook
      </button>
      <button class="share-btn insta"   onclick="shareInsta()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        Instagram
      </button>
      <button class="share-btn copy"    onclick="copyLink()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Copy
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
          <div class="sec-label">${ui.secTimeline}</div>
          <div class="tl-list" id="r-timeline"></div>
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
        <div class="sec-label">${ui.secCurrent}</div>
        <div class="sec-text" id="r-charm-full"></div>
      </div>
      <div class="sec-card">
        <div class="sec-label">${ui.secTimeline}</div>
        <div class="tl-list" id="r-timeline-full"></div>
      </div>
      <div class="sec-card">
        <div class="sec-label">${ui.secStrengths}</div>
        <div class="item-list" id="r-strengths-full"></div>
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

    <!-- 동영상 광고 모달 -->
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
        <div class="share-img-preview-wrap">
          <img id="share-img-preview" src="" alt="공유 이미지" />
        </div>
        <button class="btn-share-save" id="btn-share-save" onclick="downloadShareImage()">📥 이미지 저장하기</button>
        <div class="share-guide" id="share-guide"></div>
        <button class="btn-open-platform" id="btn-open-platform" onclick="openPlatform()"></button>
        <button class="modal-btn-close" onclick="closeShareModal()">닫기 · Close</button>
      </div>
    </div>
    <canvas id="share-canvas" style="display:none;"></canvas>
  </div>`;
}

// ── 퀴즈 완료 → 결과 생성 ────────────────────────────────
function finishQuiz() {
  const scores  = calcScores(answers);
  const typeCode = detectType(scores);
  const result  = getResult(typeCode);

  _currentResult = result;
  _currentType   = { code: typeCode, emoji: result.emoji, name: result.type_name };

  showScreen('result');

  // 미리보기 영역 채우기
  document.getElementById('r-emoji').textContent    = result.emoji;
  document.getElementById('r-type').textContent     = result.type_name;
  document.getElementById('r-subtitle').textContent = result.subtitle;
  document.getElementById('r-oneline').textContent  = result.one_line;

  const hashWrap = document.getElementById('r-hashtags');
  hashWrap.innerHTML = result.hashtags.map(h =>
    `<span class="hashtag">${h}</span>`).join('');

  // 블러 영역 미리보기
  document.getElementById('r-charm').textContent = result.charm;
  renderTimeline('r-timeline', result);
  renderStrengths('r-strengths', result.strengths);
}

function renderTimeline(id, result) {
  const ui   = t().ui;
  const labs = ui.periodLabels;
  const items = [
    { label: labs[0], text: result.dating_early },
    { label: labs[1], text: result.dating_mid   },
    { label: labs[2], text: result.dating_long  },
  ].map(item =>
    `<div class="tl-item">
       <span class="tl-badge">${item.label}</span>
       <span class="tl-text">${item.text}</span>
     </div>`
  ).join('');
  document.getElementById(id).innerHTML = items;
}

function renderStrengths(id, items) {
  document.getElementById(id).innerHTML = (items || []).map(s =>
    `<div class="item">
       <span class="item-icon">${s.icon}</span>
       <div>
         <div class="item-title">${s.title}</div>
         <div class="item-desc">${s.desc}</div>
       </div>
     </div>`
  ).join('');
}

// ── 동영상 광고 (15초 카운트다운) ────────────────────────
function showVideoAd() {
  document.getElementById('video-ad-modal').classList.add('show');
  let sec = 15;
  document.getElementById('cd-num').textContent = sec;
  document.getElementById('video-progress').style.width = '0%';
  document.getElementById('skip-btn').textContent = '잠시 후 건너뛸 수 있어요';
  document.getElementById('skip-btn').classList.remove('active');
  document.getElementById('skip-btn').onclick = null;

  _cdTimer = setInterval(() => {
    sec--;
    document.getElementById('cd-num').textContent = sec;
    document.getElementById('video-progress').style.width = `${((15 - sec) / 15) * 100}%`;
    if (sec <= 5) {
      document.getElementById('skip-btn').textContent = `건너뛰기 (${sec})`;
    }
    if (sec <= 0) {
      clearInterval(_cdTimer);
      document.getElementById('skip-btn').textContent = '결과 확인하기 ✅';
      document.getElementById('skip-btn').classList.add('active');
      document.getElementById('skip-btn').onclick = unlockResult;
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
  btn.textContent   = t().ui.unlockComplete;
  btn.disabled      = true;
  btn.style.opacity = '0.5';
  btn.style.cursor  = 'default';

  document.getElementById('result-full').classList.add('unlocked');

  // 전체 결과 채우기
  document.getElementById('r-charm-full').textContent = result.charm;
  renderTimeline('r-timeline-full', result);
  renderStrengths('r-strengths-full', result.strengths);

  document.getElementById('r-cautions').innerHTML = (result.cautions || []).map(c =>
    `<div class="item">
       <span class="item-icon">${c.icon}</span>
       <div>
         <div class="item-title">${c.title}</div>
         <div class="item-desc">${c.desc}</div>
       </div>
     </div>`
  ).join('');

  document.getElementById('r-mbti').textContent    = result.mbti;
  document.getElementById('r-where').textContent   = result.where_to_meet;
  document.getElementById('r-closing').textContent = result.closing;
  document.getElementById('r-share-msg').textContent = result.share;


  setTimeout(() =>
    document.getElementById('result-full').scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  showToast('🎉 ' + t().ui.unlockComplete);
}

// ── 광고 슬롯 렌더링 ─────────────────────────────────────
function renderAdSlot(slotId, size) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  let unitId;
  if (slotId === 'global-banner-bottom-slot') {
    unitId = AD_CONFIG.kakao.unitId_bottom;
  } else if (slotId === 'result-banner-top') {
    unitId = AD_CONFIG.kakao.unitId_result;
  } else if (size === 'sm') {
    unitId = AD_CONFIG.kakao.unitId_top;
  } else {
    unitId = AD_CONFIG.kakao.unitId_mid;
  }

  const w = AD_CONFIG.kakao.width;
  const h = size === 'sm' ? AD_CONFIG.kakao.height_sm : AD_CONFIG.kakao.height_lg;

  slot.innerHTML = '';
  const ins = document.createElement('ins');
  ins.className = 'kakao_ad_area';
  ins.setAttribute('data-ad-unit', unitId);
  ins.setAttribute('data-ad-width', String(w));
  ins.setAttribute('data-ad-height', String(h));
  slot.appendChild(ins);
}

// ── 공유 이미지 생성 ─────────────────────────────────────
function generateShareImage(ratio) {
  const r = _currentResult;
  if (!r) return '';

  const W = 1080;
  const H = ratio === 'story' ? 1920 : 1080;
  const canvas = document.getElementById('share-canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 배경 그라데이션
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0a0a14');
  bg.addColorStop(1, '#08080f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 글로우
  const glow = ctx.createRadialGradient(W/2, H*0.25, 0, W/2, H*0.25, W*0.5);
  glow.addColorStop(0, 'rgba(255,107,157,0.15)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 브랜드
  ctx.fillStyle = 'rgba(255,107,157,0.85)';
  ctx.font = 'bold 38px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LOVETYPE', W/2, 80);

  if (ratio === 'story') {
    // 이모지
    ctx.font = '180px serif';
    ctx.fillText(r.emoji, W/2, 380);

    // 유형 레이블
    ctx.font = '500 38px sans-serif';
    ctx.fillStyle = 'rgba(255,158,203,0.8)';
    ctx.fillText('나의 러브타입', W/2, 470);

    // 유형명
    ctx.font = 'bold 86px sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(ctx, r.type_name, W/2, 590, W-100, 100);

    // 부제
    ctx.font = '400 38px sans-serif';
    ctx.fillStyle = 'rgba(255,158,203,0.7)';
    wrapText(ctx, r.subtitle, W/2, 730, W-120, 52);

    // 구분선
    const lg = ctx.createLinearGradient(80, 0, W-80, 0);
    lg.addColorStop(0, 'rgba(255,107,157,0)');
    lg.addColorStop(0.5, 'rgba(255,107,157,0.4)');
    lg.addColorStop(1, 'rgba(255,107,157,0)');
    ctx.strokeStyle = lg;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, 810); ctx.lineTo(W-80, 810); ctx.stroke();

    // 한 줄 요약
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#f0f0f0';
    wrapText(ctx, r.one_line, W/2, 880, W-120, 58);

    // 해시태그
    ctx.font = '500 32px sans-serif';
    ctx.fillStyle = 'rgba(255,107,157,0.8)';
    ctx.fillText((r.hashtags || []).slice(0,3).join(' '), W/2, 1040);

    // 매력 포인트
    ctx.fillStyle = 'rgba(255,107,157,0.08)';
    roundRect(ctx, 60, 1080, W-120, 340, 16); ctx.fill();
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = 'rgba(255,158,203,0.8)';
    ctx.textAlign = 'left';
    ctx.fillText('✨ 이 유형의 매력', 90, 1125);
    ctx.textAlign = 'center';
    ctx.font = '400 34px sans-serif';
    ctx.fillStyle = '#cccccc';
    const shortCharm = r.charm.length > 100 ? r.charm.slice(0, 100) + '…' : r.charm;
    wrapText(ctx, shortCharm, W/2, 1175, W-160, 50);

    // CTA
    const ctaG = ctx.createLinearGradient(0, 1520, 0, 1730);
    ctaG.addColorStop(0, 'rgba(255,107,157,0.2)');
    ctaG.addColorStop(1, 'rgba(255,107,157,0.08)');
    ctx.fillStyle = ctaG;
    roundRect(ctx, 60, 1520, W-120, 210, 24); ctx.fill();
    ctx.strokeStyle = 'rgba(255,107,157,0.45)';
    ctx.lineWidth = 2;
    roundRect(ctx, 60, 1520, W-120, 210, 24); ctx.stroke();

    ctx.font = 'bold 42px sans-serif';
    ctx.fillStyle = '#ff6b9d';
    ctx.fillText('나의 러브타입도 궁금하다면?', W/2, 1595);
    ctx.font = '400 32px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('지금 바로 테스트해보세요 💕', W/2, 1645);
    ctx.font = '400 28px sans-serif';
    ctx.fillStyle = 'rgba(255,107,157,0.6)';
    ctx.fillText('lovetype.netlify.app', W/2, 1700);

  } else {
    // 정방형 (카카오)
    ctx.font = '130px serif';
    ctx.fillText(r.emoji, W/2, 290);

    ctx.font = '500 32px sans-serif';
    ctx.fillStyle = 'rgba(255,158,203,0.8)';
    ctx.fillText('나의 러브타입', W/2, 370);

    ctx.font = 'bold 68px sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(ctx, r.type_name, W/2, 470, W-100, 80);

    const lg2 = ctx.createLinearGradient(80, 0, W-80, 0);
    lg2.addColorStop(0, 'rgba(255,107,157,0)');
    lg2.addColorStop(0.5, 'rgba(255,107,157,0.35)');
    lg2.addColorStop(1, 'rgba(255,107,157,0)');
    ctx.strokeStyle = lg2; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, 560); ctx.lineTo(W-80, 560); ctx.stroke();

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#f0f0f0';
    wrapText(ctx, r.one_line, W/2, 620, W-120, 50);

    ctx.font = '500 28px sans-serif';
    ctx.fillStyle = 'rgba(255,107,157,0.7)';
    ctx.fillText((r.hashtags || []).slice(0,3).join(' '), W/2, 760);

    ctx.fillStyle = 'rgba(255,107,157,0.12)';
    roundRect(ctx, 60, 810, W-120, 65, 12); ctx.fill();
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#ff6b9d';
    ctx.fillText('나도 테스트 → lovetype.netlify.app', W/2, 852);
  }

  return canvas.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxW, lh) {
  if (!text) return y;
  let line = '', curY = y;
  text.split('').forEach(ch => {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, curY); line = ch; curY += lh;
    } else line = test;
  });
  if (line) ctx.fillText(line, x, curY);
  return curY;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

// ── 공유 모달 ─────────────────────────────────────────────
function openShareModal(platform) {
  _sharePlatform = platform;
  const ratio = (platform === 'kakao') ? 'square' : 'story';
  _shareImageData = generateShareImage(ratio);
  document.getElementById('share-img-preview').src = _shareImageData;

  const configs = {
    kakao:    { title:'📤 카카오톡 공유', desc:'이미지를 저장한 후 카카오톡에서 친구에게 전송하세요', guide:'① [이미지 저장하기] 버튼 클릭\n② 카카오톡 앱 열기\n③ 친구 채팅창에서 + → 사진 → 저장된 이미지 선택', btnTxt:'📱 카카오톡 열기', btnUrl:'kakaotalk://' },
    twitter:  { title:'📤 X (트위터) 공유', desc:'이미지를 저장한 후 X 앱에서 업로드하세요', guide:'① [이미지 저장하기] 버튼 클릭\n② X 앱 열기\n③ 새 게시물 → 이미지 첨부 → 저장된 이미지 선택', btnTxt:'🐦 X 앱 열기', btnUrl:'twitter://' },
    facebook: { title:'📤 Facebook 공유', desc:'이미지를 저장한 후 Facebook 스토리에 업로드하세요', guide:'① [이미지 저장하기] 버튼 클릭\n② Facebook 앱 열기\n③ 스토리 만들기 → 저장된 이미지 선택', btnTxt:'📘 Facebook 열기', btnUrl:'fb://' },
    insta:    { title:'📤 Instagram 스토리 공유', desc:'이미지를 저장한 후 인스타그램 스토리에 업로드하세요', guide:'① [이미지 저장하기] 버튼 클릭\n② Instagram 앱 열기\n③ 스토리 → + → 저장된 이미지 선택', btnTxt:'📸 Instagram 열기', btnUrl:'instagram://' },
  };

  const cfg = configs[platform] || configs.insta;
  document.getElementById('share-img-title').textContent = cfg.title;
  document.getElementById('share-img-desc').textContent  = cfg.desc;
  document.getElementById('share-guide').textContent     = cfg.guide;
  document.getElementById('btn-open-platform').textContent = cfg.btnTxt;
  document.getElementById('btn-open-platform').dataset.url = cfg.btnUrl;
  document.getElementById('modal-share-img').classList.add('show');
}

function openPlatform() {
  window.location.href = document.getElementById('btn-open-platform').dataset.url;
  setTimeout(() => showToast('앱이 설치된 경우 열립니다'), 800);
}

function downloadShareImage() {
  const a = document.createElement('a');
  a.download = `LOVETYPE_${_sharePlatform}.png`;
  a.href = _shareImageData;
  a.click();
  showToast('✅ 이미지가 저장됐어요! 앱에서 업로드하세요 📲');
}

function closeShareModal() {
  document.getElementById('modal-share-img').classList.remove('show');
}

// ── 공유 함수 ─────────────────────────────────────────────
function shareKakao()    { openShareModal('kakao'); }
function shareTwitter()  { openShareModal('twitter'); }
function shareFacebook() { openShareModal('facebook'); }
function shareInsta()    { openShareModal('insta'); }

function copyLink() {
  const text = `${_currentResult?.emoji} LOVETYPE — "${_currentResult?.type_name}"\n${_currentResult?.one_line || ''}\n\n${window.location.href}`;
  navigator.clipboard.writeText(text)
    .then(() => showToast(t().ui.toastCopied))
    .catch(() => showToast('Copy failed'));
}

// ── 토스트 ────────────────────────────────────────────────
function showToast(msg) {
  let el = document.getElementById('global-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ── 화면 전환 ─────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(`screen-${name}`);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
}

// ── 시작 / 재시작 ─────────────────────────────────────────
function startQuiz() {
  curQ = 0; answers = {};
  showScreen('quiz');
  renderQ();
}

function restart() {
  curQ = 0; answers = {};
  _currentResult = null; _currentType = null;
  showScreen('intro');
}

// ── 초기화 ────────────────────────────────────────────────
rebuildApp();
