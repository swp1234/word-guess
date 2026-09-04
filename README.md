# Word Guess

Daily and practice word puzzles for 4–8 letter words in 12 languages.

## Measurement

The private, exact-once funnel is:

`word_guess_view` → `word_guess_start` → `word_guess_progress` → `word_guess_complete`

- Page load, typing, invalid words, mode changes, and resets are not a game start.
- Start requires the first accepted guess; progress requires the second accepted guess.
- Complete requires a win or the final accepted guess.
- Successful sharing and related-card selection emit `word_guess_share` and `word_guess_related_click` without the word, guesses, result, score, language, or URL.

## Advertising

Ad serving is suspended for the invalid-traffic restriction that began on 2026-09-03. The page contains no AdSense loader, manual unit, interstitial, rewarded flow, or simulated ad surface.

## Verification

From the portfolio root:

```powershell
npm run verify:word-guess-suspension
```
