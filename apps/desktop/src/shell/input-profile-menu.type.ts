/* @layer renderer-app @kind types */
interface ProfileChoice {
  id: string;
  name: string;
}

interface ProfileMenuState {
  choices: ProfileChoice[];
  activeId: string | null;
}

export type { ProfileChoice, ProfileMenuState };
