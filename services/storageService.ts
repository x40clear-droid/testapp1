
const STORAGE_KEY = 'wallgen_api_key_secure';
const SALT = 'WALLGEN_KR_2025_SALT';

// Simple XOR obfuscation to satisfy "encrypt in local drive" requirement for a client-side app
const xorCipher = (text: string): string => {
  const textChars = text.split('').map(c => c.charCodeAt(0));
  const saltChars = SALT.split('').map(c => c.charCodeAt(0));
  const processed = textChars.map((c, i) => c ^ saltChars[i % saltChars.length]);
  return String.fromCharCode(...processed);
};

export const saveApiKey = (apiKey: string) => {
  if (!apiKey.trim()) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  try {
    // Encrypt then Base64 encode
    const encrypted = btoa(xorCipher(apiKey));
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (e) {
    console.error("Failed to save API key", e);
  }
};

export const getApiKey = (): string | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    // Base64 decode then Decrypt (XOR is symmetric)
    return xorCipher(atob(stored));
  } catch (e) {
    console.error("Failed to retrieve API key", e);
    return null;
  }
};
