/* @layer renderer-components @kind types */

/** The kinds of playthrough a profile can be, one badge each. */
type ProfileModeId = 'vanilla' | 'vanilla-safe' | 'randomizer' | 'randomizer-online';

interface ModeBadgeProps {
  mode: ProfileModeId;
  className?: string;
}

export type { ModeBadgeProps, ProfileModeId };
