/* @layer renderer-components @kind component */
/**
 * ControllerDisconnectOverlay — shown when the active controller disconnects
 * during gameplay. Blocks input and shows resume instructions.
 */

import './ControllerDisconnectOverlay.css';

interface ControllerDisconnectOverlayProps {
  controllerName: string;
}

const ControllerDisconnectOverlay = (props: ControllerDisconnectOverlayProps) => {
  const { controllerName } = props;
  return (
    <div className="controller-disconnect-overlay">
      <div className="controller-disconnect-overlay__card">
        <div className="controller-disconnect-overlay__icon">🎮</div>
        <h2 className="controller-disconnect-overlay__title">Controller Disconnected</h2>
        <p className="controller-disconnect-overlay__message">
          <strong>{controllerName}</strong> has been disconnected.
        </p>
        <div className="controller-disconnect-overlay__actions">
          <p>Reconnect the controller, or:</p>
          <ul>
            <li>Double-click the game canvas to resume</li>
            <li>Press <kbd>F10</kbd> to resume</li>
            <li>Use another registered controller</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export { ControllerDisconnectOverlay };
