/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { usePadState } from '@drizztdourden08/brock-input/renderer';
import { ControllerLayout } from '@drizztdourden08/tessera/composites';
import { Image } from '@drizztdourden08/tessera/primitives';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { buildControllerSlots } from '@app/input/controller-families/build-controller-slots';
import { FAMILY_LAYOUTS } from '@app/input/controller-families/controller-families.constants';
import { layoutFamilyOf } from '@app/input/controller-families/layout-family-of';
import type { ControllerSilhouetteProps } from './ControllerSilhouette.type';

const ControllerSilhouette = ({ deviceKey, controls, family, label }: ControllerSilhouetteProps) => {
  const pad = usePadState(deviceKey);
  const positions = useMemo(() => new Set<string>(controls.map((control) => control.position)), [controls]);
  const layout = FAMILY_LAYOUTS[layoutFamilyOf(family, positions)];

  const glyphOf = useCallback((iconId: string) => {
    const url = getButtonIconUrl(iconId);
    return url === null ? undefined : <Image src={url} alt="" draggable={false} fit="contain" />;
  }, []);
  const slots = useMemo(
    () => buildControllerSlots(pad, layout, positions, glyphOf),
    [pad, layout, positions, glyphOf],
  );

  return <ControllerLayout variant={layout.variant} slots={slots} extras={pad.extras} label={label} />;
};

export { ControllerSilhouette };
