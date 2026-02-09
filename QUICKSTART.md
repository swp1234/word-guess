# Word Guess - Quick Start Guide

## 🚀 Launch the Game Locally

### Option 1: Python HTTP Server (Recommended)
```bash
cd E:\Fire Project\projects\word-guess
python -m http.server 8000
# Then open: http://localhost:8000
```

### Option 2: Direct Open in Browser
```bash
start E:\Fire Project\projects\word-guess\index.html
```

### Option 3: Node.js Server
```bash
cd E:\Fire Project\projects\word-guess
npx http-server
```

---

## 🎮 How to Play

### Daily Mode
1. Click **"Daily"** button (default mode)
2. Guess the 5-letter word in 6 attempts
3. Each guess reveals:
   - 🟩 **Green**: Correct letter in correct position
   - 🟨 **Yellow**: Correct letter in wrong position
   - ⬛ **Gray**: Letter not in word

4. Next daily puzzle available in 24 hours

### Practice Mode
1. Click **"Practice"** button
2. Unlimited words to guess
3. Perfect for training and learning strategies

---

## ⌨️ Controls

### Virtual Keyboard (On-Screen)
- Click letter buttons to type
- Click **Back** to delete
- Click **Enter** to submit

### Physical Keyboard
- **A-Z**: Type letters
- **Backspace**: Delete last letter
- **Enter**: Submit guess

---

## ⚙️ Settings

### Hard Mode
- Previously revealed letters MUST be used
- More challenging experience

### Sound Effects
- Toggle audio feedback for game events

### Animations
- Toggle smooth tile flip animations
- Useful for low-end devices

---

## 📊 Statistics

View your statistics by:
1. Click **⚙️** (Settings icon)
2. Click **"Statistics"**
3. See:
   - Games played
   - Win rate
   - Current streak
   - Guess distribution

---

## 🌐 Language Support

Click **🌐** to change language:
- 🇰🇷 Korean
- 🇺🇸 English
- 🇯🇵 Japanese
- 🇨🇳 Chinese
- 🇪🇸 Spanish
- 🇧🇷 Portuguese
- 🇮🇩 Indonesian
- 🇹🇷 Turkish
- 🇩🇪 German
- 🇫🇷 French
- 🇮🇳 Hindi
- 🇷🇺 Russian

---

## 💡 Tips & Strategies

1. **Start with Common Letters**
   - E, A, R, O, I appear frequently

2. **Use Vowels Early**
   - Most words have 1-2 vowels
   - Hint system will guide you

3. **Try Different Positions**
   - Don't assume position after first guess

4. **Hard Mode Challenge**
   - Enable for maximum difficulty
   - Uses revealed letters strategically

5. **Practice Mode Benefits**
   - Unlimited attempts
   - Build word recognition
   - Learn patterns

---

## 🔊 Sound Effects

The game includes audio feedback:
- **Pop**: Letter typed
- **Flip**: Tile reveals result
- **Success**: Game won
- **Error**: Invalid word

Toggle in Settings if audio distracts

---

## 📱 Mobile Experience

### Touch Support
- Tap virtual keyboard buttons
- Works on all touch devices
- Optimized for 360px-480px widths

### Full Screen
- Click "Install" to add to home screen
- Play like native app
- Works offline!

---

## 🌙 Dark & Light Modes

Click **🌙** button to toggle:
- **Dark Mode** (Default): Easy on eyes, modern aesthetic
- **Light Mode**: High contrast, bright display

Mode preference is saved

---

## 🎯 Game Mechanics

### How Daily Word Works
- Same word for all users on same day
- Word changes at midnight UTC
- Your game progress resets daily
- Previous games saved in statistics

### How Practice Word Works
- Random word selected each game
- No time limit
- Play as many as you want
- Stats tracked separately

### Scoring System
```
Attempts → Points
1 guess  → 100 points
2 guesses → 90 points
3 guesses → 80 points
4 guesses → 70 points
5 guesses → 60 points
6 guesses → 50 points
Loss      → 0 points
```

---

## 🔧 Troubleshooting

### Game Won't Load
- [ ] Clear browser cache
- [ ] Disable browser extensions
- [ ] Try different browser
- [ ] Check internet connection

### Service Worker Issues
- [ ] Go to DevTools > Application > Service Workers
- [ ] Check status is "activated"
- [ ] Click "Unregister" if broken
- [ ] Reload page to re-register

### Offline Mode Not Working
- [ ] Ensure you played game online once first
- [ ] Service Worker must cache assets
- [ ] Check browser allows offline
- [ ] Try hard refresh (Ctrl+Shift+R)

### Statistics Lost
- [ ] Check browser storage is enabled
- [ ] LocalStorage not blocked
- [ ] Cookies enabled
- [ ] Private/Incognito won't save stats

---

## 📊 Analytics & Privacy

The game tracks:
- Game plays and results
- Language preferences
- Session duration
- Feature usage

**No personal data is collected.**

---

## 💬 Share Your Results

After winning, click **"Share"** to:
- **Social Media**: Post emoji grid
- **Copy to Clipboard**: Share via message
- **Web Share API**: Direct share on mobile

Example share format:
```
Word Guess #125
4/6

🟩🟩🟩⬛⬛
🟩🟨🟩🟩🟩
🟩🟩🟩🟩🟩
🟩🟩🟩🟩🟩
```

---

## 🏆 Streak System

- **Streak**: Consecutive daily puzzle wins
- **Max Streak**: Your best consecutive wins
- **Current Streak**: Maintained by daily play

Miss a day = streak resets to 0

---

## 🎨 Hint System

Each game includes hints:

**First Hint** (Practice):
- Tells if word has vowels or not

**Subsequent Hints** (Practice):
- Reveals next letter position

Hints are optional - use strategically!

---

## 💾 Data Storage

### What's Saved
- Game statistics (wins, losses, streak)
- User preferences (theme, sound, language)
- Game state (current guess, current word)

### Where It's Stored
- Browser LocalStorage (5-10 MB)
- Persists across sessions
- Deleted if browser data cleared

### Cloud Sync (Future)
- Coming soon: sync across devices
- Optional account creation
- Cloud backup of stats

---

## 🐛 Report Issues

Found a bug? Have suggestions?

Options:
1. **In-Game**: Settings → Contact Support
2. **Email**: support@dopabrain.com
3. **Social**: Tweet @dopabrain

---

## 🔐 Privacy & Security

- No account required
- No personal data collected
- No tracking cookies
- No ads tracking behavior
- Works completely offline
- Open source friendly

---

## 📖 Full Documentation

For detailed information:
- See **README.md** in project folder
- Check **About** section in-game
- Review source code comments
- Visit dopabrain.com/word-guess

---

## 🎉 Have Fun!

Word Guess is designed to be:
- ✅ **Fun**: Engaging gameplay
- ✅ **Fair**: Random words from 2000+ list
- ✅ **Fast**: Instant feedback
- ✅ **Accessible**: Full i18n support
- ✅ **Free**: No cost to play

**Play daily at dopabrain.com/games/word-guess**

---

Happy guessing! 🎮
