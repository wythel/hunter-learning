// staffPos: 0 = bottom line (1st line), 1 = 1st space, 2 = 2nd line, ...
// (each integer step = half a stave space, going upward)

// Treble: C4(middle C, 1 ledger below) → B4(middle line). Full Do-Ti octave.
export const TREBLE_NOTES = [
  { id: 'C4', clef: 'treble', midi: 60, solfege: 'Do',  staffPos: -2 },
  { id: 'D4', clef: 'treble', midi: 62, solfege: 'Re',  staffPos: -1 },
  { id: 'E4', clef: 'treble', midi: 64, solfege: 'Mi',  staffPos: 0  },
  { id: 'F4', clef: 'treble', midi: 65, solfege: 'Fa',  staffPos: 1  },
  { id: 'G4', clef: 'treble', midi: 67, solfege: 'Sol', staffPos: 2  },
  { id: 'A4', clef: 'treble', midi: 69, solfege: 'La',  staffPos: 3  },
  { id: 'B4', clef: 'treble', midi: 71, solfege: 'Ti',  staffPos: 4  },
];

// Bass: C3(2nd space) → B3(space above top line). Full Do-Ti octave.
export const BASS_NOTES = [
  { id: 'C3', clef: 'bass', midi: 48, solfege: 'Do',  staffPos: 3 },
  { id: 'D3', clef: 'bass', midi: 50, solfege: 'Re',  staffPos: 4 },
  { id: 'E3', clef: 'bass', midi: 52, solfege: 'Mi',  staffPos: 5 },
  { id: 'F3', clef: 'bass', midi: 53, solfege: 'Fa',  staffPos: 6 },
  { id: 'G3', clef: 'bass', midi: 55, solfege: 'Sol', staffPos: 7 },
  { id: 'A3', clef: 'bass', midi: 57, solfege: 'La',  staffPos: 8 },
  { id: 'B3', clef: 'bass', midi: 59, solfege: 'Ti',  staffPos: 9 },
];

export const SOLFEGE = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];

// Visual colour per solfège name (rainbow-ish, friendly for kids)
export const SOLFEGE_COLOR = {
  Do:  '#ff6b6b',
  Re:  '#ff922b',
  Mi:  '#ffd43b',
  Fa:  '#51cf66',
  Sol: '#4dabf7',
  La:  '#845ef7',
  Ti:  '#f783ac',
};

export function getNotePool(clefMode) {
  if (clefMode === 'treble') return TREBLE_NOTES;
  if (clefMode === 'bass')   return BASS_NOTES;
  return [...TREBLE_NOTES, ...BASS_NOTES];
}

// One octave (C to B) of white-key info, mapped from a starting MIDI C.
// Used to draw the piano keyboard.
const WHITE_LETTERS  = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const WHITE_SOLFEGE  = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti'];
const WHITE_OFFSETS  = [0, 2, 4, 5, 7, 9, 11]; // semitones from C

// Black keys positioned between white keys (index in the octave's 7 whites)
// After C(0), D(1), F(3), G(4), A(5)
const BLACK_BETWEEN = [
  { afterWhite: 0, offset: 1  }, // C#
  { afterWhite: 1, offset: 3  }, // D#
  { afterWhite: 3, offset: 6  }, // F#
  { afterWhite: 4, offset: 8  }, // G#
  { afterWhite: 5, offset: 10 }, // A#
];

// Build a multi-octave keyboard. startC: midi number of the lowest C.
// octaves: number of full C-to-B octaves to draw, plus an extra C on the right.
export function buildKeyboard(startC, octaves) {
  const whites = [];
  const blacks = [];

  for (let o = 0; o < octaves; o++) {
    WHITE_LETTERS.forEach((letter, i) => {
      const midi = startC + o * 12 + WHITE_OFFSETS[i];
      whites.push({
        midi,
        letter,
        solfege: WHITE_SOLFEGE[i],
        id: `${letter}${Math.floor(midi / 12) - 1}`, // MIDI octave naming
      });
    });
    BLACK_BETWEEN.forEach(({ afterWhite, offset }) => {
      const midi = startC + o * 12 + offset;
      blacks.push({
        midi,
        afterWhite: o * 7 + afterWhite, // global white index
      });
    });
  }

  // Extra trailing C (visual completeness)
  const tailMidi = startC + octaves * 12;
  whites.push({
    midi: tailMidi,
    letter: 'C',
    solfege: 'Do',
    id: `C${Math.floor(tailMidi / 12) - 1}`,
  });

  return { whites, blacks };
}

// Keyboard chosen per clef of the current question (so the relevant white keys
// are always visible). Both keyboards span 2 octaves.
export function keyboardForClef(clef) {
  if (clef === 'bass') return buildKeyboard(36, 2); // C2 → C4
  return buildKeyboard(60, 2);                       // C4 → C6 (treble)
}
