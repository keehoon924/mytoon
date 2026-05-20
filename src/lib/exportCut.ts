import type { FilterSettings } from "@/components/editor/types";

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
const FONT_FAMILY: Record<string, string> = {
  default: "sans-serif",
  gothic: "Arial, sans-serif",
  handwriting: "cursive",
  round: "Tahoma, sans-serif",
  bold: "Impact, sans-serif",
};

export type ExportBubble = {
  type: string; text: string; font: string;
  color: string; fontSize: number; bold: boolean;
  x: number; y: number; w: number; h: number;
  rotation: number; zIndex: number;
};

export type ExportOverlayItem =
  | { type: "character"; imageUrl: string; x: number; y: number; w: number; h: number; rotation: number; zIndex: number }
  | { type: "stroke"; points: number[]; color: string; width: number; erase: boolean; zIndex: number };

export type ExportCut = {
  imageUrl: string | null;
  bubbles: ExportBubble[];
  overlay: { items: ExportOverlayItem[]; filters?: FilterSettings } | null;
};

export type ExportOptions = {
  size: number;
  format: "png" | "jpg";
  watermark: boolean;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function buildCssFilter(f?: FilterSettings): string {
  if (!f) return "none";
  const parts: string[] = [];
  if (f.brightness !== 0) parts.push(`brightness(${(1 + f.brightness).toFixed(2)})`);
  if (f.contrast !== 0) parts.push(`contrast(${(1 + f.contrast).toFixed(2)})`);
  if (f.saturation !== 0) parts.push(`saturate(${(1 + f.saturation).toFixed(2)})`);
  if (f.grayscale) parts.push("grayscale(1)");
  if (f.sepia) parts.push("sepia(1)");
  return parts.length === 0 ? "none" : parts.join(" ");
}

function roundRect(ctx: CanvasRenderingContext2D, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(rr, 0);
  ctx.lineTo(w - rr, 0);
  ctx.quadraticCurveTo(w, 0, w, rr);
  ctx.lineTo(w, h - rr);
  ctx.quadraticCurveTo(w, h, w - rr, h);
  ctx.lineTo(rr, h);
  ctx.quadraticCurveTo(0, h, 0, h - rr);
  ctx.lineTo(0, rr);
  ctx.quadraticCurveTo(0, 0, rr, 0);
  ctx.closePath();
}

function wrapAndDrawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  fontSize: number,
  fontFamily: string,
  bold: boolean,
  color: string,
) {
  ctx.font = `${bold ? "bold " : ""}${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";

  const padding = 8;
  const maxWidth = width - padding * 2;
  const lineHeight = fontSize * 1.2;
  const words = text.split(/(\s+)/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur + w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur.trimEnd());
      cur = w.trimStart();
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur.trimEnd());

  const totalH = lines.length * lineHeight;
  const startY = padding + Math.max(0, (height - padding * 2 - totalH) / 2);
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    if (y + lineHeight > height - padding) break;
    ctx.fillText(lines[i], width / 2, y);
  }
}

function drawBubble(ctx: CanvasRenderingContext2D, b: ExportBubble) {
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.rotate((b.rotation * Math.PI) / 180);
  ctx.translate(-b.w / 2, -b.h / 2);

  const bg = BUBBLE_BG[b.type] ?? "#ffffff";
  const border = BUBBLE_BORDER[b.type] ?? "#374151";
  const dash = BUBBLE_DASH[b.type];
  const sw = BUBBLE_STROKE_WIDTH[b.type] ?? 1.5;
  const radius = BUBBLE_RADIUS[b.type] ?? 12;

  roundRect(ctx, b.w, b.h, radius);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = sw;
  ctx.strokeStyle = border;
  if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
  ctx.stroke();
  ctx.setLineDash([]);

  wrapAndDrawText(
    ctx, b.text, b.w, b.h, b.fontSize,
    FONT_FAMILY[b.font] ?? "sans-serif",
    b.bold, b.color,
  );

  ctx.restore();
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Extract<ExportOverlayItem, { type: "stroke" }>) {
  if (s.points.length < 4) return;
  ctx.save();
  ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(s.points[0], s.points[1]);
  for (let i = 2; i < s.points.length; i += 2) {
    ctx.lineTo(s.points[i], s.points[i + 1]);
  }
  ctx.stroke();
  ctx.restore();
}

async function drawCharacter(ctx: CanvasRenderingContext2D, c: Extract<ExportOverlayItem, { type: "character" }>) {
  const img = await loadImage(c.imageUrl);
  ctx.save();
  ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
  ctx.rotate((c.rotation * Math.PI) / 180);
  ctx.drawImage(img, -c.w / 2, -c.h / 2, c.w, c.h);
  ctx.restore();
}

function drawWatermark(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = "bold 18px sans-serif";
  ctx.textBaseline = "bottom";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 4;
  ctx.fillText("MyToon", CANVAS_SIZE - 10, CANVAS_SIZE - 10);
  ctx.restore();
}

export async function renderCutToCanvas(cut: ExportCut, options: ExportOptions): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = options.size;
  canvas.height = options.size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  const scale = options.size / CANVAS_SIZE;
  ctx.scale(scale, scale);

  if (options.format === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  if (cut.imageUrl) {
    const img = await loadImage(cut.imageUrl);
    ctx.save();
    ctx.filter = buildCssFilter(cut.overlay?.filters);
    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.restore();
  }

  const bubbleItems = cut.bubbles.map((b) => ({ kind: "bubble" as const, zIndex: b.zIndex, b }));
  const overlayItems = (cut.overlay?.items ?? []).map((it) =>
    it.type === "stroke"
      ? { kind: "stroke" as const, zIndex: it.zIndex, s: it }
      : { kind: "character" as const, zIndex: it.zIndex, c: it }
  );
  const all = [...bubbleItems, ...overlayItems].sort((a, b) => a.zIndex - b.zIndex);

  for (const item of all) {
    if (item.kind === "bubble") drawBubble(ctx, item.b);
    else if (item.kind === "stroke") drawStroke(ctx, item.s);
    else await drawCharacter(ctx, item.c);
  }

  if (options.watermark) drawWatermark(ctx);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, format: "png" | "jpg", quality = 0.92): Promise<Blob> {
  const mime = format === "png" ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("toBlob failed"));
    }, mime, quality);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
