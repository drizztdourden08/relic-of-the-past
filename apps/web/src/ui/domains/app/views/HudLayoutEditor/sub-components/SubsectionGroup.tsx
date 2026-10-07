/* @layer renderer-components @kind component */
/**
 * ONE LEVEL DOWN FROM `SectionAccordion`, WHICH IS THE WHOLE IDEA. The panel
 * solved "thirty properties in a 232px rail" at its top level with nine
 * collapsible sections and then never applied the same answer inside the
 * longest section it has. Appearance's Border, Outline, Tint and each Shadow
 * are sub-editors behind a plain `Toggle` that looks exactly like `Clip
 * children`, which is a boolean. They are indistinguishable until you flip one.
 *
 * THE HEADER STATES THE VALUE. A collapsed group is not a closed drawer, it is
 * a row that reads `2px solid` beside a swatch of the colour, so the author
 * finds the group that is doing something without opening any of them. That is
 * the property the flat scroll did not have, and it is what makes the section
 * one screen tall with everything on (`behavior/appearance-summary.ts` owns the
 * wording).
 *
 * THE TOGGLE IS A SIBLING OF THE TRIGGER, NOT INSIDE IT. A checkbox nested in
 * a button is invalid markup and unreachable by keyboard; the enable box, the
 * expand trigger and the optional per-group action are three controls on one
 * row. Turning a group ON opens it in the same gesture. The caller does that,
 * because the caller is what enforces "one open at a time".
 *
 * A GROUP THAT IS OFF CANNOT BE OPENED. There is nothing behind it: `border`
 * is `undefined` and every field inside would have to invent a value to show.
 * The trigger is `disabled` and the summary says `off`, which is the honest
 * reading of an empty drawer.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Checkbox } from '@ds/primitives/Checkbox';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import './HudLayoutEditor.appearance.css';
import type { ReactNode } from 'react';

interface SubsectionAction {
  label: string;
  icon: string;
  onClick: () => void;
}

interface SubsectionGroupProps {
  title: string;
  /** The one-line value, shown open or closed. `off` when there is none. */
  summary: string;
  /** CSS paint for the preview chip, from `swatchOf()` in `appearance-summary`. */
  swatch?: string;
  open: boolean;
  onToggle: () => void;
  /** Present = this group carries an enable box. Absent = it is always on
   *  (a shadow card exists because the author added it). */
  enabled?: boolean;
  onEnabledChange?: (on: boolean) => void;
  /** The far-right control, such as a shadow's remove. Never the expand gesture. */
  action?: SubsectionAction;
  children: ReactNode;
}

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
export type { SubsectionAction, SubsectionGroupProps };
