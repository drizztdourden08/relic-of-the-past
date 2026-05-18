interface ProfileCardProps {
  profile: Profile;
  onSelect: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

export type {
  ProfileCardProps,
};
