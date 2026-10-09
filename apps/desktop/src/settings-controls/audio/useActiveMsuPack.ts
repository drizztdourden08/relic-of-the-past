/* @layer renderer-app @kind hook */
import { useProfiles } from '@drizztdourden08/brock-react';
import type { MsuPackProfile } from '@rotp/features';
import { useMsuPackProfile } from './useMsuPackProfile';

const useActiveMsuPack = (): MsuPackProfile | null => {
  const { active } = useProfiles();
  return useMsuPackProfile(active?.id ?? '').pack;
};

export { useActiveMsuPack };
