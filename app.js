/* =========================================================
   10YL — app.js (정적 결과 버전, API 불필요)
   i18n.js + results.js 에 의존
   ========================================================= */

// ── 카테고리 인덱스 (나이 질문이 인덱스 0) ────────────────
const CAT_OF = [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,7,7,7,7,7,7,7,8,8,8,8,8,8,8,9,9,9,9,9,9,9];

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
    financial: avg([1,2,3,4,5,6,7,8,9,10,11,12]),
    career:    avg([13,14,15,16,17,18,19]),
    tech:      avg([20,21,22,23,24,25]),
    relation:  avg([26,27,28,29,30,31,32,33,34]),
    exercise:  avg([35,36,37,38,39,40,41]),
    lifestyle: avg([42,43,44,45,46,47,48,49,50,51]),
    spending:  avg([52,53,54,55,56,57,58]),
    media:     avg([59,60,61,62,63,64,65]),
    growth:    avg([66,67,68,69,70,71,72]),
    vision:    avg([73,74,75,76,77,78,79]),
  };
}

// ── 유형 판정 ─────────────────────────────────────────────
// 검증된 분포: 모든 점수 구간에서 최대 30% 이하로 균등 분산
const TYPE_LIST = [

  // ══ 특수 케이스: 모든 축이 4 이상일 때 → 가장 낮은 2개 축 기준 분기 ══
  {
    code: '_HIGH_ALL_', emoji: '',
    cond: s => {
      const axes = {financial:s.financial, tech:s.tech, growth:s.growth, relation:s.relation, exercise:s.exercise, lifestyle:s.lifestyle};
      if (Math.min(...Object.values(axes)) < 4) return false;
      const sorted = Object.entries(axes).sort((a,b)=>a[1]-b[1]);
      const low2 = [sorted[0][0], sorted[1][0]];
      const code =
        (low2.includes('financial') && low2.includes('tech'))    ? 'TYPE_7'  :
        (low2.includes('financial') && low2.includes('growth'))   ? 'TYPE_12' :
        (low2.includes('financial'))                               ? 'TYPE_3'  :
        (low2.includes('tech') && low2.includes('growth'))        ? 'TYPE_5'  :
        (low2.includes('tech'))                                    ? 'TYPE_2'  :
        (low2.includes('growth'))                                  ? 'TYPE_1'  :
        (low2.includes('exercise'))                                ? 'TYPE_8'  :
        (low2.includes('relation'))                                ? 'TYPE_10' : 'TYPE_8';
      s._overrideCode = code;
      return true;
    }
  },

  // ══ 고점수(4~5) 구간 ════════════════════════════════════
  { code:'TYPE_12', emoji:'💪', cond: s => s.exercise>=4 && s.lifestyle>=4 && s.financial>=4 },
  { code:'TYPE_7',  emoji:'🌿', cond: s => s.exercise>=4 && s.relation>=4 && s.growth>=4 },
  { code:'TYPE_8',  emoji:'🌍', cond: s => s.tech>=4 && s.growth>=4 && s.financial>=4 && s.relation>=4 },
  { code:'TYPE_10', emoji:'🎯', cond: s => s.growth>=4 && s.tech>=4 && s.financial<=3 },
  { code:'TYPE_3',  emoji:'🚀', cond: s => s.growth>=4 && s.tech>=3 && s.financial<=3 },
  { code:'TYPE_4',  emoji:'💎', cond: s => s.growth>=4 && s.financial<=2 },
  { code:'TYPE_1',  emoji:'🥇', cond: s => s.tech>=4 && s.financial>=4 && s.growth<=3 },
  { code:'TYPE_1',  emoji:'🥇', cond: s => s.tech>=4 && s.financial>=4 },
  { code:'TYPE_12', emoji:'💪', cond: s => s.exercise>=4 && s.lifestyle>=4 },
  { code:'TYPE_7',  emoji:'🌿', cond: s => s.exercise>=4 && s.relation>=4 },
  { code:'TYPE_5',  emoji:'🏠', cond: s => s.financial>=4 && s.relation>=3 && s.tech<=3 },
  { code:'TYPE_2',  emoji:'🥈', cond: s => s.financial>=4 && s.growth>=3 && s.relation>=3 },
  { code:'TYPE_8',  emoji:'🌍', cond: s => s.tech>=4 && s.growth>=4 && s.financial>=3 },
  { code:'TYPE_9',  emoji:'😴', cond: s => s.financial>=4 && s.growth<=2 },

  // ══ 중간 구간(3~4) ════════════════════════════════════
  { code:'TYPE_11', emoji:'🌱',
    cond: s => {
      const keys = ['financial','tech','growth','relation','exercise','lifestyle'];
      const vals = keys.map(k => s[k]);
      const avg  = vals.reduce((a,b) => a+b, 0) / vals.length;
      return avg >= 2.8 && avg <= 3.8 && Math.max(...vals) - Math.min(...vals) <= 1;
    }
  },
  { code:'TYPE_2',  emoji:'🥈', cond: s => s.financial>=3 && s.growth>=3 && s.relation>=3 },
  { code:'TYPE_9',  emoji:'😴', cond: s => s.financial>=3 && s.growth<=2 },
  { code:'TYPE_5',  emoji:'🏠', cond: s => s.financial>=3 && s.relation>=3 && s.tech<=2 },
  { code:'TYPE_12', emoji:'💪', cond: s => s.exercise>=3 && s.lifestyle>=3 && s.financial<=2 },
  { code:'TYPE_7',  emoji:'🌿', cond: s => s.exercise>=3 && s.relation>=3 && s.financial<=2 },
  { code:'TYPE_3',  emoji:'🚀', cond: s => s.growth>=3 && s.tech>=3 && s.financial<=2 },
  { code:'TYPE_4',  emoji:'💎', cond: s => s.growth>=3 && s.financial<=2 && s.vision>=2 },

  // ══ 낮은 구간(1~2) 분산 ══════════════════════════════
  { code:'TYPE_3',  emoji:'🚀', cond: s => s.vision>=2 && s.growth>=2 && s.financial<=2 },
  { code:'TYPE_12', emoji:'💪', cond: s => s.exercise>=2 && s.lifestyle>=2 && s.growth<=2 },
  { code:'TYPE_7',  emoji:'🌿', cond: s => s.relation>=2 && s.exercise>=2 && s.financial<=2 },
  { code:'TYPE_5',  emoji:'🏠', cond: s => s.financial>=2 && s.relation>=2 },
  { code:'TYPE_2',  emoji:'🥈', cond: s => s.financial>=2 && s.growth>=2 },

  // ══ 최종 폴백 — 현실 직시형 3단계 ══════════════════════
  { code:'TYPE_6A', emoji:'💸', cond: s => s.vision >= 2 },
  { code:'TYPE_6B', emoji:'🤝', cond: s => s.relation >= 2 },
  { code:'TYPE_6C', emoji:'🌅', cond: _  => true },
];

