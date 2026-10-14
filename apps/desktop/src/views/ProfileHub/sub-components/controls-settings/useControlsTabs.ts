/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { ControlSchemeId } from '@rotp/features';
import type { ControlsTab } from './controls-settings.type';

const useControlsTabs = (scheme: ControlSchemeId) => {
  const [activeTab, setActiveTab] = useState<ControlsTab>('controls');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [devicesCollapsed, setDevicesCollapsed] = useState(false);

  useEffect(() => {
    if (scheme === 'modern' && activeTab === 'controls') setActiveTab('modern');
    if (scheme === 'classic' && activeTab === 'modern') setActiveTab('controls');
  }, [scheme, activeTab]);

  return { activeTab, sidebarCollapsed, devicesCollapsed, setActiveTab, setSidebarCollapsed, setDevicesCollapsed };
};

export { useControlsTabs };
