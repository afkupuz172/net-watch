// Game state management

export const INITIAL_TP = 100;
export const TP_REGEN = 5;
export const STORAGE_KEY = 'netwatch_highscore';

export function createGameState() {
  return {
    tp: INITIAL_TP,
    session: 0,
    correct: 0,
    wrong: 0,
    totalRequests: 0,
    gameState: 'start', // 'start' | 'playing' | 'feedback' | 'gameover'
    currentRequest: null,
    lastDecision: null, // { correct: boolean, damage: number }
    highScore: parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10),
    equippedTool: null, // 'netshield' | 'hcaptcha' | 'hcaptcha-pro' | null
    hcaptchaFailCount: 0,
    proWin: false
  };
}

export function saveHighScore(score) {
  const current = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
  if (score > current) {
    localStorage.setItem(STORAGE_KEY, score.toString());
    return true;
  }
  return false;
}

export function getHighScore() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
}