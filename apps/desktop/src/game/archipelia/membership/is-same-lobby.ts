/* @layer bridge-wasm @kind logic */
import { formatLobbyCode, lobbyUrlCandidates } from '@rotp/randomizer';
import type { ArchipeliaMembership } from './membership.type';

const lobbyUrlOf = (server: string): string => lobbyUrlCandidates(server)[0] ?? server.trim().toLowerCase();

const codeOf = (code: string): string => formatLobbyCode(code) ?? code.trim().toUpperCase();

const isSameLobby = (membership: ArchipeliaMembership, server: string, code: string): boolean =>
  codeOf(membership.code) === codeOf(code) && lobbyUrlOf(membership.server) === lobbyUrlOf(server);

export { isSameLobby };
