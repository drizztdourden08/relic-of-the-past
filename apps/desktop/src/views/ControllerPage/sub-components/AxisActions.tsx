/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { AxisRecordButton } from '@app/views/InputTester';
import type { AxisActionsProps } from '../ControllerPage.type';

const AxisActions = ({ label, getValues, onCalibrate }: AxisActionsProps) => (
  <>
    <AxisRecordButton getValues={getValues} label={label} />
    <Button variant="tertiary" size="sm" onClick={onCalibrate} title={`Calibrate ${label}`}>Calibrate</Button>
  </>
);

export { AxisActions };
