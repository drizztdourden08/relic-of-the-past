import { useState, useCallback, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { GameCanvas } from './components/GameCanvas';
import { LogOverlay } from './components/LogOverlay';
import { log } from './lib/log-bus';
import type { LogChannel, LogLevel } from './lib/log-bus';

export function App(): JSX.Element {
  const [assetData, setAssetData] = useState<Uint8Array | null>(null);
  const [status, setStatus] = useState<string>('');

  // Bridge IPC log events from main process into LogBus
  useEffect(() => {
    return window.api.onLogEntry((entry) => {
      const channel = entry.channel as LogChannel;
      const level = entry.level as LogLevel;
      if (channel in log && typeof log[channel] === 'function') {
        log[channel](entry.message, level);
      }
    });
  }, []);

  const handleLoadRom = useCallback(async () => {
    try {
      // Check for cached extracted assets
      log.app('Checking for cached assets...');
      const hasAssets = await window.api.checkAssets();
      if (hasAssets) {
        setStatus('Loading cached assets...');
        log.app('Found cached assets, loading...');
        const buffer = await window.api.loadAssets();
        if (buffer) {
          log.app(`Loaded cached assets (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
          setAssetData(new Uint8Array(buffer));
          setStatus('');
          return;
        }
      }

      // No cached assets — need a ROM to extract from
      // Check if ROM is already stored in userData
      let needRomPick = !(await window.api.checkRom());

      if (needRomPick) {
        log.app('No cached ROM, opening file dialog...');
        const romPath = await window.api.openRomDialog();
        if (!romPath) {
          log.app('ROM dialog cancelled');
          return;
        }
        log.app(`Selected: ${romPath}`);

        // Extract assets (copies ROM to userData, runs restool, caches result)
        setStatus('Extracting assets from ROM (this may take a moment)...');
        const result = await window.api.extractAssets(romPath);
        if (!result.success) {
          setStatus(`Extraction failed: ${result.error}`);
          return;
        }
      } else {
        // ROM exists in userData but assets don't — re-extract
        log.app('ROM cached but assets missing, re-extracting...');
        setStatus('Re-extracting assets...');
        // Pass empty string to signal "use stored ROM"
        const storedRomPath = await window.api.getUserDataPath() + '/assets/zelda3.sfc';
        const result = await window.api.extractAssets(storedRomPath);
        if (!result.success) {
          setStatus(`Extraction failed: ${result.error}`);
          return;
        }
      }

      // Load the freshly extracted assets
      setStatus('Loading assets...');
      const buffer = await window.api.loadAssets();
      if (buffer) {
        log.app(`Loaded extracted assets (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
        setAssetData(new Uint8Array(buffer));
        setStatus('');
      } else {
        setStatus('Failed to load assets after extraction');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`ROM loading failed: ${msg}`);
      setStatus('Error: ' + msg);
    }
  }, []);

  return (
    <div className="app">
      <TitleBar onLoadRom={handleLoadRom} />
      <main className="app-main">
        <GameCanvas assetData={assetData} status={status} />
      </main>
      <LogOverlay />
    </div>
  );
}
