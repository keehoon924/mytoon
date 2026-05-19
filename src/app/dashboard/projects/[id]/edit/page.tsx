"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import EditorPanel from "@/components/editor/EditorPanel";
import type { CanvasObject, BubbleType } from "@/components/editor/types";
import { addBubble } from "@/components/editor/CanvasEditor";
import { nanoid } from "nanoid";

const CanvasEditor = dynamic(() => import("@/components/editor/CanvasEditor"), { ssr: false });

type Bubble = { id: string; type: string; text: string; font: string; x: number; y: number; w: number; h: number };
type Cut = { id: string; orderIndex: number; imageUrl: string | null; prompt: string | null; bubbles: Bubble[]; overlayJson: unknown; hasPrevious: boolean };
type Character = { id: string; name: string; referenceImageUrl: string | null };

function bubblesToObjects(bubbles: Bubble[]): CanvasObject[] {
  return bubbles.map((b, i) => ({
    id: b.id,
    kind: "bubble" as const,
    bubbleType: (b.type as BubbleType) ?? "speech",
    text: b.text,
    font: b.font ?? "default",
    color: "#111111",
    fontSize: 14,
    bold: false,
    x: b.x, y: b.y, w: b.w, h: b.h,
    rotation: 0,
    zIndex: i,
  }));
}

type Tool = "select" | "mask";

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

  const [tool, setTool] = useState<Tool>("select");
  const [regenPrompt, setRegenPrompt] = useState("");
  const [inpaintPrompt, setInpaintPrompt] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [inpainting, setInpainting] = useState(false);
  const [opError, setOpError] = useState("");

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
        const rawCuts = projData.project.cuts;
        setCuts(rawCuts.map((c: Cut & { previousImageUrl?: string }) => ({
          ...c,
          hasPrevious: !!c.previousImageUrl,
        })));
        setTitle(projData.project.title);
        setObjects(bubblesToObjects(rawCuts[0]?.bubbles ?? []));
        setRegenPrompt(rawCuts[0]?.prompt ?? "");
      }
      if (charRes.ok) setCharacters(charData.characters);
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const switchCut = useCallback(async (newIndex: number) => {
    await saveCurrent();
    setActiveCutIndex(newIndex);
    setObjects(bubblesToObjects(cuts[newIndex]?.bubbles ?? []));
    setSelectedId(null);
    setTool("select");
    setOpError("");
    setRegenPrompt(cuts[newIndex]?.prompt ?? "");
    clearMask();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuts, objects]);

  async function saveCurrent() {
    const cut = cuts[activeCutIndex];
    if (!cut) return;
    setSaving(true);
    const bubbles = objects
      .filter((o) => o.kind === "bubble")
      .map((o) => ({
        type: o.kind === "bubble" ? o.bubbleType : "speech",
        text: o.kind === "bubble" ? o.text : "",
        font: o.kind === "bubble" ? o.font : "default",
        color: o.kind === "bubble" ? o.color : "#000000",
        fontSize: o.kind === "bubble" ? o.fontSize : 14,
        bold: o.kind === "bubble" ? o.bold : false,
        x: o.x, y: o.y, w: o.w, h: o.h,
        rotation: o.rotation,
        zIndex: o.zIndex,
      }));
    const overlayItems = objects
      .filter((o) => o.kind === "character")
      .map((o) => ({
        id: o.id,
        type: "character" as const,
        characterId: o.kind === "character" ? o.characterId : "",
        imageUrl: o.kind === "character" ? o.imageUrl : "",
        x: o.x, y: o.y, w: o.w, h: o.h,
        rotation: o.rotation,
        zIndex: o.zIndex,
      }));
    await fetch(`/api/projects/${id}/cuts/${cut.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bubbles, overlayItems }),
    });
    setSaving(false);
  }

  function clearMask() {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

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
    const char = characters[0];
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
  }

  const activeCut = cuts[activeCutIndex];
  const isMaskMode = tool === "mask";

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${id}`} className="text-gray-500 hover:text-black text-sm">←</Link>
          <span className="font-semibold text-gray-900 text-sm">{title} 편집</span>
        </div>
        <button
          onClick={async () => { await saveCurrent(); router.push(`/dashboard/projects/${id}`); }}
          disabled={saving}
          className="rounded-full bg-black px-5 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "저장 중..." : "저장 완료"}
        </button>
      </header>

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
              maskMode={isMaskMode}
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
                  onClick={() => setTool("mask")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tool === "mask" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                >
                  마스크 브러시
                </button>
              </div>
              {isMaskMode && (
                <button onClick={clearMask} className="text-xs text-gray-500 hover:text-black">
                  마스크 초기화
                </button>
              )}
            </div>

            {/* 인페인트 패널 (마스크 모드일 때만) */}
            {isMaskMode && (
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
          />
        </div>
      </div>
    </main>
  );
}
