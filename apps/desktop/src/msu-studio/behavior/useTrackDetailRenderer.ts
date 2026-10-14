/* @layer renderer-components @kind hook */
import { createElement, useCallback } from 'react';
import { TrackDetail } from '../TrackDetail';
import type { MsuTrackPanelProps } from '../MsuTrackPanel.type';
import { trackTarget } from './layer-target';

const useTrackDetailRenderer = (props: MsuTrackPanelProps) => {
  const { selected, files, manifest, saveBase, format, reportStore, readOnly, onConfirm, onReload } = props;

  return useCallback((trackNum: number) => createElement(TrackDetail, {
    pack: selected,
    trackNum,
    target: trackTarget(trackNum),
    manifest,
    saveBase,
    availableFiles: files.map((f) => f.name),
    isLayered: format === 'layered',
    reportStore,
    onConfirm,
    onSaved: onReload,
    readOnly,
  }), [selected, manifest, saveBase, files, format, reportStore, onConfirm, onReload, readOnly]);
};

export { useTrackDetailRenderer };
