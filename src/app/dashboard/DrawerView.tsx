"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Folder = { id: string; name: string; parentId: string | null };
type Project = {
  id: string; title: string; cutCount: number; layoutType: string; status: string;
  folderId: string | null; updatedAt: string;
  cuts: { imageUrl: string | null }[];
};

type Props = {
  userEmail: string;
  creditBalance: number;
  isAdmin: boolean;
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

function FolderNode({
  folder, depth, tree, selectedId, onSelect, onRename, onDelete, onDrop,
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
        className={`flex items-center gap-1 rounded px-2 py-1 text-sm cursor-pointer ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"} ${dragOver ? "ring-2 ring-black" : ""}`}
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
        <span className="text-gray-400">▸</span>
        {editing ? (
          <input
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={() => { setEditing(false); if (name.trim() && name !== folder.name) onRename(folder.id, name.trim()); }}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") { setName(folder.name); setEditing(false); } }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 rounded border border-gray-200 px-1 text-xs outline-none"
          />
        ) : (
          <span className="flex-1 truncate">{folder.name}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}
          className="text-xs text-gray-400 hover:text-black opacity-0 group-hover:opacity-100"
          title="이름 변경"
        >
          ✎
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (confirm(`"${folder.name}" 폴더를 삭제하시겠습니까? (안의 폴더도 함께 삭제, 프로젝트는 루트로 이동)`)) onDelete(folder.id); }}
          className="text-xs text-red-300 hover:text-red-600"
          title="삭제"
        >
          ×
        </button>
      </div>
      {children.map((c) => (
        <FolderNode key={c.id} folder={c} depth={depth + 1} tree={tree}
          selectedId={selectedId} onSelect={onSelect}
          onRename={onRename} onDelete={onDelete} onDrop={onDrop} />
      ))}
    </div>
  );
}

export default function DrawerView({ userEmail, creditBalance, isAdmin }: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [rootDragOver, setRootDragOver] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [fRes, pRes] = await Promise.all([
        fetch("/api/folders"), fetch("/api/projects"),
      ]);
      if (cancelled) return;
      if (fRes.ok) setFolders((await fRes.json()).folders);
      if (pRes.ok) setProjects((await pRes.json()).projects);
    }
    load();
    return () => { cancelled = true; };
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
    if (res.ok) setFolders((prev) => prev.map((f) => f.id === id ? { ...f, name } : f));
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
      setProjects((prev) => prev.map((p) => p.folderId && descendants.has(p.folderId) ? { ...p, folderId: null } : p));
      if (selectedFolderId && descendants.has(selectedFolderId)) setSelectedFolderId(null);
    }
  }

  async function moveProject(folderId: string | null, projectId: string) {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    if (res.ok) setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, folderId } : p));
  }

  async function deleteProject(projectId: string, title: string) {
    if (!confirm(`"${title}"을(를) 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }

  const tree = buildTree(folders);
  const roots = tree.get(null) ?? [];
  const visibleProjects = projects.filter((p) => (p.folderId ?? null) === selectedFolderId);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">MyToon</span>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/dashboard/characters" className="hover:text-black">내 캐릭터</Link>
          <Link href="/dashboard/reports" className="hover:text-black">내 신고</Link>
          {isAdmin && <Link href="/admin" className="text-purple-600 hover:text-purple-800">어드민</Link>}
          {isAdmin ? (
            <span className="font-medium text-purple-600">관리자 (무제한)</span>
          ) : (
            <Link href="/dashboard/credits" className="hover:text-black">
              크레딧 <strong className="text-black">{creditBalance}</strong>개 <span className="text-xs text-blue-600">+ 충전</span>
            </Link>
          )}
          <span className="text-gray-400 text-xs">{userEmail}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-gray-400 hover:text-gray-700">로그아웃</button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 flex gap-6">
        {/* 폴더 사이드바 */}
        <aside className="w-56 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-500">폴더</h2>
            <button onClick={createFolder} className="text-xs text-gray-500 hover:text-black">+ 새 폴더</button>
          </div>
          <div
            className={`rounded px-2 py-1 text-sm cursor-pointer mb-1 ${selectedFolderId === null ? "bg-gray-100" : "hover:bg-gray-50"} ${rootDragOver ? "ring-2 ring-black" : ""}`}
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
            전체 / 루트
          </div>
          {roots.map((f) => (
            <FolderNode key={f.id} folder={f} depth={0} tree={tree}
              selectedId={selectedFolderId}
              onSelect={setSelectedFolderId}
              onRename={renameFolder}
              onDelete={deleteFolder}
              onDrop={moveProject} />
          ))}
        </aside>

        {/* 프로젝트 목록 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">내 서랍</h1>
            <Link href="/dashboard/new"
              className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">
              + 새 작품
            </Link>
          </div>

          {visibleProjects.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              {selectedFolderId === null ? "이 폴더에 작품이 없습니다." : "이 폴더에 작품이 없습니다. 드래그해서 옮기세요."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {visibleProjects.map((p) => {
                const thumb = p.cuts[0]?.imageUrl;
                return (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/project-id", p.id)}
                    className="group relative rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link href={`/dashboard/projects/${p.id}`}>
                      <div className="aspect-square bg-gray-100">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300 text-sm">
                            {p.status === "generating" ? "생성 중..." : "미리보기 없음"}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.cutCount}컷 · {p.layoutType}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => deleteProject(p.id, p.title)}
                      className="absolute top-2 right-2 rounded-full bg-white/90 text-red-400 hover:text-red-600 w-6 h-6 text-xs opacity-0 group-hover:opacity-100"
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
