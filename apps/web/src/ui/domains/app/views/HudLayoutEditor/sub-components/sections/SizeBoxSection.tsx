/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { BoxModelField } from '../BoxModelField';
import { DisabledReason } from '../DisabledReason';
import { ExtentField } from '../ExtentField';
import { MinMaxField } from '../MinMaxField';
import { ValueInput } from '../ValueInput';
import { extentText } from '../../behavior/extent-text';
import type { Extent } from '@shared/types/hud';
import { SCREEN_REASON } from './SizeBoxSection.constants';
import type { SizeBoxSectionProps } from './SizeBoxSection.type';

const SizeBoxSection = (props: SizeBoxSectionProps) => {
  const { node, onPatch, scope, insideRepeat, isScreen = false } = props;

  const setSize = (axis: 'w' | 'h', next: Extent | undefined): void => {
    const size = { ...node.size, [axis]: next };
    if (size.w === undefined) delete size.w;
    if (size.h === undefined) delete size.h;
    onPatch({ size: size.w === undefined && size.h === undefined ? undefined : size });
  };

  return (
    <Box className="hud-inspect__group">
      <DisabledReason active={isScreen} reason={SCREEN_REASON}>
        <Box className="hud-inspect__group">
          <Box className="hud-inspect__row">
            <ExtentField label="w" value={node.size?.w} onChange={(next) => setSize('w', next)} />
            <ExtentField label="h" value={node.size?.h} onChange={(next) => setSize('h', next)} />
          </Box>
          <MinMaxField
            min={node.min}
            max={node.max}
            onMin={(min) => onPatch({ min })}
            onMax={(max) => onPatch({ max })}
            scope={scope}
            insideRepeat={insideRepeat}
          />
        </Box>
      </DisabledReason>

      <BoxModelField
        margin={node.margin}
        padding={node.padding}
        marginLocked={isScreen}
        centre={`${extentText(node.size?.w)} × ${extentText(node.size?.h)}`}
        onMargin={(margin) => onPatch({ margin })}
        onPadding={(padding) => onPatch({ padding })}
      />

      <ValueInput
        label="scale"
        value={node.scale ?? 1}
        readOnly={isScreen}
        derivedFrom={isScreen ? SCREEN_REASON : undefined}
        onChange={(scale) => onPatch({ scale: scale === 1 ? undefined : scale })}
        scope={scope}
        insideRepeat={insideRepeat}
        role="number"
        min={0.1}
        step={0.05}
      />
    </Box>
  );
};

export { SizeBoxSection };
export type { SizeBoxSectionProps } from './SizeBoxSection.type';
