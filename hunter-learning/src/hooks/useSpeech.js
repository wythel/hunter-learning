import { useCallback } from 'react';

// 只設 u.lang 不指定 voice 時，瀏覽器會自己挑——在中文系統的 Mac/iPad 上常常挑到
// 系統預設的「美佳」用中文腔唸英文，或是 en-US 清單字母序最前面的 Albert、Bad News
// 這類搞笑語音。所以這裡明確挑一個自然的人聲。

// 依偏好順序：越前面越好
const PREFERRED = [
  'samantha', 'ava', 'allison', 'susan', 'tom', 'alex',       // Apple 英文
  'google us english',                                        // Chrome
  'microsoft aria', 'microsoft jenny', 'microsoft guy',        // Edge/Windows
  '美佳', 'mei-jia', 'google 國語', 'microsoft hanhan', 'microsoft yating', // 國語(台灣)
];

// macOS 的搞笑語音，以及聽起來很機器人的 Eloquence 系列：排到最後，只在沒得選時才用
const ODD = [
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news',
  'jester', 'organ', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox',
  'fred', 'junior', 'kathy', 'ralph',
  'eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley',
];

const norm = (s) => String(s || '').replace('_', '-').toLowerCase();

export function pickVoice(voices, lang) {
  const want = norm(lang);
  const base = want.split('-')[0];
  let best = null;
  let bestScore = -Infinity;
  for (const v of voices || []) {
    const vl = norm(v.lang);
    if (vl.split('-')[0] !== base) continue;
    const name = norm(v.name);
    let score = vl === want ? 100 : 50;
    const pref = PREFERRED.findIndex(p => name.startsWith(p));
    if (pref >= 0) score += 60 - pref;
    if (/enhanced|premium|natural|neural/.test(name)) score += 30;
    if (ODD.some(o => name.startsWith(o))) score -= 120;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best;
}

// Chrome 的語音清單是非同步載入的：一載入模組就先要一次，進第一題時通常已經就緒
if (typeof window !== 'undefined' && window.speechSynthesis) {
  try { window.speechSynthesis.getVoices(); } catch { /* 略過 */ }
}

// 用瀏覽器內建語音唸出一段文字。
//   speak('apple', 'en-US')  → 唸英文
//   speak('山', 'zh-TW')     → 唸國語
//   speak('I see a cat', 'en-US', 0.55) → 放慢唸
// 瀏覽器缺 speechSynthesis 或缺對應語音時安靜降級，不影響遊戲。
export function useSpeech() {
  return useCallback((text, lang, rate = 0.9) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      // 清單還沒載入時 pickVoice 回 null，就只靠 lang
      const voice = pickVoice(window.speechSynthesis.getVoices(), lang);
      if (voice) u.voice = voice;
      window.speechSynthesis.speak(u);
    } catch {
      /* 無語音支援時安靜略過 */
    }
  }, []);
}
