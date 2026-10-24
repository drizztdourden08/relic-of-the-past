/* @layer bridge-wasm @kind logic */
import { AP_WORLD_VERSION } from '@rotp/randomizer';
import type { JoinConfig } from '@rotp/randomizer';
import type { JoinInput } from './join-input.type';

const joinConfigOf = (input: JoinInput): JoinConfig => {
  const { server, code, ap, slotName, yaml, build, bytes, client, token } = input;
  return {
    server,
    code,
    client,
    archipelagoVersion: ap,
    world: { worldVersion: AP_WORLD_VERSION, bytes, sha256: build.sha256, size: build.size },
    slots: [{ name: slotName, yaml }],
    displayName: slotName,
    token: token ?? null,
  };
};

export { joinConfigOf };
