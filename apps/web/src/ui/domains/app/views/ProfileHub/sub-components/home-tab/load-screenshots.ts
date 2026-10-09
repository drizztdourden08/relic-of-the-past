/* @layer renderer-components @kind logic */
const loadScreenshots = async (
  saves: readonly { id: string; hasScreenshot?: boolean }[],
  read: (id: string) => Promise<string | null | undefined>,
): Promise<Record<string, string>> => {
  const screenshots: Record<string, string> = {};
  for (const save of saves) {
    if (!save.hasScreenshot) continue;
    try {
      const b64 = await read(save.id);
      if (b64) screenshots[save.id] = `data:image/png;base64,${b64}`;
    } catch {
      continue;
    }
  }
  return screenshots;
};

export { loadScreenshots };
