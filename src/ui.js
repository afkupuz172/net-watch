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
  'This traffic has never committed a crime. Unlike Dave from sales.'
];

function hcaptchaHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return h;
}

function getHCaptchaAnnotation(value) {
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
  const idx = hcaptchaHash(v) % HCAPTCHA_GREEN_QUIPS.length;
  return { level: 'green', quip: HCAPTCHA_GREEN_QUIPS[idx] };
}

function renderHCaptchaAnnotation(value) {
  const ann = getHCaptchaAnnotation(value);
  if (!ann) return '';
  return `<div class="hcaptcha-annotation hcaptcha-${ann.level}">${ann.quip}</div>`;
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
  
  container.innerHTML = `
    <div class="request-panel">
      <div class="session-label">Incoming Request #${request.id}</div>
      <hr class="divider">
      <div class="request-body">
        <div class="field">
          <span class="field-label">TIMESTAMP:</span>
          <span class="field-value">${highlightValue(req.timestamp, shieldEnabled)}</span>
        </div>
        <div class="field">
          <span class="field-label">SOURCE IP:</span>
          <span class="field-value">${highlightValue(req.srcIp, shieldEnabled)}</span>
        </div>
        ${hcaptchaEnabled ? renderHCaptchaAnnotation(req.srcIp) : ''}
        <div class="field">
          <span class="field-label">DEST:</span>
          <span class="field-value">${highlightValue(req.dest, shieldEnabled)}</span>
        </div>
        <div class="field">
          <span class="field-label">METHOD:</span>
          <span class="field-value">${highlightValue(req.method, shieldEnabled)}</span>
        </div>
        <div class="field">
          <span class="field-label">PATH:</span>
          <span class="field-value">${highlightValue(req.path, shieldEnabled)}</span>
        </div>
        ${hcaptchaEnabled ? renderHCaptchaAnnotation(req.path) : ''}
        <div class="field">
          <span class="field-label">HOST:</span>
          <span class="field-value">${highlightValue(req.host, shieldEnabled)}</span>
        </div>
        <div class="field">
          <span class="field-label">USER-AGENT:</span>
          <span class="field-value">${highlightValue(req.userAgent, shieldEnabled)}</span>
        </div>
        ${hcaptchaEnabled ? renderHCaptchaAnnotation(req.userAgent) : ''}
        ${req.headers && Object.keys(req.headers).length > 0 ? `
          <div class="field">
            <span class="field-label">HEADERS:</span>
            <span class="field-value">${formatHeaders(req.headers)}</span>
          </div>
        ` : ''}
        ${req.body ? `
          <div class="payload-label">[REQUEST BODY]</div>
          <div class="payload">${formatPayload(req.body)}</div>
          ${hcaptchaEnabled ? renderHCaptchaAnnotation(req.body) : ''}
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

// Render feedback panel
export function renderFeedback(request, decision, container) {
  const isCorrect = decision.correct;
  const damage = decision.damage || 0;
  const isMalicious = request.isMalicious;
  const wasBlockingLegit = !isCorrect && !isMalicious;
  
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
        <div class="continue-prompt">Press SPACE or click to continue...</div>
      </div>
    `;
  }
}

// Render start screen
export function renderStartPage(state, container) {
  const netshieldClass = state.equippedTool === 'netshield' ? 'tool-selected' : 'tool-unselected';
  const hcaptchaClass = state.equippedTool === 'hcaptcha' ? 'tool-selected' : 'tool-unselected';
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