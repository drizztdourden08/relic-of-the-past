/* @layer renderer-components @kind hook */
/**
 * Step navigation for the diagnostics wizard: which steps are visible for the
 * selected controller, where the run currently sits in them, and how it moves.
 * The visible list is derived per run instead of fixed, since a controller
 * with no byte capability drops that step entirely (see wizard-steps.ts), so
 * neither the indicator nor Next/Back may assume a static order.
 */
import { useCallback, useMemo } from 'react';
import { visibleSteps } from './wizard-steps';
import type { WizardStep } from './wizard-steps';

interface UseWizardNavigationProps {
  hasByteCapability: boolean;
  step: WizardStep;
  setStep: (step: WizardStep) => void;
}

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
