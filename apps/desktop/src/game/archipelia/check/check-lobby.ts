/* @layer bridge-wasm @kind logic */
import { AP_WORLD_VERSION, lobbyInfo, lobbyInfoProblems } from '@rotp/randomizer';
import { loadBuildsIndex } from '@app/archipelago/world-package';
import { pickBuild } from '../builds/pick-build';
import { unsupportedVersionText } from '../builds/unsupported-version-text';
import { clientInfoOf } from '../client-info-of';
import { FORM_ERRORS } from './form-error.constants';
import { formErrorOf } from './form-error-of';
import type { LobbyCheck } from './lobby-check.type';

const errorOf = (text: string): LobbyCheck => ({ kind: 'error', text });

const checkLobby = async (server: string, code: string): Promise<LobbyCheck> => {
  const result = await lobbyInfo(server, code);
  if (!result.ok) return errorOf(formErrorOf(result.failure, server));
  const { lobby } = result.info;
  const builds = (await loadBuildsIndex())?.builds ?? [];
  const build = pickBuild(builds, lobby.engine.ap);
  if (build === null) return errorOf(unsupportedVersionText(lobby.engine.ap, builds));
  if (!lobby.joinable) return errorOf(FORM_ERRORS['lobby-locked'] ?? '');
  const client = await clientInfoOf();
  const problem = lobbyInfoProblems(result.info, {
    client, archipelagoVersion: build.archipelagoVersion, worldVersion: AP_WORLD_VERSION, worldBytes: build.size, yamlBytes: [],
  })[0];
  if (problem !== undefined) return errorOf(problem.message);
  return { kind: 'ok', server, code, name: lobby.name, ap: lobby.engine.ap, approval: lobby.admission === 'host-approval', build };
};

export { checkLobby };
