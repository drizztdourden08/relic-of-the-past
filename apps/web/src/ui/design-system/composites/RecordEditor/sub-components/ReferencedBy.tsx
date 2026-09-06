/* @layer renderer-components @kind component */
/**
 * A usage-overview panel for a record other collections point at. Renders only
 * what it is handed, since this package cannot look records up. Each entry
 * publishes `data-id-ref` / `data-target-kind`, the same handoff `id-ref-kit`
 * uses, so the owning screen's click handler follows the link.
 */
import { useState } from 'react';
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Text } from '../../../primitives/Text';
import type { ReferencedByHit } from '../RecordEditor.type';
import './ReferencedBy.css';

const TITLE = 'Referenced by';
const EMPTY = 'Not referenced anywhere.';

interface ReferencedByProps {
  hits: readonly ReferencedByHit[];
}

interface KindGroup {
  kind: string;
  hits: readonly ReferencedByHit[];
}

/** Grouped in first-seen order, so the panel reads the same way every time for the same hits. */
const groupByKind = (hits: readonly ReferencedByHit[]): readonly KindGroup[] => {
  const order: string[] = [];
  const byKind = new Map<string, ReferencedByHit[]>();
  for (const hit of hits) {
    let held = byKind.get(hit.kind);
    if (!held) { held = []; byKind.set(hit.kind, held); order.push(hit.kind); }
    held.push(hit);
  }
  return order.map(kind => ({ kind, hits: byKind.get(kind) ?? [] }));
};

const ReferencedBy = (props: ReferencedByProps) => {
  const { hits } = props;
  // Groups start collapsed: a common tag can sit on hundreds of screens, and
  // starting expanded would grow the panel past the window.
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  if (hits.length === 0) {
    return <Text className="referenced-by__empty">{EMPTY}</Text>;
  }

  const toggle = (kind: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind); else next.add(kind);
      return next;
    });
  };

  return (
    <Box className="referenced-by">
      <Text as="p" className="referenced-by__title">{TITLE}</Text>
      {groupByKind(hits).map((group) => (
        <Box key={group.kind} className="referenced-by__group">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="referenced-by__toggle"
            aria-expanded={expanded.has(group.kind)}
            onClick={() => toggle(group.kind)}
          >
            {group.kind} ({group.hits.length})
          </Button>
          {expanded.has(group.kind) && (
            <Box as="ul" className="referenced-by__list">
              {group.hits.map((hit) => (
                <Box as="li" key={`${hit.id}.${hit.field}`} className="referenced-by__item">
                  <Text
                    as="span"
                    className="referenced-by__link"
                    title={`${hit.kind}: ${hit.id}`}
                    data-id-ref={hit.id}
                    data-target-kind={hit.kind}
                  >
                    {hit.label}
                  </Text>
                  <Text as="span" className="referenced-by__field">via {hit.field}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export { ReferencedBy };
export type { ReferencedByProps };
