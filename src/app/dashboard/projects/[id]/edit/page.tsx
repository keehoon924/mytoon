"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import EditorPanel from "@/components/editor/EditorPanel";
import VersionDrawer from "@/components/editor/VersionDrawer";
import type { CanvasObject, BubbleType, StrokeObject, FilterSettings } from "@/components/editor/types";
import { DEFAULT_FILTERS } from "@/components/editor/types";
import { addBubble } from "@/components/editor/CanvasEditor";
import type { EditorTool, BrushSettings } from "@/components/editor/CanvasEditor";
import { nanoid } from "nanoid";

const CanvasEditor = dynamic(() => import("@/components/editor/CanvasEditor"), { ssr: false });
const AUTOSAVE_INTERVAL_MS = 30000;

type Bubble = {
  id: string; type: string; text: string; font: string;
  color: string; fontSize: number; bold: boolean;
  x: number; y: number; w: number; h: number;
  rotation: number; zIndex: number;
};
type OverlayItem =
  | { id: string; type: "character"; characterId: string; imageUrl: string; x: number; y: number; w: number; h: number; rotation: number; zIndex: number }
  | { id: string; type: "stroke"; points: number[]; color: string; width: number; erase: boolean; zIndex: number };

type OverlayJson = {
  items?: OverlayItem[];
  filters?: FilterSettings;
} | null;

type Cut = {
  id: string; orderIndex: number; imageUrl: string | null; prompt: string | null;
  bubbles: Bubble[]; overlayJson: OverlayJson; hasPrevious: boolean;
};
type Character = { id: string; name: string; referenceImageUrl: string | null };

const DEFAULT_BRUSH: BrushSettings = { color: "#000000", width: 4, erase: false };

function overlayToObjects(overlay: OverlayJson): CanvasObject[] {
  const items = overlay?.items ?? [];
  return items.map((it): CanvasObject => {
    if (it.type === "character") {
      return {
        id: it.id, kind: "character",
        characterId: it.characterId, imageUrl: it.imageUrl,
        x: it.x, y: it.y, w: it.w, h: it.h,
        rotation: it.rotation, zIndex: it.zIndex,
      };
    }
    return {
      id: it.id, kind: "stroke",
      points: it.points, color: it.color, width: it.width, erase: it.erase,
      zIndex: it.zIndex,
    };
  });
}

function bubblesToObjects(bubbles: Bubble[]): CanvasObject[] {
  return bubbles.map((b) => ({
    id: b.id,
    kind: "bubble" as const,
    bubbleType: (b.type as BubbleType) ?? "speech",
    text: b.text,
    font: b.font ?? "default",
    color: b.color ?? "#111111",
    fontSize: b.fontSize ?? 14,
    bold: b.bold ?? false,
    x: b.x, y: b.y, w: b.w, h: b.h,
    rotation: b.rotation ?? 0,
    zIndex: b.zIndex ?? 0,
  }));
}

