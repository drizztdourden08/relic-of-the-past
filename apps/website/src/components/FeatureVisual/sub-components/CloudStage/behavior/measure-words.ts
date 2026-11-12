/* @layer website-site @kind logic */
import { PROBE_PX, WRAP_SHARE } from '../CloudStage.constants';
import type { CloudMeasure, CloudSize } from '../CloudStage.type';

const probeOf = (stage: HTMLElement, word: string, width?: number): HTMLSpanElement => {
  const probe = document.createElement('span');
  probe.className = 'cloud-stage__word cloud-stage__probe';
  probe.textContent = word;
  probe.style.fontSize = `${PROBE_PX}px`;
  if (width !== undefined) {
    probe.style.width = `${width}px`;
    probe.style.whiteSpace = 'normal';
    probe.style.textAlign = 'center';
  }
  stage.append(probe);
  return probe;
};

const sizeOf = (probe: HTMLElement): CloudSize => {
  const box = probe.getBoundingClientRect();
  return { width: box.width / PROBE_PX, height: box.height / PROBE_PX };
};

const measureWords = (stage: HTMLElement, words: readonly string[]): Map<string, CloudMeasure> => {
  const measures = new Map<string, CloudMeasure>();

  words.forEach((word) => {
    const single = probeOf(stage, word);
    const singleSize = sizeOf(single);
    const wrapped = word.includes(' ') ? probeOf(stage, word, singleSize.width * PROBE_PX * WRAP_SHARE) : null;
    const wrappedSize = wrapped ? sizeOf(wrapped) : null;

    measures.set(word, { single: singleSize, wrapped: wrappedSize && wrappedSize.height > singleSize.height * 1.4 ? wrappedSize : null });
    single.remove();
    wrapped?.remove();
  });
  return measures;
};

export { measureWords };
