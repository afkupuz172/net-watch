// UI rendering and typewriter effect

// Format payload with syntax highlighting
export function formatPayload(body) {
  if (!body) return '<span class="null">null</span>';
  
  // Simple JSON syntax highlighting
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
export function renderHeader(state, container) {
  const hpPercent = (state.hp / 100) * 100;
  const hpClass = hpPercent <= 30 ? 'critical' : hpPercent <= 60 ? 'warning' : '';
  const statusText = hpPercent <= 30 ? 'CRITICAL' : hpPercent <= 60 ? 'WARNING' : 'NOMINAL';
  
  container.innerHTML = `
    <div class="header">
      <div>
        <div class="logo">▌NETWATCH v2.1▌</div>
        <div class="company">Veridian Systems SOC</div>
      </div>
      <div class="hp-container">
        <span class="hp-label">HP</span>
        <div class="hp-bar">
          <div class="hp-fill ${hpClass}" style="width: ${hpPercent}%"></div>
        </div>
        <span class="hp-text">${state.hp}%</span>
        <span class="session-counter">[${statusText}]</span>
      </div>
      <div class="session-counter">Request #${state.session.toString().padStart(3, '0')}</div>
    </div>
  `;
}

// Render request details
export function renderRequest(request, container) {
  const req = request.request;
  const ipClass = req.srcIp.startsWith('10.') || req.srcIp.startsWith('172.') || req.srcIp.startsWith('192.') ? '' : 
    req.srcIp === '185.234.72.19' || req.srcIp === '89.248.167.131' || req.srcIp === '45.227.34.107' ? 'danger' : '';
  
  container.innerHTML = `
    <div class="request-panel">
      <div class="session-label">Incoming Request #${request.id}</div>
      <hr class="divider">
      <div class="request-body">
        <div class="field">
          <span class="field-label">TIMESTAMP:</span>
          <span class="field-value">${req.timestamp}</span>
        </div>
        <div class="field">
          <span class="field-label">SOURCE IP:</span>
          <span class="field-value ${ipClass}">${req.srcIp}</span>
        </div>
        <div class="field">
          <span class="field-label">DEST:</span>
          <span class="field-value">${req.dest}</span>
        </div>
        <div class="field">
          <span class="field-label">METHOD:</span>
          <span class="field-value">${req.method}</span>
        </div>
        <div class="field">
          <span class="field-label">PATH:</span>
          <span class="field-value">${req.path}</span>
        </div>
        <div class="field">
          <span class="field-label">HOST:</span>
          <span class="field-value">${req.host}</span>
        </div>
        <div class="field">
          <span class="field-label">USER-AGENT:</span>
          <span class="field-value">${req.userAgent}</span>
        </div>
        ${req.headers && Object.keys(req.headers).length > 0 ? `
          <div class="field">
            <span class="field-label">HEADERS:</span>
            <span class="field-value">${formatHeaders(req.headers)}</span>
          </div>
        ` : ''}
        ${req.body ? `
          <div class="payload-label">[REQUEST BODY]</div>
          <div class="payload">${formatPayload(req.body)}</div>
        ` : ''}
      </div>
    </div>
  `;
}

// Render action buttons
export function renderActions(enabled, container) {
  container.innerHTML = `
    <div class="actions">
      <button class="btn btn-allow" data-action="allow" ${enabled ? '' : 'disabled'}>[A] ALLOW</button>
      <button class="btn btn-deny" data-action="deny" ${enabled ? '' : 'disabled'}>[D] DENY</button>
    </div>
  `;
}

// Render feedback panel
export function renderFeedback(request, decision, container) {
  const isCorrect = decision.correct;
  const damage = decision.damage || 0;
  
  if (isCorrect) {
    container.innerHTML = `
      <div class="feedback-panel">
        <div class="feedback-header success">✓ REQUEST #${request.id} — ALLOWED</div>
        <hr class="divider">
        <div class="feedback-verdict">VERDICT: CLEAN</div>
        <div class="feedback-body">
          <div class="feedback-detail">• ${request.explanation}</div>
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
          <div class="feedback-detail damage">• Damage: -${damage} HP</div>
        </div>
        <div class="continue-prompt">Press SPACE or click to continue...</div>
      </div>
    `;
  }
}

// Render start screen
export function renderStartPage(state, container) {
  container.innerHTML = `
    <div class="start-screen">
      <div class="start-logo">▌NETWATCH v2.1▌</div>
      <div class="start-subtitle">VERIDIAN SYSTEMS — SECURITY OPERATIONS CENTER</div>
      <hr class="divider">
      <div class="start-content">
        <p class="start-intro">You are a Tier-1 SOC Analyst assigned to the graveyard shift at Veridian Systems. Your job: analyze incoming network requests and decide whether to <span class="text-allow">ALLOW</span> or <span class="text-deny">DENY</span> them.</p>
        <p class="start-intro">Some requests are legitimate. Others are attacks. One wrong decision and your corporate network bleeds.</p>
        <div class="start-rules">
          <div class="rule-header">// MISSION BRIEFING</div>
          <div class="rule"><span class="text-allow">ALLOW</span> — Request appears legitimate. Let it through.</div>
          <div class="rule"><span class="text-deny">DENY</span> — Request shows signs of malicious intent. Block it.</div>
          <div class="rule">You start with <span class="text-hp">100 HP</span>. Each successful attack costs you HP based on severity.</div>
          <div class="rule">Game ends at <span class="text-deny">0 HP</span>. Your shift is over.</div>
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
          <div class="stat">Final HP: <span class="stat-value">${state.hp}</span></div>
        </div>
        <button class="btn-restart" data-action="restart">[RESTART SHIFT]</button>
        <div class="high-score">High Score: <span>${state.highScore}</span> requests</div>
      </div>
    </div>
  `;
}