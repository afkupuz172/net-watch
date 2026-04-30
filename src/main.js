// Main game entry point

import { initPool, getNextRequest } from './requests.js';
import { createGameState, saveHighScore, getHighScore } from './game.js';
import { 
  renderHeader, 
  renderRequest, 
  renderActions, 
  renderFeedback, 
  renderGameOver,
  renderStartPage 
} from './ui.js';

class NetwatchGame {
  constructor() {
    this.state = createGameState();
    this.terminal = null;
    this.actionsContainer = null;
    this.typewriterTimeout = null;
    
    this.init();
  }
  
  init() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div id="terminal" class="terminal"></div>
      <div id="actions" class="actions"></div>
      <div id="gameover"></div>
    `;
    
    this.terminal = document.getElementById('terminal');
    this.actionsContainer = document.getElementById('actions');
    this.gameoverContainer = document.getElementById('gameover');
    
    this.startNewGame();
    this.bindEvents();
  }
  
  startNewGame() {
    this.state = createGameState();
    this.state.highScore = getHighScore();
    this.gameoverContainer.innerHTML = '';
    this.gameoverContainer.style.display = 'none';
    initPool();
    this.render();
  }
  
  nextRequest() {
    this.state.session++;
    this.state.gameState = 'playing';
    this.state.currentRequest = getNextRequest();
    this.state.lastDecision = null;
    
    this.render();
    
    // Disable buttons during typewriter
    renderActions(false, this.actionsContainer);
    
    // Simulate typing delay before showing request
    setTimeout(() => {
      this.render();
      renderActions(true, this.actionsContainer);
    }, 500);
  }
  
  handleDecision(decision) {
    if (this.state.gameState !== 'playing') return;
    
    const request = this.state.currentRequest;
    const isMalicious = request.isMalicious;
    const isCorrect = (decision === 'allow' && !isMalicious) || (decision === 'deny' && isMalicious);
    
    let damage = 0;
    if (!isCorrect && isMalicious) {
      damage = request.damage || 10;
      this.state.hp = Math.max(0, this.state.hp - damage);
    }
    
    if (isCorrect) {
      this.state.correct++;
    } else {
      this.state.wrong++;
    }
    this.state.totalRequests++;
    
    this.state.lastDecision = { correct: isCorrect, damage };
    this.state.gameState = 'feedback';
    
    // Shake screen on wrong decision
    if (!isCorrect) {
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 200);
    }
    
    this.render();
    
    // Check for game over
    if (this.state.hp <= 0) {
      setTimeout(() => this.gameOver(), 1500);
    }
  }
  
  continueGame() {
    if (this.state.hp > 0) {
      this.nextRequest();
    }
  }
  
  gameOver() {
    this.state.gameState = 'gameover';
    
    // Update high score
    const isNewHighScore = saveHighScore(this.state.totalRequests);
    if (isNewHighScore) {
      this.state.highScore = this.state.totalRequests;
    }
    
    this.gameoverContainer.style.display = 'flex';
    renderGameOver(this.state, this.gameoverContainer);
  }
  
  render() {
    renderHeader(this.state, this.terminal);
    
    if (this.state.gameState === 'start') {
      renderStartPage(this.state, this.terminal);
    } else if (this.state.gameState === 'playing' || this.state.gameState === 'feedback') {
      const request = this.state.currentRequest;
      
      if (this.state.gameState === 'playing') {
        renderRequest(request, this.terminal);
      } else {
        renderFeedback(request, this.state.lastDecision, this.terminal);
      }
    }
  }
  
  startGame() {
    this.state.gameState = 'playing';
    this.nextRequest();
  }
  
  bindEvents() {
    // Button clicks
    this.actionsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn || btn.disabled) return;
      
      const action = btn.dataset.action;
      if (action === 'allow') {
        this.handleDecision('allow');
      } else if (action === 'deny') {
        this.handleDecision('deny');
      }
    });
    
    // Start button and restart button
    this.terminal.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'start') {
        this.startGame();
      } else if (e.target.dataset.action === 'restart') {
        this.startNewGame();
      } else if (this.state.gameState === 'feedback') {
        this.continueGame();
      }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (this.state.gameState === 'start') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.startGame();
        }
        return;
      }
      if (this.state.gameState === 'playing') {
        if (e.key === 'a' || e.key === 'A') {
          this.handleDecision('allow');
        } else if (e.key === 'd' || e.key === 'D') {
          this.handleDecision('deny');
        }
      } else if (this.state.gameState === 'feedback') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.continueGame();
        }
      } else if (this.state.gameState === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.startNewGame();
        }
      }
    });
    
    // Restart button
    this.gameoverContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-restart');
      if (btn) {
        this.startNewGame();
      }
    });
  }
}

// Start the game
new NetwatchGame();