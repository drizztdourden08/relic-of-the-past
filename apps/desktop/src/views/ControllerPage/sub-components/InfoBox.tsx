/* @layer renderer-components @kind component */
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import { Box, Card, Status } from '@drizztdourden08/tessera/primitives';
import { ControllerPortRow } from '@app/compounds/ControllerPortRow';
import { ControllerStatusBar } from '@app/compounds/ControllerStatusBar';
import type { InfoBoxProps } from '../ControllerPage.type';
import { controllerFacts } from '../behavior/controller-facts';
import { InfoIdentity } from './InfoIdentity';
import { PadActions } from './PadActions';
import { RumbleTests } from './RumbleTests';
import './InfoBox.css';

const InfoBox = ({ page, onRunDiagnostics, onReport }: InfoBoxProps) => {
  const { entry, deviceKey, adapterPort } = page;
  const ready = entry.status === 'ready';
  const actions = (
    <Box className="controller-page__info-actions">
      <Status tone={ready ? 'success' : 'warning'} dot>{ready ? 'Connected' : 'Unavailable'}</Status>
      <PadActions deviceKey={deviceKey} onRunDiagnostics={onRunDiagnostics} onReport={onReport} />
    </Box>
  );

  return (
    <Card title="Controller" actions={actions} className="controller-page__info">
      <Box className="controller-info">
        <Box className="controller-info__head">
          <InfoIdentity page={page} />
          <ControllerStatusBar
            detected
            showAbsent
            busType={entry.busType}
            connectionState={entry.connectionState}
            hasRumble={entry.hasRumble}
            hasGyro={entry.hasGyro}
          />
        </Box>
        <FactsPanel groups={controllerFacts(page)} layout="rows" framed={false} label="Controller facts" className="controller-info__facts" />
        {adapterPort !== null && (
          <ControllerPortRow
            portNumber={adapterPort}
            status={entry.status}
            busType={entry.busType}
            hasRumble={entry.hasRumble}
            hasGyro={entry.hasGyro}
          />
        )}
        <RumbleTests deviceKey={deviceKey} hasRumble={Boolean(entry.hasRumble)} />
      </Box>
    </Card>
  );
};

export { InfoBox };
