import { describe, it, expect } from 'vitest';
import { pickVoice } from '../hooks/useSpeech';

const v = (name, lang) => ({ name, lang });

// 實際從中文系統的 Mac Chrome 拿到的清單節錄：預設是美佳，en-US 字母序最前面是搞笑語音
const MAC = [
  v('美佳', 'zh-TW'), v('Eddy (中文（台灣）)', 'zh-TW'), v('婷婷', 'zh-CN'),
  v('Albert', 'en-US'), v('Bad News', 'en-US'), v('Bahh', 'en-US'),
  v('Eddy (英文（美國）)', 'en-US'), v('Fred', 'en-US'), v('Grandma (英文（美國）)', 'en-US'),
  v('Samantha', 'en-US'), v('Zarvox', 'en-US'), v('Daniel', 'en-GB'),
];

describe('pickVoice', () => {
  it('picks Samantha for en-US over novelty and Eloquence voices', () => {
    expect(pickVoice(MAC, 'en-US').name).toBe('Samantha');
  });

  it('picks 美佳 for zh-TW', () => {
    expect(pickVoice(MAC, 'zh-TW').name).toBe('美佳');
  });

  it('never answers English with a Chinese voice', () => {
    const onlyZh = [v('美佳', 'zh-TW')];
    expect(pickVoice(onlyZh, 'en-US')).toBeNull();
  });

  it('falls back to another English accent before a novelty voice', () => {
    const list = [v('Albert', 'en-US'), v('Daniel', 'en-GB')];
    expect(pickVoice(list, 'en-US').name).toBe('Daniel');
  });

  it('prefers Google/Microsoft natural voices on other browsers', () => {
    const list = [v('Microsoft David', 'en-US'), v('Microsoft Aria Online (Natural)', 'en-US')];
    expect(pickVoice(list, 'en-US').name).toMatch(/Aria/);
    expect(pickVoice([v('Google US English', 'en-US'), v('Fred', 'en-US')], 'en-US').name)
      .toBe('Google US English');
  });

  it('handles underscore lang codes (Android) and an empty list', () => {
    expect(pickVoice([v('English', 'en_US')], 'en-US').name).toBe('English');
    expect(pickVoice([], 'en-US')).toBeNull();
  });
});
