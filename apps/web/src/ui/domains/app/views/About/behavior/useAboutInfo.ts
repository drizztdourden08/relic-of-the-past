/* @layer renderer-components @kind hook */
import { usePlatform } from '@app/platform';
import { useAppVersion } from '@app/hooks/useAppVersion';
import type { OsKind, HostShell } from '@shared/platform';

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

/** The About page's spec rows — sourced from the platform facade, not the user agent. */
const useAboutInfo = (): AboutRow[] => {
  const { info } = usePlatform();
  const version = useAppVersion();

  const electron = navigator.userAgent.match(/Electron\/([\d.]+)/)?.[1];
  const chromium = navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1];
  const runtime = info.host === 'electron' && electron ? `Electron ${electron}` : HOST_LABEL[info.host];

  return [
    { label: 'Version', value: version || '—' },
    { label: 'Runtime', value: runtime },
    { label: 'Engine', value: chromium ? `Chromium ${chromium}` : '—' },
    { label: 'Platform', value: OS_LABEL[info.os] },
  ];
};

export { useAboutInfo };
export type { AboutRow };
