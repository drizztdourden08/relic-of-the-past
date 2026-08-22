/* @layer renderer-components @kind component */
/**
 * How close a laid-out box is to the row limit the engine actually enforces.
 * The engine never wraps or clamps an overrun row — it just draws past the
 * interior into the next row's tiles — so this reads as a hard pass/fail
 * meter, not a soft progress bar: comfortable, near the limit, or corrupted.
 *
 * Full mode draws one bar per row for a translator editing a single box.
 * Compact mode collapses that into one chip for a card header, where a bar
 * per row would be too much chrome — "fits", or which row overflows and by
 * how much.
 *
 * Presentational only: takes the already-measured `RowFit[]` and renders it.
 */
import { useMemo } from 'react';
import { Box, Text, Badge, ProgressBar } from '@ds/primitives';
import type { ProgressVariant } from '@ds/primitives';
import { ROW_WIDTH_PX } from '@shared/game/language/layout/types';
import type { RowFit } from '@shared/game/language/layout/types';
import './FitMeter.css';

type FitMeterProps = {
  rows: RowFit[];
  /** One-line summary for a card header instead of a bar per row. */
  compact?: boolean;
};

type FitState = 'comfortable' | 'near' | 'over';

/** A row reads as "near" once it has used this fraction of the interior. */
const NEAR_LIMIT_RATIO = 0.9;

const PROGRESS_VARIANT_BY_STATE: Record<FitState, ProgressVariant> = {
  comfortable: 'green',
  near: 'gold',
  over: 'danger',
};

/** Badge only ever needs these three of its four variants here. */
const BADGE_VARIANT_BY_STATE: Record<FitState, 'success' | 'warning' | 'danger'> = {
  comfortable: 'success',
  near: 'warning',
  over: 'danger',
};

const stateOf = (row: RowFit): FitState => {
  if (row.overflow) return 'over';
  if (row.widthPx / ROW_WIDTH_PX >= NEAR_LIMIT_RATIO) return 'near';
  return 'comfortable';
};

/** The row using the most of the interior, overflow first since an overrun
 * row's own widthPx already exceeds every non-overflow row's. */
const worstRow = (rows: RowFit[]): RowFit =>
  rows.reduce((worst, row) => (row.widthPx > worst.widthPx ? row : worst), rows[0]);

const remainingLabel = (row: RowFit): string => {
  const remaining = ROW_WIDTH_PX - row.widthPx;
  return remaining >= 0 ? `${remaining} px left` : `${Math.abs(remaining)} px over`;
};

const FitMeterCompact = (props: { rows: RowFit[] }) => {
  const { rows } = props;
  const worst = useMemo(() => worstRow(rows), [rows]);
  const state = stateOf(worst);
  const overflowing = rows.find((row) => row.overflow);
  const label = overflowing ? `line ${overflowing.row} overflows` : 'fits';
  const detail = `${worst.widthPx} / ${ROW_WIDTH_PX} px · ${remainingLabel(worst)}`;

  return (
    <Box className="fit-meter fit-meter--compact" title={detail}>
      <Badge variant={BADGE_VARIANT_BY_STATE[state]} className="fit-meter__chip">
        {label}
      </Badge>
      <Text as="span" variant="caption" className="fit-meter__detail">{detail}</Text>
    </Box>
  );
};

const FitMeterRow = (props: { row: RowFit }) => {
  const { row } = props;
  const state = stateOf(row);
  const barValue = Math.min(row.widthPx, ROW_WIDTH_PX);
  const rowClassName = `fit-meter__row fit-meter__row--${state}`;

  return (
    <Box className={rowClassName}>
      <Text as="span" variant="caption" className="fit-meter__label">{`Row ${row.row}`}</Text>
      <ProgressBar
        value={barValue}
        max={ROW_WIDTH_PX}
        variant={PROGRESS_VARIANT_BY_STATE[state]}
        className="fit-meter__bar"
      />
      <Text as="span" variant="caption" className="fit-meter__numbers">
        {`${row.widthPx} / ${ROW_WIDTH_PX} px`}
      </Text>
      <Text as="span" variant="caption" className="fit-meter__remaining">
        {remainingLabel(row)}
      </Text>
      {row.overflow ? (
        <Badge variant="danger" className="fit-meter__overflow-badge">overflow</Badge>
      ) : null}
    </Box>
  );
};

const FitMeter = (props: FitMeterProps) => {
  const { rows, compact = false } = props;

  if (rows.length === 0) return null;
  if (compact) return <FitMeterCompact rows={rows} />;

  return (
    <Box className="fit-meter">
      {rows.map((row) => <FitMeterRow key={row.row} row={row} />)}
    </Box>
  );
};

export { FitMeter };
export type { FitMeterProps };
