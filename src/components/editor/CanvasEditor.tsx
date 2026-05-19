"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer, Group } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { CanvasObject, BubbleObject, BubbleType } from "./types";
import { FONT_FAMILY } from "./types";
import { nanoid } from "nanoid";

const CANVAS_SIZE = 512;

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

type Props = {
  imageUrl: string | null;
  objects: CanvasObject[];
  onChange: (objects: CanvasObject[]) => void;
};

function CutImage({ url }: { url: string }) {
  const [img] = useImage(url, "anonymous");
  return <KonvaImage image={img} width={CANVAS_SIZE} height={CANVAS_SIZE} />;
}

function BubbleShape({ obj, isSelected, onSelect, onChange }: {
  obj: BubbleObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (o: BubbleObject) => void;
}) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const fontFamily = FONT_FAMILY[obj.font] ?? "sans-serif";

  useEffect(() => {
    if (!trRef.current) return;
    if (isSelected && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else {
      trRef.current.nodes([]);
    }
  }, [isSelected]);

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
        draggable
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

export default function CanvasEditor({ imageUrl, objects, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const deselect = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === stageRef.current) setSelectedId(null);
  }, []);

  function updateObject(updated: CanvasObject) {
    onChange(objects.map((o) => (o.id === updated.id ? updated : o)));
  }

  return (
    <Stage
      ref={stageRef}
      width={CANVAS_SIZE} height={CANVAS_SIZE}
      onMouseDown={deselect} onTouchStart={deselect}
      className="border rounded-lg overflow-hidden shadow"
    >
        <Layer>
          {imageUrl && <CutImage url={imageUrl} />}
          {[...objects]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((obj) =>
              obj.kind === "bubble" ? (
                <BubbleShape
                  key={obj.id}
                  obj={obj}
                  isSelected={selectedId === obj.id}
                  onSelect={() => setSelectedId(obj.id)}
                  onChange={(updated) => updateObject(updated)}
                />
              ) : null
            )}
        </Layer>
      </Stage>
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
