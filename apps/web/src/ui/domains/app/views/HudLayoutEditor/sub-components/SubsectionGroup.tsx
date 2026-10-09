/* @layer renderer-components @kind component */
import { Box, Button, Checkbox, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import './HudLayoutEditor.appearance.css';
import type { SubsectionGroupProps } from './SubsectionGroup.type';

const SubsectionGroup = (props: SubsectionGroupProps) => {
  const { title, summary, swatch, open, onToggle, enabled, onEnabledChange, action, children } = props;
  const togglable = onEnabledChange !== undefined;
  const on = !togglable || enabled === true;

  return (
    <Box className={`hud-subgroup${open && on ? ' is-open' : ''}`} data-on={on}>
      <Box className="hud-subgroup__head">
        {togglable && (
          <Checkbox
            size="sm"
            checked={enabled === true}
            ariaLabel={`${title} on`}
            onChange={(next) => onEnabledChange(next)}
          />
        )}
        <Button
          variant="bare"
          className="hud-subgroup__trigger"
          aria-expanded={on && open}
          disabled={!on}
          onClick={onToggle}
        >
          <Text className="hud-subgroup__name">{title}</Text>
          {swatch !== undefined && (
            <Box className="hud-subgroup__swatch" style={{ background: swatch }} aria-hidden />
          )}
          <Text className="hud-subgroup__summary">{summary}</Text>
          <Text className="hud-subgroup__caret" aria-hidden>{on && open ? '▾' : '▸'}</Text>
        </Button>
        {action && (
          <IconButton variant="ghost" size="sm" label={action.label} onClick={action.onClick}>
            {action.icon}
          </IconButton>
        )}
      </Box>
      {on && open && <Box className="hud-subgroup__body">{children}</Box>}
    </Box>
  );
};

export { SubsectionGroup };
export type { SubsectionAction, SubsectionGroupProps } from './SubsectionGroup.type';