function detectType(scores) {
  const s = scores;
  // _HIGH_ALL_ 특수 케이스 처리
  for (const t of TYPE_LIST) {
    if (t.cond(s)) {
      let code = t.code;
      if (code === '_HIGH_ALL_') code = s._overrideCode || 'TYPE_8';
      const emoji = (code === '_HIGH_ALL_') ? '🌍' : t.emoji ||
        {TYPE_8:'🌍',TYPE_1:'🥇',TYPE_3:'🚀',TYPE_10:'🎯',TYPE_4:'💎',TYPE_2:'🥈',
         TYPE_12:'💪',TYPE_7:'🌿',TYPE_11:'🌱',TYPE_5:'🏠',TYPE_9:'😴',
         TYPE_6A:'💸',TYPE_6B:'🤝',TYPE_6C:'🌅'}[code] || '⚠️';
      return {
        code,
        emoji,
        name: (TYPE_NAMES[LANG] || TYPE_NAMES.en)[code] || code,
      };
    }
  }
  return { code:'TYPE_6C', emoji:'🌅', name: (TYPE_NAMES[LANG]||TYPE_NAMES.en)['TYPE_6C']||'New Start' };
}

// ── 언어별 유형 이름 ──────────────────────────────────────
const TYPE_NAMES = {
  ko: { TYPE_8:'글로벌 리더형', TYPE_1:'테크 부자형', TYPE_3:'대기만성 창업가형', TYPE_10:'인생 역전형', TYPE_4:'숨겨진 다이아형', TYPE_2:'착실한 우상향형', TYPE_12:'몸이 자산형', TYPE_7:'건강 부자형', TYPE_11:'균형 성장형', TYPE_5:'안정 추구 현실파형', TYPE_9:'잠자는 사자형', TYPE_6:'현실 직시형', TYPE_6A:'재정 집중 현실파형', TYPE_6B:'관계 중심 현실파형', TYPE_6C:'새출발 현실파형' },
  en: { TYPE_8:'Global Leader', TYPE_1:'Tech Wealth Builder', TYPE_3:'Late Bloomer Entrepreneur', TYPE_10:'Life Comeback', TYPE_4:'Hidden Diamond', TYPE_2:'Steady Climber', TYPE_12:'Body is Capital', TYPE_7:'Health Wealthy', TYPE_11:'Balanced Grower', TYPE_5:'Stability Seeker', TYPE_9:'Sleeping Lion', TYPE_6:'Reality Check', TYPE_6A:'Finance-Focused Realist', TYPE_6B:'Relationship-Centered Realist', TYPE_6C:'Fresh Start Realist' },
  ja: { TYPE_8:'グローバルリーダー型', TYPE_1:'テック富豪型', TYPE_3:'大器晩成型', TYPE_10:'逆転人生型', TYPE_4:'隠れダイア型', TYPE_2:'堅実上昇型', TYPE_12:'体が資本型', TYPE_7:'健康長者型', TYPE_11:'バランス成長型', TYPE_5:'安定志向型', TYPE_9:'眠れる獅子型', TYPE_6:'現実直視型', TYPE_6A:'財政重視現実派型', TYPE_6B:'関係重視現実派型', TYPE_6C:'新出発現実派型' },
  zh: { TYPE_8:'全球领导者型', TYPE_1:'科技富翁型', TYPE_3:'大器晚成型', TYPE_10:'人生逆袭型', TYPE_4:'隐藏钻石型', TYPE_2:'稳步上升型', TYPE_12:'身体即资产型', TYPE_7:'健康富有型', TYPE_11:'均衡成长型', TYPE_5:'稳定追求型', TYPE_9:'沉睡雄狮型', TYPE_6:'现实直视型', TYPE_6A:'财务专注现实型', TYPE_6B:'关系中心现实型', TYPE_6C:'全新出发现实型' },
  fr: { TYPE_8:'Leader Mondial', TYPE_1:'Bâtisseur Tech', TYPE_3:'Entrepreneur Tardif', TYPE_10:'Grand Retour', TYPE_4:'Diamant Caché', TYPE_2:'Grimpeur Régulier', TYPE_12:'Le Corps est Capital', TYPE_7:'Riche en Santé', TYPE_11:'Croissance Équilibrée', TYPE_5:'Chercheur de Stabilité', TYPE_9:'Lion Endormi', TYPE_6:'Vérité en Face', TYPE_6A:'Réaliste Financier', TYPE_6B:'Réaliste Relationnel', TYPE_6C:'Nouveau Départ' },
  ru: { TYPE_8:'Глобальный Лидер', TYPE_1:'Технологический Богач', TYPE_3:'Поздний Предприниматель', TYPE_10:'Comeback', TYPE_4:'Скрытый Бриллиант', TYPE_2:'Стабильный Восходящий', TYPE_12:'Тело — Капитал', TYPE_7:'Богатый Здоровьем', TYPE_11:'Сбалансированный Рост', TYPE_5:'Ищущий Стабильности', TYPE_9:'Спящий Лев', TYPE_6:'Взгляд в Реальность', TYPE_6A:'Финансовый Реалист', TYPE_6B:'Реалист Отношений', TYPE_6C:'Новый Старт' },
  es: { TYPE_8:'Líder Global', TYPE_1:'Emprendedor Tech', TYPE_3:'Emprendedor Tardío', TYPE_10:'Gran Regreso', TYPE_4:'Diamante Oculto', TYPE_2:'Ascenso Constante', TYPE_12:'El Cuerpo es Capital', TYPE_7:'Rico en Salud', TYPE_11:'Crecimiento Equilibrado', TYPE_5:'Buscador de Estabilidad', TYPE_9:'León Dormido', TYPE_6:'Cara a la Realidad', TYPE_6A:'Realista Financiero', TYPE_6B:'Realista Relacional', TYPE_6C:'Nuevo Comienzo' },
  vi: { TYPE_8:'Lãnh đạo Toàn cầu', TYPE_1:'Xây dựng Tài sản', TYPE_3:'Doanh nhân Muộn', TYPE_10:'Comeback vĩ đại', TYPE_4:'Kim cương ẩn', TYPE_2:'Leo thang ổn định', TYPE_12:'Thân thể là Vốn', TYPE_7:'Giàu Sức khỏe', TYPE_11:'Phát triển Cân bằng', TYPE_5:'Tìm kiếm Ổn định', TYPE_9:'Sư tử ngủ', TYPE_6:'Nhìn thẳng Thực tế', TYPE_6A:'Thực tế Tài chính', TYPE_6B:'Thực tế Quan hệ', TYPE_6C:'Khởi đầu Mới' },
  hi: { TYPE_8:'वैश्विक नेता', TYPE_1:'टेक धनवान', TYPE_3:'देर से खिलने वाला', TYPE_10:'जीवन वापसी', TYPE_4:'छिपा हीरा', TYPE_2:'स्थिर ऊर्ध्वगामी', TYPE_12:'शरीर है पूंजी', TYPE_7:'स्वस्थ धनवान', TYPE_11:'संतुलित विकास', TYPE_5:'स्थिरता खोजी', TYPE_9:'सोया शेर', TYPE_6:'वास्तविकता सामना', TYPE_6A:'वित्त केंद्रित यथार्थवादी', TYPE_6B:'संबंध केंद्रित यथार्थवादी', TYPE_6C:'नई शुरुआत यथार्थवादी' },
  de: { TYPE_8:'Globaler Führungstyp', TYPE_1:'Tech-Vermögensbauer', TYPE_3:'Spätentwickler', TYPE_10:'Comeback-Typ', TYPE_4:'Verborgener Diamant', TYPE_2:'Stetiger Aufsteiger', TYPE_12:'Körper ist Kapital', TYPE_7:'Gesund Vermögend', TYPE_11:'Ausgewogenes Wachstum', TYPE_5:'Stabilitätssuchender', TYPE_9:'Schlafender Löwe', TYPE_6:'Realitäts-Check', TYPE_6A:'Finanzieller Realist', TYPE_6B:'Beziehungs-Realist', TYPE_6C:'Neuanfang-Typ' },
  th: { TYPE_8:'ผู้นำระดับโลก', TYPE_1:'นักสร้างความมั่งคั่ง', TYPE_3:'ผู้ประกอบการสายดึก', TYPE_10:'การกลับมา', TYPE_4:'เพชรที่ซ่อนอยู่', TYPE_2:'ไต่เขาอย่างมั่นคง', TYPE_12:'ร่างกายคือทุน', TYPE_7:'มั่งคั่งสุขภาพ', TYPE_11:'การเติบโตสมดุล', TYPE_5:'แสวงหาความมั่นคง', TYPE_9:'สิงห์หลับ', TYPE_6:'หันหน้าสู่ความจริง', TYPE_6A:'นักสู้ด้านการเงิน', TYPE_6B:'นักสู้ด้านความสัมพันธ์', TYPE_6C:'การเริ่มต้นใหม่' },
  pt: { TYPE_8:'Líder Global', TYPE_1:'Construtor de Riqueza', TYPE_3:'Empreendedor Tardio', TYPE_10:'Grande Volta', TYPE_4:'Diamante Escondido', TYPE_2:'Ascenso Estável', TYPE_12:'Corpo é Capital', TYPE_7:'Rico em Saúde', TYPE_11:'Crescimento Equilibrado', TYPE_5:'Buscador de Estabilidade', TYPE_9:'Leão Adormecido', TYPE_6:'Cara à Realidade', TYPE_6A:'Realista Financeiro', TYPE_6B:'Realista Relacional', TYPE_6C:'Novo Começo' },
};

