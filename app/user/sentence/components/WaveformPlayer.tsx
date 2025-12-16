// app/user/sentences/components/WaveformPlayer.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

type Props = {
  audioUrl: string | null;
  audioBlob: Blob | null;
  range: [number, number];
  setRange: (range: [number, number]) => void;
  keyword: string;
  isPlaying: boolean;
  onPlayToggle: () => void;
};

export default function WaveformPlayer({
  audioBlob,
  range,
  setRange,
  keyword,
  isPlaying,
  onPlayToggle,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null); // Wrapper waveform để lấy width
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const keywordRegionRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);

  const [duration, setDuration] = useState(30);
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
    if (!waveformRef.current || !audioBlob) {
      setIsReady(false);
      return;
    }

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

    ws.loadBlob(audioBlob);

    ws.on("ready", () => {
      const dur = ws.getDuration() || 30;
      setDuration(dur);
      setIsReady(true);
      updateAllRegions(ws);
    });

    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on("seeking", () => {
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
      ws.destroy();
      setIsReady(false);
    };
  }, [audioBlob, memoizedOnPlayToggle]);

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
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl p-8 shadow-inner">
      {/* Wrapper waveform với position relative để overlay absolute */}
      <div ref={containerRef} id="waveform-container" className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
        <div ref={waveformRef} className="w-full" />

        {/* Overlay trái - làm mờ phần trước start */}
        <div className="dim-overlay-left absolute top-0 left-0 h-full bg-gray-800 opacity-50 pointer-events-none" />

        {/* Overlay phải - làm mờ phần sau end */}
        <div className="dim-overlay-right absolute top-0 h-full bg-gray-800 opacity-50 pointer-events-none" />
      </div>

      <div className="text-center text-lg font-medium text-gray-700 mb-4">
        Thời gian hiện tại: {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
      </div>

      <div className="space-y-4">
        <label className="block text-xl font-bold text-gray-800 text-center">
          Chọn chính xác đoạn chứa từ khóa <span className="text-purple-700">"{keyword}"</span>
        </label>

        <div className="px-0">
          <Slider
            range
            min={0}
            max={duration}
            step={0.01}
            value={range}
            onChange={handleRangeChange}
            trackStyle={[{ backgroundColor: "#7c3aed" }]}
            handleStyle={[
              {
                borderColor: "#7c3aed",
                backgroundColor: "#fff",
                boxShadow: "0 0 0 8px rgba(124,58,237,0.4)",
                width: "24px",
                height: "24px",
              },
              {
                borderColor: "#7c3aed",
                backgroundColor: "#fff",
                boxShadow: "0 0 0 8px rgba(124,58,237,0.4)",
                width: "24px",
                height: "24px",
              },
            ]}
            railStyle={{ backgroundColor: "#e5e7eb", height: "8px", borderRadius: "4px" }}
          />
        </div>

        <div className="flex justify-between text-lg font-semibold text-gray-700">
          <span>Bắt đầu: {range[0].toFixed(2)}s</span>
          <span>Kết thúc: {range[1].toFixed(2)}s</span>
          <span>Độ dài: {(range[1] - range[0]).toFixed(2)}s</span>
        </div>
      </div>
    </div>
  );
}