/* @layer bridge-wasm @kind logic */
const inLobby = (profile: Profile): boolean =>
  profile.randomizer?.mode === 'archipelia' || profile.randomizer?.origin === 'archipelia';

export { inLobby };
