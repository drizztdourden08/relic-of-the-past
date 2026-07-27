/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { usePlatform } from '@app/platform';
import { useAppVersion } from '@app/hooks/useAppVersion';
import { buildDebugText, collectRendererDiagnostics } from '@app/lib/diagnostics';
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { OsKind, HostShell } from '@shared/platform';

// Injected at build time (apps/web/vite.config.ts) for the Capacitor build; absent
// elsewhere, so always read via typeof.
declare const __CAP_VERSION__: string | undefined;

interface AboutRow {
  label: string;
  value: string;
}

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

/** About page rows (for display) + a debug-info string builder (for the Copy button),
 *  both sourced from the platform facade rather than the user agent. */
const useAboutInfo = (): { rows: AboutRow[]; buildDebugText: () => Promise<string> } => {
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

  const rows: AboutRow[] = [
    { label: 'Version', value: version || '—' },
    { label: 'Runtime', value: runtime },
    { label: 'Engine', value: engine },
    { label: 'Platform', value: OS_LABEL[info.os] },
  ];

  const buildText = useCallback(async (): Promise<string> => {
    const [system, renderer] = await Promise.all([fetchSystem(), collectRendererDiagnostics()]);
    return buildDebugText({
      header: [
        'Relic of the Past — debug info',
        `Version: ${version || '—'}`,
        `Runtime: ${runtime}`,
        `Engine: ${engine}`,
        `Platform: ${OS_LABEL[info.os]} (host: ${info.host}, os: ${info.os})`,
        `Form factor: ${info.formFactor} · Input: ${info.input} · Dev: ${info.isDev}`,
      ],
      system,
      renderer,
      userAgent: navigator.userAgent,
    });
  }, [version, runtime, engine, info]);

  return { rows, buildDebugText: buildText };
};

export { useAboutInfo };
export type { AboutRow };
