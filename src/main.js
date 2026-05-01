// Main game entry point

import { initPool, getNextRequest } from './requests.js';
import { createGameState, saveHighScore, getHighScore, TP_REGEN } from './game.js';
import { 
  renderHeader, 
  renderRequest, 
  renderActions, 
  renderFeedback, 
  renderGameOver,
  renderStartPage,
  renderContinueButton
} from './ui.js';

const TIMER_DURATION = 15;

class NetwatchGame {
  constructor() {
    this.state = createGameState();
    this.terminal = null;
    this.actionsContainer = null;
    this.timerInterval = null;
    this.timeLeft = TIMER_DURATION;
    
    this.init();
  }
  
  init() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div id="terminal" class="terminal">
        <div id="header-bar"></div>
        <div id="request-content"></div>
      </div>
      <div id="actions" class="actions"></div>
      <div id="gameover"></div>
    `;
    
    this.terminal = document.getElementById('terminal');
    this.headerBar = document.getElementById('header-bar');
    this.requestContent = document.getElementById('request-content');
    this.actionsContainer = document.getElementById('actions');
    this.gameoverContainer = document.getElementById('gameover');
    
    this.scheduleGlitch();
    this.startNewGame();
    this.bindEvents();
  }
  
  triggerGlitch() {
    const terminal = document.querySelector('.terminal');
    if (terminal) {
      terminal.classList.add('glitch');
      setTimeout(() => terminal.classList.remove('glitch'), 150);
    }
  }
  
  scheduleGlitch() {
    // Random glitch every 3-8 seconds
    const delay = 3000 + Math.random() * 5000;
    setTimeout(() => {
      this.triggerGlitch();
      this.scheduleGlitch();
    }, delay);
  }
  
  startNewGame() {
    this.stopTimer();
    this.state = createGameState();
    this.state.highScore = getHighScore();
    this.gameoverContainer.innerHTML = '';
    this.gameoverContainer.style.display = 'none';
    initPool();
    this.render();
  }
  
  startTimer() {
    this.stopTimer();
    this.timeLeft = TIMER_DURATION;
    this.timerInterval = setInterval(() => {
      this.timeLeft = Math.max(0, this.timeLeft - 0.1);
      const seconds = Math.floor(this.timeLeft);
      const ms = Math.floor((this.timeLeft % 1) * 100);
      const timerEl = this.headerBar.querySelector('.timer-value');
      if (timerEl) {
        timerEl.textContent = `${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
        if (this.timeLeft <= 5) {
          timerEl.classList.add('timer-critical');
          timerEl.classList.remove('timer-warning');
        } else if (this.timeLeft <= 10) {
          timerEl.classList.add('timer-warning');
          timerEl.classList.remove('timer-critical');
        } else {
          timerEl.classList.remove('timer-critical', 'timer-warning');
        }
      }
      
      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.handleDecision('allow');
      }
    }, 100);
  }
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  nextRequest() {
    this.stopTimer();
    this.timeLeft = TIMER_DURATION;
    this.state.session++;
    this.state.gameState = 'playing';
    this.state.currentRequest = getNextRequest();
    this.state.lastDecision = null;
    
    this.render();
    
    // Disable buttons during typewriter
    renderActions(false, this.actionsContainer);
    
    // Simulate typing delay before showing request, then enable timer
    setTimeout(() => {
      this.render();
      renderActions(true, this.actionsContainer);
      this.startTimer();
    }, 500);
  }
  
  handleDecision(decision) {
    if (this.state.gameState !== 'playing') return;
    
    this.stopTimer();
    
    const request = this.state.currentRequest;
    const isMalicious = request.isMalicious;
    
    // Correct: allow clean OR deny malicious
    // Wrong: allow malicious (attack succeeds) OR deny clean (blocking valid traffic)
    const isCorrect = (decision === 'allow' && !isMalicious) || (decision === 'deny' && isMalicious);
    
    let damage = 0;
    let shielded = false;
    if (!isCorrect) {
      if (isMalicious) {
        // Allowed an attack
        damage = request.damage || 10;
      } else {
        // Denied legitimate traffic — blocking customer requests
        damage = 25; // Heavy penalty for blocking valid traffic
      }
      // Apply netshield reduction if equipped
      if (this.state.equippedTool === 'netshield') {
        damage = Math.max(0, damage - 5);
        shielded = damage > 0; // Only show shielded if some damage was prevented
      }
      this.state.tp = Math.max(0, this.state.tp - damage);
    } else {
      // Successful decision — replenish trust points
      this.state.tp = Math.min(100, this.state.tp + TP_REGEN);
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
    if (this.state.tp <= 0) {
      setTimeout(() => this.gameOver(), 1500);
    }
  }
  
  continueGame() {
    if (this.state.tp > 0) {
      this.nextRequest();
    }
  }
  
  gameOver() {
    this.stopTimer();
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
    const showTimer = this.state.gameState === 'playing';
    renderHeader(this.state, this.headerBar, showTimer ? this.timeLeft : null);
    
    // Clear actions between sessions
    this.actionsContainer.innerHTML = '';
    
    if (this.state.gameState === 'start') {
      renderStartPage(this.state, this.requestContent);
    } else if (this.state.gameState === 'playing') {
      const request = this.state.currentRequest;
      renderRequest(request, this.requestContent, this.state.equippedTool);
      renderActions(true, this.actionsContainer);
    } else if (this.state.gameState === 'feedback') {
      const request = this.state.currentRequest;
      renderFeedback(request, this.state.lastDecision, this.requestContent);
      renderContinueButton(this.actionsContainer);
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
      } else if (action === 'giveup') {
        this.gameOver();
      }
    });
    
    // Start button and restart button
    this.requestContent.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'start') {
        this.startGame();
      } else if (e.target.dataset.action === 'restart') {
        this.startNewGame();
      } else if (this.state.gameState === 'feedback') {
        this.continueGame();
      }
    });
    
    // Tool selection
    this.requestContent.addEventListener('click', (e) => {
      if (this.state.gameState !== 'start') return;
      const toolCard = e.target.closest('.tool-card');
      if (toolCard) {
        const tool = toolCard.dataset.tool;
        this.state.equippedTool = tool === this.state.equippedTool ? null : tool;
        this.render();
      }
    });
    
    // Continue button in actions container
    this.actionsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-continue');
      if (btn && this.state.gameState === 'feedback') {
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