function cutToObjects(cut: Cut | undefined): CanvasObject[] {
  if (!cut) return [];
  return [...bubblesToObjects(cut.bubbles), ...overlayToObjects(cut.overlayJson)];
}

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cuts, setCuts] = useState<Cut[]>([]);
  const [activeCutIndex, setActiveCutIndex] = useState(0);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");

  const [tool, setTool] = useState<EditorTool>("select");
  const [brush, setBrush] = useState<BrushSettings>(DEFAULT_BRUSH);
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());

  const [regenPrompt, setRegenPrompt] = useState("");
  const [inpaintPrompt, setInpaintPrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [inpainting, setInpainting] = useState(false);
  const [opError, setOpError] = useState("");

  const [showVersionDrawer, setShowVersionDrawer] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [autosaveTick, setAutosaveTick] = useState(0);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const dirtyRef = useRef(false);

  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [projRes, charRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch("/api/characters"),
      ]);
      const projData = await projRes.json();
      const charData = await charRes.json();
      if (cancelled) return;
      if (projRes.ok) {
        const rawCuts: Array<Cut & { previousImageUrl?: string }> = projData.project.cuts;
        const normalized = rawCuts.map((c) => ({ ...c, hasPrevious: !!c.previousImageUrl }));
        setCuts(normalized);
        setTitle(projData.project.title);
        setObjects(cutToObjects(normalized[0]));
        setFilters(normalized[0]?.overlayJson?.filters ?? DEFAULT_FILTERS);
        setRegenPrompt(normalized[0]?.prompt ?? "");
      }
      if (charRes.ok) setCharacters(charData.characters);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  function clearMask() {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

  const buildPayload = useCallback((objs: CanvasObject[], f: FilterSettings) => {
    const bubbles = objs
      .filter((o) => o.kind === "bubble")
      .map((o) => o.kind === "bubble" ? ({
        type: o.bubbleType, text: o.text, font: o.font,
        color: o.color, fontSize: o.fontSize, bold: o.bold,
        x: o.x, y: o.y, w: o.w, h: o.h,
        rotation: o.rotation, zIndex: o.zIndex,
      }) : null)
      .filter((b) => b !== null);

    const items: OverlayItem[] = objs
      .filter((o) => o.kind !== "bubble")
      .map((o) => {
        if (o.kind === "character") {
          return {
            id: o.id, type: "character" as const,
            characterId: o.characterId, imageUrl: o.imageUrl,
            x: o.x, y: o.y, w: o.w, h: o.h,
            rotation: o.rotation, zIndex: o.zIndex,
          };
        }
        const s = o as StrokeObject;
        return {
          id: s.id, type: "stroke" as const,
          points: s.points, color: s.color, width: s.width, erase: s.erase,
          zIndex: s.zIndex,
        };
      });

    return { bubbles, overlay: { items, filters: f } };
  }, []);

  const saveCurrent = useCallback(async (objsArg?: CanvasObject[], filtersArg?: FilterSettings) => {
    const cut = cuts[activeCutIndex];
    if (!cut) return;
    const objs = objsArg ?? objects;
    const f = filtersArg ?? filters;
    setSaving(true);
    const { bubbles, overlay } = buildPayload(objs, f);
    await fetch(`/api/projects/${id}/cuts/${cut.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bubbles, overlay }),
    });
    setSaving(false);
    dirtyRef.current = false;
    setLastSavedAt(new Date());
  }, [cuts, activeCutIndex, objects, filters, id, buildPayload]);

  useEffect(() => {
    dirtyRef.current = true;
  }, [objects, filters]);

  useEffect(() => {
    const t = setInterval(() => setAutosaveTick((n) => n + 1), AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (autosaveTick === 0) return;
    if (!dirtyRef.current) return;
    let cancelled = false;
    (async () => {
      await saveCurrent();
      if (cancelled) return;
      await fetch(`/api/projects/${id}/versions`, { method: "POST" });
    })();
    return () => { cancelled = true; };
  }, [autosaveTick, saveCurrent, id]);

  async function reloadProject() {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    const rawCuts: Array<Cut & { previousImageUrl?: string }> = data.project.cuts;
    const normalized = rawCuts.map((c) => ({ ...c, hasPrevious: !!c.previousImageUrl }));
    setCuts(normalized);
    setTitle(data.project.title);
    setActiveCutIndex(0);
    setObjects(cutToObjects(normalized[0]));
    setFilters(normalized[0]?.overlayJson?.filters ?? DEFAULT_FILTERS);
    setSelectedId(null);
    setHiddenIds(new Set());
    setLockedIds(new Set());
    setRegenPrompt(normalized[0]?.prompt ?? "");
    dirtyRef.current = false;
  }

  const switchCut = useCallback(async (newIndex: number) => {
    await saveCurrent();
    setActiveCutIndex(newIndex);
    const target = cuts[newIndex];
    setObjects(cutToObjects(target));
    setFilters(target?.overlayJson?.filters ?? DEFAULT_FILTERS);
    setSelectedId(null);
    setHiddenIds(new Set());
    setLockedIds(new Set());
    setTool("select");
    setOpError("");
    setRegenPrompt(target?.prompt ?? "");
    clearMask();
  }, [cuts, saveCurrent]);

  function updateActiveCutImage(imageUrl: string, hasPrevious: boolean) {
    setCuts((prev) =>
      prev.map((c, i) => i === activeCutIndex ? { ...c, imageUrl, hasPrevious } : c)
    );
  }

  async function handleRegenerate() {
    const cut = cuts[activeCutIndex];
    if (!cut) return;
    setOpError("");
    setRegenerating(true);
    const res = await fetch(`/api/projects/${id}/cuts/${cut.id}/regenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: regenPrompt || undefined }),
    });
    const data = await res.json();
    setRegenerating(false);
    if (!res.ok) { setOpError(data.error); return; }
    updateActiveCutImage(data.cut.imageUrl, true);
    setRegenPrompt(data.cut.prompt ?? "");
  }

  async function handleInpaint() {
    const cut = cuts[activeCutIndex];
    if (!cut || !inpaintPrompt.trim()) return;
    setOpError("");
    setInpainting(true);
    const res = await fetch(`/api/projects/${id}/cuts/${cut.id}/inpaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: inpaintPrompt }),
    });
    const data = await res.json();
    setInpainting(false);
    if (!res.ok) { setOpError(data.error); return; }
    updateActiveCutImage(data.cut.imageUrl, true);
    clearMask();
    setTool("select");
    setInpaintPrompt("");
  }

  async function handleUndo() {
    const cut = cuts[activeCutIndex];
    if (!cut) return;
    setOpError("");
    const res = await fetch(`/api/projects/${id}/cuts/${cut.id}/undo`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { setOpError(data.error); return; }
    updateActiveCutImage(data.cut.imageUrl, false);
  }

  function handleAddBubble(type: BubbleType) {
    setObjects((prev) => addBubble(prev, type));
  }

  function handleAddCharacter() {
    setShowCharPicker(true);
  }

  function addCharacterById(charId: string) {
    const char = characters.find((c) => c.id === charId);
    if (!char || !char.referenceImageUrl) return;
    const newObj: CanvasObject = {
      id: nanoid(),
      kind: "character",
      characterId: char.id,
      imageUrl: char.referenceImageUrl,
      x: 20, y: 20, w: 120, h: 120,
      rotation: 0,
      zIndex: objects.length,
    };
    setObjects((prev) => [...prev, newObj]);
    setShowCharPicker(false);
  }

  function handleMoveZ(objId: string, dir: "up" | "down") {
    setObjects((prev) => {
      const target = prev.find((o) => o.id === objId);
      if (!target) return prev;
      let neighbor: CanvasObject | null = null;
      for (const o of prev) {
        if (o.id === objId) continue;
        if (dir === "up" && o.zIndex > target.zIndex && (!neighbor || o.zIndex < neighbor.zIndex)) neighbor = o;
        if (dir === "down" && o.zIndex < target.zIndex && (!neighbor || o.zIndex > neighbor.zIndex)) neighbor = o;
      }
      if (!neighbor) return prev;
      const newZ = neighbor.zIndex;
      const oldZ = target.zIndex;
      return prev.map((o) =>
        o.id === objId ? { ...o, zIndex: newZ } :
        o.id === neighbor!.id ? { ...o, zIndex: oldZ } : o
      );
    });
  }

  function handleDelete(objId: string) {
    setObjects((prev) => prev.filter((o) => o.id !== objId));
    if (selectedId === objId) setSelectedId(null);
    setHiddenIds((s) => { const n = new Set(s); n.delete(objId); return n; });
    setLockedIds((s) => { const n = new Set(s); n.delete(objId); return n; });
  }

  function toggleHidden(objId: string) {
    setHiddenIds((s) => { const n = new Set(s); if (n.has(objId)) n.delete(objId); else n.add(objId); return n; });
  }
  function toggleLocked(objId: string) {
    setLockedIds((s) => { const n = new Set(s); if (n.has(objId)) n.delete(objId); else n.add(objId); return n; });
  }

  const activeCut = cuts[activeCutIndex];

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* 모바일 경고 */}
      <div className="md:hidden flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <p className="text-xs text-amber-700">
          편집 기능은 PC 환경을 권장합니다. 모바일에서는 일부 기능이 제한될 수 있습니다.
        </p>
        <Link
          href={`/dashboard/projects/${id}`}
          className="shrink-0 text-xs font-medium text-amber-600 underline"
        >
          뒤로
        </Link>
      </div>

      <header className="border-b bg-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${id}`} className="text-gray-500 hover:text-black text-sm">←</Link>
          <span className="font-semibold text-gray-900 text-sm">{title} 편집</span>
          <span className="text-xs text-gray-400">
            {saving ? "저장 중..." : lastSavedAt ? `마지막 저장: ${lastSavedAt.toLocaleTimeString("ko-KR")}` : "자동 저장 대기"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionDrawer(true)}
            className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            버전 히스토리
          </button>
          <button
            onClick={async () => { await saveCurrent(); router.push(`/dashboard/projects/${id}`); }}
            disabled={saving}
            className="rounded-full bg-black px-5 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            저장 완료
          </button>
        </div>
      </header>

      <VersionDrawer
        projectId={id}
        open={showVersionDrawer}
        onClose={() => setShowVersionDrawer(false)}
        onRestored={() => { reloadProject(); }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 컷 목록 */}
        <aside className="w-20 border-r bg-white flex flex-col items-center py-4 gap-2 overflow-y-auto shrink-0">
          {cuts.map((cut, i) => (
            <button key={cut.id} onClick={() => switchCut(i)}
              className={`w-14 h-14 rounded-lg border-2 overflow-hidden shrink-0 ${i === activeCutIndex ? "border-black" : "border-gray-200"}`}>
              {cut.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cut.imageUrl} alt={`컷 ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">{i + 1}</div>
              )}
            </button>
          ))}
        </aside>

        {/* 캔버스 영역 */}
        <div className="flex flex-1 items-start justify-center gap-6 p-6 overflow-auto">
          <div className="flex flex-col gap-3">
            {/* 재생성 툴바 */}
            <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2">
              <input
                type="text"
                value={regenPrompt}
                onChange={(e) => setRegenPrompt(e.target.value)}
                placeholder={activeCut?.prompt ?? "장면 설명 입력 후 재생성"}
                className="flex-1 text-xs border-none outline-none text-gray-700 placeholder-gray-400 min-w-0"
              />
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="shrink-0 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 hover:bg-gray-800"
              >
                {regenerating ? "생성 중..." : "재생성"}
              </button>
              {activeCut?.hasPrevious && (
                <button
                  onClick={handleUndo}
                  className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                >
                  이전으로
                </button>
              )}
            </div>

            {/* 캔버스 */}
            <CanvasEditor
              imageUrl={activeCut?.imageUrl ?? null}
              objects={objects}
              onChange={setObjects}
              tool={tool}
              brush={brush}
              filters={filters}
              hiddenIds={hiddenIds}
              lockedIds={lockedIds}
              maskCanvasRef={maskCanvasRef}
            />

            {/* 도구 선택 */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
                <button
                  onClick={() => { setTool("select"); clearMask(); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tool === "select" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                >
                  선택
                </button>
                <button
                  onClick={() => { setTool("brush"); clearMask(); setSelectedId(null); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tool === "brush" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                >
                  브러시
                </button>
                <button
                  onClick={() => setTool("mask")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tool === "mask" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                >
                  마스크 브러시
                </button>
              </div>
              {tool === "mask" && (
                <button onClick={clearMask} className="text-xs text-gray-500 hover:text-black">
                  마스크 초기화
                </button>
              )}
            </div>

            {/* 인페인트 패널 (마스크 모드일 때만) */}
            {tool === "mask" && (
              <div className="bg-white border rounded-xl p-3 flex flex-col gap-2">
                <p className="text-xs text-gray-500">변경할 내용을 입력하세요</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inpaintPrompt}
                    onChange={(e) => setInpaintPrompt(e.target.value)}
                    placeholder="예: 하늘을 붉은 석양으로 바꿔줘"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    onClick={handleInpaint}
                    disabled={inpainting || !inpaintPrompt.trim()}
                    className="shrink-0 rounded-lg bg-black px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {inpainting ? "적용 중..." : "적용"}
                  </button>
                </div>
                <p className="text-xs text-gray-400">붓으로 수정할 영역을 칠한 뒤, 원하는 변경 내용을 입력하세요.</p>
              </div>
            )}

            {opError && <p className="text-xs text-red-500">{opError}</p>}
          </div>

          <EditorPanel
            objects={objects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={setObjects}
            onAddBubble={handleAddBubble}
            onAddCharacter={handleAddCharacter}
            onMoveZ={handleMoveZ}
            onDelete={handleDelete}
            characterImages={characters.map((c) => ({
              id: c.id, name: c.name, imageUrl: c.referenceImageUrl,
            }))}
            tool={tool}
            brush={brush}
            onBrushChange={setBrush}
            filters={filters}
            onFiltersChange={setFilters}
            hiddenIds={hiddenIds}
            lockedIds={lockedIds}
            onToggleHidden={toggleHidden}
            onToggleLocked={toggleLocked}
          />
        </div>
      </div>

      {/* 캐릭터 선택 모달 */}
      {showCharPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowCharPicker(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-900 mb-4">캐릭터 추가</h3>
            {characters.length === 0 ? (
              <p className="text-sm text-gray-400">등록된 캐릭터가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => addCharacterById(c.id)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-[#E8F0EB] p-2 hover:border-[#7CAF8A] hover:bg-[#F0F7F2]"
                  >
                    {c.referenceImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.referenceImageUrl}
                        alt={c.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-[#F0F7F2] flex items-center justify-center text-2xl">🙂</div>
                    )}
                    <span className="text-xs text-gray-700 text-center truncate w-full">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowCharPicker(false)}
              className="mt-4 w-full rounded-full border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
