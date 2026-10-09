/* @layer tests @kind helper */
import { vi } from 'vitest';

const stubViewStateWindow = (): void => {
  vi.stubGlobal('window', {
    api: { uiViews: { load: vi.fn().mockResolvedValue({}), save: vi.fn().mockResolvedValue(undefined) } },
    addEventListener: () => {},
    removeEventListener: () => {},
  });
};

export { stubViewStateWindow };
