# Word Guess - Daily Word Puzzle Game

A Wordle-inspired 5-letter word guessing game with daily challenges and practice mode. Built with vanilla HTML5, CSS3, and JavaScript with PWA support.

## Features

### Core Game Mechanics
- **Daily Mode**: One word per day synchronized across all players
- **Practice Mode**: Unlimited word puzzles for skill improvement
- **6 Attempts**: Limited tries to guess the 5-letter word
- **Color Feedback System**:
  - 🟩 Green: Correct letter in correct position
  - 🟨 Yellow: Correct letter in wrong position
  - ⬛ Gray: Letter not in the word

### User Experience
- **2026 UI/UX Trends**: Glassmorphism, microinteractions, minimalist design
- **Dark Mode First**: Beautiful dark theme with optional light mode
- **Mobile & Desktop**: Fully responsive with touch and keyboard support
- **Smooth Animations**: 3D tile flip animations and microinteractions
- **Sound Effects**: Optional audio feedback using Web Audio API

### Game Features
- **Hint System**: Smart hints that reveal word patterns
- **Hard Mode**: Challenging mode that requires using revealed letters
- **Statistics Tracking**: Win rate, streak, and attempt distribution
- **Result Sharing**: Share your win with emoji grid using Web Share API
- **Keyboard Support**: Full physical keyboard support (A-Z, Backspace, Enter)
- **Virtual Keyboard**: On-screen QWERTY keyboard with status indicators

### Technical Features
- **PWA (Progressive Web App)**:
  - Service Worker for offline functionality
  - App installation support
  - Works without internet connection
- **Internationalization (i18n)**: 12-language support
  - Korean, English, Japanese, Chinese, Spanish, Portuguese
  - Indonesian, Turkish, German, French, Hindi, Russian
- **LocalStorage**: Persistent game state and statistics
- **Analytics**: Google Analytics 4 integration
- **Monetization**: AdSense and AdMob ad placement ready

### Supported Languages
- 🇰🇷 한국어 (Korean)
- 🇺🇸 English
- 🇯🇵 日本語 (Japanese)
- 🇨🇳 中文 (Chinese)
- 🇪🇸 Español (Spanish)
- 🇧🇷 Português (Portuguese)
- 🇮🇩 Indonesia (Indonesian)
- 🇹🇷 Türkçe (Turkish)
- 🇩🇪 Deutsch (German)
- 🇫🇷 Français (French)
- 🇮🇳 हिन्दी (Hindi)
- 🇷🇺 Русский (Russian)

## Project Structure

```
word-guess/
├── index.html              # Main HTML with semantic structure
├── manifest.json           # PWA configuration
├── sw.js                   # Service Worker for offline support
├── icon-192.svg           # App icon (192x192)
├── icon-512.svg           # App icon (512x512)
├── css/
│   └── style.css          # 2026 UI/UX trends styling
└── js/
    ├── app.js             # Main game logic
    ├── i18n.js            # Internationalization module
    ├── word-list.js       # 2000+ word dictionary
    └── locales/           # Translation files
        ├── ko.json        # Korean
        ├── en.json        # English
        ├── ja.json        # Japanese
        ├── zh.json        # Chinese
        ├── es.json        # Spanish
        ├── pt.json        # Portuguese
        ├── id.json        # Indonesian
        ├── tr.json        # Turkish
        ├── de.json        # German
        ├── fr.json        # French
        ├── hi.json        # Hindi
        └── ru.json        # Russian
```

## Getting Started

### Local Development

1. **Clone and setup**
```bash
cd projects/word-guess
python -m http.server 8000
# Open http://localhost:8000 in browser
```

2. **Or open directly**
```bash
start index.html
```

### Deployment

The game is ready for deployment to:
- **GitHub Pages**: Static files, perfect for PWA
- **Netlify**: Drag-and-drop deployment with auto HTTPS
- **Vercel**: Fast CDN distribution
- **Firebase Hosting**: With cloud functions for future features

## Game Settings

### Hard Mode
When enabled, previously revealed letters must be used in subsequent guesses.

### Sound Effects
Toggle audio feedback for key presses, correct answers, and errors.

### Animations
Toggle smooth tile flip animations (useful for low-end devices).

## Technical Details

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 11.1+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

### API Integration
- **Google Analytics 4**: Game tracking and user analytics
- **AdSense**: Display ads (top/bottom banners)
- **AdMob**: In-app ads (banners, interstitials)
- **Web Share API**: Share results to social media

### Accessibility
- WCAG 2.1 AA compliant
- 44px+ touch targets
- High color contrast ratios
- Keyboard navigation support
- Reduced motion support

### Performance
- Lazy loading for locale files
- CSS Grid for responsive layout
- LocalStorage for instant state recovery
- Optimized SVG icons (maskable and any purpose)

## Monetization Strategy

### Ad Revenue
- Top banner: Display ads (AdSense)
- Bottom banner: Display ads (AdSense)
- Game interstitials: Full-screen ads (AdMob)

### Future In-App Features
- Premium hint system
- Ad-free experience
- Advanced statistics
- Leaderboards

## Statistics Tracking

### Metrics Tracked
- Games played (daily and practice)
- Win/loss count
- Win rate percentage
- Current streak
- Attempt distribution (1-6)

### Data Persistence
- Stored locally in browser (IndexedDB)
- Synced to cloud (future feature)

## Analytics Events

GA4 events tracked:
- `game_start`: When game is started
- `guess_submitted`: Each word guess
- `game_won`: When player wins
- `game_lost`: When player loses
- `hint_used`: When hint is requested
- `language_changed`: When player changes language
- `hard_mode_toggled`: When hard mode is enabled/disabled

## Future Enhancements

1. **Cloud Sync**: Save progress across devices
2. **Leaderboards**: Global and friend rankings
3. **Achievements**: Badges for milestones
4. **Custom Word Lists**: Language-specific vocabularies
5. **Multiplayer**: Race mode with friends
6. **Themes**: Additional color schemes
7. **Accessibility**: Enhanced screen reader support
8. **API Backend**: Track stats on server

## Credits

- **Inspiration**: Wordle by Josh Wardle
- **Design**: 2026 UI/UX trends (Calm, Headspace, Revolut)
- **Audio**: Web Audio API for sound effects
- **i18n**: Community translations

## License

Copyright © 2026. All rights reserved. Built for dopabrain.com

## Support & Feedback

For issues, suggestions, or translations:
- GitHub Issues: [Report bugs]
- Email: support@dopabrain.com
- Twitter: [@dopabrain]

---

**Play Word Guess daily at dopabrain.com/games/word-guess**
