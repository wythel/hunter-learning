import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '../../components/StarField';
import Staff from './Staff';
import Piano from './Piano';
import { TREBLE_NOTES, BASS_NOTES, SOLFEGE_COLOR, keyboardForClef } from './notes';

const ACCENT = '#818cf8';

function NoteRow({ note }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '6px 10px', borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${SOLFEGE_COLOR[note.solfege]}33`,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: SOLFEGE_COLOR[note.solfege],
        color: '#0a1626', fontWeight: 900, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 12px ${SOLFEGE_COLOR[note.solfege]}66`,
      }}>
        {note.solfege}
      </div>
      <div style={{ color: 'rgba(220,230,245,0.85)', fontSize: 14, fontWeight: 700 }}>
        {note.id}
      </div>
    </motion.div>
  );
}

function clefSlide(clef) {
  const isTreble = clef === 'treble';
  const notes = isTreble ? TREBLE_NOTES : BASS_NOTES;
  return {
    icon: isTreble ? '𝄞' : '𝄢',
    title: isTreble ? '高音譜記號' : '低音譜記號',
    intro: isTreble
      ? '這個彎彎的記號是「G譜號」，常用在右手彈奏的較高音。'
      : '這個記號是「F譜號」，常用在左手彈奏的較低音。',
    notes,
  };
}

function ClefSlideContent({ clef }) {
  const data = clefSlide(clef);
  // Show staff with all 7 notes faded behind to teach positions
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        fontSize: 13, color: 'rgba(180,195,215,0.85)',
        textAlign: 'center', lineHeight: 1.6, padding: '0 4px',
      }}>
        {data.intro}
      </div>
      <div style={{
        background: 'rgba(8,16,28,0.75)',
        border: '1px solid rgba(129,140,248,0.25)',
        borderRadius: 14, padding: '12px 8px',
      }}>
        <Staff clef={clef} note={null} accent={ACCENT} />
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, width: '100%',
      }}>
        {data.notes.map(n => <NoteRow key={n.id} note={n} />)}
      </div>
    </div>
  );
}

function PianoMapSlide() {
  const kbd = keyboardForClef('treble'); // C4-C6
  // Highlight Do (C4 and C5)
  const highlightMidis = [60, 72];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        fontSize: 13, color: 'rgba(180,195,215,0.85)',
        textAlign: 'center', lineHeight: 1.6,
      }}>
        每個音符都對應到鋼琴上的一個白鍵。<br />
        白鍵從左到右是 <b style={{ color: '#ff6b6b' }}>Do</b> <b style={{ color: '#ff922b' }}>Re</b> <b style={{ color: '#ffd43b' }}>Mi</b> <b style={{ color: '#51cf66' }}>Fa</b> <b style={{ color: '#4dabf7' }}>Sol</b> <b style={{ color: '#845ef7' }}>La</b> <b style={{ color: '#f783ac' }}>Ti</b>。
      </div>
      <div style={{
        background: 'rgba(8,16,28,0.75)',
        border: '1px solid rgba(129,140,248,0.25)',
        borderRadius: 14, padding: '10px 8px', width: '100%',
      }}>
        <Piano whites={kbd.whites} blacks={kbd.blacks} highlightMidis={highlightMidis} showLabels="all" />
      </div>
      <div style={{
        fontSize: 11.5, color: 'rgba(139,163,190,0.7)', textAlign: 'center',
      }}>
        紫色標出的鍵都是 <b style={{ color: '#818cf8' }}>Do</b>（每組 7 個音都從 Do 開始）
      </div>
    </div>
  );
}

