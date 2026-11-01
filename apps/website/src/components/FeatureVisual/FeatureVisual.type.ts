/* @layer website-site @kind types */
import type { ComponentType } from 'react';
import type { FeatureVisual as FeatureVisualData } from '../../features';

type VisualKind = FeatureVisualData['kind'];

type VisualProps<K extends VisualKind> = {
  visual: Extract<FeatureVisualData, { kind: K }>;
  caption: string;
};

type VisualRenderers = { [K in VisualKind]: ComponentType<VisualProps<K>> };

type AnyRenderer = ComponentType<{ visual: FeatureVisualData; caption: string }>;

type FeatureVisualProps = {
  visual: FeatureVisualData;
  caption: string;
};

export type { AnyRenderer, FeatureVisualProps, VisualProps, VisualRenderers };
