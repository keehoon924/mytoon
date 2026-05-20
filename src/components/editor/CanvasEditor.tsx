"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer, Group, Line } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { CanvasObject, BubbleObject, BubbleType, CharacterObject, StrokeObject, FilterSettings } from "./types";
import { FONT_FAMILY, CANVAS_SIZE, DEFAULT_FILTERS } from "./types";
import { nanoid } from "nanoid";

const MASK_BRUSH_RADIUS = 20;

const BUBBLE_BG: Record<string, string> = {
  narration: "#fffbe6",
  sfx: "#fff0f0",
};
const BUBBLE_BORDER: Record<string, string> = {
  shout: "#e53e3e",
  thought: "#7c3aed",
};
const BUBBLE_DASH: Record<string, number[]> = {
  thought: [6, 3],
};
const BUBBLE_STROKE_WIDTH: Record<string, number> = {
  shout: 2.5,
};
const BUBBLE_RADIUS: Record<string, number> = {
  sfx: 0,
  shout: 4,
};

export type EditorTool = "select" | "brush" | "mask";

export type BrushSettings = {
  color: string;
  width: number;
  erase: boolean;
};

type Props = {
  imageUrl: string | null;
  objects: CanvasObject[];
  onChange: (objects: CanvasObject[]) => void;
  tool?: EditorTool;
  brush?: BrushSettings;
  filters?: FilterSettings;
  hiddenIds?: Set<string>;
  lockedIds?: Set<string>;
  maskCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
};

type KonvaFilter = typeof Konva.Filters.Brighten;

function buildKonvaFilters(filters: FilterSettings): KonvaFilter[] {
  const list: KonvaFilter[] = [];
  if (filters.brightness !== 0) list.push(Konva.Filters.Brighten);
  if (filters.contrast !== 0) list.push(Konva.Filters.Contrast);
  if (filters.saturation !== 0) list.push(Konva.Filters.HSL);
  if (filters.grayscale) list.push(Konva.Filters.Grayscale);
  if (filters.sepia) list.push(Konva.Filters.Sepia);
  return list;
}

function CutImage({ url, filters }: { url: string; filters: FilterSettings }) {
  const [img] = useImage(url, "anonymous");
  const ref = useRef<Konva.Image>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !img) return;
    node.cache();
    node.filters(buildKonvaFilters(filters));
    node.brightness(filters.brightness);
    node.contrast(filters.contrast * 100);
    node.saturation(filters.saturation);
    node.getLayer()?.batchDraw();
  }, [img, filters]);

  return <KonvaImage ref={ref} image={img} width={CANVAS_SIZE} height={CANVAS_SIZE} />;
}

function BubbleShape({ obj, isSelected, locked, onSelect, onChange }: {
  obj: BubbleObject;
  isSelected: boolean;
  locked: boolean;
  onSelect: () => void;
  onChange: (o: BubbleObject) => void;
}) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const fontFamily = FONT_FAMILY[obj.font] ?? "sans-serif";

  useEffect(() => {
    if (!trRef.current) return;
    if (isSelected && !locked && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else {
      trRef.current.nodes([]);
    }
  }, [isSelected, locked]);

  const bgColor = BUBBLE_BG[obj.bubbleType] ?? "#ffffff";
  const borderColor = BUBBLE_BORDER[obj.bubbleType] ?? "#374151";
  const dash = BUBBLE_DASH[obj.bubbleType];

  return (
    <>
      <Group
        ref={groupRef}
        x={obj.x} y={obj.y}
        width={obj.w} height={obj.h}
        rotation={obj.rotation}
        draggable={!locked}
        listening={!locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ ...obj, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = groupRef.current;
          if (!node) return;
          onChange({
            ...obj,
            x: node.x(), y: node.y(),
            w: Math.max(60, node.width() * node.scaleX()),
            h: Math.max(30, node.height() * node.scaleY()),
            rotation: node.rotation(),
          });
          node.scaleX(1); node.scaleY(1);
        }}
      >
        <Rect width={obj.w} height={obj.h} fill={bgColor} stroke={borderColor}
          strokeWidth={BUBBLE_STROKE_WIDTH[obj.bubbleType] ?? 1.5}
          cornerRadius={BUBBLE_RADIUS[obj.bubbleType] ?? 12}
          dash={dash} />
        <Text
          text={obj.text} width={obj.w} height={obj.h}
          align="center" verticalAlign="middle"
          fontSize={obj.fontSize} fill={obj.color}
          fontFamily={fontFamily}
          fontStyle={obj.bold ? "bold" : "normal"}
          padding={8} wrap="word" ellipsis />
      </Group>
      <Transformer
        ref={trRef}
        rotateEnabled keepRatio={false}
        enabledAnchors={["top-left","top-right","bottom-left","bottom-right","middle-left","middle-right"]}
      />
    </>
  );
}

function CharacterShape({ obj, isSelected, locked, onSelect, onChange }: {
  obj: CharacterObject;
  isSelected: boolean;
  locked: boolean;
  onSelect: () => void;
  onChange: (o: CharacterObject) => void;
}) {
  const [img] = useImage(obj.imageUrl, "anonymous");
  const imgRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!trRef.current) return;
    if (isSelected && !locked && imgRef.current) {
      trRef.current.nodes([imgRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else {
      trRef.current.nodes([]);
    }
  }, [isSelected, locked]);

  return (
    <>
      <KonvaImage
        ref={imgRef}
        image={img}
        x={obj.x} y={obj.y} width={obj.w} height={obj.h}
        rotation={obj.rotation}
        draggable={!locked}
        listening={!locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ ...obj, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = imgRef.current;
          if (!node) return;
          onChange({
            ...obj,
            x: node.x(), y: node.y(),
            w: Math.max(20, node.width() * node.scaleX()),
            h: Math.max(20, node.height() * node.scaleY()),
            rotation: node.rotation(),
          });
          node.scaleX(1); node.scaleY(1);
        }}
      />
      <Transformer
        ref={trRef}
        rotateEnabled keepRatio={false}
        enabledAnchors={["top-left","top-right","bottom-left","bottom-right"]}
      />
    </>
  );
}

