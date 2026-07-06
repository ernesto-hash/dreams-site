import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Share2, X } from "lucide-react";

export type ShareItem = {
  id: string;
  content_url: string | null;
  text: string | null;
  tema: string | null;
  is_ai_generated: boolean;
};

type Format = "square" | "story";

const DIMS: Record<Format, [number, number]> = {
  square: [1080, 1080],
  story:  [1080, 1920],
};

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Fetch image as blob → objectURL so canvas is never tainted (blob:// = same-origin).
// Avoids the browser-cache CORS issue: images already cached by <img> tags (no CORS)
// would taint the canvas if loaded with crossOrigin="anonymous".
async function loadImageBlob(url: string): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      cache: "no-cache",
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        reject(new Error("img load failed"));
      };
      img.src = objUrl;
    });
    return img;
  } catch {
    return null;
  }
}

async function drawCard(
  canvas: HTMLCanvasElement,
  item: ShareItem,
  fmt: Format
) {
  const [W, H] = DIMS[fmt];
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── background ──────────────────────────────────────────────────
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, W, H);

  // ── image (via fetch→blob to avoid canvas taint) ─────────────────
  if (item.content_url) {
    const img = await loadImageBlob(item.content_url);
    if (img && img.naturalWidth > 0) {
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth  * scale;
      const dh = img.naturalHeight * scale;
      ctx.globalAlpha = 0.62;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
    }
  }

  // ── gradient overlays ────────────────────────────────────────────
  // top vignette (covers brand area)
  const gTop = ctx.createLinearGradient(0, 0, 0, H * 0.28);
  gTop.addColorStop(0, "rgba(0,0,0,0.82)");
  gTop.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gTop;
  ctx.fillRect(0, 0, W, H * 0.28);

  // bottom vignette (covers text area)
  const gBot = ctx.createLinearGradient(0, H * 0.42, 0, H);
  gBot.addColorStop(0, "rgba(0,0,0,0)");
  gBot.addColorStop(0.5, "rgba(0,0,0,0.78)");
  gBot.addColorStop(1,   "rgba(0,0,0,0.97)");
  ctx.fillStyle = gBot;
  ctx.fillRect(0, H * 0.42, W, H * 0.58);

  // ── load font ────────────────────────────────────────────────────
  try { await document.fonts.load("700 56px Inter"); } catch { /* already loaded */ }

  const PAD = 70;

  // ── brand top-left ────────────────────────────────────────────────
  ctx.font         = "600 32px Inter, sans-serif";
  ctx.fillStyle    = "rgba(212,175,55,0.75)";
  ctx.textAlign    = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("DREAMS", PAD, PAD + 4);
  // thin gold rule
  ctx.strokeStyle = "rgba(212,175,55,0.35)";
  ctx.lineWidth   = 1.5;
  const bw = ctx.measureText("DREAMS").width;
  ctx.beginPath();
  ctx.moveTo(PAD, PAD + 16);
  ctx.lineTo(PAD + bw, PAD + 16);
  ctx.stroke();

  // ── main text ─────────────────────────────────────────────────────
  if (item.text) {
    const fs     = fmt === "square" ? 50 : 54;
    const lineH  = fs * 1.42;
    ctx.font         = `700 ${fs}px Inter, sans-serif`;
    ctx.fillStyle    = "#FFFFFF";
    ctx.textAlign    = "center";
    ctx.textBaseline = "alphabetic";
    const maxTW = W - PAD * 2.2;
    const lines  = wrapLines(ctx, `"${item.text}"`, maxTW);
    // clamp to 6 lines max
    const visible = lines.slice(0, 6);
    if (lines.length > 6) visible[5] = visible[5].replace(/[^…]$/, "…");
    const totalH = visible.length * lineH;
    let ty = H - PAD * 2.8 - totalH;
    for (const line of visible) {
      ctx.fillText(line, W / 2, ty);
      ty += lineH;
    }
  }

  // ── tema label ────────────────────────────────────────────────────
  ctx.font         = "400 26px Inter, sans-serif";
  ctx.textAlign    = "center";
  ctx.textBaseline = "alphabetic";
  if (item.tema) {
    ctx.fillStyle = "#D4AF37";
    ctx.fillText(item.tema.toUpperCase(), W / 2, H - PAD + 4);
  } else {
    ctx.fillStyle = "rgba(212,175,55,0.35)";
    ctx.fillText("monumentofdreams.com", W / 2, H - PAD + 4);
  }
}

// ── component ─────────────────────────────────────────────────────────────

type Props = {
  item: ShareItem;
  onClose: () => void;
};

export default function ShareableCard({ item, onClose }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [fmt, setFmt]       = useState<Format>("square");
  const [busy, setBusy]     = useState(true);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const generate = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    setBusy(true);
    setDataUrl(null);
    try {
      await drawCard(c, item, fmt);
      setDataUrl(c.toDataURL("image/png"));
    } catch (e) {
      console.error("Canvas draw error:", e);
    } finally {
      setBusy(false);
    }
  }, [item, fmt]);

  useEffect(() => { generate(); }, [generate]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href     = dataUrl;
    a.download = `dream-${fmt}-${Date.now()}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `dream-${fmt}.png`, { type: "image/png" });
      await (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share?.({
        files: [file],
        title: "Monument of Dreams",
        text: item.text ? `"${item.text}"` : "Monument of Dreams",
      });
    } catch { /* cancelled */ }
  };

  const canShare =
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    typeof (navigator as { share?: unknown }).share === "function";

  return (
    <div
      className="fixed inset-0 bg-black/93 backdrop-blur-sm z-[70] flex flex-col items-center justify-center p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[280px] flex flex-col gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-black border border-neon-primary/20 flex items-center justify-center text-neon-secondary/60 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>

        {/* canvas preview */}
        <div
          className={[
            "relative w-full overflow-hidden rounded-xl border border-neon-primary/15 bg-zinc-950",
            fmt === "story" ? "aspect-[9/16]" : "aspect-square",
          ].join(" ")}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: "block" }}
          />
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-6 h-6 rounded-full border-2 border-neon-primary/30 border-t-neon-primary animate-spin" />
            </div>
          )}
        </div>

        {/* format toggle */}
        <div className="flex gap-2">
          {(["square", "story"] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFmt(f)}
              className={[
                "flex-1 py-2 rounded-lg text-[10px] font-cinzel uppercase tracking-[0.14em] border transition-all",
                fmt === f
                  ? "border-neon-primary text-neon-primary bg-neon-primary/10"
                  : "border-neon-primary/18 text-neon-secondary/35 hover:border-neon-primary/40",
              ].join(" ")}
            >
              {f === "square" ? "1:1 Feed" : "9:16 Story"}
            </button>
          ))}
        </div>

        {/* actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={busy || !dataUrl}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-neon-primary text-neon-primary font-cinzel text-[11px] uppercase tracking-[0.12em] hover:bg-neon-primary/10 transition-all disabled:opacity-35"
          >
            <Download size={13} />
            Download
          </button>

          {canShare && (
            <button
              onClick={handleShare}
              disabled={busy || !dataUrl}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border border-neon-primary/25 text-neon-secondary/55 font-cinzel text-[11px] uppercase tracking-[0.12em] hover:border-neon-primary/50 hover:text-neon-secondary/80 transition-all disabled:opacity-35"
            >
              <Share2 size={13} />
              Partilhar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
