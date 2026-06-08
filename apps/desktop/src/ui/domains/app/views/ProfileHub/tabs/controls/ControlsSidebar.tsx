/* @layer renderer-components @kind component */
/** ControlsSettings left column: input-profile list (collapsible). */
import { InputProfileList } from './InputProfileList';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const ControlsSidebar = ({ ctrl }: { ctrl: Ctrl }) => {
  return (
    <div className={`controls-settings__sidebar ${ctrl.sidebarCollapsed ? 'controls-settings__sidebar--collapsed' : ''}`}>
      <div className="controls-settings__col-header">
        <button
          className="controls-settings__col-toggle"
          onClick={() => ctrl.setSidebarCollapsed(!ctrl.sidebarCollapsed)}
          title={ctrl.sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {ctrl.sidebarCollapsed ? '▶' : '◀'}
        </button>
        <span className="controls-settings__col-title">Profiles</span>
      </div>
      {/* Collapsed: show icon strip for quick profile selection */}
      <div className="controls-settings__sidebar-icons">
        {ctrl.profiles.map((p) => (
          <button
            key={p.id}
            className={`controls-settings__sidebar-icon-btn ${p.id === ctrl.activeProfile?.id ? 'controls-settings__sidebar-icon-btn--active' : ''}`}
            onClick={() => ctrl.selectProfile(p)}
            title={p.name}
          >
            {p.deviceType === 'keyboard' ? '⌨️' : '🎮'}
          </button>
        ))}
      </div>
      {/* Expanded: full profile list */}
      <div className="controls-settings__sidebar-content">
        <InputProfileList
          profiles={ctrl.profiles}
          activeId={ctrl.activeProfile?.id ?? null}
          initialEditId={ctrl.newlyCreatedId}
          onSelect={ctrl.selectProfile}
          onDelete={(p) => ctrl.setDeleteTarget(p)}
          onRename={ctrl.handleRename}
          onCreate={ctrl.handleCreate}
        />
      </div>
    </div>
  );
};

export { ControlsSidebar };
