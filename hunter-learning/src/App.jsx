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
      </Routes>
    </HashRouter>
  );
}
