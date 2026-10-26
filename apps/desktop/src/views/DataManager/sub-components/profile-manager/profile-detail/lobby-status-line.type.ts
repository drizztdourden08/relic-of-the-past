/* @layer renderer-components @kind types */
interface LobbyStatusLine {
  text: string;
  why?: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
  busy: boolean;
  progress?: number;
  final: boolean;
}

interface ProfileLobbyStatusProps {
  profile: Profile;
}

export type { LobbyStatusLine, ProfileLobbyStatusProps };
