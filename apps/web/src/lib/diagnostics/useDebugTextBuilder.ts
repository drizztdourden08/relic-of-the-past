/* @layer renderer-lib @kind hook */
import { useCallback } from 'react';
import { usePlatform } from '@app/platform';
import { useAppVersion } from '@app/hooks/useAppVersion';
import { buildDebugText } from './format/debug-text';
import { collectRendererDiagnostics } from './collect-renderer';
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { DebugTextBuilder } from './useDebugTextBuilder.type';
import { HOST_LABEL, OS_LABEL } from './useDebugTextBuilder.constants';

declare const __CAP_VERSION__: string | undefined;

const capacitorVersion = (): string | null =>
  typeof __CAP_VERSION__ === 'string' && __CAP_VERSION__ ? __CAP_VERSION__ : null;

const fetchSystem = async (): Promise<SystemDiagnostics | null> => {
  try {
    return (await window.api?.getSystemDiagnostics?.()) ?? null;
  } catch {
    return null;
  }
};

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
  const engine = chromium ? `Chromium ${chromium}` : '-';
  const osLabel = OS_LABEL[info.os];

  const buildText = useCallback(async (): Promise<string> => {
    const [system, renderer] = await Promise.all([fetchSystem(), collectRendererDiagnostics()]);
    return buildDebugText({
      header: [
        'Relic of the Past - debug info',
        `Version: ${version || '-'}`,
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
