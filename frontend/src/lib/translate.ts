/**
 * Auto-translate text to English using the MyMemory Translation API.
 * Free, no API key required. Supports auto-detection of source language.
 */

/**
 * Detect if text is likely already in English.
 * Uses a combination of Unicode script checks and common-word heuristics.
 */
function isLikelyEnglish(text: string): boolean {
    // Strip hashtags, mentions, URLs, numbers, and punctuation for analysis
    const cleaned = text
        .replace(/(#\w+|@\w+)/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[0-9.,!?;:'"()\-\[\]{}\s]+/g, ' ')
        .trim();

    if (!cleaned) return true; // If nothing left after cleaning, treat as English

    // Check for non-Latin scripts (Cyrillic, CJK, Arabic, Devanagari, Thai, etc.)
    const nonLatinPattern = /[\u0400-\u04FF\u0500-\u052F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0600-\u06FF\u0900-\u097F\u0E00-\u0E7F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/;
    if (nonLatinPattern.test(cleaned)) return false;

    // For Latin-script text, check against common English words
    const words = cleaned.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    if (words.length === 0) return true;

    const commonEnglish = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
        'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
        'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
        'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
        'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has',
        'had', 'did', 'does', 'am', 'should', 'must', 'need', 'very', 'still',
        'more', 'here', 'where', 'why', 'how', 'much', 'many', 'may', 'own',
        'world', 'government', 'political', 'policy', 'news', 'breaking', 'market',
        'economy', 'stock', 'price', 'vote', 'election', 'bill', 'act', 'law',
    ]);

    const englishWordCount = words.filter(w => commonEnglish.has(w)).length;
    const ratio = englishWordCount / words.length;

    // If at least 30% of words are common English words, consider it English
    return ratio >= 0.3;
}

/**
 * Translates text to English using the MyMemory free translation API.
 * If the text is already in English, returns it unchanged.
 * Falls back to original text if translation fails.
 */
export async function translateToEnglish(text: string): Promise<string> {
    // Quick check — if it looks English already, skip translation
    if (isLikelyEnglish(text)) {
        return text;
    }

    try {
        // Preserve hashtags and mentions — translate only the prose
        const tokens: { type: 'text' | 'tag'; value: string }[] = [];
        const tagPattern = /(#\w+|@\w+)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = tagPattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                tokens.push({ type: 'text', value: text.slice(lastIndex, match.index) });
            }
            tokens.push({ type: 'tag', value: match[0] });
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            tokens.push({ type: 'text', value: text.slice(lastIndex) });
        }

        // Translate only the text parts
        const translatedTokens = await Promise.all(
            tokens.map(async (token) => {
                if (token.type === 'tag' || !token.value.trim()) return token.value;

                const encodedText = encodeURIComponent(token.value);
                const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=autodetect|en`;
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(8000), // 8-second timeout
                });

                if (!response.ok) return token.value;

                const data = await response.json();
                if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
                    const translated = data.responseData.translatedText as string;
                    // MyMemory returns the same text if it can't detect the language
                    // or if the text is already in English
                    return translated;
                }
                return token.value;
            })
        );

        return translatedTokens.join('');
    } catch (error) {
        console.error('Translation failed, using original text:', error);
        return text; // Graceful fallback
    }
}
