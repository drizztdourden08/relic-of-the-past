/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { MappingList } from './mapping-list.type';

const useMappingEntries = (devices: readonly DeviceEntry[]): MappingList => {
  const [list, setList] = useState<MappingList>({ entries: [], loaded: false });

  useEffect(() => {
    let live = true;
    void inputApi().mapping.list()
      .then((entries) => { if (live) setList({ entries, loaded: true }); })
      .catch(() => { if (live) setList((previous) => ({ ...previous, loaded: true })); });
    return () => { live = false; };
  }, [devices]);

  return list;
};

export { useMappingEntries };
