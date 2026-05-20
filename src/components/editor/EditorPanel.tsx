"use client";

import type { CanvasObject, BubbleObject, BubbleType, FilterSettings } from "./types";
import { BUBBLE_LABELS, FONTS } from "./types";
import type { EditorTool, BrushSettings } from "./CanvasEditor";

type Props = {
  objects: CanvasObject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (objects: CanvasObject[]) => void;
  onAddBubble: (type: BubbleType) => void;
  onAddCharacter: () => void;
  onMoveZ: (id: string, dir: "up" | "down") => void;
  onDelete: (id: string) => void;
  characterImages: { id: string; name: string; imageUrl: string | null }[];

  tool: EditorTool;
  brush: BrushSettings;
  onBrushChange: (b: BrushSettings) => void;

  filters: FilterSettings;
  onFiltersChange: (f: FilterSettings) => void;

  hiddenIds: Set<string>;
  lockedIds: Set<string>;
  onToggleHidden: (id: string) => void;
  onToggleLocked: (id: string) => void;
};

const BUBBLE_TYPES: BubbleType[] = ["speech", "thought", "shout", "narration", "sfx"];

function layerLabel(o: CanvasObject): string {
  if (o.kind === "bubble") return `${BUBBLE_LABELS[o.bubbleType]}: ${o.text.slice(0, 8) || "(빈 텍스트)"}`;
  if (o.kind === "character") return "캐릭터";
  return `브러시${o.erase ? " (지우개)" : ""}`;
}

