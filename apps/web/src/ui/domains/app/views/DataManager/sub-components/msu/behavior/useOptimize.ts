/* @layer renderer-components @kind hook */
/**
 * Get the tool, measure, show the numbers, convert. Measuring runs on its own once the tool is
 * available and nothing is written until the numbers are accepted.
 *
 * The pack is re-read the moment a run SETTLES (success or failure), not when the dialog closes:
 * the run rewrites the manifest as it goes, and an edit saved from the stale copy would write the
 * old references back over the new ones.
 */
import { useCallback, useEffect, useState } from 'react';
import type { OptimizeAnalysis, OptimizeProgress, OptimizeRunResult } from '@shared/types/msu-optimize';
import { useFfmpegInstall } from './useFfmpegInstall';

/** Where the flow is. `tool` covers both offering the download and watching it arrive. */
type OptimizeStep = 'checking' | 'tool' | 'measuring' | 'preview' | 'converting' | 'result' | 'error';

interface OptimizeParams {
  pack: string;
  /** False tears the flow back down, so re-opening starts from the tool check again. */
  open: boolean;
  /** Fired once a run has settled, success or failure, so the pack's files and manifest are re-read. */
  onRunSettled: () => void;
}

const messageOf = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

/** The candidates a run would actually touch. An unreadable file is not one of them. */
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

  useEffect(() => (open ? window.api.onMsuOptimizeProgress(setProgress) : undefined), [open]);

  const measure = useCallback(async (): Promise<void> => {
    setStep('measuring');
    setProgress(null);
    setError(null);
    try {
      setAnalysis(await window.api.analyzeMsuOptimize(pack));
      setStep('preview');
    } catch (err) {
      setError(messageOf(err, 'Could not measure this pack.'));
      setStep('error');
    }
  }, [pack]);

  // Runs when the tool becomes available, whether it was already installed or has just been
  // fetched. Measuring moves the step on, so this cannot re-trigger itself.
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
      setResult(await window.api.runMsuOptimize(pack, names));
      setStep('result');
    } catch (err) {
      setError(messageOf(err, 'Could not convert this pack.'));
      setStep('error');
    } finally {
      // A failed run may still have converted part of the pack, so the re-read is unconditional.
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
export type { OptimizeParams, OptimizeStep };
