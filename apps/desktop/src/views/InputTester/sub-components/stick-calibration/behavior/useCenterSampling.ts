/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CENTER_SAMPLE_FRAMES, STICK_CENTERED } from '../stick-calibration.constants';
import type { Step, StickQuad, StickSamples } from '../stick-calibration.type';

const emptySamples = (): StickSamples => ({ lx: [], ly: [], rx: [], ry: [] });

const average = (values: readonly number[]): number => Math.round(values.reduce((a, b) => a + b, 0) / values.length);

const useCenterSampling = (step: Step, raw: StickQuad) => {
  const samplesRef = useRef<StickSamples>(emptySamples());
  const [centerDone, setCenterDone] = useState(false);
  const [centerProgress, setCenterProgress] = useState(0);
  const [centerValues, setCenterValues] = useState<StickQuad>(STICK_CENTERED);

  const startCenter = useCallback(() => {
    samplesRef.current = emptySamples();
    setCenterDone(false);
    setCenterProgress(0);
  }, []);

  useEffect(() => {
    if (step !== 'center' || centerDone) return;
    const s = samplesRef.current;
    s.lx.push(raw.lx); s.ly.push(raw.ly); s.rx.push(raw.rx); s.ry.push(raw.ry);
    const count = s.lx.length;
    setCenterProgress(Math.min(count / CENTER_SAMPLE_FRAMES, 1));
    if (count >= CENTER_SAMPLE_FRAMES) {
      setCenterValues({ lx: average(s.lx), ly: average(s.ly), rx: average(s.rx), ry: average(s.ry) });
      setCenterDone(true);
    }
  }, [step, centerDone, raw]);

  return { centerDone, centerProgress, centerValues, startCenter };
};

export { useCenterSampling };
