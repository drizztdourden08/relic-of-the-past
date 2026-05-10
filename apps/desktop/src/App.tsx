import { useState, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { GameCanvas } from './components/GameCanvas';
import { LogOverlay } from './components/LogOverlay';
import { log } from './lib/log-bus';

export function App(): JSX.Element {
  const [assetData, setAssetData] = useState<Uint8Array | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleLoadRom = useCallback(async () => {
    try {
      // First check if we already have extracted assets
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

      // Open ROM file picker
      log.app('Opening ROM file dialog...');
      const romPath = await window.api.openRomDialog();
      if (!romPath) {
        log.app('ROM dialog cancelled');
        return;
      }

      log.app(`Selected: ${romPath}`);
      setStatus('Reading ROM...');
      const romBuffer = await window.api.readFile(romPath);
      const romData = new Uint8Array(romBuffer);

      // For now, we look for zelda3_assets.dat alongside the ROM
      // or in the same directory. The asset extraction pipeline
      // (restool.py) is a separate step the user runs once.
      // We'll check for a .dat file next to the ROM.
      const assetsPath = romPath.replace(/\.(sfc|smc)$/i, '_assets.dat');
      try {
        log.app(`Looking for assets at: ${assetsPath}`);
        const assetsBuffer = await window.api.readFile(assetsPath);
        const data = new Uint8Array(assetsBuffer);
        log.app(`Found assets file (${(data.byteLength / 1024).toFixed(0)} KB), caching...`);
        await window.api.saveAssets(data.buffer);
        setAssetData(data);
        // Save ROM path to settings
        const settings = await window.api.loadSettings();
        settings.romPath = romPath;
        await window.api.saveSettings(settings);
        setStatus('');
        return;
      } catch {
        log.app('No _assets.dat found next to ROM, trying ROM as assets...');
      }

      // Try loading the file as-is (it might be zelda3_assets.dat renamed)
      // Check the signature
      if (romData.length > 100) {
        // Cache and try
        await window.api.saveAssets(romData.buffer);
        setAssetData(romData);
        const settings = await window.api.loadSettings();
        settings.romPath = romPath;
        await window.api.saveSettings(settings);
        setStatus('');
      } else {
        setStatus('Could not load assets. Run restool.py to extract zelda3_assets.dat from your ROM.');
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
