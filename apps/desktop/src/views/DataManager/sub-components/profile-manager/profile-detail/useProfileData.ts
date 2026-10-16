/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { loadProfileData } from './load-profile-data';
import type { ProfileData } from './profile-data.type';

const useProfileData = (profileId: string): ProfileData | null => {
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    let current = true;
    setData(null);
    void loadProfileData(profileId).then((loaded) => { if (current) setData(loaded); });
    return () => { current = false; };
  }, [profileId]);

  return data;
};

export { useProfileData };