// detectType 함수는 TYPE_LIST 아래에 포함됨

// ── 전역 상태 ─────────────────────────────────────────────
let curQ        = 0;
let answers     = {};
let _currentResult = null;
let _currentType   = null;
let _currentAgeIdx = 1; // 기본값: 20대
let _cdTimer       = null;
const AD_SECONDS   = 15;

// ── 광고 설정 ─────────────────────────────────────────────
// ✅ 심사 통과 후 아래 값을 실제 ID로 교체하세요
const AD_CONFIG = {
  kakao:  { unitId: 'YOUR_ADFIT_UNIT_ID', width: 320, height: 100 },
  google: { publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', slotId: 'XXXXXXXXXX' },
};

// ── 언어별 광고 슬롯 렌더링 ──────────────────────────────
function renderAdSlot(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (LANG === 'ko') {
    if (AD_CONFIG.kakao.unitId === 'YOUR_ADFIT_UNIT_ID') {
      container.innerHTML = `<div class="ad-placeholder-box">광고 (카카오 애드핏 심사 후 활성화)</div>`;
    } else {
      container.innerHTML = `
        <ins class="kakao_ad_area" style="display:none;"
          data-ad-unit="${AD_CONFIG.kakao.unitId}"
          data-ad-width="${AD_CONFIG.kakao.width}"
          data-ad-height="${AD_CONFIG.kakao.height}"></ins>`;
    }
  } else {
    if (AD_CONFIG.google.publisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
      container.innerHTML = `<div class="ad-placeholder-box">Ad (Google AdSense — activate after approval)</div>`;
    } else {
      container.innerHTML = `
        <ins class="adsbygoogle"
          style="display:block;width:100%;min-height:90px;"
          data-ad-client="${AD_CONFIG.google.publisherId}"
          data-ad-slot="${AD_CONFIG.google.slotId}"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>`;
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    }
  }
}

// ── 화면 전환 ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 앱 전체 재빌드 ────────────────────────────────────────
function rebuildApp() {
  document.getElementById('app').innerHTML =
    buildLangSelect() +
    buildIntro() +
    buildPrivacy() +
    buildQuiz() +
    buildResult();
}

// ── 언어 선택 화면 ────────────────────────────────────────
function buildLangSelect() {
  const langs = [
    ['ko','🇰🇷','한국어'],['en','🇺🇸','English'],['ja','🇯🇵','日本語'],
    ['zh','🇨🇳','中文'],  ['fr','🇫🇷','Français'],['ru','🇷🇺','Русский'],
    ['es','🇪🇸','Español'],['vi','🇻🇳','Tiếng Việt'],['hi','🇮🇳','हिन्दी'],
    ['de','🇩🇪','Deutsch'],['th','🇹🇭','ภาษาไทย'],['pt','🇧🇷','Português'],
  ];
  return `<div class="screen active" id="screen-lang">
    <div class="lang-wrap">
      <div class="lang-brand">10YL</div>
      <div class="lang-title">How will I change<br>in the next 10 years?</div>
      <div class="lang-sub">Select your language · 언어를 선택하세요</div>
      <div class="lang-grid">
        ${langs.map(([code,flag,name]) => `
          <button class="lang-btn" onclick="selectLang('${code}')">
            <span class="lang-flag">${flag}</span>
            <span class="lang-name">${name}</span>
          </button>`).join('')}
      </div>
    </div>
  </div>`;
}

function selectLang(code) {
  LANG = code;
  document.body.style.fontFamily = I18N[code].font;
  document.documentElement.lang  = code;
  rebuildApp();
  // 언어 선택 즉시 전역 배너 광고 표시 시작
  initGlobalBanners();
  showScreen('intro');
}

// ── 전역 배너 초기화 (언어 선택 후 즉시 실행) ────────────
function initGlobalBanners() {
  renderAdSlot('global-banner-slot');
  renderAdSlot('global-banner-bottom-slot');
}

// ── 인트로 화면 ───────────────────────────────────────────
function buildIntro() {
  const ui   = t().ui;
  const cats = t().cats;
  return `<div class="screen" id="screen-intro">
    <div style="margin-bottom:2rem;">
      <div class="intro-eyebrow">AI Future Prediction</div>
      <div class="intro-title">${ui.title}<br><span>${ui.subtitle}</span></div>

      <div class="cat-grid">
        ${cats.map(c=>`
          <div class="cat-chip">
            <span class="chip-icon">${c.icon}</span>
            <div><strong>${c.name}</strong></div>
          </div>`).join('')}
      </div>

      <div class="free-badge-wrap">
        <div class="free-badge">${ui.freeBadge}</div>
      </div>

      <div class="notice-box">
        <div class="notice-title">Notice</div>
        ${ui.notice.map(n=>`<div class="notice-item">${n}</div>`).join('')}
        ${ui.noticeWarn.map(n=>`<div class="notice-item warn">${n}</div>`).join('')}
      </div>

      <span class="privacy-link" onclick="showScreen('privacy')">${ui.privacy}</span>
      <button class="btn-primary" onclick="startQuiz()">${ui.startBtn}</button>
      <div class="hint">${ui.hint}</div>
      <div style="margin-top:1rem;text-align:center;">
        <span class="privacy-link" onclick="showScreen('lang')" style="font-size:13px;">🌐 Change Language</span>
      </div>
    </div>
  </div>`;
}

// ── 개인정보처리방침 ───────────────────────────────────────
function buildPrivacy() {
  const ui = t().ui;
  return `<div class="screen" id="screen-privacy">
    <div class="priv-wrap">
      <h2>Privacy Policy</h2>
      <div class="priv-section"><h3>Data Collection</h3><p>We collect survey response data only. No personally identifiable information is collected.</p></div>
      <div class="priv-section"><h3>Data Processing</h3><p>All analysis is done locally in your browser. No data is sent to any server.</p></div>
      <div class="priv-section"><h3>Disclaimer</h3><p>Results are for entertainment and self-reflection only. Not financial, investment, or medical advice.</p></div>
      <button class="btn-ghost" onclick="showScreen('intro')">${ui.back}</button>
    </div>
  </div>`;
}

// ── 퀴즈 화면 ─────────────────────────────────────────────
function buildQuiz() {
  const ui = t().ui;
  return `<div class="screen" id="screen-quiz">
    <div class="progress-wrap">
      <div class="progress-top">
        <div class="progress-label" id="prog-label">${ui.catLabel} 1 ${ui.of} 10</div>
        <div class="progress-pct"  id="prog-pct">0%</div>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="prog-fill" style="width:0%"></div></div>
    </div>
    <div class="cat-header">
      <div class="cat-header-icon" id="cat-icon">💰</div>
      <div>
        <div class="cat-header-name" id="cat-name"></div>
        <div class="cat-header-msg"  id="cat-msg"></div>
      </div>
    </div>
    <div id="q-area"></div>

    <!-- 퀴즈 중간 배너 광고 -->
    <div class="quiz-mid-banner">
      <div class="ad-banner-label">광고 · AD</div>
      <div id="quiz-mid-banner-slot"></div>
    </div>

    <div class="quiz-nav">
      <button class="btn-back" onclick="prevQ()">${ui.back}</button>
      <button class="btn-next" id="btn-next" onclick="nextQ()" disabled>${ui.next}</button>
    </div>
  </div>`;
}

// ── 결과 화면 ─────────────────────────────────────────────
function buildResult() {
  const ui = t().ui;
  const SHARE_BTNS = `
    <div class="share-btns">
      <button class="share-btn kakao"    onclick="shareKakao()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.632 5.07 4.09 6.48L5.1 21l5.1-2.52c.59.09 1.19.14 1.8.14 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z"/></svg>
        KakaoTalk
      </button>
      <button class="share-btn twitter"  onclick="shareTwitter()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X
      </button>
      <button class="share-btn facebook" onclick="shareFacebook()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook
      </button>
      <button class="share-btn insta"    onclick="shareInsta()">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        Instagram
      </button>
      <button class="share-btn copy"     onclick="copyLink()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Copy
      </button>
    </div>`;

  return `<div class="screen" id="screen-result">

    <!-- 결과 화면 진입 즉시 표시되는 인라인 배너 -->
    <div class="result-inline-banner">
      <div class="ad-banner-label">광고 · AD</div>
      <div id="result-banner-top"></div>
    </div>

    <!-- 유형 미리보기 (광고 전 공개) -->
    <div class="result-preview-card">
      <div class="preview-emoji" id="r-emoji"></div>
      <div class="preview-eyebrow">${ui.resultLabel}</div>
      <div class="preview-type"   id="r-type"></div>
      <div class="preview-oneline" id="r-oneline"></div>
    </div>

    <!-- 점수 미니 바 (광고 전 공개) -->
    <div class="score-preview" id="score-preview"></div>

    <!-- 잠금 영역 -->
    <div class="locked-wrap" id="locked-wrap">
      <div class="locked-blur" id="locked-blur">
        <div class="sec-card"><div class="sec-label">${ui.secCurrent}</div><div class="sec-text" id="r-current"></div></div>
        <div class="sec-card"><div class="sec-label">${ui.secTimeline}</div><div class="tl-list"  id="r-timeline"></div></div>
        <div class="sec-card"><div class="sec-label">${ui.secStrengths}</div><div class="item-list" id="r-strengths"></div></div>

        <!-- 중간 배너 광고 (잠금 영역 내) -->
        <div class="ad-banner-label">광고 · AD</div>
        <div class="ad-banner-wrap" id="banner-ad-middle"></div>

        <div class="sec-card"><div class="sec-label">${ui.secRisks}</div><div class="item-list" id="r-risks"></div></div>
        <div class="sec-card"><div class="sec-label">${ui.secMbti}</div><div class="sec-text" id="r-mbti"></div></div>
        <div class="sec-card"><div class="sec-label">${ui.secActions}</div><div class="item-list" id="r-actions"></div></div>
      </div>
      <div class="lock-overlay" id="lock-overlay">
        <div class="lock-icon">🔒</div>
        <div class="lock-msg">${ui.lockMsg}</div>
      </div>
    </div>

    <!-- 동영상 광고 시청 언락 버튼 -->
    <button class="unlock-btn" id="unlock-btn" onclick="openAdModal()">${ui.unlockBtn}</button>

    <!-- 언락 후 표시 영역 -->
    <div class="result-full" id="result-full">
      <div class="share-card">
        <div class="share-title">${ui.shareTitle}</div>
        <div class="share-msg" id="r-share-text"></div>
        ${SHARE_BTNS}
      </div>
      <div class="closing-card"><div class="closing-text" id="r-closing"></div></div>
    </div>

    <!-- 하단 배너 광고 -->
    <div class="ad-banner-label">광고 · AD</div>
    <div class="ad-banner-wrap" id="banner-ad-bottom"></div>

    <div class="disclaimer-bottom">${ui.disclaimer.replace(/\n/g,'<br>')}</div>
    <button class="btn-ghost" onclick="restart()">${ui.restart}</button>
  </div>

  <!-- ====== 동영상 광고 모달 (15초) ====== -->
  <div class="video-ad-overlay" id="video-ad-modal">
    <div class="video-ad-box">

      <!-- 상단 바 -->
      <div class="video-ad-topbar">
        <span class="video-ad-badge">광고 · AD</span>
        <span class="video-ad-skip" id="video-skip-btn">5초 후 스킵 가능</span>
      </div>

      <!-- 광고 영상 슬롯 -->
      <div class="video-ad-slot">
        <div id="video-ad-content"></div>
      </div>

      <!-- 진행 바 -->
      <div class="video-progress-wrap">
        <div class="video-progress-bg">
          <div class="video-progress-fill" id="video-progress-fill" style="width:0%"></div>
        </div>
      </div>

      <!-- 카운트다운 -->
      <div class="video-countdown-wrap">
        <div class="video-countdown-text">
          <span id="video-countdown-num">${AD_SECONDS}</span>초 시청 후 전체 결과 확인 가능
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.35);">무료 서비스 지원 광고</div>
      </div>

    </div>
  </div>

  <!-- 인스타 스토리 모달 → 공유 이미지 모달로 업그레이드 -->
  <div class="modal-overlay" id="modal-share-img">
    <div class="modal-box share-img-modal">
      <div class="share-img-header">
        <div class="modal-title" id="share-img-title">공유 이미지</div>
        <div class="modal-sub" id="share-img-desc">이미지를 저장한 후 업로드하세요</div>
      </div>

      <!-- 이미지 미리보기 -->
      <div class="share-img-preview-wrap">
        <img id="share-img-preview" src="" alt="공유 이미지" />
      </div>

      <!-- 저장 버튼 -->
      <button class="btn-share-save" id="btn-share-save" onclick="downloadShareImage()">
        📥 이미지 저장하기
      </button>

      <!-- 플랫폼별 안내 -->
      <div class="share-guide" id="share-guide"></div>

      <!-- 플랫폼 열기 버튼 -->
      <button class="btn-open-platform" id="btn-open-platform" onclick="openPlatform()">
      </button>

      <button class="modal-btn-close" onclick="closeShareModal()" style="width:100%;margin-top:8px;">닫기 · Close</button>
    </div>
  </div>

  <canvas id="share-canvas" style="display:none;"></canvas>`;
}

// ── 퀴즈 렌더링 ───────────────────────────────────────────
function renderQ() {
  const qs   = t().qs;
  const cats = t().cats;
  const ui   = t().ui;
  const q    = qs[curQ];
  const catIdx = CAT_OF[curQ];
  const cat  = cats[catIdx];
  const total = qs.length;
  const pct  = Math.round((curQ / total) * 100);

  document.getElementById('prog-label').textContent = `${ui.catLabel} ${catIdx+1} ${ui.of} 10`;
  document.getElementById('prog-pct').textContent   = pct + '%';
  document.getElementById('prog-fill').style.width  = pct + '%';
  document.getElementById('cat-icon').textContent   = cat.icon;
  document.getElementById('cat-name').textContent   = cat.name;
  document.getElementById('cat-msg').textContent    = cat.msg;

  const sel = answers[curQ];
  document.getElementById('q-area').innerHTML = `
    <div class="q-card">
      <div class="q-num">Q${curQ+1} / ${total}</div>
      <div class="q-text">${q.q}</div>
      <div class="options">
        ${q.opts.map((o,i) => `
          <div class="opt ${sel===i?'selected':''}" onclick="selectOpt(${i})">
            <div class="opt-radio"></div><span>${o}</span>
          </div>`).join('')}
      </div>
    </div>`;

  document.getElementById('btn-next').disabled = (sel === undefined);
}

function selectOpt(i) {
  answers[curQ] = i;
  document.getElementById('btn-next').disabled = false;
  renderQ();
}

function nextQ() {
  if (answers[curQ] === undefined) return;
  const qs    = t().qs;
  const cats  = t().cats;
  const nextIdx = curQ + 1;

  if (nextIdx >= qs.length) { finishQuiz(); return; }

  const curCat  = CAT_OF[curQ];
  const nextCat = CAT_OF[nextIdx];

  if (nextCat !== curCat && cats[nextCat].milestone) {
    const m = cats[nextCat].milestone;
    document.getElementById('q-area').innerHTML = `
      <div class="milestone">
        <div class="milestone-emoji">${m.emoji}</div>
        <div class="milestone-title">${m.title}</div>
        <div class="milestone-sub">${m.sub}</div>
      </div>`;
    document.getElementById('btn-next').disabled = false;
    document.getElementById('btn-next').onclick = () => {
      curQ = nextIdx;
      document.getElementById('btn-next').onclick = nextQ;
      renderQ();
    };
  } else {
    curQ = nextIdx;
    renderQ();
  }
}

function prevQ() {
  if (curQ > 0) { curQ--; renderQ(); }
  else showScreen('intro');
}

// ── 퀴즈 완료 → 결과 즉시 표시 ──────────────────────────
function finishQuiz() {
  const scores   = calcScores(answers);
  const type     = detectType(scores);
  const ageIdx   = answers[0] !== undefined ? answers[0] : 1;
  const result   = getResult(type.code, ageIdx);

  _currentResult = result;
  _currentType   = type;
  _currentAgeIdx = ageIdx; // 나이 인덱스 저장 (공유 이미지용)

  renderResult(scores, type, result);
  showScreen('result');

  // 결과 화면 진입 즉시 인라인 배너 표시 (언락 전부터)
  renderAdSlot('result-banner-top');
}

// ── 결과 렌더링 ───────────────────────────────────────────
function renderResult(scores, type, result) {
  const ui = t().ui;

  document.getElementById('r-emoji').textContent      = type.emoji;
  document.getElementById('r-type').textContent       = type.name;
  document.getElementById('r-oneline').textContent    = result.one_line  || '';
  document.getElementById('r-current').textContent    = result.current   || '';
  document.getElementById('r-mbti').textContent       = result.mbti      || '';
  document.getElementById('r-share-text').textContent = result.share     || '';
  document.getElementById('r-closing').textContent    = result.closing   || '';

  // 점수 미니 바
  const axes = [
    { key:'financial', icon:'💰' }, { key:'exercise',  icon:'🏃' },
    { key:'growth',    icon:'🧠' }, { key:'tech',      icon:'🤖' },
    { key:'relation',  icon:'❤️' }, { key:'lifestyle', icon:'🍽️' },
  ];
  document.getElementById('score-preview').innerHTML = axes.map(a => `
    <div class="sp-item">
      <div class="sp-icon">${a.icon}</div>
      <div class="sp-bar-bg">
        <div class="sp-bar-fill" style="width:${(scores[a.key]/5)*100}%"></div>
      </div>
    </div>`).join('');

  // 타임라인
  const [p1,p2,p3] = ui.periodLabels;
  document.getElementById('r-timeline').innerHTML = [
    { period:p1, text:result.year1_3  || '' },
    { period:p2, text:result.year4_7  || '' },
    { period:p3, text:result.year8_10 || '' },
  ].map(tl => `
    <div class="tl-item">
      <div class="tl-badge">${tl.period}</div>
      <div class="tl-text">${tl.text}</div>
    </div>`).join('');

  // 강점
  document.getElementById('r-strengths').innerHTML = (result.strengths||[]).map(s => `
    <div class="item">
      <div class="item-icon">${s.icon}</div>
      <div><div class="item-title">${s.title}</div><div class="item-desc">${s.desc}</div></div>
    </div>`).join('');

  // 리스크
  document.getElementById('r-risks').innerHTML = (result.risks||[]).map(r => `
    <div class="item">
      <div class="item-icon">${r.icon}</div>
      <div><div class="item-title">${r.title}</div><div class="item-desc">${r.desc}</div></div>
    </div>`).join('');

  // 액션
  document.getElementById('r-actions').innerHTML = (result.actions||[]).map(a => `
    <div class="item">
      <div class="item-icon">${a.icon}</div>
      <div>
        <div class="item-priority">${a.priority}</div>
        <div class="item-title">${a.title}</div>
        <div class="item-desc">${a.desc}</div>
      </div>
    </div>`).join('');
}

// ── 동영상 광고 모달 열기 (15초) ────────────────────────
function openAdModal() {
  document.getElementById('video-ad-modal').classList.add('show');
  document.getElementById('video-skip-btn').classList.remove('active');
  document.getElementById('video-skip-btn').textContent = '5초 후 스킵 가능';
  document.getElementById('video-progress-fill').style.width = '0%';
  document.getElementById('video-countdown-num').textContent = AD_SECONDS;

  // 광고 슬롯 렌더링
  renderVideoAdSlot();

  let elapsed = 0;
  _cdTimer = setInterval(() => {
    elapsed++;
    const pct = Math.round((elapsed / AD_SECONDS) * 100);
    document.getElementById('video-progress-fill').style.width = pct + '%';
    document.getElementById('video-countdown-num').textContent = AD_SECONDS - elapsed;

    // 5초 후 스킵 버튼 활성화 텍스트 변경
    if (elapsed === 5) {
      const skipBtn = document.getElementById('video-skip-btn');
      skipBtn.textContent = '광고 시청 중... (' + (AD_SECONDS - elapsed) + '초)';
    }
    if (elapsed > 5) {
      document.getElementById('video-skip-btn').textContent =
        '광고 시청 중... (' + (AD_SECONDS - elapsed) + '초)';
    }

    if (elapsed >= AD_SECONDS) {
      clearInterval(_cdTimer);
      document.getElementById('video-countdown-num').textContent = '0';
      document.getElementById('video-progress-fill').style.width = '100%';
      // 스킵 버튼 → 결과 확인 버튼으로
      const skipBtn = document.getElementById('video-skip-btn');
      skipBtn.textContent = '✅ 전체 결과 확인하기';
      skipBtn.classList.add('active');
      skipBtn.onclick = unlockResult;
    }
  }, 1000);
}

// ── 동영상 광고 슬롯 렌더링 ──────────────────────────────
function renderVideoAdSlot() {
  const slot = document.getElementById('video-ad-content');
  if (!slot) return;

  if (LANG === 'ko') {
    // 카카오 애드핏 — 동영상 광고
    if (AD_CONFIG.kakao.unitId === 'YOUR_ADFIT_UNIT_ID') {
      slot.innerHTML = `
        <div class="video-ad-placeholder">
          <div class="video-ad-placeholder-icon">📺</div>
          <div class="video-ad-placeholder-text">카카오 애드핏 동영상 광고<br>심사 통과 후 실제 광고가 표시됩니다</div>
        </div>`;
    } else {
      slot.innerHTML = `
        <ins class="kakao_ad_area" style="display:none;width:100%;height:100%;"
          data-ad-unit="${AD_CONFIG.kakao.unitId}"
          data-ad-width="320" data-ad-height="180"></ins>`;
    }
  } else {
    // 구글 애드센스 — 동영상/디스플레이 광고
    if (AD_CONFIG.google.publisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
      slot.innerHTML = `
        <div class="video-ad-placeholder">
          <div class="video-ad-placeholder-icon">📺</div>
          <div class="video-ad-placeholder-text">Google AdSense Video Ad<br>Activate after approval</div>
        </div>`;
    } else {
      slot.innerHTML = `
        <ins class="adsbygoogle video-adsense-slot"
          style="display:block;"
          data-ad-client="${AD_CONFIG.google.publisherId}"
          data-ad-slot="${AD_CONFIG.google.slotId}"
          data-ad-format="video"
          data-full-width-responsive="true"></ins>`;
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    }
  }
}

// ── 결과 언락 ─────────────────────────────────────────────
function unlockResult() {
  clearInterval(_cdTimer);
  const ui = t().ui;

  // 동영상 광고 모달 닫기
  document.getElementById('video-ad-modal').classList.remove('show');

  // 블러 해제
  document.getElementById('locked-blur').classList.remove('locked-blur');
  document.getElementById('lock-overlay').style.display = 'none';
  document.getElementById('locked-wrap').style.position = 'static';

  // 언락 버튼 상태 변경
  const btn = document.getElementById('unlock-btn');
  btn.textContent   = ui.unlockComplete;
  btn.disabled      = true;
  btn.style.opacity = '0.5';
  btn.style.cursor  = 'default';

  // 공유+마무리 영역 표시
  document.getElementById('result-full').classList.add('unlocked');

  // 언락 후 추가 배너 렌더링 (중간 + 하단)
  renderAdSlot('banner-ad-middle');
  renderAdSlot('banner-ad-bottom');

  setTimeout(() =>
    document.getElementById('result-full').scrollIntoView({ behavior:'smooth', block:'start' }),
  300);
  showToast('🎉 ' + ui.unlockComplete);
}

// ── 10년 후 나이 계산 ────────────────────────────────────
// answers[0] = 나이 인덱스 (0=10대, 1=20대, 2=30대, 3=40대, 4=50대+)
function getFutureAge() {
  const ageIdx = _currentAgeIdx !== undefined ? _currentAgeIdx : 1;
  const ageRanges = [
    { label: '20대', range: '20~29세', future: '30대 초중반', futureRange: '30~39세' },
    { label: '20대', range: '20~29세', future: '30대 초중반', futureRange: '30~39세' },
    { label: '30대', range: '30~39세', future: '40대 초중반', futureRange: '40~49세' },
    { label: '40대', range: '40~49세', future: '50대 초중반', futureRange: '50~59세' },
    { label: '50대 이상', range: '50세~',  future: '60대',       futureRange: '60~69세' },
  ];
  // 10대는 특별 처리
  if (ageIdx === 0) return { label:'10대', range:'13~19세', future:'20대 초중반', futureRange:'20~29세' };
  return ageRanges[Math.min(ageIdx, 4)] || ageRanges[1];
}

// ── 긍정적 강점 문구 추출 ─────────────────────────────────
function getPositiveHighlights() {
  const strengths = _currentResult?.strengths || [];
  const actions   = _currentResult?.actions   || [];
  const year8_10  = _currentResult?.year8_10  || '';
  const closing   = _currentResult?.closing   || '';

  // 강점 중 가장 긍정적인 2개 선택
  const s1 = strengths[0] ? `✦ ${strengths[0].title}: ${strengths[0].desc}` : '';
  const s2 = strengths[1] ? `✦ ${strengths[1].title}: ${strengths[1].desc}` : '';

  // 10년 후 시나리오 (가장 긍정적인 미래)
  const future = year8_10.length > 70 ? year8_10.slice(0, 70) + '…' : year8_10;

  // 액션 1순위 (지금 당장 할 수 있는 것)
  const action = actions[0] ? `🎯 ${actions[0].title}` : '';

  return { s1, s2, future, action, closing };
}

// ── 공유 이미지 생성 핵심 함수 ───────────────────────────
// ratio: 'story' = 9:16 (1080×1920), 'square' = 1:1 (1080×1080)
function generateShareImage(ratio) {
  const typeName  = _currentType?.name   || '';
  const typeEmoji = _currentType?.emoji  || '🔮';
  const oneline   = _currentResult?.one_line || '';
  const ageInfo   = getFutureAge();
  const { s1, s2, future, action, closing } = getPositiveHighlights();

  const W = 1080;
  const H = ratio === 'story' ? 1920 : 1080;

  const canvas = document.getElementById('share-canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── 배경 그라데이션 ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0,   '#0a0a14');
  bgGrad.addColorStop(0.5, '#0d0d18');
  bgGrad.addColorStop(1,   '#080810');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── 배경 글로우 ──
  const glowY = ratio === 'story' ? H * 0.25 : H * 0.3;
  const grad = ctx.createRadialGradient(W/2, glowY, 0, W/2, glowY, W * 0.55);
  grad.addColorStop(0,   'rgba(232,255,71,0.15)');
  grad.addColorStop(0.5, 'rgba(100,180,255,0.04)');
  grad.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── 상단 브랜드 바 ──
  ctx.fillStyle = 'rgba(232,255,71,0.08)';
  ctx.fillRect(0, 0, W, 110);
  ctx.font = 'bold 38px sans-serif';
  ctx.fillStyle = 'rgba(232,255,71,0.9)';
  ctx.textAlign = 'center';
  ctx.fillText('10YL — 10 Years Later', W/2, 72);

  if (ratio === 'story') {
    // ══════════════════════════════════════════════════════
    // 스토리 레이아웃 (9:16 = 1080×1920)
    // ══════════════════════════════════════════════════════

    // ── ① 10년 후 나이 배지 ──────────────────────────────
    ctx.fillStyle = 'rgba(232,255,71,0.15)';
    roundRect(ctx, 60, 140, W-120, 120, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,255,71,0.4)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 140, W-120, 120, 16);
    ctx.stroke();

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#e8ff47';
    ctx.fillText(`당신의 10년 후 나이는 ${ageInfo.futureRange} 입니다`, W/2, 188);
    ctx.font = '400 28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(`현재 ${ageInfo.label} → 10년 후 ${ageInfo.future}`, W/2, 232);

    // ── ② 이모지 ─────────────────────────────────────────
    ctx.font = '170px serif';
    ctx.fillText(typeEmoji, W/2, 470);

    // ── ③ 유형 레이블 ────────────────────────────────────
    ctx.font = '500 38px sans-serif';
    ctx.fillStyle = 'rgba(232,255,71,0.75)';
    ctx.fillText('나의 10년 후 미래 유형', W/2, 545);

    // ── ④ 유형명 (크고 굵게) ─────────────────────────────
    ctx.font = 'bold 86px sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(ctx, typeName, W/2, 660, W - 100, 100);

    // ── 구분선 ───────────────────────────────────────────
    const lineGrad = ctx.createLinearGradient(80, 0, W-80, 0);
    lineGrad.addColorStop(0, 'rgba(232,255,71,0)');
    lineGrad.addColorStop(0.5, 'rgba(232,255,71,0.35)');
    lineGrad.addColorStop(1, 'rgba(232,255,71,0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, 790); ctx.lineTo(W-80, 790); ctx.stroke();

    // ── ⑤ 한 줄 요약 (긍정적 핵심 문구) ─────────────────
    ctx.font = 'bold 44px sans-serif';
    ctx.fillStyle = '#f0f0f0';
    wrapText(ctx, oneline, W/2, 860, W - 120, 58);

    // ── ⑥ 강점 카드 ──────────────────────────────────────
    if (s1) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(ctx, 60, 1010, W-120, 100, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      roundRect(ctx, 60, 1010, W-120, 100, 14);
      ctx.stroke();
      ctx.font = '400 34px sans-serif';
      ctx.fillStyle = '#cccccc';
      wrapText(ctx, s1, W/2, 1073, W-160, 44);
    }

    if (s2) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(ctx, 60, 1126, W-120, 100, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      roundRect(ctx, 60, 1126, W-120, 100, 14);
      ctx.stroke();
      ctx.font = '400 34px sans-serif';
      ctx.fillStyle = '#cccccc';
      wrapText(ctx, s2, W/2, 1189, W-160, 44);
    }

    // ── ⑦ 10년 후 미래 시나리오 ──────────────────────────
    ctx.fillStyle = 'rgba(232,255,71,0.08)';
    roundRect(ctx, 60, 1248, W-120, 200, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,255,71,0.2)';
    ctx.lineWidth = 1;
    roundRect(ctx, 60, 1248, W-120, 200, 14);
    ctx.stroke();

    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = 'rgba(232,255,71,0.8)';
    ctx.textAlign = 'left';
    ctx.fillText('✨ 10년 후 당신의 모습', 90, 1295);
    ctx.textAlign = 'center';
    ctx.font = '400 32px sans-serif';
    ctx.fillStyle = '#d0d0d0';
    wrapText(ctx, future, W/2, 1345, W-160, 46);

    // ── ⑧ 지금 당장 액션 ─────────────────────────────────
    if (action) {
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = 'rgba(232,255,71,0.7)';
      ctx.fillText(action, W/2, 1508);
    }

    // ── ⑨ 클로징 문구 (응원) ─────────────────────────────
    if (closing) {
      ctx.font = '400 30px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      const shortClosing = closing.length > 50 ? closing.slice(0, 50) + '…' : closing;
      wrapText(ctx, shortClosing, W/2, 1570, W-160, 42);
    }

    // ── ⑩ 하단 CTA 박스 ──────────────────────────────────
    const ctaGrad = ctx.createLinearGradient(0, 1650, 0, 1860);
    ctaGrad.addColorStop(0, 'rgba(232,255,71,0.18)');
    ctaGrad.addColorStop(1, 'rgba(232,255,71,0.08)');
    ctx.fillStyle = ctaGrad;
    roundRect(ctx, 60, 1650, W-120, 210, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,255,71,0.45)';
    ctx.lineWidth = 2;
    roundRect(ctx, 60, 1650, W-120, 210, 24);
    ctx.stroke();

    ctx.font = 'bold 42px sans-serif';
    ctx.fillStyle = '#e8ff47';
    ctx.fillText('나의 10년 후가 궁금하다면?', W/2, 1720);
    ctx.font = '500 34px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('지금 바로 테스트해보세요 🚀', W/2, 1768);
    ctx.font = '400 28px sans-serif';
    ctx.fillStyle = 'rgba(232,255,71,0.6)';
    ctx.fillText('10yltest.netlify.app', W/2, 1832);

  } else {
    // ══════════════════════════════════════════════════════
    // 정방형 레이아웃 (1:1 = 1080×1080) — 카카오톡
    // ══════════════════════════════════════════════════════

    // ── ① 10년 후 나이 배지 ──────────────────────────────
    ctx.fillStyle = 'rgba(232,255,71,0.14)';
    roundRect(ctx, 60, 130, W-120, 100, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,255,71,0.4)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 130, W-120, 100, 14);
    ctx.stroke();

    ctx.font = 'bold 34px sans-serif';
    ctx.fillStyle = '#e8ff47';
    ctx.fillText(`10년 후 나이: ${ageInfo.futureRange}`, W/2, 169);
    ctx.font = '400 26px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(`현재 ${ageInfo.label} → 10년 후 ${ageInfo.future}`, W/2, 208);

    // ── ② 이모지 ─────────────────────────────────────────
    ctx.font = '130px serif';
    ctx.fillText(typeEmoji, W/2, 390);

    // ── ③ 유형 레이블 ────────────────────────────────────
    ctx.font = '500 32px sans-serif';
    ctx.fillStyle = 'rgba(232,255,71,0.8)';
    ctx.fillText('나의 10년 후 미래 유형', W/2, 460);

    // ── ④ 유형명 ─────────────────────────────────────────
    ctx.font = 'bold 68px sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(ctx, typeName, W/2, 560, W - 100, 80);

    // ── 구분선 ───────────────────────────────────────────
    const lineGrad2 = ctx.createLinearGradient(80, 0, W-80, 0);
    lineGrad2.addColorStop(0, 'rgba(232,255,71,0)');
    lineGrad2.addColorStop(0.5, 'rgba(232,255,71,0.35)');
    lineGrad2.addColorStop(1, 'rgba(232,255,71,0)');
    ctx.strokeStyle = lineGrad2;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, 660); ctx.lineTo(W-80, 660); ctx.stroke();

    // ── ⑤ 한 줄 요약 (핵심 긍정 문구) ───────────────────
    ctx.font = 'bold 38px sans-serif';
    ctx.fillStyle = '#f0f0f0';
    wrapText(ctx, oneline, W/2, 720, W - 120, 52);

    // ── ⑥ 강점 하이라이트 ────────────────────────────────
    if (s1) {
      ctx.font = '400 30px sans-serif';
      ctx.fillStyle = 'rgba(232,255,71,0.7)';
      wrapText(ctx, s1, W/2, 830, W-160, 42);
    }

    // ── ⑦ 10년 후 미래 ───────────────────────────────────
    if (future) {
      ctx.fillStyle = 'rgba(232,255,71,0.07)';
      roundRect(ctx, 60, 890, W-120, 100, 12);
      ctx.fill();
      ctx.font = '400 28px sans-serif';
      ctx.fillStyle = '#aaaaaa';
      wrapText(ctx, `✨ ${future}`, W/2, 948, W-160, 38);
    }

    // ── ⑧ 하단 CTA ───────────────────────────────────────
    const ctaG2 = ctx.createLinearGradient(0, 1000, 0, 1080);
    ctaG2.addColorStop(0, 'rgba(232,255,71,0.16)');
    ctaG2.addColorStop(1, 'rgba(232,255,71,0.06)');
    ctx.fillStyle = ctaG2;
    roundRect(ctx, 60, 1004, W-120, 60, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,255,71,0.4)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 60, 1004, W-120, 60, 12);
    ctx.stroke();

    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#e8ff47';
    ctx.fillText('나도 테스트 → 10yltest.netlify.app', W/2, 1044);
  }

  return canvas.toDataURL('image/png');
}

