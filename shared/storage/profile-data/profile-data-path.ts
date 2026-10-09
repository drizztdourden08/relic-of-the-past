/* @layer shared-storage @kind logic */
const profileDataPath = (profile: string, store: string): string => `profiles/${profile}/${store}.json`;

export { profileDataPath };
