/* @layer renderer-components @kind component */
/**
 * ONE SHAPE FOR EVERY REFERENCE TO SOMETHING ELSE: the thing itself, its human
 * name and a caret. The whole row is the trigger.
 *
 * GENERALISED, NOT INVENTED. The `sprite` branch (contract §31.4) already
 * deleted its text box and drew the chosen sprite as its own `Thumbnail` plus
 * its manifest label. Four other places still printed an identifier the author
 * had to decode (`DPAD`, `generic · A`, `sprite hud-silver-arrow-icon`,
 * `heart-shape · shape-3f21`), and in every one of them the editor already
 * owns the picture and draws it in the picker one click away. This is that fix
 * with the sprite assumption taken out of it; `SpriteContent` now renders this
 * and `.hud-sprite-field` is gone.
 *
 * A THUMBNAIL OR A SPECIMEN, NEVER A SLUG. Where the referent is a picture,
 * `src` draws it (falling back per-image, which is `Thumbnail`'s own rule, so
 * a partially extracted ROM shows what exists). Where it is a TYPEFACE, there
 * is no picture to draw and `specimen` renders a sample set in the face being
 * chosen instead. It is the same argument, one medium over.
 *
 * TWO ACTIONS, BECAUSE THERE ARE TWO KINDS OF REFERENT. A sprite, a glyph and
 * a button face are CHOSEN: the caret opens a picker (`pick`). A switch case's
 * node and a repeat's child are whole subtrees that are not chosen from a list
 * at all (they are edited in place, by selecting them), so those carry `go`
 * and keep the jump gesture the case editor already had. Drawing a picker
 * caret on a control that cannot open one would be the panel lying about what
 * a click does.
 *
 * OWNS NO PICKER. The picker is `children`, mounted by the caller, anchored to
 * the ref this hands back, so this file never learns that sprite manifests,
 * glyph packs or slot schemes exist.
 */
import './HudLayoutEditor.content.css';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Text } from '@ds/primitives/Text';
import { Thumbnail } from '@ds/primitives/Thumbnail';
import type { ReactNode, RefObject } from 'react';

interface ReferenceFieldProps {
  label?: string;
  hint?: ReactNode;
  /** The referent's artwork. Absent draws `placeholder`, which is a real answer
   *  for a kind that has no picture, not a failure. */
  src?: string;
  placeholder?: string;
  /** Drawn INSTEAD of the thumbnail, for a referent that is type, not
   *  art (a text face's `07`). */
  specimen?: ReactNode;
  /** The human name, such as a manifest label, a position, or a node's kind. */
  name: string;
  /** The dim half: what kind of thing this is, or its id. */
  kind?: string;
  /** `pick` opens a picker; `go` selects the referent (see the header). */
  action?: 'pick' | 'go';
  /** A reference stacked inside a card, at one line instead of two. */
  compact?: boolean;
  onOpen: () => void;
  /** Anchors the caller's picker to this row. */
  anchorRef?: RefObject<HTMLButtonElement | null>;
  /** The picker, mounted by the caller. */
  children?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

const CARET = { pick: '▾', go: '↗' } as const;

const ReferenceField = (props: ReferenceFieldProps) => {
  const {
    label, hint, src, placeholder = '?', specimen, name, kind, action = 'pick',
    compact = false, onOpen, anchorRef, children, className = '', 'aria-label': ariaLabel,
  } = props;

  return (
    <Field size="sm" label={label} hint={hint} className={`hud-ref ${className}`}>
      <Button
        ref={anchorRef}
        variant="ghost"
        className={`hud-ref-field${compact ? ' hud-ref-field--compact' : ''}`}
        aria-label={ariaLabel ?? `${label ?? 'Reference'}: ${name}`}
        onClick={onOpen}
      >
        {specimen === undefined
          ? <Thumbnail src={src} alt="" placeholder={placeholder} className="hud-ref-field__thumb" />
          : <Text className="hud-ref-field__specimen">{specimen}</Text>}
        <Text className="hud-ref-field__name">{name}</Text>
        {kind !== undefined && <Text className="hud-ref-field__kind">{kind}</Text>}
        <Text className="hud-ref-field__caret">{CARET[action]}</Text>
      </Button>
      {children}
    </Field>
  );
};

export { ReferenceField };
export type { ReferenceFieldProps };
