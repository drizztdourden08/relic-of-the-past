/* @layer renderer-app @kind hook */
import { useProfiles } from '@drizztdourden08/brock-react';
import type { MsuPackProfile } from '@shared/features/msu-auto-config';
import { useMsuPackProfile } from './useMsuPackProfile';

const useActiveMsuPack = (): MsuPackProfile | null => {
  const { active } = useProfiles();
  return useMsuPackProfile(active?.id ?? '').pack;
};

export { useActiveMsuPack };
