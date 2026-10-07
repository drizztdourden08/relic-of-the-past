/* @layer renderer-components @kind component */
/**
 * A formula inside a `repeat` produces N values, not one. Twenty cells, one per
 * instance, with the reading in a line beneath: at life 112/160 the strip IS
 * the meaning of the formula. It reads fourteen full hearts and six empty, and it is
 * the cheapest possible check that a slice formula is right.
 *
 * NOT A TABLE. Twenty instances with a labelled value each is twenty rows or a
 * twenty-column table; neither fits a 232 px rail. The strip does, and it reads
 * faster: the shape of the run is the answer, not any one number in it.
 *
 * IT CAPS AT `MAX_CELLS` AND SAYS SO. A repeat's count is a `Value` and can
 * resolve to hundreds; drawing them all would push the panel wide and tell
 * nobody anything the first twenty did not.
 */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { resolveValue } from '@shared/hud/data';
import type { Scope } from '../../../behavior/formula-scope';

interface InstanceStripProps {
  expr: string;
  instances: readonly Scope[];
  /** Which instance the stage is previewing, outlined in the strip. */
  previewIndex?: number;
}

const MAX_CELLS = 20;

/** A gate reads back as 1/0, so "true on 3 of 20" is the honest summary; a
 *  measurement reads back as a spread, so its own two ends are. */
const summarise = (values: readonly number[]): string => {
  const booleanish = values.every((v) => v === 0 || v === 1);
  if (booleanish) return `true on ${values.filter((v) => v === 1).length} of ${values.length}`;
  const full = values.filter((v) => v >= 1).length;
  const empty = values.filter((v) => v <= 0).length;
  if (full + empty === values.length) return `${full} full · ${empty} empty`;
  return `${Math.min(...values)} ... ${Math.max(...values)}`;
};

const InstanceStrip = (props: InstanceStripProps) => {
  const { expr, instances, previewIndex = 0 } = props;
  if (instances.length === 0) return null;

  const shown = instances.slice(0, MAX_CELLS);
  const values = shown.map((scope) => resolveValue({ from: 'data', expr }, scope));
  const over = instances.length - shown.length;

  return (
    <Box className="hud-instance-strip">
      <Box className="hud-instance-strip__cells" aria-label={`Result across ${instances.length} instances`}>
        {values.map((value, index) => (
          <Text
            key={index}
            className={`hud-instance-strip__cell${index === previewIndex ? ' is-preview' : ''}`}
            data-on={value > 0 ? 'true' : undefined}
            title={`#${index + 1} → ${value}`}
          />
        ))}
      </Box>
      <Text className="hud-instance-strip__read">
        {summarise(values)}{over > 0 ? ` · first ${MAX_CELLS} of ${instances.length}` : ''}
      </Text>
    </Box>
  );
};

export { InstanceStrip, MAX_CELLS };
export type { InstanceStripProps };
