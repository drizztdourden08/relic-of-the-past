/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { MenuIcon } from '@app/views/HudLayoutEditor/sub-components/MenuIcon';
import type { ReactElement } from 'react';
import type { MenuIconProps } from '@app/views/HudLayoutEditor/sub-components/MenuIcon.type';

const menuIcon = (source: MenuIconProps['source']): ReactElement => createElement(MenuIcon, { source });

export { menuIcon };
