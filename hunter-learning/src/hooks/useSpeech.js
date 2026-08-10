import { useCallback } from 'react';

// 用瀏覽器內建語音唸出一段文字。
//   speak('apple', 'en-US')  → 唸英文
//   speak('山', 'zh-TW')     → 唸國語
// 瀏覽器缺 speechSynthesis 或缺對應語音時安靜降級，不影響遊戲。
export function useSpeech() {
  return useCallback((text, lang) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch {
      /* 無語音支援時安靜略過 */
    }
  }, []);
}
