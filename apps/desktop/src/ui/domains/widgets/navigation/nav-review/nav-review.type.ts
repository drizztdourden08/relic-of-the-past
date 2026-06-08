/* @layer renderer-widgets @kind types */

type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';

interface PointReview {
  status: ReviewStatus;
  comment?: string;
  /** User-corrected requirements (overrides auto-detected) */
  correctedRequirements?: string[][];
  /** User-corrected transit type */
  correctedTransitType?: string;
}

interface ScreenReview {
  status: ReviewStatus;
  comment?: string;
  points: Record<string, PointReview>;
}

type NavReviewData = Record<string, ScreenReview>;

interface BorderBundle {
  id: string;
  direction: 'n' | 's' | 'e' | 'w';
  tiles: number[];
  requirements: string[][];
}

interface EntranceInfo {
  id: number;
  roomId: number;
  gridRow: number;
  gridCol: number;
}

interface TransitionInfo {
  entranceIdx: number;
  requirements: string[];
}

interface NavReviewPanelProps {
  locationKey: string;
  bundles: BorderBundle[];
  entrances: EntranceInfo[];
  transitions: TransitionInfo[];
  borders: {
    north: { freeTiles: number[]; itemTiles: { pos: number; requirements: string[] }[] };
    south: { freeTiles: number[]; itemTiles: { pos: number; requirements: string[] }[] };
    east: { freeTiles: number[]; itemTiles: { pos: number; requirements: string[] }[] };
    west: { freeTiles: number[]; itemTiles: { pos: number; requirements: string[] }[] };
  };
  reachableCount: number;
  totalTiles: number;
}

export type {
  ReviewStatus, PointReview, ScreenReview, NavReviewData,
  BorderBundle, EntranceInfo, TransitionInfo, NavReviewPanelProps,
};
