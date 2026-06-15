/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { usePlatform } from '@app/platform';
import { useAppVersion } from '@app/hooks/useAppVersion';
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

// Best-effort GPU string via WebGL's debug-renderer extension.
const readGpu = (): string => {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return '—';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return String(renderer);
  } catch {
    return '—';
  }
};

/** About page rows (for display) + a debug-info string builder (for the Copy button),
 *  both sourced from the platform facade rather than the user agent. */
const useAboutInfo = (): { rows: AboutRow[]; buildDebugText: () => string } => {
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

  const buildDebugText = useCallback((): string => [
    'Relic of the Past — debug info',
    `Version: ${version || '—'}`,
    `Runtime: ${runtime}`,
    `Engine: ${engine}`,
    `Platform: ${OS_LABEL[info.os]} (host: ${info.host}, os: ${info.os})`,
    `Form factor: ${info.formFactor} · Input: ${info.input} · Dev: ${info.isDev}`,
    `Screen: ${window.screen.width}×${window.screen.height} @ ${window.devicePixelRatio}x`,
    `Viewport: ${window.innerWidth}×${window.innerHeight}`,
    `GPU: ${readGpu()}`,
    `User agent: ${navigator.userAgent}`,
  ].join('\n'), [version, runtime, engine, info]);

  return { rows, buildDebugText };
};

export { useAboutInfo };
export type { AboutRow };
