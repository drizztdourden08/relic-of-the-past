/* @layer renderer-components @kind component */
import { Box, Checkbox, IconButton, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import type { SubsectionGroupProps } from './SubsectionGroup.type';

const SubsectionGroup = (props: SubsectionGroupProps) => {
  const { title, summary, swatch, open, onToggle, enabled, onEnabledChange, action, children } = props;
  const togglable = onEnabledChange !== undefined;
  const on = !togglable || enabled === true;
  const shown = on && open;

  return (
    <Box className={`hud-subgroup${shown ? ' is-open' : ''}`} data-on={on}>
      <Box className="hud-subgroup__head">
        {togglable && (
          <Checkbox
            size="sm"
            checked={enabled === true}
            ariaLabel={`${title} on`}
            onChange={(next) => onEnabledChange(next)}
          />
        )}
        <Pressable
          className="hud-subgroup__trigger"
          aria-expanded={shown}
          disabled={!on}
          onClick={onToggle}
        >
          <Text className="hud-subgroup__name">{title}</Text>
          {swatch !== undefined && (
            <Box className="hud-subgroup__swatch" style={{ background: swatch }} aria-hidden />
          )}
          <Text className="hud-subgroup__summary">{summary}</Text>
          <Text className="hud-subgroup__caret" aria-hidden>{shown ? '▾' : '▸'}</Text>
        </Pressable>
        {action && (
          <IconButton variant="ghost" size="sm" label={action.label} onClick={action.onClick}>
            {action.icon}
          </IconButton>
        )}
      </Box>
      {shown && <Box className="hud-subgroup__body">{children}</Box>}
    </Box>
  );
};

export { SubsectionGroup };
