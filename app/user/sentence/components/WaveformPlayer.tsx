// app/user/sentences/components/WaveformPlayer.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

type Props = {
  /** Khi có audioUrl (bước kiểm tra chéo) dùng URL; không thì dùng audioBlob (bước thu âm). */
  audioUrl?: string | null;
  audioBlob?: Blob | null;
  range: [number, number];
  setRange: (range: [number, number]) => void;
  keyword: string;
  isPlaying: boolean;
  onPlayToggle: () => void;
};

export default function WaveformPlayer({
  audioUrl = null,
  audioBlob = null,
  range,
  setRange,
  keyword,
  isPlaying,
  onPlayToggle,
}: Props) {
  const hasAudio = !!audioUrl || !!audioBlob;
  const containerRef = useRef<HTMLDivElement>(null); // Wrapper waveform để lấy width
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const keywordRegionRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);

  const [duration, setDuration] = useState(15);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const memoizedOnPlayToggle = useCallback(onPlayToggle, []);

  // Cập nhật overlay dim khi range hoặc ready thay đổi
  useEffect(() => {
    if (!containerRef.current || !isReady || duration === 0) return;

    const container = containerRef.current;
    const totalWidth = container.offsetWidth;

    const leftPercent = (range[0] / duration) * 100;
    const rightPercent = (range[1] / duration) * 100;

    // Overlay trái
    const leftOverlay = container.querySelector(".dim-overlay-left") as HTMLElement;
    if (leftOverlay) {
      leftOverlay.style.width = `${leftPercent}%`;
    }

    // Overlay phải
    const rightOverlay = container.querySelector(".dim-overlay-right") as HTMLElement;
    if (rightOverlay) {
      rightOverlay.style.width = `${100 - rightPercent}%`;
      rightOverlay.style.left = `${rightPercent}%`;
    }
  }, [range, isReady, duration]);

  useEffect(() => {
    if (!waveformRef.current || !hasAudio) {
      setIsReady(false);
      return;
    }

    let cancelled = false;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    const regionsPlugin = RegionsPlugin.create();

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#c4b5fd",
      progressColor: "#7c3aed",
      cursorColor: "#4c1d95",
      cursorWidth: 2,
      barWidth: 3,
      barRadius: 4,
      barGap: 1,
      height: 100,
      normalize: true,
      backend: "MediaElement",
      dragToSeek: true,
      fillParent: true,
      minPxPerSec: 50,
      plugins: [regionsPlugin],
    });

    const ignoreAbort = (err: unknown) => {
      if (!err || typeof err !== "object") return;
      const e = err as Error;
      if (e.name === "AbortError" || (e.message && String(e.message).toLowerCase().includes("abort"))) {
        return;
      }
      console.error(err);
    };

    const loadPromise = audioUrl
      ? ws.load(audioUrl)
      : audioBlob
        ? ws.loadBlob(audioBlob)
        : null;
    if (loadPromise && typeof (loadPromise as Promise<unknown>)?.catch === "function") {
      (loadPromise as Promise<unknown>).catch(ignoreAbort);
    }

    ws.on("error", (err: unknown) => {
      ignoreAbort(err);
    });

    ws.on("ready", () => {
      if (cancelled) return;
      const dur = ws.getDuration() || 15;
      setDuration(dur);
      setIsReady(true);
      updateAllRegions(ws);
    });

    ws.on("audioprocess", () => {
      if (cancelled) return;
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("seeking", () => {
      if (cancelled) return;
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("play", () => {
      if (!isPlaying) memoizedOnPlayToggle();
    });

    ws.on("pause", () => {
      if (isPlaying) memoizedOnPlayToggle();
    });

    ws.on("finish", () => {
      if (isPlaying) memoizedOnPlayToggle();
    });

    wavesurferRef.current = ws;

    return () => {
      cancelled = true;
      ws.destroy();
      setIsReady(false);
    };
  }, [audioUrl, audioBlob, hasAudio, memoizedOnPlayToggle]);

  const updateAllRegions = (ws: WaveSurfer) => {
    const regions = (ws as any).regions;
    if (!regions) return;

    [keywordRegionRef, startMarkerRef, endMarkerRef].forEach((ref) => {
      if (ref.current) {
        ref.current.remove();
        ref.current = null;
      }
    });

    const keywordRegion = regions.add({
      start: range[0],
      end: range[1],
      content: keyword ? `<strong style="color:#4c1d95;">${keyword}</strong>` : "Đoạn chọn",
      color: "rgba(124, 58, 237, 0.2)",
      drag: true,
      resize: true,
      minLength: 0.5,
    });

    keywordRegion.on("update", () => {
      setRange([keywordRegion.start, keywordRegion.end]);
    });

    keywordRegionRef.current = keywordRegion;

    const startMarker = regions.add({
      start: range[0],
      color: "transparent",
    });
    startMarkerRef.current = startMarker;

    const endMarker = regions.add({
      start: range[1],
      color: "transparent",
    });
    endMarkerRef.current = endMarker;
  };

  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;
    updateAllRegions(wavesurferRef.current);
  }, [range, isReady]);

  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;

    if (isPlaying) {
      wavesurferRef.current.play(range[0], range[1]);
    } else {
      wavesurferRef.current.pause();
    }
  }, [isPlaying, isReady, range]);

  const handleRangeChange = useCallback(
    (value: number | number[]) => {
      let newRange = value as [number, number];
      if (newRange[1] > duration) newRange[1] = duration;
      if (newRange[0] >= newRange[1]) newRange[0] = Math.max(0, newRange[1] - 0.5);
      setRange(newRange);
    },
    [setRange, duration]
  );

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div ref={containerRef} id="waveform-container" className="relative mb-4 rounded-lg overflow-hidden">
        <div ref={waveformRef} className="w-full" />
        <div className="dim-overlay-left absolute top-0 left-0 h-full bg-gray-800 opacity-50 pointer-events-none" />
        <div className="dim-overlay-right absolute top-0 h-full bg-gray-800 opacity-50 pointer-events-none" />
      </div>

      <p className="text-center text-sm text-gray-600 mb-3">
        {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
      </p>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800 text-center">
          Chọn đoạn chứa từ khóa <span className="text-indigo-700">&quot;{keyword}&quot;</span>
        </label>

        <div className="px-0">
          <Slider
            range
            min={0}
            max={duration}
            step={0.01}
            value={range}
            onChange={handleRangeChange}
            trackStyle={[{ backgroundColor: "#4f46e5" }]}
            handleStyle={[
              { borderColor: "#4f46e5", backgroundColor: "#fff", width: "18px", height: "18px" },
              { borderColor: "#4f46e5", backgroundColor: "#fff", width: "18px", height: "18px" },
            ]}
            railStyle={{ backgroundColor: "#e5e7eb", height: "6px", borderRadius: "4px" }}
          />
        </div>

        <div className="flex flex-wrap justify-between gap-2 text-xs font-medium text-gray-700">
          <span>Bắt đầu: {range[0].toFixed(2)}s</span>
          <span>Kết thúc: {range[1].toFixed(2)}s</span>
          <span className={range[1] - range[0] > 2 ? "text-red-600" : "text-emerald-600"}>
            Độ dài: {(range[1] - range[0]).toFixed(2)}s {range[1] - range[0] > 2 && "(cần ≤ 2s)"}
          </span>
        </div>
      </div>
    </div>
  );
}