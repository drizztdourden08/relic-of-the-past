/* @layer renderer-components @kind component */
import { Box, EmptyState } from '@drizztdourden08/tessera/primitives';
import { SideNav } from '@drizztdourden08/tessera/composites';
import { ControllerPage } from '@app/views/ControllerPage';
import { usePadNav } from './behavior/usePadNav';
import { NO_PADS_MESSAGE, NO_PADS_TITLE, PADS_NAV_LABEL, PADS_NAV_STORAGE_KEY } from './ControllerPads.constants';
import type { ControllerPadsProps } from './ControllerPads.type';
import './ControllerPads.css';

const ControllerPads = (props: ControllerPadsProps) => {
  const { initialDeviceKey, onRunDiagnostics } = props;
  const { config, activeKey, gone, empty, pick } = usePadNav(initialDeviceKey);

  if (empty || activeKey === null) return <EmptyState title={NO_PADS_TITLE} message={NO_PADS_MESSAGE} />;

  return (
    <Box className="controller-pads">
      <SideNav
        config={config}
        activeId={activeKey}
        onSelect={pick}
        defaultOpen
        storageKey={PADS_NAV_STORAGE_KEY}
        ariaLabel={PADS_NAV_LABEL}
      />
      <Box className="controller-pads__page">
        <ControllerPage key={activeKey} deviceKey={activeKey} gone={gone} onRunDiagnostics={onRunDiagnostics} />
      </Box>
    </Box>
  );
};

export { ControllerPads };
