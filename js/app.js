/**
 * Word Guess Game - Main Application Logic
 * Wordle-style 5-letter word guessing game
 */

// Game state
let gameState = {
    mode: 'daily', // 'daily' or 'practice'
    currentWord: '',
    guesses: [],       // Completed/submitted guesses only
    currentGuess: [],  // Letters being typed for current row
    gameOver: false,
    won: false,
    attempts: 6,
    hints: 1,
    hardMode: false,
    soundEnabled: true,
    animationsEnabled: true,
    stats: {
        played: 0,
        wins: 0,
        losses: 0,
        streak: 0,
        distribution: [0, 0, 0, 0, 0, 0], // Distribution by attempts
        totalAttempts: 0
    }
};

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
 * Initialize game board with tiles
 */
function initializeTiles() {
    tilesContainer.innerHTML = '';
    for (let i = 0; i < 30; i++) { // 6 rows × 5 columns
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

    if (gameState.currentGuess.length < 5) {
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
function handleEnter() {
    if (gameState.gameOver) return;

    const currentGuess = gameState.currentGuess;

    // Validation
    if (!currentGuess || currentGuess.length !== 5) {
        showError(i18n.t('errors.wordTooShort'));
        return;
    }

    const word = currentGuess.join('');
    if (!isValidWord(word)) {
        showError(i18n.t('errors.wordNotInList'));
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

    // Submit guess
    submitGuess(gameState.guesses[gameState.guesses.length - 1]);
}

/**
 * Validate hard mode rules
 */
function validateHardMode(currentGuess) {
    const word = currentGuess.join('');

    for (const guess of gameState.guesses) {
        const guessWord = guess.join('');
        for (let i = 0; i < 5; i++) {
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
        updateStats(true);
        setTimeout(() => {
            playSound('correct');
            showResultModal(true);
        }, 600);
    } else if (gameState.guesses.length >= gameState.attempts) {
        gameState.gameOver = true;
        gameState.won = false;
        updateStats(false);
        setTimeout(() => {
            playSound('error');
            showResultModal(false);
        }, 600);
    }

    updateKeyboardColors();
}

/**
 * Animate tile flips and apply feedback
 */
function animateTileFlips(currentGuess, isCorrect) {
    const startIndex = (gameState.guesses.length - 1) * 5;
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
    const used = new Array(5).fill(false);

    // First pass: mark correct letters
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            feedback[i] = 'correct';
            used[i] = true;
        }
    }

    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (feedback[i]) continue;

        let found = false;
        for (let j = 0; j < 5; j++) {
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
            const tileIndex = guessIndex * 5 + letterIndex;
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
            const tileIndex = currentRowIndex * 5 + letterIndex;
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
        const attemptIndex = gameState.guesses.length - 1;
        gameState.stats.distribution[attemptIndex]++;
    } else {
        gameState.stats.losses++;
        gameState.stats.streak = 0;
    }
    gameState.stats.totalAttempts += gameState.guesses.length;

    // Save stats to localStorage
    saveStats();
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
        gameState.stats = JSON.parse(saved);
    }
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

    resultStats.innerHTML = `
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
    `;

    resultModal.classList.remove('hidden');
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
    gameState.hints = 1;

    if (mode === 'daily') {
        gameState.currentWord = getWordOfTheDay();
        dailyCounterDiv.classList.remove('hidden');
        updateDailyTimer();
    } else {
        gameState.currentWord = getRandomWord();
        dailyCounterDiv.classList.add('hidden');
    }

    hintText.classList.add('hidden');
    hintBtn.disabled = false;
    resultModal.classList.add('hidden');
    errorMessage.classList.add('hidden');

    initializeTiles();
    initializeKeyboard();
    updateTiles();
    updateKeyboardColors();
}

/**
 * Show statistics modal
 */
function showStatsModal() {
    document.getElementById('stat-played').textContent = gameState.stats.played;
    document.getElementById('stat-wins').textContent = gameState.stats.wins;
    document.getElementById('stat-streak').textContent = gameState.stats.streak;
    const winRate = gameState.stats.played > 0 ? Math.round(gameState.stats.wins / gameState.stats.played * 100) : 0;
    document.getElementById('stat-winrate').textContent = winRate + '%';

    // Draw distribution chart
    const maxCount = Math.max(...gameState.stats.distribution, 1);
    const chartDiv = document.getElementById('distribution-chart');
    chartDiv.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const count = gameState.stats.distribution[i];
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
    const text = `Word Guess #${getDayNumber()}\n${gameState.guesses.length}/${gameState.attempts}\n\n${emojiGrid}`;

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
 * Use hint
 */
function useHint() {
    if (gameState.gameOver || gameState.hints <= 0) return;

    if (gameState.guesses.length === 0 && gameState.currentGuess.length === 0) {
        // First hint: reveal if word has common patterns
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const hasVowel = vowels.some(v => gameState.currentWord.includes(v));
        hintText.innerHTML = hasVowel ?
            `💡 ${i18n.t('hint.vowel')}` :
            `💡 ${i18n.t('hint.noVowel')}`;
    } else {
        // Reveal one letter at current position
        if (gameState.currentGuess.length < 5) {
            const nextPos = gameState.currentGuess.length;
            const hintLetter = gameState.currentWord[nextPos];
            hintText.innerHTML = `💡 ${i18n.t('hint.letterAt')} ${nextPos + 1}: <strong>${hintLetter}</strong>`;
            handleKeyPress(hintLetter);
        }
    }

    gameState.hints--;
    hintText.classList.remove('hidden');
    hintBtn.disabled = true;
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
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('wordguess-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });

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
    // Load saved settings
    loadStats();
    gameState.hardMode = localStorage.getItem('wordguess-hardmode') === 'true';
    gameState.soundEnabled = localStorage.getItem('wordguess-sound') !== 'false';
    gameState.animationsEnabled = localStorage.getItem('wordguess-animations') !== 'false';

    const theme = localStorage.getItem('wordguess-theme');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
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

    // Start game
    startNewGame('daily');

    // Update UI text when language changes
    window.addEventListener('languagechange', updateUIText);
}

// Start when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
