import './App.scss';
import KalimbaScore from './components/KalimbaScore.jsx';

const demoScore = {
  title: 'Twinkle Twinkle Little Star',
  subtitle: 'Key: C / 4-4 time',
  tempo: 88,
  scale: 'C',
  timeSignature: {
    beats: 4,
    noteValue: 4,
  },
  totalBeats: 48,
  notes: [
    // 1 1 5 5 6 6 5
    { id: 'a1', tine: 8, start: 0, duration: 1, label: '1' },
    { id: 'a2', tine: 8, start: 1, duration: 1, label: '1' },
    { id: 'a3', tine: 10, start: 2, duration: 1, label: '5' },
    { id: 'a4', tine: 10, start: 3, duration: 1, label: '5' },
    { id: 'a5', tine: 5, start: 4, duration: 1, label: '6' },
    { id: 'a6', tine: 5, start: 5, duration: 1, label: '6' },
    { id: 'a7', tine: 10, start: 6, duration: 2, label: '5', style: 'accent' },
    // 4 4 3 3 2 2 1
    { id: 'b1', tine: 6, start: 8, duration: 1, label: '4' },
    { id: 'b2', tine: 6, start: 9, duration: 1, label: '4' },
    { id: 'b3', tine: 9, start: 10, duration: 1, label: '3' },
    { id: 'b4', tine: 9, start: 11, duration: 1, label: '3' },
    { id: 'b5', tine: 7, start: 12, duration: 1, label: '2' },
    { id: 'b6', tine: 7, start: 13, duration: 1, label: '2' },
    { id: 'b7', tine: 8, start: 14, duration: 2, label: '1', style: 'accent' },
    // 5 5 4 4 3 3 2
    { id: 'c1', tine: 10, start: 16, duration: 1, label: '5' },
    { id: 'c2', tine: 10, start: 17, duration: 1, label: '5' },
    { id: 'c3', tine: 6, start: 18, duration: 1, label: '4' },
    { id: 'c4', tine: 6, start: 19, duration: 1, label: '4' },
    { id: 'c5', tine: 9, start: 20, duration: 1, label: '3' },
    { id: 'c6', tine: 9, start: 21, duration: 1, label: '3' },
    { id: 'c7', tine: 7, start: 22, duration: 2, label: '2', style: 'accent' },
    // 5 5 4 4 3 3 2
    { id: 'd1', tine: 10, start: 24, duration: 1, label: '5' },
    { id: 'd2', tine: 10, start: 25, duration: 1, label: '5' },
    { id: 'd3', tine: 6, start: 26, duration: 1, label: '4' },
    { id: 'd4', tine: 6, start: 27, duration: 1, label: '4' },
    { id: 'd5', tine: 9, start: 28, duration: 1, label: '3' },
    { id: 'd6', tine: 9, start: 29, duration: 1, label: '3' },
    { id: 'd7', tine: 7, start: 30, duration: 2, label: '2', style: 'accent' },
    // 1 1 5 5 6 6 5
    { id: 'e1', tine: 8, start: 32, duration: 1, label: '1' },
    { id: 'e2', tine: 8, start: 33, duration: 1, label: '1' },
    { id: 'e3', tine: 10, start: 34, duration: 1, label: '5' },
    { id: 'e4', tine: 10, start: 35, duration: 1, label: '5' },
    { id: 'e5', tine: 5, start: 36, duration: 1, label: '6' },
    { id: 'e6', tine: 5, start: 37, duration: 1, label: '6' },
    { id: 'e7', tine: 10, start: 38, duration: 2, label: '5', style: 'accent' },
    // 4 4 3 3 2 2 1
    { id: 'f1', tine: 6, start: 40, duration: 1, label: '4' },
    { id: 'f2', tine: 6, start: 41, duration: 1, label: '4' },
    { id: 'f3', tine: 9, start: 42, duration: 1, label: '3' },
    { id: 'f4', tine: 9, start: 43, duration: 1, label: '3' },
    { id: 'f5', tine: 7, start: 44, duration: 1, label: '2' },
    { id: 'f6', tine: 7, start: 45, duration: 1, label: '2' },
    { id: 'f7', tine: 8, start: 46, duration: 2, label: '1', style: 'accent' },
  ],
};

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <p className="app-version">v0.5</p>
          <h1>Kalimba Score Viewer</h1>
        </div>
      </header>
      <KalimbaScore score={demoScore} />
    </div>
  );
}

export default App;
