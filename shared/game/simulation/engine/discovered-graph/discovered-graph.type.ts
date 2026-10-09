/* @layer shared-game @kind types */
import type { SimExit } from '../../types';

type DiscoveredGraph = Map<string, SimExit[]>;

type OverworldWorld = 'light' | 'dark';

export type { DiscoveredGraph, OverworldWorld };
