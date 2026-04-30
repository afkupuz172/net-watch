# NETWATCH — SOC Analyst Simulator

## 1. Concept & Vision

You are Tier-1 SOC Analyst at Veridian Systems, 02:47 AM shift. A neon terminal glow is your only companion as HTTP requests flood your screen — some legitimate, some weaponized. You have seconds to decide: **ALLOW** or **DENY**. Let one malicious request through and your corporate network bleeds. Let too many through and you're fired — or worse, prosecuted.

The game captures that specific anxiety of night-shift security work: the weight of binary choices with asymmetric consequences, the dread of a log you should have flagged, the cold satisfaction of catching an attack before it catches you.

## 2. Design Language

### Aesthetic Direction
**CRT terminal noir** — The phosphor glow of a 1990s NOC monitor, scan lines and all. Not retro-hipster, but genuinely uncomfortable. The kind of interface you actually see in a SOC at 3am.

### Color Palette
- `--bg`: #0a0c10 (near-black with blue tint)
- `--bg-terminal`: #0d1117 (terminal background)
- `--primary`: #00ff88 (phosphor green — the classic terminal green)
- `--danger`: #ff3366 (alarm red)
- `--warning`: #ffaa00 (amber alert)
- `--text`: #c9d1d9 (soft gray text)
- `--text-dim`: #6e7681 (dimmed secondary text)
- `--border`: #30363d (subtle borders)
- `--glow`: rgba(0, 255, 136, 0.15) (green glow for active elements)

### Typography
- **Primary**: `IBM Plex Mono` — the authentic terminal feel
- **Fallback**: `Courier New`, monospace
- All caps for labels, mixed case for body content
- No italic, no serif mixing

### Spatial System
- Tight, dense information display — SOC analysts don't have whitespace
- Consistent 8px grid
- Bordered panels with 1px solid lines
- Status bar always visible at top

### Motion Philosophy
- Minimal, purposeful: requests "type in" letter by letter (typewriter effect, 20ms/char)
- Scan line overlay (CSS, subtle)
- Screen flicker on wrong decision (brief, 200ms)
- HP bar drains with smooth transition (400ms ease-out)
- No bouncy or playful animations — everything is deliberate, clinical

### Visual Assets
- ASCII art logo for "NETWATCH" header
- Simple geometric shapes for status indicators
- No images — pure text and CSS

## 3. Layout & Structure

```
┌─────────────────────────────────────────────────────┐
│ ▌NETWATCH v2.1 ▌ VERIDIAN SYSTEMS SOC ▌ HP [████░░] 80% │  <- Header bar
├─────────────────────────────────────────────────────┤
│                                                     │
│  INCOMING REQUEST #047                              │  <- Session label
│  ─────────────────────────────────────────────      │
│                                                     │
│  TIMESTAMP:  2026-04-30 02:47:33 UTC                │
│  SOURCE IP:  185.234.72.19 (RUE)                    │
│  DEST:       internal.veridian.corp                 │
│  METHOD:     POST                                   │
│  PATH:       /api/v2/users/auth                     │
│  HOST:       api.veridian.corp                      │
│  USER-AGENT: Mozilla/5.0 (compatible;...)            │
│                                                     │
│  [REQUEST BODY / PAYLOAD]                           │
│  ─────────────────────────────────────────────      │
│  {                                                  │
│    "username": "admin",                             │
│    "password": "admin123",                          │
│    "mfa_code": null                                 │
│  }                                                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [ALLOW]                              [DENY]        │  <- Action buttons
└─────────────────────────────────────────────────────┘
```

**Feedback State** (replaces request display):

```
┌─────────────────────────────────────────────────────┐
│  ✓ REQUEST #047 — ALLOWED                          │
│  ─────────────────────────────────────────────      │
│  VERDICT: CLEAN                                     │
│  • Legitimate auth attempt — employee VPN access    │
│                                                     │
│  Press SPACE or click to continue...                │
└─────────────────────────────────────────────────────┘
```

**Failure State**:

```
┌─────────────────────────────────────────────────────┐
│  ✗ REQUEST #047 — BREACH DETECTED                  │
│  ─────────────────────────────────────────────      │
│  INFILTRATION SUCCESSFUL — Your network is compromised │
│  • Request appeared to be legitimate auth           │
│  • Actual payload: SQL injection via username field │
│  • Expected: Deny — malformed query string          │
│  • Damage: -15 HP                                   │
│  • 185.234.72.19 flagged as malicious               │
│                                                     │
│  Press SPACE or click to continue...                │
└─────────────────────────────────────────────────────┘
```

