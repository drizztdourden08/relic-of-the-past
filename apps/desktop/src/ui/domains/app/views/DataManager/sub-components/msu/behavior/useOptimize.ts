/* @layer renderer-components @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useCallback, useEffect, useState } from 'react';
import type { OptimizeAnalysis, OptimizeProgress, OptimizeRunResult } from '@shared/types/msu-optimize';
import { useFfmpegInstall } from '@app/hooks/useFfmpegInstall';
import type { OptimizeParams, OptimizeStep } from './useOptimize.type';

const messageOf = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

const convertibleNames = (analysis: OptimizeAnalysis | null): string[] =>
  (analysis?.candidates ?? []).filter((row) => row.excludedBecause === null).map((row) => row.name);

const useOptimize = (params: OptimizeParams) => {
  const { pack, open, onRunSettled } = params;
  const tool = useFfmpegInstall(open);
  const [step, setStep] = useState<OptimizeStep>('checking');
  const [analysis, setAnalysis] = useState<OptimizeAnalysis | null>(null);
  const [progress, setProgress] = useState<OptimizeProgress | null>(null);
  const [result, setResult] = useState<OptimizeRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) return;
    setStep('checking');
    setAnalysis(null);
    setProgress(null);
    setResult(null);
    setError(null);
  }, [open]);

  useEffect(() => (open ? appApi().onMsuOptimizeProgress(setProgress) : undefined), [open]);

  const measure = useCallback(async (): Promise<void> => {
    setStep('measuring');
    setProgress(null);
    setError(null);
    try {
      setAnalysis(await appApi().analyzeMsuOptimize(pack));
      setStep('preview');
    } catch (err) {
      setError(messageOf(err, 'Could not measure this pack.'));
      setStep('error');
    }
  }, [pack]);

  useEffect(() => {
    if (!open || tool.state === null) return;
    if (step !== 'checking' && step !== 'tool') return;
    if (tool.state.status === 'ready') void measure();
    else if (step === 'checking') setStep('tool');
  }, [open, step, tool.state, measure]);

  const convert = useCallback(async (): Promise<void> => {
    const names = convertibleNames(analysis);
    if (names.length === 0) return;
    setStep('converting');
    setProgress(null);
    setError(null);
    try {
      setResult(await appApi().runMsuOptimize(pack, names));
      setStep('result');
    } catch (err) {
      setError(messageOf(err, 'Could not convert this pack.'));
      setStep('error');
    } finally {
      onRunSettled();
    }
  }, [analysis, pack, onRunSettled]);

  return {
    step,
    tool,
    analysis,
    progress,
    result,
    error,
    convertibleCount: convertibleNames(analysis).length,
    convert,
    retry: measure,
  };
};

export { useOptimize };
