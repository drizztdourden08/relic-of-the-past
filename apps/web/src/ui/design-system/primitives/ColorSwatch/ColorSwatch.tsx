/* @layer renderer-components @kind component */
import './ColorSwatch.css';
import type { ColorSwatchProps } from './ColorSwatch.type';

/** A single colour, as a button. The fill is the data, so it stays an inline style. */
const ColorSwatch = (props: ColorSwatchProps) => {
  const { color, caption, selected = false, edited = false, transparent = false, className = '', ...rest } = props;
  const classes = [
    'color-swatch',
    selected ? 'color-swatch--selected' : '',
    edited ? 'color-swatch--edited' : '',
    transparent ? 'color-swatch--transparent' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type="button" className={classes} style={transparent ? undefined : { background: color }} {...rest}>
      {caption !== undefined && <span className="color-swatch__caption">{caption}</span>}
    </button>
  );
};

export { ColorSwatch };