**Game Over State**:

```
┌─────────────────────────────────────────────────────┐
│  ██ NETWATCH — SHUTDOWN ██                         │
│                                                     │
│  SYSTEM COMPROMISED                                 │
│  Your SOC tenure at Veridian Systems has ended.    │
│  Final Score: 23 requests reviewed                  │
│  Correct Decisions: 18 (78%)                        │
│                                                     │
│  [RESTART SHIFT]                                   │
└─────────────────────────────────────────────────────┘
```

## 4. Features & Interactions

### Core Gameplay Loop
1. Request appears with typewriter animation (1-2 seconds to read)
2. Player clicks ALLOW or DENY (keyboard shortcuts: A and D)
3. Feedback displays immediately
4. 2-second pause, then next request auto-loads
5. Repeat until HP reaches 0

### Request Types (sampled randomly)
- **Clean requests** (40%): Legitimate traffic — should ALLOW
- **Malicious requests** (60%): Attacks — should DENY

### Malicious Request Categories
Each has a name, description, damage value, and "how to spot" explanation:

| Category | Damage | Example |
|----------|--------|---------|
| SQL Injection | 15-25 HP | `username: "admin'--"`, malformed query strings |
| XSS | 10-20 HP | `<script>alert(1)</script>` in params |
| SSRF | 20-30 HP | Requests to internal IPs (10.x, 192.168.x, localhost) |
| Command Injection | 25-35 HP | `; rm -rf /`, `$(whoami)` in params |
| Credential Stuffing | 15-25 HP | Known breach combos, generic passwords |
| Path Traversal | 20-25 HP | `../../etc/passwd`, `..\\..\\windows\\system32` |
| Fake Malware Download | 20-30 HP | Suspicious file extensions from untrusted sources |
| Auth Bypass | 25-35 HP | Direct object references, insecure JWT patterns |

### HP System
- Start: 100 HP
- HP bar visually degrades (green → yellow → red)
- At 30 HP: status text changes to "CRITICAL"
- At 0 HP: game over

### Keyboard Controls
- `A` — Allow
- `D` — Deny
- `Space` / `Enter` — Continue (on feedback screen)

### Persistence
- High score (most requests survived) stored in localStorage

## 5. Component Inventory

### Header Bar
- Fixed top, always visible
- Shows: NETWATCH logo, company name, HP bar, current session count
- HP bar: green >60%, yellow 30-60%, red <30%
- Subtle pulsing glow on HP when critical

### Request Panel
- Center of screen, main focus
- Monospace text, typewriter animation on load
- All fields clearly labeled
- Payload/body formatted and syntax-highlighted (strings in green, numbers in amber)

### Action Buttons
- Two large buttons: ALLOW (green border) and DENY (red border)
- Hover: background fills with color, text inverts
- Active/pressed: brief scale down
- Disabled during typewriter animation

### Feedback Panel
- Same size/location as request panel
- Success: green header bar, checkmark icon (ASCII)
- Failure: red header bar, X icon, detailed explanation
- "Press to continue" prompt pulses

### Game Over Overlay
- Full screen, semi-transparent dark overlay
- Final stats displayed
- Restart button

## 6. Technical Approach

### Stack
- **Vite** + **Vanilla JS** — no framework overhead for this scope
- **Single HTML file** with embedded styles and scripts for simplicity
- Project structure:
  ```
  netwatch/
  ├── index.html
  ├── package.json
  ├── vite.config.js
  └── src/
      ├── main.js
      ├── game.js        (game state, HP, loop)
      ├── requests.js    (request generation, categories)
      ├── ui.js          (render functions, typewriter)
      └── styles.css
  ```

### State Shape
```js
{
  hp: 100,
  session: 0,
  correct: 0,
  wrong: 0,
  requests: [],       // history for end screen
  currentRequest: null,
  gameState: 'playing' | 'feedback' | 'gameover'
}
```

### Request Generation
- Pool of ~30 requests (mix of clean and malicious)
- Shuffled at game start
- Each request object: `{ id, timestamp, srcIp, dest, method, path, headers, body, isMalicious, category, damage, explanation, spotDescription }`

### Randomization
- 60% malicious, 40% clean on average
- Difficulty ramps: later sessions show more sophisticated attacks
- Damage values have slight randomization within range

### No External Dependencies
- Pure browser APIs
- localStorage for high score