export default function CanvasEditor({
  imageUrl, objects, onChange,
  tool = "select",
  brush = { color: "#000000", width: 4, erase: false },
  filters = DEFAULT_FILTERS,
  hiddenIds,
  lockedIds,
  maskCanvasRef,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const isDrawing = useRef(false);
  const currentStrokeId = useRef<string | null>(null);

  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === "brush") {
      const pos = stageRef.current?.getPointerPosition();
      if (!pos) return;
      isDrawing.current = true;
      const id = nanoid();
      currentStrokeId.current = id;
      const newStroke: StrokeObject = {
        id,
        kind: "stroke",
        points: [pos.x, pos.y],
        color: brush.color,
        width: brush.width,
        erase: brush.erase,
        zIndex: objects.length,
      };
      onChange([...objects, newStroke]);
      return;
    }
    if (e.target === stageRef.current) setSelectedId(null);
  }, [tool, brush, objects, onChange]);

  const handleStageMouseMove = useCallback(() => {
    if (tool !== "brush" || !isDrawing.current || !currentStrokeId.current) return;
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    const id = currentStrokeId.current;
    onChange(
      objects.map((o) =>
        o.id === id && o.kind === "stroke"
          ? { ...o, points: [...o.points, pos.x, pos.y] }
          : o
      )
    );
  }, [tool, objects, onChange]);

  const handleStageMouseUp = useCallback(() => {
    isDrawing.current = false;
    currentStrokeId.current = null;
  }, []);

  function updateObject(updated: CanvasObject) {
    onChange(objects.map((o) => (o.id === updated.id ? updated : o)));
  }

  function initMaskCanvas() {
    const canvas = maskCanvasRef?.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function drawMaskBrush(x: number, y: number) {
    const ctx = initMaskCanvas();
    if (!ctx) return;
    ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
    ctx.beginPath();
    ctx.arc(x, y, MASK_BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleMaskMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    isDrawing.current = true;
    const { x, y } = getCanvasPos(e);
    drawMaskBrush(x, y);
  }

  function handleMaskMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    const { x, y } = getCanvasPos(e);
    drawMaskBrush(x, y);
  }

  function handleMaskMouseUp() {
    isDrawing.current = false;
  }

  const isMaskMode = tool === "mask";
  const isBrushMode = tool === "brush";

  return (
    <div className="relative inline-block">
      <Stage
        ref={stageRef}
        width={CANVAS_SIZE} height={CANVAS_SIZE}
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onTouchMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onTouchEnd={handleStageMouseUp}
        className={`border rounded-lg overflow-hidden shadow ${isBrushMode ? "cursor-crosshair" : ""}`}
      >
        <Layer>
          {imageUrl && <CutImage url={imageUrl} filters={filters} />}
          {[...objects]
            .sort((a, b) => a.zIndex - b.zIndex)
            .filter((obj) => !hiddenIds?.has(obj.id))
            .map((obj) => {
              const locked = lockedIds?.has(obj.id) ?? false;
              if (obj.kind === "bubble") {
                return (
                  <BubbleShape
                    key={obj.id}
                    obj={obj}
                    isSelected={selectedId === obj.id}
                    locked={locked || isBrushMode}
                    onSelect={() => !isBrushMode && setSelectedId(obj.id)}
                    onChange={(updated) => updateObject(updated)}
                  />
                );
              }
              if (obj.kind === "character") {
                return (
                  <CharacterShape
                    key={obj.id}
                    obj={obj}
                    isSelected={selectedId === obj.id}
                    locked={locked || isBrushMode}
                    onSelect={() => !isBrushMode && setSelectedId(obj.id)}
                    onChange={(updated) => updateObject(updated)}
                  />
                );
              }
              return (
                <Line
                  key={obj.id}
                  points={obj.points}
                  stroke={obj.color}
                  strokeWidth={obj.width}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={obj.erase ? "destination-out" : "source-over"}
                  listening={false}
                />
              );
            })}
        </Layer>
      </Stage>
      {isMaskMode && (
        <canvas
          ref={maskCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 rounded-lg cursor-crosshair"
          style={{ pointerEvents: "all" }}
          onMouseDown={handleMaskMouseDown}
          onMouseMove={handleMaskMouseMove}
          onMouseUp={handleMaskMouseUp}
          onMouseLeave={handleMaskMouseUp}
        />
      )}
    </div>
  );
}

export function addBubble(
  objects: CanvasObject[],
  bubbleType: BubbleType,
  text = "대사 입력"
): CanvasObject[] {
  const newBubble: BubbleObject = {
    id: nanoid(),
    kind: "bubble",
    bubbleType,
    text,
    font: "default",
    color: "#111111",
    fontSize: 14,
    bold: false,
    x: 20,
    y: 20,
    w: 200,
    h: 70,
    rotation: 0,
    zIndex: objects.length,
  };
  return [...objects, newBubble];
}
