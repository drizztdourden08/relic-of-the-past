/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';
import { loadBuildsIndex } from '@app/archipelago/world-package';

const useBundledVersions = (): readonly string[] => {
  const [versions, setVersions] = useState<readonly string[]>([]);

  useEffect(() => {
    let live = true;
    void loadBuildsIndex().then((index) => {
      if (live) setVersions(index?.builds.map((build) => build.archipelagoVersion) ?? []);
    });
    return () => {
      live = false;
    };
  }, []);

  return versions;
};

export { useBundledVersions };
