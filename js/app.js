/**
 * Word Guess Game - Main Application Logic
 * Wordle-style 5-letter word guessing game
 */

// Game state
let gameState = {
    mode: 'daily', // 'daily' or 'practice'
    difficulty: 'normal', // 'easy', 'normal', 'hard', 'expert'
    currentWord: '',
    wordLength: 5,
    guesses: [],       // Completed/submitted guesses only
    currentGuess: [],  // Letters being typed for current row
    gameOver: false,
    won: false,
    attempts: 6,
    hints: 3,
    hintRevealed: [],
    validating: false,
    hardMode: false,
    soundEnabled: true,
    animationsEnabled: true,
    stats: {
        played: 0,
        wins: 0,
        losses: 0,
        streak: 0,
        distribution: [0, 0, 0, 0, 0, 0, 0, 0], // Distribution by attempts (up to 8)
        totalAttempts: 0
    }
};

// Visual feedback helpers
function shakeBoard() {
    if (!tilesContainer) return;
    tilesContainer.classList.add('shake');
    setTimeout(() => tilesContainer.classList.remove('shake'), 400);
}

// Inject shake animation CSS
(function() {
    const s = document.createElement('style');
    s.textContent = '@keyframes wg-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}.shake{animation:wg-shake .4s ease}';
    document.head.appendChild(s);
})();

