"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Folder = { id: string; name: string; parentId: string | null };
type Project = {
  id: string;
  title: string;
  cutCount: number;
  layoutType: string;
  status: string;
  folderId: string | null;
  updatedAt: string;
  cuts: { imageUrl: string | null }[];
};

type Props = {
  userEmail?: string;
  creditBalance?: number;
  isAdmin?: boolean;
};

function buildTree(folders: Folder[]) {
  const byParent = new Map<string | null, Folder[]>();
  for (const f of folders) {
    const key = f.parentId;
    const arr = byParent.get(key) ?? [];
    arr.push(f);
    byParent.set(key, arr);
  }
  return byParent;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  generating: "생성 중",
  done: "완료",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-500",
  generating: "bg-amber-100 text-amber-600",
  done: "bg-[#E8F0EB] text-[#7CAF8A]",
};

function FolderNode({
  folder,
  depth,
  tree,
  selectedId,
  onSelect,
  onRename,
  onDelete,
  onDrop,
}: {
  folder: Folder;
  depth: number;
  tree: Map<string | null, Folder[]>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDrop: (folderId: string | null, projectId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [dragOver, setDragOver] = useState(false);
  const children = tree.get(folder.id) ?? [];
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm cursor-pointer transition-colors ${
          isSelected ? "bg-[#E8F0EB] text-[#7CAF8A]" : "hover:bg-[#F0F7F2] text-gray-600"
        } ${dragOver ? "ring-2 ring-[#7CAF8A]" : ""}`}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => onSelect(folder.id)}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const projectId = e.dataTransfer.getData("text/project-id");
          if (projectId) onDrop(folder.id, projectId);
        }}
      >
        <span className="text-gray-300">📁</span>
        {editing ? (
          <input
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (name.trim() && name !== folder.name) onRename(folder.id, name.trim());
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") { setName(folder.name); setEditing(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-[#E8F0EB] px-1 text-xs outline-none"
          />
        ) : (
          <span className="flex-1 truncate">{folder.name}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="text-xs text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100"
          title="이름 변경"
        >
          ✎
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`"${folder.name}" 폴더를 삭제하시겠습니까?`)) onDelete(folder.id);
          }}
          className="text-xs text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
          title="삭제"
        >
          ×
        </button>
      </div>
      {children.map((c) => (
        <FolderNode
          key={c.id}
          folder={c}
          depth={depth + 1}
          tree={tree}
          selectedId={selectedId}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

type MenuState = { projectId: string; x: number; y: number } | null;

export default function DrawerView({
  userEmail: _u,
  creditBalance: _c,
  isAdmin: _a,
}: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [rootDragOver, setRootDragOver] = useState(false);
  const [menu, setMenu] = useState<MenuState>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [fRes, pRes] = await Promise.all([
        fetch("/api/folders"),
        fetch("/api/projects"),
      ]);
      if (cancelled) return;
      if (fRes.ok) setFolders((await fRes.json()).folders);
      if (pRes.ok) setProjects((await pRes.json()).projects);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // 메뉴 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function createFolder() {
    const name = prompt("새 폴더 이름");
    if (!name?.trim()) return;
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), parentId: selectedFolderId }),
    });
    const data = await res.json();
    if (res.ok) setFolders((prev) => [...prev, data.folder]);
  }

  async function renameFolder(id: string, name: string) {
    const res = await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  }

  async function deleteFolder(id: string) {
    const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (res.ok) {
      const descendants = new Set<string>();
      const collect = (fid: string) => {
        descendants.add(fid);
        folders.filter((c) => c.parentId === fid).forEach((c) => collect(c.id));
      };
      collect(id);
      setFolders((prev) => prev.filter((f) => !descendants.has(f.id)));
      setProjects((prev) =>
        prev.map((p) =>
          p.folderId && descendants.has(p.folderId) ? { ...p, folderId: null } : p
        )
      );
      if (selectedFolderId && descendants.has(selectedFolderId)) setSelectedFolderId(null);
    }
  }

  async function moveProject(folderId: string | null, projectId: string) {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    if (res.ok)
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, folderId } : p))
      );
    setMovingId(null);
  }

  async function deleteProject(projectId: string, title: string) {
    if (!confirm(`"${title}"을(를) 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setMenu(null);
  }

  async function duplicateProject(projectId: string) {
    const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.project) setProjects((prev) => [data.project, ...prev]);
    }
    setMenu(null);
  }

  async function renameProject(projectId: string, title: string) {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, title } : p)));
    setRenamingId(null);
    setMenu(null);
  }

  const tree = buildTree(folders);
  const roots = tree.get(null) ?? [];
  const visibleProjects = projects.filter((p) => (p.folderId ?? null) === selectedFolderId);

  const TEMPLATES = [
    { emoji: "📖", label: "기본 4컷", href: "/dashboard/new?template=basic4" },
    { emoji: "📱", label: "세로 스토리", href: "/dashboard/new?template=vertical" },
    { emoji: "💬", label: "말풍선 강조", href: "/dashboard/new?template=bubble" },
  ];

  return (
    <main className="min-h-screen bg-[#FFFBF5]">
      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
        {/* 폴더 사이드바 - 데스크탑 */}
        <aside className="hidden md:block w-52 shrink-0">
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">폴더</h2>
              <button
                onClick={createFolder}
                className="text-xs text-[#7CAF8A] hover:underline"
              >
                + 새 폴더
              </button>
            </div>

            {/* 전체 */}
            <div
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors mb-1 ${
                selectedFolderId === null
                  ? "bg-[#E8F0EB] text-[#7CAF8A] font-medium"
                  : "hover:bg-[#F0F7F2] text-gray-600"
              } ${rootDragOver ? "ring-2 ring-[#7CAF8A]" : ""}`}
              onClick={() => setSelectedFolderId(null)}
              onDragOver={(e) => { e.preventDefault(); setRootDragOver(true); }}
              onDragLeave={() => setRootDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setRootDragOver(false);
                const pid = e.dataTransfer.getData("text/project-id");
                if (pid) moveProject(null, pid);
              }}
            >
              <span>🏠</span>
              <span>전체</span>
            </div>

            {roots.map((f) => (
              <FolderNode
                key={f.id}
                folder={f}
                depth={0}
                tree={tree}
                selectedId={selectedFolderId}
                onSelect={setSelectedFolderId}
                onRename={renameFolder}
                onDelete={deleteFolder}
                onDrop={moveProject}
              />
            ))}
          </div>
        </aside>

        {/* 모바일 폴더 칩 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-[#E8F0EB] px-4 py-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              selectedFolderId === null
                ? "bg-[#7CAF8A] text-white"
                : "border border-[#E8F0EB] text-gray-600"
            }`}
          >
            전체
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                selectedFolderId === f.id
                  ? "bg-[#7CAF8A] text-white"
                  : "border border-[#E8F0EB] text-gray-600"
              }`}
            >
              {f.name}
            </button>
          ))}
          <button
            onClick={createFolder}
            className="shrink-0 rounded-full border border-dashed border-[#7CAF8A] px-3 py-1 text-xs text-[#7CAF8A]"
          >
            + 폴더
          </button>
        </div>

        {/* 프로젝트 목록 */}
        <div className="flex-1 min-w-0 pb-16 md:pb-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">내 서랍</h1>
          </div>

          {loading ? (
            /* 스켈레톤 */
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl border border-[#E8F0EB] bg-white overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleProjects.length === 0 ? (
            /* 빈 상태 */
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                {selectedFolderId === null
                  ? "아직 작품이 없어요"
                  : "이 폴더는 비어 있어요"}
              </h2>
              <p className="text-gray-400 mb-8">
                {selectedFolderId === null
                  ? "첫 인스타툰을 만들어 보세요!"
                  : "작품을 드래그해서 폴더에 옮기세요."}
              </p>

              {selectedFolderId === null && (
                <>
                  <Link
                    href="/dashboard/new"
                    className="inline-block rounded-full bg-[#7CAF8A] px-8 py-3 text-sm font-semibold text-white hover:bg-[#6a9e79] mb-8"
                  >
                    + 첫 인스타툰 만들기
                  </Link>

                  {/* 템플릿 추천 */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                      추천 템플릿으로 시작하기
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {TEMPLATES.map((t) => (
                        <Link
                          key={t.label}
                          href={t.href}
                          className="flex items-center gap-2 rounded-xl border border-[#E8F0EB] bg-white px-4 py-3 text-sm hover:border-[#7CAF8A] hover:bg-[#F0F7F2] transition-colors"
                        >
                          <span className="text-xl">{t.emoji}</span>
                          <span className="font-medium text-gray-700">{t.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {visibleProjects.map((p) => {
                const thumb = p.cuts[0]?.imageUrl;
                const isGenerating = p.status === "generating";

                return (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/project-id", p.id)}
                    className="group relative rounded-xl border border-[#E8F0EB] bg-white overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    {/* 썸네일 */}
                    <Link href={`/dashboard/projects/${p.id}`}>
                      <div className="aspect-square bg-[#F5F9F6] relative">
                        {isGenerating ? (
                          <div className="flex h-full flex-col items-center justify-center gap-2">
                            <div className="h-8 w-8 rounded-full border-2 border-[#7CAF8A] border-t-transparent animate-spin" />
                            <span className="text-xs text-gray-400">생성 중...</span>
                          </div>
                        ) : thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-200 text-3xl">
                            🖼️
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* 정보 */}
                    <div className="p-3">
                      {renamingId === p.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            renameProject(p.id, renameValue);
                          }}
                        >
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => setRenamingId(null)}
                            className="w-full rounded border border-[#E8F0EB] px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[#7CAF8A]"
                          />
                        </form>
                      ) : (
                        <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-gray-400">{p.cutCount}컷</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                        <span className="ml-auto text-xs text-gray-300">
                          {new Date(p.updatedAt).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* ... 메뉴 버튼 */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenu({ projectId: p.id, x: rect.left, y: rect.bottom + 4 });
                      }}
                      className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-400 shadow-sm opacity-0 group-hover:opacity-100 hover:text-gray-700 transition-opacity"
                    >
                      ···
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 카드 컨텍스트 메뉴 */}
      {menu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-44 rounded-xl border border-[#E8F0EB] bg-white shadow-lg py-1"
          style={{ top: menu.y, left: Math.min(menu.x, window.innerWidth - 180) }}
        >
          {(() => {
            const proj = projects.find((p) => p.id === menu.projectId);
            if (!proj) return null;
            return (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F0F7F2]"
                  onClick={() => {
                    setRenamingId(proj.id);
                    setRenameValue(proj.title);
                    setMenu(null);
                  }}
                >
                  이름 변경
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F0F7F2]"
                  onClick={() => {
                    setMovingId(proj.id);
                    setMenu(null);
                  }}
                >
                  폴더 이동
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F0F7F2]"
                  onClick={() => duplicateProject(proj.id)}
                >
                  복제
                </button>
                <hr className="my-1 border-[#E8F0EB]" />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  onClick={() => deleteProject(proj.id, proj.title)}
                >
                  삭제
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* 폴더 이동 모달 */}
      {movingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setMovingId(null)}
        >
          <div
            className="w-72 rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-900 mb-3">폴더 이동</h3>
            <div className="space-y-1">
              <button
                className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-[#F0F7F2]"
                onClick={() => moveProject(null, movingId)}
              >
                🏠 루트 (폴더 없음)
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-[#F0F7F2]"
                  onClick={() => moveProject(f.id, movingId)}
                >
                  📁 {f.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setMovingId(null)}
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
