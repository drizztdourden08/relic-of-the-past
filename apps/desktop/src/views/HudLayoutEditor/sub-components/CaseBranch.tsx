/* @layer renderer-components @kind component */
import { nodeArtOf } from '@app/hud-layout-editing/node-art';
import { ReferenceField } from './ReferenceField';
import type { CaseBranchProps } from './CaseBranch.type';

const CaseBranch = (props: CaseBranchProps) => {
  const { node, label, glyphPacks, onSelectNode } = props;
  const art = nodeArtOf(node, glyphPacks);

  return (
    <ReferenceField
      compact
      action="go"
      src={art.src}
      placeholder={art.icon}
      name={art.name}
      kind={art.kind}
      onOpen={() => onSelectNode(node.id)}
      aria-label={`Go to ${label}: ${art.name}`}
    />
  );
};

export { CaseBranch };
