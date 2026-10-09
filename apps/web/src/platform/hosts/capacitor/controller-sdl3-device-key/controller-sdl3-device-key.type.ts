/* @layer renderer-other @kind types */
interface AssignedKey {
  deviceKey: string;
  vidPid: string;
  slot: number;
}

interface DeviceKeySlots {
  byId: Map<number, AssignedKey>;
  usedSlots: Map<string, Set<number>>;
}

export type { AssignedKey, DeviceKeySlots };
