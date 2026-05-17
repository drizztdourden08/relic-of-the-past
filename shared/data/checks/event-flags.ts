/**
 * Event Check Completion Flags — defines how progression events are detected
 * from the WasmGetProgressFlags() buffer.
 *
 * Unlike NPC flags (bitmask checks), events use threshold comparisons
 * on the progress buffer values.
 *
 * Buffer layout:
 *   [0]  = sram_progress_indicator: 0=intro, 1=post-uncle, 2=rescued-zelda, 3=post-escape
 *   [12] = player_sleep_in_bed_state: 0=asleep, 1=uncle woke Link, 2=Link out of bed
 */

export interface EventFlagEntry {
  /** Index into the progress buffer */
  bufferIndex: number;
  /** Comparison type */
  compare: 'gte' | 'eq' | 'any-of';
  /** Value(s) to compare against */
  value: number | number[];
}

export const CHECK_EVENT_FLAGS: Record<string, EventFlagEntry> = {
  // Link wakes up = player_sleep_in_bed_state >= 2 (got out of bed)
  // NOTE: For loaded saves past uncle, progressToEvents also fires 'Link Wakes Up'
  // via sram_progress_indicator >= 1, but for the CHECK completion we use the bed state.
  // The bridge also checks sram_progress_indicator >= 1 as fallback (index 0).
  'event-link-wakes-up': {
    bufferIndex: 12,
    compare: 'gte',
    value: 2,
  },

  // Zelda Rescue Started = progress_indicator >= 1 (Uncle gave sword)
  'event-zelda-rescue': {
    bufferIndex: 0,
    compare: 'gte',
    value: 1,
  },

  // Rescued Zelda = progress_indicator >= 2 (reached Sanctuary)
  'event-rescued-zelda': {
    bufferIndex: 0,
    compare: 'gte',
    value: 2,
  },
};
