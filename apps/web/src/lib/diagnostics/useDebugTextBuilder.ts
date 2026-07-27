/* @layer renderer-lib @kind hook */
import { useCallback } from 'react';
import { usePlatform } from '@app/platform';
import { useAppVersion } from '@app/hooks/useAppVersion';
import { buildDebugText } from './format/debug-text';
import { collectRendererDiagnostics } from './collect-renderer';
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { OsKind, HostShell } from '@shared/platform';

// Injected at build time (apps/web/vite.config.ts) for the Capacitor build; absent
// elsewhere, so always read via typeof.
declare const __CAP_VERSION__: string | undefined;

const HOST_LABEL: Record<HostShell, string> = {
  electron: 'Electron',
  capacitor: 'Capacitor',
  web: 'Web',
};

const OS_LABEL: Record<OsKind, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
  unknown: 'Unknown',
};

const capacitorVersion = (): string | null =>
  typeof __CAP_VERSION__ === 'string' && __CAP_VERSION__ ? __CAP_VERSION__ : null;

// Host hardware only exists behind a main process; the web and mobile builds report
// what the renderer can see on its own.
const fetchSystem = async (): Promise<SystemDiagnostics | null> => {
  try {
    return (await window.api?.getSystemDiagnostics?.()) ?? null;
  } catch {
    return null;
  }
};

interface DebugTextBuilder {
  buildDebugText: () => Promise<string>;
  version: string;
  runtime: string;
  engine: string;
  osLabel: string;
}

/** The same debug-info builder backs the About page's "Copy debug info" button and the
 *  bug-report form's auto-attached debug block — one source, sourced from the platform
 *  facade rather than the user agent. */
const useDebugTextBuilder = (): DebugTextBuilder => {
  const { info } = usePlatform();
  const version = useAppVersion();

  const electron = navigator.userAgent.match(/Electron\/([\d.]+)/)?.[1];
  const chromium = navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1];
  const cap = capacitorVersion();
  const runtime =
    info.host === 'electron' && electron ? `Electron ${electron}`
    : info.host === 'capacitor' ? `Capacitor${cap ? ` ${cap}` : ''}`
    : HOST_LABEL[info.host];
  const engine = chromium ? `Chromium ${chromium}` : '—';
  const osLabel = OS_LABEL[info.os];

  const buildText = useCallback(async (): Promise<string> => {
    const [system, renderer] = await Promise.all([fetchSystem(), collectRendererDiagnostics()]);
    return buildDebugText({
      header: [
        'Relic of the Past — debug info',
        `Version: ${version || '—'}`,
        `Runtime: ${runtime}`,
        `Engine: ${engine}`,
        `Platform: ${osLabel} (host: ${info.host}, os: ${info.os})`,
        `Form factor: ${info.formFactor} · Input: ${info.input} · Dev: ${info.isDev}`,
      ],
      system,
      renderer,
      userAgent: navigator.userAgent,
    });
  }, [version, runtime, engine, osLabel, info]);

  return { buildDebugText: buildText, version, runtime, engine, osLabel };
};

export { useDebugTextBuilder };
