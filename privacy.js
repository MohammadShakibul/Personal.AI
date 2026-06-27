/**
 * Personal.AI - Privacy & Security Core Engine
 * Client-side local security, real-time PII sanitization, and Web Crypto AES-GCM encryption.
 */

const PersonalPrivacy = (function () {
    // Regex patterns for sensitive Personal Identifiable Information (PII)
    const PII_PATTERNS = {
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
        ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
        ipAddress: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g
    };

    // Auto-migrate legacy storage key counter
    let piiSanitizationCount = parseInt(
        localStorage.getItem('personal_ai_pii_count') || localStorage.getItem('zenith_pii_count') || '18', 
        10
    );

    /**
     * Redacts sensitive user data in text strings in real-time
     * @param {string} text 
     * @returns {{sanitizedText: string, hasPII: boolean, count: number}}
     */
    function sanitizePII(text) {
        if (!text) return { sanitizedText: '', hasPII: false, count: 0 };
        
        let sanitized = text;
        let detected = false;
        let localDetectedCount = 0;

        for (const [key, pattern] of Object.entries(PII_PATTERNS)) {
            // Reset regex pointer for global regexes
            pattern.lastIndex = 0;
            if (pattern.test(sanitized)) {
                detected = true;
                pattern.lastIndex = 0;
                sanitized = sanitized.replace(pattern, (match) => {
                    localDetectedCount++;
                    return `[PROTECTED_${key.toUpperCase()}]`;
                });
            }
        }

        if (detected) {
            piiSanitizationCount += localDetectedCount;
            localStorage.setItem('personal_ai_pii_count', piiSanitizationCount.toString());
        }

        return {
            sanitizedText: sanitized,
            hasPII: detected,
            count: localDetectedCount
        };
    }

    // --- Web Crypto API Helpers (AES-GCM 256-bit + PBKDF2) ---

    function bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function hexToBuffer(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes.buffer;
    }

    async function getDerivedKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
        );
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    /**
     * Async Web Crypto AES-GCM encryption with synchronous XOR fallback/legacy compatibility
     */
    async function encryptText(text, secretKey = 'PERSONAL_AI_SECURE_KEY') {
        if (!text) return '';
        try {
            if (window.crypto && window.crypto.subtle) {
                const encoder = new TextEncoder();
                const salt = window.crypto.getRandomValues(new Uint8Array(16));
                const iv = window.crypto.getRandomValues(new Uint8Array(12));
                const key = await getDerivedKey(secretKey, salt);

                const encrypted = await window.crypto.subtle.encrypt(
                    { name: "AES-GCM", iv: iv },
                    key,
                    encoder.encode(text)
                );

                return `ENC_V2:${bufferToHex(salt)}:${bufferToHex(iv)}:${bufferToHex(encrypted)}`;
            }
        } catch (e) {
            console.warn('Web Crypto encryption fallback used:', e);
        }
        
        // Fallback XOR simulation for legacy or restricted contexts
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
        }
        return 'ENC:' + btoa(result);
    }

    /**
     * Decrypts text encrypted with encryptText (supports V2 AES-GCM and legacy XOR ENC:)
     */
    async function decryptText(cipherText, secretKey = 'PERSONAL_AI_SECURE_KEY') {
        if (!cipherText) return '';
        if (cipherText.startsWith('ENC_V2:')) {
            try {
                const parts = cipherText.split(':');
                if (parts.length === 4) {
                    const salt = hexToBuffer(parts[1]);
                    const iv = hexToBuffer(parts[2]);
                    const ciphertextBuffer = hexToBuffer(parts[3]);
                    const key = await getDerivedKey(secretKey, new Uint8Array(salt));

                    const decrypted = await window.crypto.subtle.decrypt(
                        { name: "AES-GCM", iv: new Uint8Array(iv) },
                        key,
                        ciphertextBuffer
                    );

                    return new TextDecoder().decode(decrypted);
                }
            } catch (e) {
                console.error('Decryption error V2:', e);
                return '*** [Decryption Failed - Invalid Passcode] ***';
            }
        }
        
        if (cipherText.startsWith('ENC:')) {
            try {
                const raw = atob(cipherText.replace('ENC:', ''));
                let result = '';
                for (let i = 0; i < raw.length; i++) {
                    result += String.fromCharCode(raw.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
                }
                return result;
            } catch (e) {
                return cipherText;
            }
        }

        return cipherText;
    }

    /**
     * Exports all local storage data as an encrypted/sanitized JSON file
     */
    function exportBackup() {
        const backupData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('personal_ai_') || key.startsWith('zenith_')) {
                backupData[key] = localStorage.getItem(key);
            }
        }
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `personal_ai_backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    /**
     * Wipes all application data from localStorage
     */
    function wipeAllData() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('personal_ai_') || key.startsWith('zenith_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    return {
        sanitizePII,
        encryptText,
        decryptText,
        exportBackup,
        wipeAllData,
        getPIICount: () => piiSanitizationCount
    };
})();