// ── 텍스트 줄바꿈 헬퍼 ───────────────────────────────────
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  if (!text) return y;
  const chars = text.split('');
  let line = '';
  let curY = y;
  chars.forEach(ch => {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = ch;
      curY += lineHeight;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, x, curY);
  return curY;
}

// ── 둥근 사각형 헬퍼 ─────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── 공유 모달 열기 ────────────────────────────────────────
let _sharePlatform = '';
let _shareImageData = '';

function openShareModal(platform) {
  _sharePlatform = platform;

  const ratio = (platform === 'kakao') ? 'square' : 'story';
  _shareImageData = generateShareImage(ratio);

  document.getElementById('share-img-preview').src = _shareImageData;

  const configs = {
    kakao: {
      title:  '📤 카카오톡 공유',
      desc:   '이미지를 저장한 후, 카카오톡에서 친구에게 사진으로 전송하세요',
      guide:  '① 아래 [이미지 저장하기] 버튼 클릭\n② 카카오톡 앱 열기\n③ 친구 채팅창에서 + → 사진 → 저장된 이미지 선택',
      btnTxt: '📱 카카오톡 열기',
      btnUrl: 'kakaotalk://',
    },
    twitter: {
      title:  '📤 X (트위터) 공유',
      desc:   '이미지를 저장한 후 X 앱에서 스토리에 업로드하세요',
      guide:  '① 아래 [이미지 저장하기] 버튼 클릭\n② X 앱 열기\n③ 새 게시물 → 이미지 첨부 → 저장된 이미지 선택',
      btnTxt: '🐦 X 앱 열기',
      btnUrl: 'twitter://',
    },
    facebook: {
      title:  '📤 Facebook 공유',
      desc:   '이미지를 저장한 후 Facebook 스토리에 업로드하세요',
      guide:  '① 아래 [이미지 저장하기] 버튼 클릭\n② Facebook 앱 열기\n③ 스토리 만들기 → 저장된 이미지 선택',
      btnTxt: '📘 Facebook 열기',
      btnUrl: 'fb://',
    },
    insta: {
      title:  '📤 Instagram 스토리 공유',
      desc:   '이미지를 저장한 후 인스타그램 스토리에 업로드하세요',
      guide:  '① 아래 [이미지 저장하기] 버튼 클릭\n② Instagram 앱 열기\n③ 스토리 → + → 저장된 이미지 선택',
      btnTxt: '📸 Instagram 열기',
      btnUrl: 'instagram://',
    },
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
  const url = document.getElementById('btn-open-platform').dataset.url;
  window.location.href = url;
  setTimeout(() => showToast('앱이 설치된 경우 열립니다'), 800);
}

function downloadShareImage() {
  const a = document.createElement('a');
  a.download = `10YL_${_sharePlatform}_result.png`;
  a.href = _shareImageData;
  a.click();
  showToast('✅ 이미지가 저장됐어요! 앱에서 업로드하세요 📲');
}

function closeShareModal() {
  document.getElementById('modal-share-img').classList.remove('show');
}

// ── 카카오톡 공유 ─────────────────────────────────────────
function shareKakao() {
  openShareModal('kakao');
}

// ── X (트위터) 공유 ───────────────────────────────────────
function shareTwitter() {
  openShareModal('twitter');
}

// ── 페이스북 공유 ─────────────────────────────────────────
function shareFacebook() {
  openShareModal('facebook');
}

// ── 인스타그램 공유 ───────────────────────────────────────
function shareInsta() {
  openShareModal('insta');
}

function copyLink() {
  const ui   = t().ui;
  const text = `${_currentType?.emoji} 10YL — "${_currentType?.name}"\n${_currentResult?.share||''}\n\n${window.location.href}`;
  navigator.clipboard.writeText(text)
    .then(()  => showToast(ui.toastCopied))
    .catch(()  => showToast('Copy failed'));
}

// ── 하위 호환용 (기존 코드 참조 방지) ────────────────────
function downloadInstaImage() { downloadShareImage(); }
function closeInstaModal()    { closeShareModal(); }

// ── 토스트 ────────────────────────────────────────────────
function showToast(msg) {
  let el = document.getElementById('global-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-toast'; el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ── 시작 / 재시작 ─────────────────────────────────────────
function startQuiz() {
  curQ = 0; answers = {};
  showScreen('quiz');
  renderQ();
  // 퀴즈 시작 즉시 중간 배너 표시
  renderAdSlot('quiz-mid-banner-slot');
}

function restart() {
  curQ = 0; answers = {};
  _currentResult = null; _currentType = null;
  showScreen('intro');
}

// ── 초기화 ────────────────────────────────────────────────
rebuildApp();
