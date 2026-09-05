import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import MathBattleSettings from './games/math-battle/Settings';
import MathBattleGame    from './games/math-battle/Game';
import ChainMathSettings from './games/chain-math/Settings';
import ChainMathGame     from './games/chain-math/Game';
import ClockSettings     from './games/clock-reading/Settings';
import ClockGame         from './games/clock-reading/Game';
import EnglishSettings   from './games/english-match/Settings';
import EnglishGame       from './games/english-match/Game';
import MemorySettings    from './games/memory-flip/Settings';
import MemoryGame        from './games/memory-flip/Game';
import MoleSettings      from './games/math-mole/Settings';
import MoleGame          from './games/math-mole/Game';
import SymmetrySettings  from './games/symmetry/Settings';
import SymmetryGame      from './games/symmetry/Game';
import OddEvenSettings   from './games/odd-even/Settings';
import OddEvenGame       from './games/odd-even/Game';
import MakeTenSettings   from './games/make-ten/Settings';
import MakeTenGame       from './games/make-ten/Game';
import NoteStaffSettings from './games/note-staff/Settings';
import NoteStaffGame     from './games/note-staff/Game';
import WordHuntSettings  from './games/word-hunt/Settings';
import WordHuntGame      from './games/word-hunt/Game';
import ColumnMathSettings from './games/column-math/Settings';
import ColumnMathGame     from './games/column-math/Game';
import MoonPhasesSettings from './games/moon-phases/Settings';
import MoonPhasesGame     from './games/moon-phases/Game';
// 3D 場景（three.js）較大，lazy 載入讓其他遊戲的 bundle 不受影響
const PolarDay = lazy(() => import('./games/polar-day/PolarDay'));
import SolarSystemSettings from './games/solar-system/Settings';
import SolarSystemGame      from './games/solar-system/Game';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"                   element={<Lobby />} />
        <Route path="/math-battle"        element={<MathBattleSettings />} />
        <Route path="/math-battle/play"   element={<MathBattleGame />} />
        <Route path="/chain-math"         element={<ChainMathSettings />} />
        <Route path="/chain-math/play"    element={<ChainMathGame />} />
        <Route path="/clock-reading"      element={<ClockSettings />} />
        <Route path="/clock-reading/play" element={<ClockGame />} />
        <Route path="/english-match"      element={<EnglishSettings />} />
        <Route path="/english-match/play" element={<EnglishGame />} />
        <Route path="/memory-flip"        element={<MemorySettings />} />
        <Route path="/memory-flip/play"   element={<MemoryGame />} />
        <Route path="/math-mole"          element={<MoleSettings />} />
        <Route path="/math-mole/play"     element={<MoleGame />} />
        <Route path="/symmetry"           element={<SymmetrySettings />} />
        <Route path="/symmetry/play"      element={<SymmetryGame />} />
        <Route path="/odd-even"           element={<OddEvenSettings />} />
        <Route path="/odd-even/play"      element={<OddEvenGame />} />
        <Route path="/make-ten"           element={<MakeTenSettings />} />
        <Route path="/make-ten/play"      element={<MakeTenGame />} />
        <Route path="/note-staff"         element={<NoteStaffSettings />} />
        <Route path="/note-staff/play"    element={<NoteStaffGame />} />
        <Route path="/word-hunt"          element={<WordHuntSettings />} />
        <Route path="/word-hunt/play"     element={<WordHuntGame />} />
        <Route path="/column-math"        element={<ColumnMathSettings />} />
        <Route path="/column-math/play"   element={<ColumnMathGame />} />
        <Route path="/moon-phases"        element={<MoonPhasesSettings />} />
        <Route path="/moon-phases/play"   element={<MoonPhasesGame />} />
        <Route path="/polar-day"          element={
          <Suspense fallback={
            <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center',
              color: '#8ba3be', fontSize: 18, fontWeight: 800 }}>🌍 準備出發…</div>
          }>
            <PolarDay />
          </Suspense>
        } />
        <Route path="/solar-system"       element={<SolarSystemSettings />} />
        <Route path="/solar-system/play"  element={<SolarSystemGame />} />
      </Routes>
    </HashRouter>
  );
}
