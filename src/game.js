// Game state management

const INITIAL_HP = 100;
const STORAGE_KEY = 'netwatch_highscore';

export function createGameState() {
  return {
    hp: INITIAL_HP,
    session: 0,
    correct: 0,
    wrong: 0,
    totalRequests: 0,
    gameState: 'start', // 'start' | 'playing' | 'feedback' | 'gameover'
    currentRequest: null,
    lastDecision: null, // { correct: boolean, damage: number }
    highScore: parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
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