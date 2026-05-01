// UI rendering and typewriter effect

// Format payload with syntax highlighting
export function formatPayload(body) {
  if (!body) return '<span class="null">null</span>';
  
  // Simple JSON syntax highlighting (all in primary green)
  return body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="string">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="number">$1</span>')
    .replace(/: (null)/g, ': <span class="null">$1</span>');
}

// Typewriter effect that resolves a promise
export function typewriter(element, text, speed = 15) {
  return new Promise((resolve) => {
    element.innerHTML = '';
    let i = 0;
    
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    
    type();
  });
}

// Format headers for display
export function formatHeaders(headers) {
  return Object.entries(headers)
    .map(([k, v]) => `<div class="field"><span class="field-label">${k}:</span> <span class="field-value">${v}</span></div>`)
    .join('');
}

// Render the main game view
export function renderHeader(state, container, timeLeft = null) {
  const tpPercent = (state.tp / 100) * 100;
  const tpClass = tpPercent <= 30 ? 'critical' : tpPercent <= 60 ? 'warning' : '';
  const statusText = tpPercent <= 30 ? 'CRITICAL' : tpPercent <= 60 ? 'WARNING' : 'NOMINAL';
  
  let timerHtml = '';
  if (timeLeft !== null) {
    const seconds = Math.floor(timeLeft);
    const ms = Math.floor((timeLeft % 1) * 100);
    const timerClass = timeLeft <= 5 ? 'timer-critical' : timeLeft <= 10 ? 'timer-warning' : '';
    timerHtml = `
      <div class="timer">
        <span class="timer-label">TIME</span>
        <span class="timer-value ${timerClass}">${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}</span>
      </div>
    `;
  }
  
  container.innerHTML = `
    <div class="header">
      <div>
        <div class="logo">▌NETWATCH v2.1▌</div>
        <div class="company">Veridian Systems SOC</div>
      </div>
      <div class="hp-container">
        <span class="hp-label">Trust Points</span>
        <div class="hp-bar">
          <div class="hp-fill ${tpClass}" style="width: ${tpPercent}%"></div>
        </div>
        <span class="hp-text">${state.tp} TP</span>
        <span class="session-counter">[${statusText}]</span>
      </div>
      ${timerHtml}
      <div class="session-counter">Request #${state.session.toString().padStart(3, '0')}</div>
    </div>
  `;
}

// hCaptcha Enterprise annotation engine
const HCAPTCHA_GREEN_QUIPS = [
  'Boring. Beautifully, legally boring.',
  'Nothing to see here. Carry on.',
  'Clean as a freshly wiped server.',
  'Certified safe by hCaptcha Enterprise\u2122. Probably.',
  'This traffic has never committed a crime. Unlike Dave from sales.',
  'Squeaky clean. Almost suspiciously so. Almost.',
  'hCaptcha gives this a thumbs up. One of its robotic thumbs.',
  'Completely ordinary. A truly unremarkable piece of the internet.',
  'No flags. No concerns. No fun.',
  'Verified. Legitimate. Dull. Moving on.',
  'This could not be more legal if it tried.',
  'A beacon of compliance in a dark, dark network.',
  'Our algorithms found nothing. Our therapist found plenty, but that is unrelated.',
  'Harmless. Like a golden retriever wearing a tiny tie.',
  'hCaptcha Enterprise\u2122 sees no evil. Hears no evil. Bills quarterly regardless.',
  'Traffic of this caliber deserves a small certificate. We did not include one.',
  'So clean it squeaks. hCaptcha appreciates the effort.',
  'Not a single RFC violation. Someone actually read the docs.',
  'Legitimate. Authorized. Allowed. Please proceed. Thank you for your service.',
  'This request has done nothing wrong and should be allowed to live its life.'
];