export default function EditorPanel({
  objects, selectedId, onSelect, onChange, onAddBubble, onAddCharacter,
  onMoveZ, onDelete, characterImages,
  tool, brush, onBrushChange,
  filters, onFiltersChange,
  hiddenIds, lockedIds, onToggleHidden, onToggleLocked,
}: Props) {
  const selected = objects.find((o) => o.id === selectedId);
  const selectedBubble = selected?.kind === "bubble" ? (selected as BubbleObject) : null;

  function updateBubble(patch: Partial<BubbleObject>) {
    if (!selectedBubble) return;
    onChange(
      objects.map((o) =>
        o.id === selectedId && o.kind === "bubble" ? ({ ...o, ...patch } as BubbleObject) : o
      )
    );
  }

  const sortedLayers = [...objects].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex flex-col gap-4 w-64 shrink-0">
      {/* 말풍선 추가 */}
      <div className="rounded-xl border bg-white p-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">말풍선 추가</p>
        <div className="grid grid-cols-2 gap-1.5">
          {BUBBLE_TYPES.map((t) => (
            <button key={t} onClick={() => onAddBubble(t)}
              className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 text-center">
              {BUBBLE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* 캐릭터 추가 */}
      {characterImages.length > 0 && (
        <div className="rounded-xl border bg-white p-3">
          <p className="text-xs font-semibold text-gray-500 mb-2">캐릭터 스티커</p>
          <button onClick={onAddCharacter}
            className="w-full rounded-lg border border-gray-200 px-2 py-2 text-xs text-gray-700 hover:bg-gray-50">
            + 캐릭터 추가
          </button>
        </div>
      )}

      {/* 브러시 설정 (브러시 모드일 때만 강조) */}
      <div className={`rounded-xl border bg-white p-3 flex flex-col gap-2 ${tool === "brush" ? "ring-2 ring-black" : ""}`}>
        <p className="text-xs font-semibold text-gray-500">브러시</p>
        <div className="flex items-center gap-2">
          <input type="color" value={brush.color}
            disabled={brush.erase}
            onChange={(e) => onBrushChange({ ...brush, color: e.target.value })}
            className="h-7 w-10 rounded border border-gray-200 cursor-pointer disabled:opacity-40" />
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" checked={brush.erase}
              onChange={(e) => onBrushChange({ ...brush, erase: e.target.checked })} />
            지우개
          </label>
        </div>
        <div>
          <label className="text-xs text-gray-500">굵기 {brush.width}px</label>
          <input type="range" min={1} max={30} value={brush.width}
            onChange={(e) => onBrushChange({ ...brush, width: Number(e.target.value) })}
            className="w-full" />
        </div>
      </div>

      {/* 필터 */}
      <div className="rounded-xl border bg-white p-3 flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500">필터</p>
        <div>
          <label className="text-xs text-gray-500">밝기 {filters.brightness.toFixed(2)}</label>
          <input type="range" min={-1} max={1} step={0.05} value={filters.brightness}
            onChange={(e) => onFiltersChange({ ...filters, brightness: Number(e.target.value) })}
            className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500">대비 {filters.contrast.toFixed(2)}</label>
          <input type="range" min={-1} max={1} step={0.05} value={filters.contrast}
            onChange={(e) => onFiltersChange({ ...filters, contrast: Number(e.target.value) })}
            className="w-full" />
        </div>
        <div>
          <label className="text-xs text-gray-500">채도 {filters.saturation.toFixed(2)}</label>
          <input type="range" min={-2} max={2} step={0.05} value={filters.saturation}
            onChange={(e) => onFiltersChange({ ...filters, saturation: Number(e.target.value) })}
            className="w-full" />
        </div>
        <div className="flex gap-3 text-xs text-gray-600">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={filters.grayscale}
              onChange={(e) => onFiltersChange({ ...filters, grayscale: e.target.checked })} />
            흑백
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={filters.sepia}
              onChange={(e) => onFiltersChange({ ...filters, sepia: e.target.checked })} />
            세피아
          </label>
        </div>
        <button
          onClick={() => onFiltersChange({ brightness: 0, contrast: 0, saturation: 0, grayscale: false, sepia: false })}
          className="self-start text-xs text-gray-400 hover:text-black"
        >
          초기화
        </button>
      </div>

      {/* 레이어 패널 */}
      <div className="rounded-xl border bg-white p-3 flex flex-col gap-1">
        <p className="text-xs font-semibold text-gray-500 mb-1">레이어</p>
        {sortedLayers.length === 0 && (
          <p className="text-xs text-gray-400">레이어 없음</p>
        )}
        {sortedLayers.map((o) => {
          const isSelected = o.id === selectedId;
          const isHidden = hiddenIds.has(o.id);
          const isLocked = lockedIds.has(o.id);
          return (
            <div
              key={o.id}
              className={`flex items-center gap-1 rounded px-1.5 py-1 text-xs ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <button
                onClick={() => onToggleHidden(o.id)}
                title={isHidden ? "표시" : "숨기기"}
                className="w-5 text-gray-500 hover:text-black"
              >
                {isHidden ? "·" : "●"}
              </button>
              <button
                onClick={() => onToggleLocked(o.id)}
                title={isLocked ? "잠금 해제" : "잠금"}
                className="w-5 text-gray-500 hover:text-black"
              >
                {isLocked ? "□" : "○"}
              </button>
              <button
                onClick={() => onSelect(o.id)}
                className={`flex-1 text-left truncate ${isHidden ? "text-gray-300" : "text-gray-700"}`}
              >
                {layerLabel(o)}
              </button>
              <button onClick={() => onMoveZ(o.id, "up")} className="text-gray-400 hover:text-black px-1">↑</button>
              <button onClick={() => onMoveZ(o.id, "down")} className="text-gray-400 hover:text-black px-1">↓</button>
              <button onClick={() => onDelete(o.id)} className="text-red-400 hover:text-red-600 px-1">×</button>
            </div>
          );
        })}
      </div>

      {/* 선택된 말풍선 속성 */}
      {selectedBubble && (
        <div className="rounded-xl border bg-white p-3 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500">속성</p>

          <div>
            <label className="text-xs text-gray-500">텍스트</label>
            <textarea rows={2} value={selectedBubble.text}
              onChange={(e) => updateBubble({ text: e.target.value })}
              className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black" />
          </div>

          <div>
            <label className="text-xs text-gray-500">폰트</label>
            <select value={selectedBubble.font} onChange={(e) => updateBubble({ font: e.target.value })}
              className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none">
              {FONTS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">크기 {selectedBubble.fontSize}px</label>
            <input type="range" min={10} max={32} value={selectedBubble.fontSize}
              onChange={(e) => updateBubble({ fontSize: Number(e.target.value) })}
              className="w-full" />
          </div>

          <div className="flex gap-2 items-center">
            <div>
              <label className="text-xs text-gray-500">색상</label>
              <input type="color" value={selectedBubble.color}
                onChange={(e) => updateBubble({ color: e.target.value })}
                className="mt-0.5 block h-7 w-10 rounded border border-gray-200 cursor-pointer" />
            </div>
            <div className="flex items-center gap-1 mt-4">
              <input type="checkbox" id="bold-chk" checked={selectedBubble.bold}
                onChange={(e) => updateBubble({ bold: e.target.checked })} />
              <label htmlFor="bold-chk" className="text-xs text-gray-600">굵게</label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
