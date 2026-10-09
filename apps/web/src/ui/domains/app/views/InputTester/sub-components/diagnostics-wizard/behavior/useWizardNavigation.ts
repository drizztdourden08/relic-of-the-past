/* @layer renderer-components @kind hook */
import { useCallback, useMemo } from 'react';
import { visibleSteps } from './wizard-steps';
import type { UseWizardNavigationProps } from '../diagnostics-wizard.type';

const useWizardNavigation = (props: UseWizardNavigationProps) => {
  const { hasByteCapability, step, setStep } = props;

  const steps = useMemo(() => visibleSteps(hasByteCapability), [hasByteCapability]);
  const stepIndex = steps.findIndex((s) => s.step === step);
  const stepLabels = useMemo(() => steps.map((s) => s.label), [steps]);

  const goNext = useCallback(() => {
    const next = steps[steps.findIndex((s) => s.step === step) + 1];
    if (next) setStep(next.step);
  }, [steps, step, setStep]);

  const goBack = useCallback(() => {
    const prev = steps[steps.findIndex((s) => s.step === step) - 1];
    if (prev) setStep(prev.step);
  }, [steps, step, setStep]);

  return { steps, stepIndex, stepLabels, goNext, goBack };
};

export { useWizardNavigation };
