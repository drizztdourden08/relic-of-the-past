/* @layer bridge-wasm @kind logic */
const liveRoomWordReader = (heap: Uint8Array, roomPtr: number, livePtr: number): ((roomId: number) => number) => {
  let liveRoomId = -1;
  let liveFlags = 0;
  if (livePtr) {
    liveRoomId = (heap[livePtr] ?? 0) | ((heap[livePtr + 1] ?? 0) << 8);
    liveFlags = (heap[livePtr + 2] ?? 0) | ((heap[livePtr + 3] ?? 0) << 8);
  }
  return (roomId) => {
    const offset = roomPtr + roomId * 2;
    const flags = (heap[offset] ?? 0) | ((heap[offset + 1] ?? 0) << 8);
    return roomId === liveRoomId ? flags | liveFlags : flags;
  };
};

export { liveRoomWordReader };
