import { GameCanvas } from './components/GameCanvas';

export function App(): JSX.Element {
  return (
    <div className="app">
      <header className="app-header">
        <h1>ALttP Randomizer</h1>
      </header>
      <main className="app-main">
        <GameCanvas />
      </main>
    </div>
  );
}