function HowToPlaySlide({ answerMode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        fontSize: 14, color: 'rgba(220,230,245,0.9)',
        textAlign: 'center', lineHeight: 1.6,
      }}>
        看見譜上出現一個音符，<br />
        {answerMode === 'name'
          ? <>就點下方對的<b style={{ color: ACCENT }}>音名按鈕</b>！</>
          : <>就在鋼琴上點對的<b style={{ color: ACCENT }}>白鍵</b>！</>}
      </div>
      <div style={{
        background: 'rgba(8,16,28,0.75)',
        border: '1px solid rgba(129,140,248,0.25)',
        borderRadius: 14, padding: '12px 8px',
      }}>
        <Staff clef="treble" note={{ id: 'C5', staffPos: 5, clef: 'treble' }} accent={ACCENT} />
      </div>
      {answerMode === 'name' ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'].map(s => (
            <div key={s} style={{
              padding: '8px 12px', borderRadius: 12,
              background: s === 'Do' ? `${SOLFEGE_COLOR.Do}33` : 'rgba(14,22,40,0.85)',
              border: `1.5px solid ${s === 'Do' ? SOLFEGE_COLOR.Do : 'rgba(50,75,110,0.6)'}`,
              color: s === 'Do' ? SOLFEGE_COLOR.Do : 'rgba(139,163,190,0.7)',
              fontWeight: 900, fontSize: 14,
              boxShadow: s === 'Do' ? `0 0 12px ${SOLFEGE_COLOR.Do}55` : 'none',
            }}>
              {s}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <Piano
            whites={keyboardForClef('treble').whites}
            blacks={keyboardForClef('treble').blacks}
            answerMidi={72}
            revealCorrect={true}
            showLabels="all"
          />
        </div>
      )}
      <div style={{ fontSize: 12, color: 'rgba(139,163,190,0.6)', textAlign: 'center' }}>
        ↑ 譜上是 <b style={{ color: ACCENT }}>C5（Do）</b>，所以正確答案是 Do 喔！
      </div>
    </div>
  );
}

function makeSlides(clefMode, answerMode) {
  const slides = [];
  if (clefMode === 'treble' || clefMode === 'mixed') {
    slides.push({
      icon: '𝄞',
      title: '高音譜記號',
      content: <ClefSlideContent clef="treble" />,
    });
  }
  if (clefMode === 'bass' || clefMode === 'mixed') {
    slides.push({
      icon: '𝄢',
      title: '低音譜記號',
      content: <ClefSlideContent clef="bass" />,
    });
  }
  slides.push({
    icon: '🎹',
    title: '鋼琴上的位置',
    content: <PianoMapSlide />,
  });
  slides.push({
    icon: answerMode === 'name' ? '🎯' : '🎹',
    title: '開始玩！',
    content: <HowToPlaySlide answerMode={answerMode} />,
  });
  return slides;
}

export default function Teaching({ clefMode, answerMode, onDone }) {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const slides = makeSlides(clefMode, answerMode);
  const isLast = slide === slides.length - 1;

  function next() {
    if (isLast) { onDone(); return; }
    setDir(1);
    setSlide(s => s + 1);
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 20px',
      paddingTop: 'max(20px, env(safe-area-inset-top))',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      position: 'relative',
    }}>
      <StarField />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(139,163,190,0.6)', fontSize: 13, fontWeight: 700,
              padding: 0, fontFamily: 'inherit',
            }}
          >
            ← 大廳
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {slides.map((_, i) => (
              <div key={i} style={{
                width: i === slide ? 18 : 7, height: 7,
                borderRadius: 4,
                background: i === slide ? ACCENT : 'rgba(139,163,190,0.2)',
                transition: 'width 0.3s, background 0.3s',
              }} />
            ))}
          </div>
          <button
            onClick={onDone}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(139,163,190,0.5)', fontSize: 13, fontWeight: 700,
              padding: 0, fontFamily: 'inherit',
            }}
          >
            跳過
          </button>
        </div>

        {/* Slide card */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={slide}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <div style={{
              background: 'rgba(10,22,38,0.92)',
              border: '1px solid rgba(26,44,61,0.95)',
              borderRadius: 24,
              padding: '24px 20px 20px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
            }}>
              {/* Icon + Title */}
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: 48, lineHeight: 1, marginBottom: 8, color: ACCENT }}
                >
                  {slides[slide].icon}
                </motion.div>
                <div style={{
                  fontSize: 22, fontWeight: 900,
                  background: `linear-gradient(135deg, ${ACCENT}, #a78bfa)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}>
                  {slides[slide].title}
                </div>
              </div>

              {slides[slide].content}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={next}
          style={{
            width: '100%', padding: '16px 0', marginTop: 16,
            borderRadius: 18, border: 'none',
            background: `linear-gradient(135deg, ${ACCENT} 0%, #6366f1 60%, #4f46e5 100%)`,
            color: '#fff', fontSize: 17, fontWeight: 900,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: `0 4px 24px ${ACCENT}80`,
          }}
        >
          {isLast ? '🚀 開始遊戲！' : '下一頁 →'}
        </motion.button>
      </div>
    </div>
  );
}
