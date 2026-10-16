/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { ControlSchemeId } from '@rotp/features';
import type { ControlsTab } from './controls-settings.type';

const useControlsTabs = (scheme: ControlSchemeId) => {
  const [activeTab, setActiveTab] = useState<ControlsTab>(scheme === 'modern' ? 'modern' : 'controls');

  useEffect(() => {
    if (scheme === 'modern' && activeTab === 'controls') setActiveTab('modern');
    if (scheme === 'classic' && activeTab === 'modern') setActiveTab('controls');
  }, [scheme, activeTab]);

  return { activeTab, setActiveTab };
};

export { useControlsTabs };
