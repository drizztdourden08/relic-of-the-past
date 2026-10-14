/* @layer bridge-wasm @kind types */
import type { createListenerSet, createReconnector } from '@rotp/randomizer';
import type {
  CheckReporter, DeathLinkSwitch, ForeignOwners, NetworkMonitor, OnlineContext, OnlineDeps,
  OnlineSessionConfig, Placement, RandomizerSession, SocketLink,
} from '@rotp/randomizer';
import type { ScoutMaps } from '../online-overrides';

type SessionStatus = RandomizerSession['status'];

type ClientState = {
  status: SessionStatus;
  link: SocketLink | null;
  stopped: boolean;
  everConnected: boolean;
  closeReason: string;
  workingUrl: string | null;
  placement: Placement | null;
  unsubscribeSwap: (() => void) | null;
};

type ClientKit = {
  config: OnlineSessionConfig;
  deps: OnlineDeps;
  game: string;
  state: ClientState;
  statusListeners: ReturnType<typeof createListenerSet<[SessionStatus]>>;
  placementListeners: ReturnType<typeof createListenerSet<[Placement, ForeignOwners]>>;
  room: OnlineContext['room'];
  maps: ScoutMaps;
  names: OnlineContext['names'];
  messages: OnlineContext['messages'];
  goal: OnlineContext['goal'];
  network: NetworkMonitor;
  deathLinks: DeathLinkSwitch;
  reportCheck: CheckReporter['reportCheck'];
  send: OnlineContext['send'];
  setStatus: (next: SessionStatus) => void;
};

type ContextHooks = Pick<OnlineContext, 'fail' | 'markConnected'>;

type LinkController = {
  ctx: OnlineContext;
  connect: () => void;
  endSession: () => void;
  reconnector: ReturnType<typeof createReconnector>;
};

export type { ClientKit, ClientState, ContextHooks, LinkController, SessionStatus };