function spawnConfetti() {
    const container = document.querySelector('.game-board') || document.body;
    const colors = ['#6aaa64', '#c9b458', '#e67e22', '#3498db', '#e74c3c', '#2ecc71'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.style.cssText = `position:fixed;width:8px;height:8px;border-radius:50%;pointer-events:none;z-index:9999;background:${colors[i % colors.length]};left:${50 + (Math.random()-0.5)*40}%;top:40%;opacity:1;transition:none;`;
        container.appendChild(p);
        const tx = (Math.random() - 0.5) * 300;
        const ty = -100 - Math.random() * 200;
        requestAnimationFrame(() => {
            p.style.transition = 'all 1s ease-out';
            p.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random()*360}deg)`;
            p.style.opacity = '0';
        });
        setTimeout(() => p.remove(), 1200);
    }
}

let _newBestShown = false;

function showNewBest() {
    let el = document.getElementById('new-best-flash');
    if (!el) {
        el = document.createElement('div');
        el.id = 'new-best-flash';
        el.style.cssText = 'position:fixed;top:20%;left:50%;transform:translate(-50%,-50%) scale(0);font-family:var(--heading,"Syne",sans-serif);font-size:32px;font-weight:800;color:#fbbf24;text-shadow:0 0 30px rgba(251,191,36,0.6);pointer-events:none;z-index:200;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.4s;opacity:0;white-space:nowrap;';
        document.body.appendChild(el);
    }
    el.textContent = 'NEW BEST!';
    el.style.transform = 'translate(-50%,-50%) scale(1.2)';
    el.style.opacity = '1';
    setTimeout(() => {
        el.style.transform = 'translate(-50%,-50%) scale(0.8)';
        el.style.opacity = '0';
    }, 1200);
}

function showFloatingStreak(streak) {
    if (streak < 2) return;
    const el = document.createElement('div');
    el.textContent = `${streak} STREAK!`;
    el.style.cssText = 'position:fixed;top:30%;left:50%;transform:translateX(-50%);font-size:28px;font-weight:bold;color:#c9b458;z-index:9999;pointer-events:none;text-shadow:0 0 10px rgba(201,180,88,0.5);opacity:1;transition:all 1.2s ease-out;';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
        el.style.top = '20%';
        el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 1400);
}

// DOM Elements
const tilesContainer = document.getElementById('tiles-container');
const virtualKeyboard = document.getElementById('virtual-keyboard');
const backspaceBtn = document.getElementById('backspace-btn');
const enterBtn = document.getElementById('enter-btn');
const errorMessage = document.getElementById('error-message');
const resultModal = document.getElementById('result-modal');
const settingsModal = document.getElementById('settings-modal');
const statsModal = document.getElementById('stats-modal');
const aboutModal = document.getElementById('about-modal');
const langMenu = document.getElementById('lang-menu');
const hardModeCheckbox = document.getElementById('hard-mode');
const soundToggle = document.getElementById('sound-toggle');
const animationsToggle = document.getElementById('animations-toggle');
const dailyCounterDiv = document.getElementById('daily-counter');
const timerDiv = document.getElementById('timer');
const hintBtn = document.getElementById('hint-btn');
const hintText = document.getElementById('hint-text');
const dailyModeBtn = document.getElementById('daily-mode-btn');
const practiceModeBtn = document.getElementById('practice-mode-btn');

// Audio context for sound effects
let audioContext;

/**
 * Initialize audio context (required for Web Audio API)
 */
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

/**
 * Play a sound effect
 */
function playSound(type = 'pop') {
    if (!gameState.soundEnabled || !audioContext) return;

    try {
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        switch (type) {
            case 'pop': // Key press
                osc.frequency.value = 800;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'correct': // Word guessed correctly
                osc.frequency.value = 523.25; // C5
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);

                const osc2 = audioContext.createOscillator();
                osc2.frequency.value = 659.25; // E5
                osc2.type = 'sine';
                osc2.connect(gain);
                osc2.start(now + 0.1);
                osc2.stop(now + 0.4);
                break;

            case 'error': // Invalid word
                osc.frequency.value = 300;
                osc.type = 'square';
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'flip': // Tile flip animation
                osc.frequency.value = 600;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
        }
    } catch (e) {
        console.log('Sound playback failed:', e);
    }
}

/**
 * Initialize game board with tiles (dynamic rows x cols)
 */
function initializeTiles() {
    tilesContainer.innerHTML = '';
    const totalTiles = gameState.attempts * gameState.wordLength;
    tilesContainer.style.gridTemplateColumns = `repeat(${gameState.wordLength}, 1fr)`;
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `tile-${i}`;
        tilesContainer.appendChild(tile);
    }
}

/**
 * Initialize virtual keyboard
 */
function initializeKeyboard() {
    virtualKeyboard.innerHTML = '';
    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    rows.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';

        row.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'key-btn';
            btn.textContent = letter;
            btn.dataset.key = letter;
            btn.addEventListener('click', () => handleKeyPress(letter));
            rowDiv.appendChild(btn);
        });

        virtualKeyboard.appendChild(rowDiv);
    });
}

/**
 * Handle key press (letter)
 */
function handleKeyPress(letter) {
    if (gameState.gameOver) return;

    initAudioContext();
    playSound('pop');

    if (gameState.currentGuess.length < gameState.wordLength) {
        gameState.currentGuess.push(letter.toUpperCase());
        updateTiles();
    }
}

/**
 * Handle backspace
 */
function handleBackspace() {
    if (gameState.gameOver) return;

    if (gameState.currentGuess.length > 0) {
        gameState.currentGuess.pop();
        updateTiles();
    }
}

/**
 * Handle enter/submit guess
 */
async function handleEnter() {
    if (gameState.gameOver || gameState.validating) return;

    const currentGuess = gameState.currentGuess;

    // Validation
    if (!currentGuess || currentGuess.length !== gameState.wordLength) {
        showError(i18n.t('errors.wordTooShort').replace('5', gameState.wordLength));
        return;
    }

    const word = currentGuess.join('');

    // Async API validation
    gameState.validating = true;
    enterBtn.classList.add('loading');
    const valid = await isValidWordAsync(word);
    gameState.validating = false;
    enterBtn.classList.remove('loading');

    if (!valid) {
        showError(i18n.t('errors.wordNotInList'));
        shakeBoard();
        if (typeof Haptic !== 'undefined') Haptic.medium();
        return;
    }

    // Hard mode validation
    if (gameState.hardMode && !validateHardMode(currentGuess)) {
        showError(i18n.t('errors.hardModeViolation'));
        return;
    }

    // Move current guess to completed guesses and reset
    gameState.guesses.push([...currentGuess]);
    gameState.currentGuess = [];

    // Submit guess and save daily state
    submitGuess(gameState.guesses[gameState.guesses.length - 1]);
    saveDailyState();
}

/**
 * Validate hard mode rules
 */
function validateHardMode(currentGuess) {
    const word = currentGuess.join('');

    for (const guess of gameState.guesses) {
        const guessWord = guess.join('');
        for (let i = 0; i < gameState.wordLength; i++) {
            if (guessWord[i] === gameState.currentWord[i] && word[i] !== guessWord[i]) {
                return false; // Must use correct letters in correct positions
            }
            if (gameState.currentWord.includes(guessWord[i]) &&
                guessWord[i] !== gameState.currentWord[i] &&
                !word.includes(guessWord[i])) {
                return false; // Must include yellow letters
            }
        }
    }

    return true;
}

/**
 * Submit a guess and check answer
 */
function submitGuess(currentGuess) {
    const word = currentGuess.join('');

    // Check if word matches
    const isCorrect = word === gameState.currentWord;

    // Apply feedback colors with animation
    animateTileFlips(currentGuess, isCorrect);

    if (isCorrect) {
        gameState.gameOver = true;
        gameState.won = true;
        // Score: fewer guesses = more points + streak bonus
        const attemptScore = (gameState.attempts - gameState.guesses.length + 1) * 100;
        const streakBonus = Math.min(gameState.stats.streak, 10) * 20;
        const hintPenalty = (3 - gameState.hints) * 30;
        gameState.roundScore = Math.max(0, attemptScore + streakBonus - hintPenalty);
        gameState.stats.totalScore = (gameState.stats.totalScore || 0) + gameState.roundScore;
        updateStats(true);
        if (typeof Haptic !== 'undefined') Haptic.success();
        if (typeof DailyStreak !== 'undefined') DailyStreak.report(gameState.stats.wins);
        if (typeof GameAchievements !== 'undefined') GameAchievements.report({
            totalWins: gameState.stats.wins,
            totalGames: gameState.stats.played,
            bestStreak: gameState.stats.maxStreak || 0
        });
        setTimeout(() => {
            playSound('correct');
            spawnConfetti();
            showFloatingStreak(gameState.stats.streak);
            if (typeof GameAds !== 'undefined') {
                GameAds.showInterstitial({ onComplete: () => { showResultModal(true); } });
            } else {
                showResultModal(true);
            }
        }, 600);
    } else if (gameState.guesses.length >= gameState.attempts) {
        gameState.gameOver = true;
        gameState.won = false;
        updateStats(false);
        if (typeof Haptic !== 'undefined') Haptic.heavy();
        if (typeof GameAchievements !== 'undefined') GameAchievements.report({
            totalWins: gameState.stats.wins,
            totalGames: gameState.stats.played,
            bestStreak: gameState.stats.maxStreak || 0
        });
        setTimeout(() => {
            playSound('error');
            shakeBoard();
            if (typeof GameAds !== 'undefined') {
                GameAds.showInterstitial({ onComplete: () => { showResultModal(false); } });
            } else {
                showResultModal(false);
            }
        }, 600);
    } else {
        // Wrong guess but still has attempts — shake feedback
        setTimeout(() => shakeBoard(), 500);
    }

    updateKeyboardColors();
}

/**
 * Animate tile flips and apply feedback
 */
function animateTileFlips(currentGuess, isCorrect) {
    const startIndex = (gameState.guesses.length - 1) * gameState.wordLength;
    const feedback = evaluateGuess(currentGuess);

    currentGuess.forEach((letter, i) => {
        const tileIndex = startIndex + i;
        const tile = document.getElementById(`tile-${tileIndex}`);
        const status = feedback[i];

        setTimeout(() => {
            playSound('flip');

            if (gameState.animationsEnabled) {
                tile.classList.add('flip');
            }

            setTimeout(() => {
                tile.classList.add(status);
                tile.classList.remove('filled');
            }, gameState.animationsEnabled ? 300 : 0);
        }, i * (gameState.animationsEnabled ? 100 : 50));
    });
}

/**
 * Evaluate a guess against the answer
 */
function evaluateGuess(guess) {
    const feedback = [];
    const answerLetters = gameState.currentWord.split('');
    const guessLetters = guess.join('').split('');
    const wLen = gameState.wordLength;
    const used = new Array(wLen).fill(false);

    // First pass: mark correct letters
    for (let i = 0; i < wLen; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            feedback[i] = 'correct';
            used[i] = true;
        }
    }

    // Second pass: mark present letters
    for (let i = 0; i < wLen; i++) {
        if (feedback[i]) continue;

        let found = false;
        for (let j = 0; j < wLen; j++) {
            if (!used[j] && guessLetters[i] === answerLetters[j]) {
                feedback[i] = 'present';
                used[j] = true;
                found = true;
                break;
            }
        }

        if (!found) {
            feedback[i] = 'absent';
        }
    }

    return feedback;
}

/**
 * Update tiles display
 */
function updateTiles() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile, i) => {
        tile.textContent = '';
        tile.classList.remove('filled', 'active', 'correct', 'present', 'absent', 'flip');
    });

    // Render completed guesses (with color feedback)
    gameState.guesses.forEach((guess, guessIndex) => {
        const feedback = evaluateGuess(guess);
        guess.forEach((letter, letterIndex) => {
            const tileIndex = guessIndex * gameState.wordLength + letterIndex;
            const tile = document.getElementById(`tile-${tileIndex}`);
            tile.textContent = letter;
            tile.classList.add('filled');
            tile.classList.add(feedback[letterIndex]);
        });
    });

    // Render current (in-progress) guess
    const currentRowIndex = gameState.guesses.length;
    if (currentRowIndex < gameState.attempts) {
        gameState.currentGuess.forEach((letter, letterIndex) => {
            const tileIndex = currentRowIndex * gameState.wordLength + letterIndex;
            const tile = document.getElementById(`tile-${tileIndex}`);
            tile.textContent = letter;
            tile.classList.add('filled', 'active');
        });
    }
}

/**
 * Update keyboard colors based on guesses
 */
function updateKeyboardColors() {
    const keyBtns = document.querySelectorAll('.key-btn');
    const letterStatus = {};

    gameState.guesses.forEach((guess, guessIndex) => {
        const feedback = evaluateGuess(guess);
        guess.forEach((letter, i) => {
            const status = feedback[i];
            if (!letterStatus[letter] || (status === 'correct' && letterStatus[letter] !== 'correct') ||
                (status === 'present' && letterStatus[letter] === 'absent')) {
                letterStatus[letter] = status;
            }
        });
    });

    keyBtns.forEach(btn => {
        const letter = btn.dataset.key;
        btn.classList.remove('correct', 'present', 'absent');
        if (letterStatus[letter]) {
            btn.classList.add(letterStatus[letter]);
        }
    });
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');

    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 2000);
}

/**
 * Update game statistics
 */
function updateStats(won) {
    gameState.stats.played++;
    if (won) {
        gameState.stats.wins++;
        gameState.stats.streak++;
        if (!gameState.stats.maxStreak || gameState.stats.streak > gameState.stats.maxStreak) {
            gameState.stats.maxStreak = gameState.stats.streak;
            if (!_newBestShown) {
                _newBestShown = true;
                showNewBest();
            }
        }
        const attemptIndex = gameState.guesses.length - 1;
        // Extend distribution array if needed
        while (gameState.stats.distribution.length <= attemptIndex) {
            gameState.stats.distribution.push(0);
        }
        gameState.stats.distribution[attemptIndex]++;
    } else {
        gameState.stats.losses++;
        gameState.stats.streak = 0;
    }
    gameState.stats.totalAttempts += gameState.guesses.length;

    // Save stats and daily state
    saveStats();
    saveDailyState();
}

/**
 * Save stats to localStorage
 */
function saveStats() {
    localStorage.setItem('wordguess-stats', JSON.stringify(gameState.stats));
}

/**
 * Load stats from localStorage
 */
function loadStats() {
    const saved = localStorage.getItem('wordguess-stats');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure maxStreak exists for forward compatibility
        if (typeof parsed.maxStreak === 'undefined') {
            parsed.maxStreak = parsed.streak || 0;
        }
        gameState.stats = parsed;
    }
}

/**
 * Save daily game state to localStorage (for restore on page reload)
 */
function saveDailyState() {
    if (gameState.mode !== 'daily') return;
    const state = {
        dayNumber: getDayNumber(),
        difficulty: gameState.difficulty,
        word: gameState.currentWord,
        guesses: gameState.guesses,
        currentGuess: gameState.currentGuess,
        gameOver: gameState.gameOver,
        won: gameState.won,
        hints: gameState.hints,
        hintRevealed: gameState.hintRevealed
    };
    localStorage.setItem('wordguess-daily-state', JSON.stringify(state));
}

/**
 * Load daily game state from localStorage
 * Returns null if no saved state or different day
 */
function loadDailyState() {
    const saved = localStorage.getItem('wordguess-daily-state');
    if (!saved) return null;
    const state = JSON.parse(saved);
    if (state.dayNumber !== getDayNumber()) return null;
    return state;
}

/**
 * Show result modal
 */
function showResultModal(won) {
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const resultStats = document.getElementById('result-stats');

    if (won) {
        resultTitle.textContent = i18n.t('result.won');
        resultTitle.style.color = 'var(--color-correct)';
        resultMessage.innerHTML = `<strong>${gameState.currentWord}</strong> ${i18n.t('result.correct')}`;
    } else {
        resultTitle.textContent = i18n.t('result.lost');
        resultTitle.style.color = 'var(--color-error)';
        resultMessage.innerHTML = `${i18n.t('result.answer')}: <strong>${gameState.currentWord}</strong>`;
    }

    // Show next puzzle timer for daily mode
    if (gameState.mode === 'daily') {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(0, 0, 0, 0);
        const timeUntil = formatTimeUntil(nextDate);
        resultMessage.innerHTML += `<br><small>${i18n.t('result.nextDaily')}: ${timeUntil}</small>`;
    }

    const scoreHtml = won && gameState.roundScore ? `
        <div class="result-stat">
            <span class="result-stat-label">Score</span>
            <span class="result-stat-value" style="color:var(--color-correct);font-weight:700">+${gameState.roundScore}</span>
        </div>` : '';

    resultStats.innerHTML = `
        ${scoreHtml}
        <div class="result-stat">
            <span class="result-stat-label">${i18n.t('stats.attempts')}</span>
            <span class="result-stat-value">${gameState.guesses.length}/${gameState.attempts}</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-label">${i18n.t('stats.streak')}</span>
            <span class="result-stat-value">${gameState.stats.streak}</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-label">${i18n.t('stats.winRate')}</span>
            <span class="result-stat-value">${gameState.stats.played > 0 ? Math.round(gameState.stats.wins / gameState.stats.played * 100) : 0}%</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-label">Total Score</span>
            <span class="result-stat-value">${gameState.stats.totalScore || 0}</span>
        </div>
    `;

    resultModal.classList.remove('hidden');

    // Inject rewarded ad button for bonus hint
    if (typeof GameAds !== 'undefined') {
        GameAds.injectRewardButton({
            container: '#result-modal .modal-content',
            label: '📺 Watch Ad for +3 Hints',
            onReward: () => {
                gameState.hints += 3;
                hintBtn.disabled = false;
            }
        });
    }
}

/**
 * Format time until next puzzle
 */
function formatTimeUntil(date) {
    const now = new Date();
    const diff = date - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return `${hours}h ${minutes}m`;
}

/**
 * Update daily timer
 */
function updateDailyTimer() {
    if (gameState.mode !== 'daily') return;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0, 0, 0, 0);

    timerDiv.textContent = formatTimeUntil(nextDate);

    setTimeout(updateDailyTimer, 60000); // Update every minute
}

/**
 * Start new game
 */
function startNewGame(mode = 'daily') {
    gameState.mode = mode;
    gameState.guesses = [];
    gameState.currentGuess = [];
    gameState.gameOver = false;
    gameState.won = false;
    gameState.hints = 3;
    gameState.hintRevealed = [];
    gameState.validating = false;
    _newBestShown = false;

    // Apply difficulty tier settings
    const tier = DIFFICULTY_TIERS[gameState.difficulty] || DIFFICULTY_TIERS.normal;
    gameState.attempts = tier.maxGuesses;

    if (mode === 'daily') {
        gameState.currentWord = getWordOfTheDay(gameState.difficulty);
        dailyCounterDiv.classList.remove('hidden');
        updateDailyTimer();

        // Restore saved daily state if available
        const savedDaily = loadDailyState();
        if (savedDaily && savedDaily.difficulty === gameState.difficulty) {
            gameState.guesses = savedDaily.guesses || [];
            gameState.currentGuess = savedDaily.currentGuess || [];
            gameState.gameOver = savedDaily.gameOver || false;
            gameState.won = savedDaily.won || false;
            gameState.hints = typeof savedDaily.hints === 'number' ? savedDaily.hints : 3;
            gameState.hintRevealed = savedDaily.hintRevealed || [];
            gameState.currentWord = savedDaily.word || gameState.currentWord;
        }
    } else {
        gameState.currentWord = getRandomWord(gameState.difficulty);
        dailyCounterDiv.classList.add('hidden');
    }

    // Set dynamic word length from selected word
    gameState.wordLength = gameState.currentWord.length;
    _expectedWordLength = gameState.wordLength;

    // Update difficulty HUD badge
    updateDifficultyHUD();

    hintText.classList.add('hidden');
    hintBtn.disabled = gameState.hints <= 0;
    resultModal.classList.add('hidden');
    if (typeof GameAds !== 'undefined') GameAds.removeRewardButton('#result-modal .modal-content');
    errorMessage.classList.add('hidden');

    initializeTiles();
    initializeKeyboard();
    updateTiles();
    updateKeyboardColors();

    // If daily was already completed, show result
    if (mode === 'daily' && gameState.gameOver) {
        setTimeout(() => showResultModal(gameState.won), 300);
    }
}

/**
 * Update difficulty HUD badge text
 */
function updateDifficultyHUD() {
    const badge = document.getElementById('difficulty-badge');
    if (!badge) return;
    const labels = {
        easy: i18n.t('difficulty.easy', 'Easy'),
        normal: i18n.t('difficulty.normal', 'Normal'),
        hard: i18n.t('difficulty.hard', 'Hard'),
        expert: i18n.t('difficulty.expert', 'Expert')
    };
    badge.textContent = labels[gameState.difficulty] || labels.normal;
    badge.className = 'difficulty-badge difficulty-' + gameState.difficulty;
}

/**
 * Set difficulty and restart game
 */
function setDifficulty(diff) {
    if (gameState.difficulty === diff) return;
    gameState.difficulty = diff;
    localStorage.setItem('wordguess-difficulty', diff);

    // Update selector UI
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === diff);
    });

    startNewGame(gameState.mode);
}

/**
 * Show statistics modal
 */
function showStatsModal() {
    document.getElementById('stat-played').textContent = gameState.stats.played;
    document.getElementById('stat-wins').textContent = gameState.stats.wins;
    document.getElementById('stat-streak').textContent = gameState.stats.streak;
    const maxStreakEl = document.getElementById('stat-maxstreak');
    if (maxStreakEl) maxStreakEl.textContent = gameState.stats.maxStreak || 0;
    const totalScoreEl = document.getElementById('stat-totalscore');
    if (totalScoreEl) totalScoreEl.textContent = gameState.stats.totalScore || 0;
    const winRate = gameState.stats.played > 0 ? Math.round(gameState.stats.wins / gameState.stats.played * 100) : 0;
    document.getElementById('stat-winrate').textContent = winRate + '%';

    // Draw distribution chart
    const maxCount = Math.max(...gameState.stats.distribution, 1);
    const chartDiv = document.getElementById('distribution-chart');
    chartDiv.innerHTML = '';

    const distLen = Math.max(gameState.stats.distribution.length, gameState.attempts);
    for (let i = 0; i < distLen; i++) {
        const count = gameState.stats.distribution[i] || 0;
        const percentage = (count / maxCount) * 100;

        const row = document.createElement('div');
        row.className = 'distribution-row';
        row.innerHTML = `
            <div class="distribution-label">${i + 1}</div>
            <div class="distribution-bar">
                <div class="distribution-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="distribution-count">${count}</div>
        `;
        chartDiv.appendChild(row);
    }

    statsModal.classList.remove('hidden');
}

/**
 * Share game result
 */
function shareResult() {
    const emojiGrid = generateEmojiGrid();
    const diffLabel = (DIFFICULTY_TIERS[gameState.difficulty] || DIFFICULTY_TIERS.normal).label;
    const text = `Word Guess #${getDayNumber()} [${diffLabel}]\n${gameState.guesses.length}/${gameState.attempts}\n\n${emojiGrid}`;

    if (navigator.share) {
        navigator.share({
            title: 'Word Guess',
            text: text
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            showError(i18n.t('result.copiedToClipboard'));
        });
    }
}

/**
 * Generate emoji grid for sharing
 */
function generateEmojiGrid() {
    let grid = '';
    gameState.guesses.forEach(guess => {
        const feedback = evaluateGuess(guess);
        feedback.forEach(status => {
            if (status === 'correct') grid += '🟩';
            else if (status === 'present') grid += '🟨';
            else grid += '⬛';
        });
        grid += '\n';
    });
    return grid;
}

/**
 * Get day number for daily puzzle
 */
function getDayNumber() {
    const today = new Date();
    const startDate = new Date(2024, 0, 1);
    return Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Use hint - reveals a random unrevealed letter
 */
function useHint() {
    if (gameState.gameOver || gameState.hints <= 0) return;

    // Find positions not yet revealed by hints
    const revealedPositions = gameState.hintRevealed || [];
    const allPositions = Array.from({ length: gameState.wordLength }, (_, i) => i);
    const unrevealed = allPositions.filter(i => !revealedPositions.includes(i));

    if (unrevealed.length === 0) return;

    // Pick a random unrevealed position
    const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    const letter = gameState.currentWord[pos];

    if (!gameState.hintRevealed) gameState.hintRevealed = [];
    gameState.hintRevealed.push(pos);

    hintText.innerHTML = `💡 ${i18n.t('hints.letterAt')} ${pos + 1}: <strong>${letter}</strong>`;
    hintText.classList.remove('hidden');

    gameState.hints--;
    if (gameState.hints <= 0) {
        hintBtn.disabled = true;
    }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (gameState.gameOver || !i18n.isInitialized) return;

        const key = e.key.toUpperCase();

        if (/^[A-Z]$/.test(key)) {
            handleKeyPress(key);
        } else if (key === 'BACKSPACE') {
            handleBackspace();
        } else if (key === 'ENTER') {
            handleEnter();
        }
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Buttons
    backspaceBtn.addEventListener('click', handleBackspace);
    enterBtn.addEventListener('click', handleEnter);
    hintBtn.addEventListener('click', useHint);

    // Mode buttons
    dailyModeBtn.addEventListener('click', () => {
        dailyModeBtn.classList.add('active');
        practiceModeBtn.classList.remove('active');
        startNewGame('daily');
    });

    practiceModeBtn.addEventListener('click', () => {
        practiceModeBtn.classList.add('active');
        dailyModeBtn.classList.remove('active');
        startNewGame('practice');
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    document.getElementById('close-settings').addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    hardModeCheckbox.addEventListener('change', (e) => {
        gameState.hardMode = e.target.checked;
        localStorage.setItem('wordguess-hardmode', gameState.hardMode);
    });

    soundToggle.addEventListener('change', (e) => {
        gameState.soundEnabled = e.target.checked;
        localStorage.setItem('wordguess-sound', gameState.soundEnabled);
    });

    animationsToggle.addEventListener('change', (e) => {
        gameState.animationsEnabled = e.target.checked;
        document.body.classList.toggle('no-animations', !e.target.checked);
        localStorage.setItem('wordguess-animations', gameState.animationsEnabled);
    });

    // Stats
    document.getElementById('stats-btn').addEventListener('click', () => {
        settingsModal.classList.add('hidden');
        showStatsModal();
    });

    document.getElementById('close-stats').addEventListener('click', () => {
        statsModal.classList.add('hidden');
    });

    document.getElementById('share-btn').addEventListener('click', shareResult);

    // About
    document.getElementById('about-btn').addEventListener('click', () => {
        settingsModal.classList.add('hidden');
        aboutModal.classList.remove('hidden');
    });

    document.getElementById('close-about').addEventListener('click', () => {
        aboutModal.classList.add('hidden');
    });

    // Language
    document.getElementById('lang-toggle').addEventListener('click', () => {
        langMenu.classList.toggle('hidden');
    });

    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', async () => {
            const lang = btn.dataset.lang;
            await i18n.setLanguage(lang);
            langMenu.classList.add('hidden');
            updateUIText();
        });
    });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || (document.body.classList.contains('light-mode') ? 'light' : 'dark');
            const next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            document.body.classList.toggle('light-mode', next === 'light');
            localStorage.setItem('wordguess-theme', next);
            const themeIcon = themeToggle.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = next === 'light' ? '🌙' : '☀️';
            }
        });
    }

    // Result modal
    document.getElementById('play-again-btn').addEventListener('click', () => {
        startNewGame(gameState.mode);
    });

    document.getElementById('share-result-btn').addEventListener('click', shareResult);

    // Close modals on outside click
    [resultModal, settingsModal, statsModal, aboutModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

/**
 * Update UI text for i18n
 */
function updateUIText() {
    i18n.updateUI();
}

/**
 * Initialize game
 */
function init() {
  try {
    // Load saved settings
    loadStats();
    gameState.hardMode = localStorage.getItem('wordguess-hardmode') === 'true';
    gameState.soundEnabled = localStorage.getItem('wordguess-sound') !== 'false';
    gameState.animationsEnabled = localStorage.getItem('wordguess-animations') !== 'false';

    // Load saved difficulty
    const savedDiff = localStorage.getItem('wordguess-difficulty');
    if (savedDiff && DIFFICULTY_TIERS[savedDiff]) {
        gameState.difficulty = savedDiff;
    }

    // Setup difficulty selector buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === gameState.difficulty);
        btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
    });

    const theme = localStorage.getItem('wordguess-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    // Update checkboxes
    hardModeCheckbox.checked = gameState.hardMode;
    soundToggle.checked = gameState.soundEnabled;
    animationsToggle.checked = gameState.animationsEnabled;

    // Setup
    initializeTiles();
    initializeKeyboard();
    setupEventListeners();
    setupKeyboardShortcuts();

    // Initialize daily streak
    if (typeof DailyStreak !== 'undefined') DailyStreak.init({ gameId: 'word-guess', bestScoreKey: 'wordguess_totalWins', minTarget: 1, unit: 'wins' });

    // Initialize game ads
    if (typeof GameAds !== 'undefined') GameAds.init();

    // Initialize game achievements
    if (typeof GameAchievements !== 'undefined') GameAchievements.init({
        gameId: 'word-guess',
        defs: [
            { id: 'wins_5', stat: 'totalWins', target: 5, icon: '⭐', name: 'Word Guesser' },
            { id: 'wins_20', stat: 'totalWins', target: 20, icon: '🏆', name: 'Word Master' },
            { id: 'wins_50', stat: 'totalWins', target: 50, icon: '👑', name: 'Word Legend' },
            { id: 'games_10', stat: 'totalGames', target: 10, icon: '🎮', name: 'Regular Player' },
            { id: 'streak_3', stat: 'bestStreak', target: 3, icon: '🔥', name: 'Hot Streak' },
            { id: 'streak_7', stat: 'bestStreak', target: 7, icon: '💥', name: 'Unstoppable' }
        ]
    });

    // Start game
    startNewGame('daily');

    // Update UI text when language changes
    window.addEventListener('languagechange', updateUIText);
  } catch(e) {
    console.error('Init error:', e);
  } finally {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 300);
    }
  }
}

// Start when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