// Green quips for clean fields on a malicious overall request \u2014 nudge toward DENY
const HCAPTCHA_GREEN_DENY_NUDGE = [
  '\u2190 \u2713 This specific field is clean. The rest of this request is another matter entirely.',
  '\u2190 \u2713 Nothing suspicious here. Keep reading. Something is waiting for you.',
  '\u2190 \u2713 hCaptcha Enterprise\u2122 sees no issue with this field. That does not mean there are none.',
  '\u2190 \u2713 Clean. Suspiciously so. Look at the other fields before you decide.',
  '\u2190 \u2713 This one passes. We are not done here.',
  '\u2190 \u2713 Safe. But hCaptcha suggests you examine the full picture before trusting it.',
];

function hcaptchaHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return h;
}

function getHCaptchaAnnotation(value, isMalicious = false) {
  if (!value) return null;
  const v = String(value);
  const redChecks = [
    [/['"]\s*(--|or\s+1\s*=\s*1|union\s+select|drop\s+table)/i, '\u2190 \uD83D\uDEA8 SQL injection. This attacker learned from a 2009 tutorial. It shows.'],
    [/<script|onerror\s*=|onload\s*=|javascript:/i, '\u2190 \uD83D\uDEA8 JavaScript in a text field. Peak 2005 hacker energy. Block with prejudice.'],
    [/file:\/\/\/|\/etc\/passwd|\/etc\/shadow/i, '\u2190 \uD83D\uDEA8 Trying to read system files. Bold strategy. Not a great one.'],
    [/rm\s+-rf|;\s*curl.*\|.*bash|&&.*curl/i, '\u2190 \uD83D\uDEA8 Shell commands in a form field. They just typed their attack out loud. Respect the audacity.'],
    [/169\.254\.169\.254/i, '\u2190 \uD83D\uDEA8 AWS metadata endpoint. Someone watched Mr. Robot and skipped the ethics episode.'],
    [/bypass_mfa|role.*admin.*true/i, '\u2190 \uD83D\uDEA8 Asking to skip MFA and be admin simultaneously. Attacker or very confused intern.'],
    [/totally-not-malware|evil\.com|evil\.net/i, '\u2190 \uD83D\uDEA8 The domain name is a confession. Deny. Frame it on the wall.'],
    [/stdClass.*cmd|O:\d+.*cmd/i, '\u2190 \uD83D\uDEA8 Serialized object with a cmd field. Someone is very proud of themselves right now.'],
    [/\.\.\//i, '\u2190 \uD83D\uDEA8 Path traversal. Trying to escape the directory like a very determined hamster.'],
    [/hunter2|' OR '/i, '\u2190 \uD83D\uDEA8 Either a SQL injection or the world\'s worst password. Possibly both.'],
  ];
  const yellowChecks = [
    [/python-requests|go-http-client/i, '\u2190 \u26A0\uFE0F Automated client. Could be legit tooling. Could be chaos on a basement server.'],
    [/185\.234\.|89\.248\.|45\.227\./i, '\u2190 \u26A0\uFE0F Sketchy IP range. Like a coworker who\'s \'technically never been convicted.\''],
    [/\/admin|\/exec|\/serialize|\/deploy/i, '\u2190 \u26A0\uFE0F Sensitive path. Legitimate admins exist. So do very determined non-admins.'],
    [/summer\d{4}|qwerty|letmein/i, '\u2190 \u26A0\uFE0F Password pattern from a leaked database. At this point, a tradition.'],
  ];
  for (const [re, quip] of redChecks) {
    if (re.test(v)) return { level: 'red', quip };
  }
  for (const [re, quip] of yellowChecks) {
    if (re.test(v)) return { level: 'yellow', quip };
  }
  if (isMalicious) {
    const idx = hcaptchaHash(v) % HCAPTCHA_GREEN_DENY_NUDGE.length;
    return { level: 'green', quip: HCAPTCHA_GREEN_DENY_NUDGE[idx] };
  }
  const idx = hcaptchaHash(v) % HCAPTCHA_GREEN_QUIPS.length;
  return { level: 'green', quip: HCAPTCHA_GREEN_QUIPS[idx] };
}

function renderAnnotatedField(label, value, isMalicious, shieldEnabled) {
  const ann = getHCaptchaAnnotation(value, isMalicious);
  const colorClass = ann ? `hcaptcha-field-${ann.level}` : '';
  return `
    <div class="field">
      <span class="field-label">${label}:</span>
      <span class="field-value ${colorClass}">${highlightValue(value, shieldEnabled)}</span>
    </div>
    ${ann ? `<div class="hcaptcha-annotation hcaptcha-${ann.level}">${ann.quip}</div>` : ''}
  `;
}

// Helper to randomly highlight values with colors for netshield
function highlightValue(value, enable) {
  if (!enable || !value) return value;
  const colors = ['shield-red', 'shield-green', 'shield-yellow'];
  // Pick a random color
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `<span class="${color}">${value}</span>`;
}

// Render request details with optional netshield/hcaptcha highlighting
export function renderRequest(request, container, equippedTool = null) {
  const req = request.request;
  const shieldEnabled = equippedTool === 'netshield';
  const hcaptchaEnabled = equippedTool === 'hcaptcha';
  const isMalicious = request.isMalicious;

  function plainField(label, value) {
    return `<div class="field"><span class="field-label">${label}:</span><span class="field-value">${highlightValue(value, shieldEnabled)}</span></div>`;
  }
  function annotatedField(label, value) {
    return hcaptchaEnabled
      ? renderAnnotatedField(label, value, isMalicious, shieldEnabled)
      : plainField(label, value);
  }

  const bodyAnn = hcaptchaEnabled && req.body ? getHCaptchaAnnotation(req.body, isMalicious) : null;

  container.innerHTML = `
    <div class="request-panel">
      <div class="session-label">Incoming Request #${request.id}</div>
      <hr class="divider">
      <div class="request-body">
        ${plainField('TIMESTAMP', req.timestamp)}
        ${annotatedField('SOURCE IP', req.srcIp)}
        ${plainField('DEST', req.dest)}
        ${plainField('METHOD', req.method)}
        ${annotatedField('PATH', req.path)}
        ${plainField('HOST', req.host)}
        ${annotatedField('USER-AGENT', req.userAgent)}
        ${req.headers && Object.keys(req.headers).length > 0 ? `
          <div class="field">
            <span class="field-label">HEADERS:</span>
            <span class="field-value">${formatHeaders(req.headers)}</span>
          </div>
        ` : ''}
        ${req.body ? `
          <div class="payload-label">[REQUEST BODY]</div>
          <div class="payload${bodyAnn ? ` payload-hcaptcha-${bodyAnn.level}` : ''}">${formatPayload(req.body)}</div>
          ${bodyAnn ? `<div class="hcaptcha-annotation hcaptcha-${bodyAnn.level}">${bodyAnn.quip}</div>` : ''}
        ` : ''}
      </div>
    </div>
  `;
}

// Render continue button for feedback state
export function renderContinueButton(container) {
  container.innerHTML = `
    <div class="actions">
      <button class="btn btn-continue" data-action="continue">[CONTINUE]</button>
    </div>
  `;
}

// Render action buttons
export function renderActions(enabled, container) {
  container.innerHTML = `
    <div class="actions">
      <button class="btn btn-allow" data-action="allow" ${enabled ? '' : 'disabled'}>[A] ALLOW</button>
      <button class="btn btn-deny" data-action="deny" ${enabled ? '' : 'disabled'}>[D] DENY</button>
      <button class="btn btn-giveup" data-action="giveup">[ I GIVE UP ]</button>
    </div>
  `;
}

const HCAPTCHA_MOCKERY_ALLOW = [
  'hCaptcha annotated that threat in red. You allowed it through anyway. Bold.',
  'The AI highlighted the danger. Literally. In red. You permitted it. Astonishing.',
  'hCaptcha is filing an incident report. The incident is you.',
  'Three hCaptcha warnings ignored. It is practically driving and you are just honking at it.',
  'hCaptcha Enterprise™ has contacted your supervisor, their supervisor, and building security.',
];

const HCAPTCHA_MOCKERY_DENY = [
  'hCaptcha gave that a green annotation. You blocked it. Green means safe.',
  'A green rating is the AI\'s way of saying clean traffic. You escalated it to a federal matter.',
  'hCaptcha marked it safe. You marked it denied. One of you went to school for this.',
  'That annotation was literally green. As in the color that means things are fine.',
  'hCaptcha Enterprise™ has enrolled you in mandatory retraining. It is not optional.',
];

function getHCaptchaMockery(decision, request, state) {
  if (!state || state.equippedTool !== 'hcaptcha' || decision.correct) return '';
  const lines = request.isMalicious ? HCAPTCHA_MOCKERY_ALLOW : HCAPTCHA_MOCKERY_DENY;
  const idx = Math.min((state.hcaptchaFailCount || 1) - 1, lines.length - 1);
  return `<div class="hcaptcha-mockery">hCaptcha Enterprise™: "${lines[Math.max(0, idx)]}"</div>`;
}

// Render feedback panel
export function renderFeedback(request, decision, container, state = null) {
  const isCorrect = decision.correct;
  const damage = decision.damage || 0;
  const isMalicious = request.isMalicious;
  const wasBlockingLegit = !isCorrect && !isMalicious;
  
  const mockery = getHCaptchaMockery(decision, request, state);
  if (isCorrect) {
    const verdict = isMalicious ? 'THREAT NEUTRALIZED' : 'CLEAN';
    container.innerHTML = `
      <div class="feedback-panel">
        <div class="feedback-header success">✓ REQUEST #${request.id} — ${isMalicious ? 'DENIED' : 'ALLOWED'}</div>
        <hr class="divider">
        <div class="feedback-verdict">VERDICT: ${verdict}</div>
        <div class="feedback-body">
          <div class="feedback-detail">• ${request.explanation}</div>
          <div class="feedback-detail regen">• Trust replenished: +5 Trust Points</div>
        </div>
        <div class="continue-prompt">Press SPACE or click to continue...</div>
      </div>
    `;
  } else if (wasBlockingLegit) {
    container.innerHTML = `
      <div class="feedback-panel">
        <div class="feedback-header failure">✗ REQUEST #${request.id} — BLOCKED</div>
        <hr class="divider">
        <div class="feedback-verdict">FALSE POSITIVE — You blocked legitimate traffic</div>
        <div class="feedback-body">
          <div class="feedback-detail">• ${request.explanation}</div>
          <div class="feedback-detail damage">• Customer traffic blocked. Damage: -${damage} Trust Points</div>
        </div>
        ${mockery}
        <div class="continue-prompt">Press SPACE or click to continue...</div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="feedback-panel">
        <div class="feedback-header failure">✗ REQUEST #${request.id} — BREACH DETECTED</div>
        <hr class="divider">
        <div class="feedback-verdict">INFILTRATION SUCCESSFUL — Your network is compromised</div>
        <div class="feedback-body">
          <div class="feedback-detail">• ${request.explanation}</div>
          <div class="feedback-detail" style="margin-top: 12px; color: var(--text-dim);">How to spot this:</div>
          <div class="feedback-detail">• ${request.spotDescription}</div>
          <div class="feedback-detail damage">• Damage: -${damage} Trust Points</div>
        </div>
        ${mockery}
        <div class="continue-prompt">Press SPACE or click to continue...</div>
      </div>
    `;
  }
}

// Render start screen
export function renderStartPage(state, container) {
  const netshieldClass = state.equippedTool === 'netshield' ? 'tool-selected' : 'tool-unselected';
  const hcaptchaClass = state.equippedTool === 'hcaptcha' ? 'tool-selected' : 'tool-unselected';
  const hcaptchaProClass = state.equippedTool === 'hcaptcha-pro' ? 'tool-selected tool-card-pro' : 'tool-unselected tool-card-pro';
  container.innerHTML = `
    <div class="start-screen">
      <div class="start-logo">▌NETWATCH v2.1▌</div>
      <div class="start-subtitle">VERIDIAN SYSTEMS — SECURITY OPERATIONS CENTER</div>
      <hr class="divider">
      <div class="start-content">
        <p class="start-intro">You are a Tier-1 SOC Analyst assigned to the graveyard shift at Veridian Systems. Your job: analyze incoming network requests and decide whether to <span class="text-allow">ALLOW</span> or <span class="text-deny">DENY</span> them.</p>
        <p class="start-intro">Some requests are legitimate. Others are attacks. One wrong decision and your corporate network bleeds — whether you let an attack through or block a customer.</p>

        <div class="tool-section">
          <div class="tool-header">// EQUIP TOOL (select one)</div>
          <button class="tool-card ${netshieldClass}" data-tool="netshield">
            <div class="tool-name">STANDARD NET SHIELD</div>
            <div class="tool-desc">Highlights suspicious values in requests. Reduces Trust Points loss by 5 on mistakes.</div>
          </button>
          <button class="tool-card ${hcaptchaClass}" data-tool="hcaptcha" style="margin-top: 8px;">
            <div class="tool-name">hCAPTCHA ENTERPRISE</div>
            <div class="tool-desc">AI-powered traffic analysis. Annotates each request field with color-coded threat arrows and a professional assessment. Results may vary. Mostly they don't.</div>
          </button>
          <button class="tool-card ${hcaptchaProClass}" data-tool="hcaptcha-pro" style="margin-top: 8px;">
            <div class="tool-name tool-name-pro">hCAPTCHA ENTERPRISE PRO™</div>
            <div class="tool-desc">Skip the graveyard shift entirely. hCaptcha's autonomous threat elimination handles everything while you relax. May contain explosions. The bots are fine. Mostly.</div>
          </button>
        </div>
        
        <div class="start-rules">
          <div class="rule-header">// MISSION BRIEFING</div>
          <div class="rule"><span class="text-allow">ALLOW</span> — Request appears legitimate. Let it through.</div>
          <div class="rule"><span class="text-deny">DENY</span> — Request shows signs of malicious intent. Block it.</div>
          <div class="rule">You have <span class="text-hp">15 seconds</span> per request. Timer expires = auto-allow.</div>
          <div class="rule">You start with <span class="text-hp">100 Trust Points</span>. Mistakes cost Trust Points:</div>
          <div class="rule indent">— Allow an attack: 10-35 Trust Points based on severity</div>
          <div class="rule indent">— Block legitimate traffic: <span class="text-deny">25 Trust Points</span></div>
          <div class="rule indent">— Correct decisions replenish <span class="text-allow">+5 Trust Points</span></div>
          <div class="rule">Game ends at <span class="text-deny">0 Trust Points</span>. Your shift is over.</div>
        </div>
        <div class="start-keys">
          <div class="key-header">// CONTROLS</div>
          <div class="key"><kbd>A</kbd> or <kbd>click ALLOW</kbd></div>
          <div class="key"><kbd>D</kbd> or <kbd>click DENY</kbd></div>
          <div class="key"><kbd>SPACE</kbd> or <kbd>ENTER</kbd> to continue after each decision</div>
        </div>
      </div>
      <button class="btn-start" data-action="start">[BEGIN SHIFT]</button>
      ${state.highScore > 0 ? `<div class="high-score">High Score: <span>${state.highScore}</span> requests reviewed</div>` : ''}
    </div>
  `;
}

// Render game over screen
export function renderGameOver(state, container) {
  if (state.proWin) {
    container.innerHTML = `
      <div class="game-over-overlay">
        <div class="game-over-content">
          <div class="game-over-title pro-win-title">✓ SHIFT COMPLETE ✓</div>
          <div class="game-over-subtitle pro-win-subtitle">PROTECTED BY hCAPTCHA ENTERPRISE PRO™</div>
          <div class="stats">
            <div class="stat">Threats Neutralized: <span class="stat-value">47,831</span></div>
            <div class="stat">Your Contribution: <span class="stat-value">0</span></div>
            <div class="stat">Trust Points Remaining: <span class="stat-value">100</span></div>
          </div>
          <div class="pro-win-message">hCaptcha did everything. You watched. That's a valid career path.</div>
          <button class="btn-restart" data-action="restart">[TRY WITHOUT PRO]</button>
        </div>
      </div>
    `;
    return;
  }

  const accuracy = state.totalRequests > 0
    ? Math.round((state.correct / state.totalRequests) * 100)
    : 0;

  container.innerHTML = `
    <div class="game-over-overlay">
      <div class="game-over-content">
        <div class="game-over-title">██ NETWATCH — SHUTDOWN ██</div>
        <div class="game-over-subtitle">SYSTEM COMPROMISED</div>
        <div class="stats">
          <div class="stat">Requests Reviewed: <span class="stat-value">${state.totalRequests}</span></div>
          <div class="stat">Correct Decisions: <span class="stat-value">${state.correct}</span> (${accuracy}%)</div>
          <div class="stat">Final Trust Points: <span class="stat-value">${state.tp}</span></div>
        </div>
        <button class="btn-restart" data-action="restart">[RESTART SHIFT]</button>
        <div class="high-score">High Score: <span>${state.highScore}</span> requests</div>
      </div>
    </div>
  `;
}

// Render hCaptcha Enterprise PRO animation screen
export function renderProAnimation(container) {
  container.innerHTML = `
    <div class="pro-screen">
      <div class="pro-title">hCAPTCHA ENTERPRISE PRO™</div>
      <div class="pro-subtitle">AUTONOMOUS THREAT ELIMINATION IN PROGRESS</div>
      <hr class="divider">
      <div class="pro-battlefield">
        <div class="pro-side pro-good-side">
          <div class="pro-side-label good-label">AUTHORIZED TRAFFIC</div>
          <div class="pro-bots">
            <span class="pro-bot good-bot" style="animation-delay:0.0s">🤖</span>
            <span class="pro-bot good-bot" style="animation-delay:0.15s">🤖</span>
            <span class="pro-bot good-bot" style="animation-delay:0.3s">🤖</span>
            <span class="pro-bot good-bot" style="animation-delay:0.45s">🤖</span>
            <span class="pro-bot good-bot" style="animation-delay:0.6s">🤖</span>
          </div>
        </div>
        <div class="pro-vs">⚡</div>
        <div class="pro-side pro-bad-side">
          <div class="pro-bots">
            <span class="pro-bot bad-bot" style="animation-delay:0.4s">👾</span>
            <span class="pro-bot bad-bot" style="animation-delay:1.1s">👾</span>
            <span class="pro-bot bad-bot" style="animation-delay:1.8s">💀</span>
            <span class="pro-bot bad-bot" style="animation-delay:2.5s">👾</span>
            <span class="pro-bot bad-bot" style="animation-delay:3.2s">💀</span>
          </div>
          <div class="pro-side-label bad-label">THREATS ELIMINATED</div>
        </div>
      </div>
      <div class="pro-blurb">
        hCaptcha Enterprise PRO™ is handling all incoming threats autonomously.<br>
        You may sit back and enjoy your evening. This one's on us.
      </div>
      <div class="pro-status-bar">
        <div class="pro-status-text" id="pro-status-text">Initializing threat matrix...</div>
        <div class="pro-progress-track">
          <div class="pro-progress-fill"></div>
        </div>
      </div>
    </div>
  `;
}