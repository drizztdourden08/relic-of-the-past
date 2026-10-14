/* @layer renderer-components @kind logic */
import * as savesStore from '@app/storage/saves-store';

const screenshotUrlOf = async (profileId: string, slot: number, hasScreenshot: boolean): Promise<string | null> => {
  if (!hasScreenshot) return null;
  try {
    const b64 = await savesStore.readScreenshot(profileId, slot);
    return b64 ? `data:image/png;base64,${b64}` : null;
  } catch {
    return null;
  }
};

export { screenshotUrlOf };
