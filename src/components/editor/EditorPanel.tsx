"use client";

import type { CanvasObject, BubbleObject, BubbleType } from "./types";
import { BUBBLE_LABELS, FONTS } from "./types";

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
};

const BUBBLE_TYPES: BubbleType[] = ["speech", "thought", "shout", "narration", "sfx"];

export default function EditorPanel({
  objects, selectedId, onChange, onAddBubble, onAddCharacter,
  onMoveZ, onDelete, characterImages,
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

  return (
    <div className="flex flex-col gap-4 w-56 shrink-0">
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

      {/* 선택된 말풍선 속성 */}
      {selectedBubble && (
        <div className="rounded-xl border bg-white p-3 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-500">속성</p>

          {/* 텍스트 */}
          <div>
            <label className="text-xs text-gray-500">텍스트</label>
            <textarea rows={2} value={selectedBubble.text}
              onChange={(e) => updateBubble({ text: e.target.value })}
              className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black" />
          </div>

          {/* 폰트 */}
          <div>
            <label className="text-xs text-gray-500">폰트</label>
            <select value={selectedBubble.font} onChange={(e) => updateBubble({ font: e.target.value })}
              className="mt-0.5 w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none">
              {FONTS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* 폰트 크기 */}
          <div>
            <label className="text-xs text-gray-500">크기 {selectedBubble.fontSize}px</label>
            <input type="range" min={10} max={32} value={selectedBubble.fontSize}
              onChange={(e) => updateBubble({ fontSize: Number(e.target.value) })}
              className="w-full" />
          </div>

          {/* 색상 + 굵기 */}
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

          {/* z-order */}
          <div>
            <label className="text-xs text-gray-500">레이어</label>
            <div className="flex gap-1 mt-0.5">
              <button onClick={() => onMoveZ(selectedBubble.id, "up")}
                className="flex-1 rounded border border-gray-200 py-1 text-xs hover:bg-gray-50">앞으로</button>
              <button onClick={() => onMoveZ(selectedBubble.id, "down")}
                className="flex-1 rounded border border-gray-200 py-1 text-xs hover:bg-gray-50">뒤로</button>
            </div>
          </div>

          {/* 삭제 */}
          <button onClick={() => onDelete(selectedBubble.id)}
            className="w-full rounded-lg border border-red-200 py-1.5 text-xs text-red-500 hover:bg-red-50">
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
