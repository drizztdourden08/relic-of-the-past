/* @layer electron-main @kind logic */
/** Tracks main-process HID report-forwarding cadence and emits a periodic summary. */

const LOG_INTERVAL_MS = 2000;

class ForwardStats {
  private lastTime = 0;
  private gapMax = 0;
  private bursts = 0;
  private count = 0;
  private logTime = 0;

  /** Record a forwarded report; returns a perf summary string when one is due, else null. */
  record(now: number): string | null {
    if (this.lastTime > 0) {
      const gap = now - this.lastTime;
      if (gap > this.gapMax) this.gapMax = gap;
      if (gap < 1) this.bursts++;
    }
    this.lastTime = now;
    this.count++;

    if (now - this.logTime > LOG_INTERVAL_MS && this.count > 0) {
      const msg = `[HID-MAIN] sent=${this.count} maxGap=${this.gapMax.toFixed(1)}ms bursts=${this.bursts}`;
      this.count = 0;
      this.gapMax = 0;
      this.bursts = 0;
      this.logTime = now;
      return msg;
    }
    return null;
  }
}

export { ForwardStats };
