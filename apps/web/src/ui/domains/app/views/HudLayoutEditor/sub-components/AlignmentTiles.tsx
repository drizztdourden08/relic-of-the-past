/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { CSS_POSITION } from '../behavior/align-options';
import { BARS, FOLD_ABOVE } from './AlignmentTiles.constants';
import './HudLayoutEditor.layout.css';
import type { AlignValue, FlowDirection } from '../behavior/align-options';
import type { CSSProperties } from 'react';
import type { AlignRowSpec, AlignmentTilesProps } from './AlignmentTiles.type';

const diagramStyle = (
  row: AlignRowSpec, value: AlignValue, direction: FlowDirection,
): CSSProperties => {
  if (row.engine === 'grid') {
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      justifyItems: row.axis === 'main' ? value : 'center',
      alignItems: row.axis === 'cross' ? value : 'center',
    };
  }
  return {
    display: 'flex',
    flexDirection: direction,
    justifyContent: row.axis === 'main' ? CSS_POSITION[value] : 'flex-start',
    alignItems: row.axis === 'cross' ? CSS_POSITION[value] : 'center',
  };
};

const barStyle = (
  row: AlignRowSpec, value: AlignValue, direction: FlowDirection,
): CSSProperties => {
  const fill = value === 'stretch';
  if (row.engine === 'grid') {
    return row.axis === 'main'
      ? { width: fill ? 'auto' : 'var(--hud-align-bar)', height: '70%' }
      : { width: '70%', height: fill ? 'auto' : 'var(--hud-align-bar)' };
  }
  return direction === 'row'
    ? { width: 'var(--hud-align-bar)', height: '65%' }
    : { width: '65%', height: 'var(--hud-align-bar)' };
};

const AlignmentTiles = (props: AlignmentTilesProps) => {
  const { direction, rows } = props;
  const columns = Math.max(...rows.map(
    (row) => (row.options.length > FOLD_ABOVE ? Math.ceil(row.options.length / 2) : row.options.length),
  ));

  return (
    <Box className="hud-align" style={{ '--hud-align-cols': columns } as CSSProperties}>
      {rows.map((row) => (
        <Box key={row.key} className="hud-align__row" role="group" aria-label={row.label}>
          <Text className="hud-align__cap" title={row.label}>{row.cap}</Text>
          <Box className="hud-align__tiles">
            {row.options.map((option) => (
              <IconButton
                key={option.value}
                className="hud-align__tile"
                variant="ghost"
                size="sm"
                active={row.value === option.value}
                label={`${row.label}. ${option.label}`}
                title={option.label}
                data-align={`${row.key}:${option.value}`}
                onClick={() => row.onChange(option.value)}
              >
                <Box
                  className="hud-align__diagram"
                  data-engine={row.engine}
                  data-flow={row.engine === 'grid' ? 'row' : direction}
                  style={diagramStyle(row, option.value, direction)}
                >
                  {Array.from({ length: BARS[row.engine] }, (_unused, i) => (
                    <Box
                      key={i}
                      className="hud-align__bar"
                      style={barStyle(row, option.value, direction)}
                    />
                  ))}
                </Box>
              </IconButton>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export { AlignmentTiles };
export type { AlignRowSpec, AlignmentTilesProps } from './AlignmentTiles.type';
