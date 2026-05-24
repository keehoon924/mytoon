"use client";

import { useEffect, useState } from "react";

type Character = {
  id: string;
  name: string;
  sourceType: string;
  referenceImageUrl: string | null;
};

type Props = {
  /** 이미 선택된 캐릭터 ID 목록 */
  selectedIds: string[];
  /** 선택 변경 콜백 */
  onChange: (ids: string[]) => void;
  /** 최대 선택 가능 수 (기본: 제한 없음) */
  max?: number;
  /** 선택 취소 가능 여부 (기본: true) */
  clearable?: boolean;
};

export default function CharacterPicker({
  selectedIds,
  onChange,
  max,
  clearable = true,
}: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/characters")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setCharacters(data.characters ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, []);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      if (!clearable && selectedIds.length === 1) return;
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      if (max && selectedIds.length >= max) {
        // 최대 선택 수 초과 시 맨 앞 교체
        onChange([...selectedIds.slice(1), id]);
      } else {
        onChange([...selectedIds, id]);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex gap-2 py-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-14 w-14 rounded-full bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E8F0EB] py-6 text-center text-sm text-gray-400">
        <p>등록된 캐릭터가 없습니다.</p>
        <a
          href="/dashboard/characters"
          className="mt-1 inline-block text-xs text-[#7CAF8A] underline"
        >
          캐릭터 등록하기
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {characters.map((c) => {
        const isSelected = selectedIds.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggle(c.id)}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all border-2 ${
              isSelected
                ? "border-[#7CAF8A] bg-[#F0F7F2]"
                : "border-transparent bg-gray-50 hover:border-[#E8F0EB]"
            }`}
          >
            {/* 아바타 */}
            <div className="relative">
              {c.referenceImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.referenceImageUrl}
                  alt={c.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-[#E8F0EB] flex items-center justify-center text-2xl">
                  🙂
                </div>
              )}
              {isSelected && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7CAF8A] text-white text-xs">
                  ✓
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-gray-700 max-w-[64px] truncate">
              {c.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
