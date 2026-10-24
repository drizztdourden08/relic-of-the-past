/* @layer renderer-components @kind logic */
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import type { ControllerPageModel } from '../ControllerPage.type';

const hex2 = (value: number): string => `0x${value.toString(16).padStart(2, '0')}`;

const reportOf = ({ state }: ControllerPageModel): string | undefined => {
  const size = state.rawBytes?.length;
  if (state.reportId == null || size === undefined) return undefined;
  return `${hex2(state.reportId)}, ${size} B`;
};

const controllerFacts = (page: ControllerPageModel): readonly FactsPanelGroup[] => {
  const { entry, resolved, idLabel, calibration } = page;
  const report = reportOf(page);
  return [
    [
      { label: 'Vendor:Product', value: idLabel, mono: true, copyable: true },
      ...(entry.guid ? [{ label: 'GUID', value: entry.guid, mono: true, copyable: true }] : []),
    ],
    [
      { label: 'Interface', value: 'HID' },
      ...(resolved ? [{ label: 'Inputs', value: `${resolved.controls.length}` }] : []),
      ...(report ? [{ label: 'Report', value: report, mono: true }] : []),
      { label: 'Mapping', value: entry.mapping ? 'Custom mapping' : 'SDL built in' },
      { label: 'Sticks', value: calibration.existingStickCal ? 'Calibrated' : 'Factory' },
    ],
  ];
};

export { controllerFacts };
