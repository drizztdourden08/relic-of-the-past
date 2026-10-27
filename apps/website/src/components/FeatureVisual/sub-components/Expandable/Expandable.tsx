/* @layer website-site @kind component */
import { useState } from 'react';
import { Box, Lightbox } from '../../../../design';
import { activatableProps } from '../../behavior/activatable-props';
import { EXPANDABLE_TEXT } from './Expandable.constants';
import type { ExpandableProps } from './Expandable.type';
import './Expandable.css';

const Expandable = ({ aspect, label, expanded, zoomable, className, children }: ExpandableProps) => {
  const [open, setOpen] = useState(false);
  const press = activatableProps(() => setOpen(true), EXPANDABLE_TEXT.expand(label));

  return (
    <>
      <Box
        {...press}
        aria-haspopup="dialog"
        className={className ? `expandable ${className}` : 'expandable'}
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          press.onClick?.(event);
        }}
      >
        {children}
      </Box>
      <Lightbox open={open} onClose={() => setOpen(false)} label={label} aspect={aspect} zoomable={zoomable}>
        {expanded}
      </Lightbox>
    </>
  );
};

export { Expandable };
