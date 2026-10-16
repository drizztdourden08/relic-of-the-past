/* @layer renderer-components @kind component */
import { useProfileSwitcher } from '../behavior/useProfileSwitcher';
import { CheckToasts } from '../../CheckToasts';
import { GameOverlay } from '../../GameOverlay';
import type { GameLayerOverlaysProps } from './GameLayerOverlays.type';
import { NavigationOverlay } from './NavigationOverlay';
import { PauseLayer } from './PauseLayer';
import { ProfileSwitcherOverlay } from './ProfileSwitcherOverlay';

const GameLayerOverlays = (props: GameLayerOverlaysProps) => {
  const { status, width, height, profileId } = props;
  const running = status === 'running';
  const profileSwitcher = useProfileSwitcher(running);

  return (
    <>
      <PauseLayer status={status} />
      {running && (
        <ProfileSwitcherOverlay
          open={profileSwitcher.open}
          profiles={profileSwitcher.profiles}
          activeId={profileSwitcher.activeId}
          prevMapping={profileSwitcher.prevMapping}
          nextMapping={profileSwitcher.nextMapping}
        />
      )}
      {running && <NavigationOverlay width={width} height={height} gameRunning={running} />}
      {running && <GameOverlay width={width} height={height} profileId={profileId} />}
      {running && <CheckToasts width={width} height={height} />}
    </>
  );
};

export { GameLayerOverlays };
