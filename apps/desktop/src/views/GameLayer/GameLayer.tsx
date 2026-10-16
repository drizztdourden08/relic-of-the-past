/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useGameState } from './behavior/useGameState';
import type { EdgeGlowRenderer, ShadowRenderer, ShadowCastingProject } from '@rotp/game-core';
import { useCanvasFit } from '../../hooks/useCanvasFit';
import { useShadowEditorStore } from '../../stores/shadow-editor-store';
import { useCanvasDisplaySize } from './behavior/useCanvasDisplaySize';
import { useCanvasBufferSize } from './behavior/useCanvasBufferSize';
import { useEdgeGlowLoop } from './behavior/useEdgeGlowLoop';
import { useGameBoot } from './behavior/useGameBoot';
import { usePublishFitSize } from './behavior/usePublishFitSize';
import { useShadowCastingLoop } from './behavior/useShadowCastingLoop';
import { GameLayerCanvases } from './sub-components/GameLayerCanvases';
import { GameLayerOverlays } from './sub-components/GameLayerOverlays';
import './GameLayer.css';
import type { GameLayerProps } from './GameLayer.type';

const GameLayer = (props: GameLayerProps) => {
  const { assetData, configIni, profileId, stretch, pixelPerfect = false, edgeEffect = true, shadowCasting = false } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);
  const glowRendererRef = useRef<EdgeGlowRenderer | null>(null);
  const shadowRendererRef = useRef<ShadowRenderer | null>(null);
  const shadowProjectRef = useRef<ShadowCastingProject | null>(null);
  const shadowCastingRef = useRef(shadowCasting);
  shadowCastingRef.current = shadowCasting;
  const edgeEffectRef = useRef(edgeEffect);
  edgeEffectRef.current = edgeEffect;
  const { status, error, start } = useGameState();
  const [canvasKey, setCanvasKey] = useState(0);
  const hasStartedRef = useRef(false);
  const { bufSize, setBufSize } = useCanvasBufferSize(canvasRef, status, canvasKey);
  const shadowDebugMode = useShadowEditorStore((s) => s.debugMode);

  const fitSize = useCanvasFit({ containerRef, bufW: bufSize.w, bufH: bufSize.h, stretch, pixelPerfect });

  useCanvasDisplaySize([canvasRef, fxCanvasRef, shadowCanvasRef], fitSize, status);
  usePublishFitSize(fitSize);

  useEdgeGlowLoop({ status, canvasKey, canvasRef, fxCanvasRef, glowRendererRef, edgeEffectRef, setBufSize });
  useShadowCastingLoop({ status, canvasKey, canvasRef, shadowCanvasRef, shadowRendererRef, shadowProjectRef, shadowCastingRef });
  useGameBoot({ status, canvasKey, canvasRef, hasStartedRef, assetData, configIni, profileId, start, setCanvasKey });

  return (
    <Box className="game-layer" ref={containerRef}>
      {status === 'error' && (
        <Box className="game-layer__status-overlay">
          <Text className="game-layer__status-text game-layer__status-text--error">Error: {error}</Text>
        </Box>
      )}
      <GameLayerCanvases
        canvasKey={canvasKey}
        running={status === 'running'}
        shadowDebugMode={shadowDebugMode}
        canvasRef={canvasRef}
        fxCanvasRef={fxCanvasRef}
        shadowCanvasRef={shadowCanvasRef}
      />
      <GameLayerOverlays
        status={status}
        width={fitSize.width}
        height={fitSize.height}
        profileId={profileId}
      />
    </Box>
  );
};

export { GameLayer };
