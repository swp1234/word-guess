/**
 * Internationalization (i18n) Module
 * Supports 12 languages: ko, en, zh, hi, ru, ja, es, pt, id, tr, de, fr
 */

class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
        this.isInitialized = false;
    }

    /**
     * Detect user language from localStorage, browser, or default to English
     */
    detectLanguage() {
        // Check localStorage
        const saved = localStorage.getItem('wordguess-language');
        if (saved && this.supportedLanguages.includes(saved)) {
            return saved;
        }

        // Check browser language
        const browserLang = navigator.language.split('-')[0].toLowerCase();
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }

        // Default to English
        return 'en';
    }

    /**
     * Load translations from JSON files
     */
    async loadTranslations(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            lang = 'en';
        }

        try {
            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            this.translations[lang] = await response.json();
            return true;
        } catch (error) {
            console.error('i18n: Failed to load translations', error);
            return false;
        }
    }

    /**
     * Initialize i18n - load all necessary translations
     */
    async init() {
        if (this.isInitialized) return;

        // Load current language and English as fallback
        await this.loadTranslations(this.currentLang);
        if (this.currentLang !== 'en') {
            await this.loadTranslations('en');
        }

        this.updateUI();
        this.isInitialized = true;
    }

    /**
     * Get translated text using dot notation
     * Example: i18n.t('app.title') -> returns translation for app.title
     */
    t(key, defaultValue = key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if translation not found
                value = this.translations.en;
                for (const fk of keys) {
                    if (value && typeof value === 'object' && fk in value) {
                        value = value[fk];
                    } else {
                        return defaultValue;
                    }
                }
                return value;
            }
        }

        return value || defaultValue;
    }

    /**
     * Update all UI elements with data-i18n attribute
     */
    updateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            // For title/placeholder attributes
            if (el.getAttribute('data-i18n-title')) {
                el.title = translation;
            }
            if (el.getAttribute('data-i18n-placeholder')) {
                el.placeholder = translation;
            }

            // For text content
            if (!el.querySelector('[data-i18n]')) {
                // Only update if no nested i18n elements
                el.textContent = translation;
            }
        });
    }

    /**
     * Change language and update UI
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            return false;
        }

        // Load translations if not already loaded
        if (!(lang in this.translations)) {
            await this.loadTranslations(lang);
        }

        this.currentLang = lang;
        localStorage.setItem('wordguess-language', lang);
        this.updateUI();
        document.documentElement.lang = lang;

        // Dispatch custom event for language change
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));

        return true;
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Get language name in its native language
     */
    getLanguageName(lang) {
        const names = {
            ko: '한국어',
            en: 'English',
            ja: '日本語',
            zh: '中文',
            es: 'Español',
            pt: 'Português',
            id: 'Bahasa Indonesia',
            tr: 'Türkçe',
            de: 'Deutsch',
            fr: 'Français',
            hi: 'हिन्दी',
            ru: 'Русский'
        };
        return names[lang] || lang;
    }

    /**
     * Get list of all supported languages
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }
}

// Create global i18n instance
const i18n = new I18n();

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try { i18n.init(); } catch(e) { console.warn('i18n init error:', e); }
    });
} else {
    try { i18n.init(); } catch(e) { console.warn('i18n init error:', e); }
}
