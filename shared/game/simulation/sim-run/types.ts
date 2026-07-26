/* @layer shared-game @kind types */
/**
 * Types for the headless sim-run automation (`--sim-run`): the config the CLI
 * flag parses into, and the report the run writes for the data-correction loop.
 */
import type { SimOutcome, DatasetSuggestion } from '../types';

/** Parsed from the `--sim-run=...` CLI flag. */
interface SimRunConfig {
  /** 0-based save-state slot to load before running (null = current state). */
  startSlot: number | null;
  /** Stop early once this screen is reached (null = run to outcome). */
  target: string | null;
  /** Halt right after this check triggers (engine SimConfig.stopAtCheckId). */
  stopAtCheckId: string | null;
  /** Hard step cap so a stuck run always terminates. */
  maxSteps: number;
  /** Diagnostic: flood this overworld screen addressably and report its numbers, then exit. */
  floodScreen: number | null;
  /** Diagnostic: report this ROOM's entrance seeds, exit-table entry and detected
   *  exits, then exit — the indoor counterpart of `floodScreen`, for finding out
   *  why a room reads as a dead end. */
  probeRoom: number | null;
  /** Extra traversal items for the `floodScreen` diagnostic (comma separated). */
  probeItems: string[] | null;
  /** Optional entry tile for `probeRoom`, as the flood's start position. */
  probeTile: { row: number; col: number } | null;
  /** Max distinct screens the game-driven flood visits before ending (null = unlimited). */
  screenWalkLimit: number | null;
}

/** A dataset edge from a reached screen to a screen the run never reached. */
interface BoundaryEdge {
  from: string;
  to: string;
  tags: string[];
}

/** Written to debug-output/sim-run.json for the in-chat correction loop to read. */
interface SimRunReport {
  outcome: SimOutcome | null;
  /** True when `target` was reached before the run ended. */
  reachedTarget: boolean;
  startSlot: number | null;
  target: string | null;
  steps: number;
  /** Logical screens the flood reached this run. */
  reachedScreens: string[];
  /** Real checks verified (triggered + flag-confirmed) this run. */
  verifiedChecks: string[];
  /** Edges leaving the reached set — where traversal stopped (gates / bad edges). */
  boundaryEdges: BoundaryEdge[];
  /** Recorder-derived, ready-to-write corrections (traversed-but-unmapped, etc.). */
  suggestions: DatasetSuggestion[];
}

export type { SimRunConfig, SimRunReport, BoundaryEdge };
