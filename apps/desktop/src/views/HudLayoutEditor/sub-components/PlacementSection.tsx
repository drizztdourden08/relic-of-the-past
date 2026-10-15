/* @layer renderer-components @kind component */
import { Box, Field, Select } from '@drizztdourden08/tessera/primitives';
import { CellPicker } from './CellPicker';
import { DisabledReason } from './DisabledReason';
import { OffsetField } from './OffsetField';
import type { HudAlignSelf, HudContainer } from '@rotp/hud';
import { FLEX_STANDIN, OPTIONS } from './PlacementSection.constants';
import type { PlacementSectionProps } from './PlacementSection.type';

const engineOf = (parent: HudContainer): string =>
  (parent.layout === 'grid' ? 'grid' : `flex ${parent.direction}`);

const reasonOf = (parent: HudContainer | null): string =>
  (parent
    ? `This parent is a ${engineOf(parent)}. Switch it to grid to place by cell.`
    : 'The screen is the whole view; it sits in nothing.');

const PlacementSection = (props: PlacementSectionProps) => {
  const { node, parent, onSelectNode, onPatch } = props;
  const isGrid = parent?.layout === 'grid';
  const openParent = parent && onSelectNode ? () => onSelectNode(parent.id) : undefined;

  return (
    <Box className="hud-inspect__group">
      <OffsetField
        value={node.margin}
        onChange={(margin) => onPatch({ margin })}
        from="where the parent puts it"
      />

      <DisabledReason
        active={!isGrid}
        reason={reasonOf(parent)}
        actionLabel={openParent ? "Open the parent's Layout" : undefined}
        onAction={openParent}
      >
        <CellPicker
          container={isGrid ? (parent) : FLEX_STANDIN}
          childId={node.id}
          place={node.place}
          onChange={(place) => onPatch({ place })}
        />
      </DisabledReason>

      <Box className="hud-inspect__row">
        <Field size="sm" label={isGrid ? 'align down' : 'align self'} className="hud-inspect__extent">
          <Select
            size="sm"
            value={node.alignSelf ?? ''}
            placeholder="parent default"
            options={OPTIONS}
            onChange={(v) => onPatch({ alignSelf: (v || undefined) as HudAlignSelf | undefined })}
          />
        </Field>
        {isGrid && (
          <Field size="sm" label="align across" className="hud-inspect__extent">
            <Select
              size="sm"
              value={node.justifySelf ?? ''}
              placeholder="follows down"
              options={OPTIONS}
              onChange={(v) => onPatch({ justifySelf: (v || undefined) as HudAlignSelf | undefined })}
            />
          </Field>
        )}
      </Box>
    </Box>
  );
};

export { PlacementSection };
