"use client";

import { useEffect, useRef, useState } from "react";
import { getApiBase } from "@/lib/api";
import { validateKeywordAudio } from "../utils/validateKeywordAudio";
import { captureTranscriptWhileRecording, isSpeechRecognitionSupported, isMobile } from "../utils/speechRecognitionCapture";
import { validateScript } from "../utils/validateScript";

type RecordStatus = "idle" | "recording" | "processing" | "accepted" | "rejected";
const REPEATS = process.env.NEXT_PUBLIC_KEYWORD_RECORDING_REPEAT_COUNT ? parseInt(process.env.NEXT_PUBLIC_KEYWORD_RECORDING_REPEAT_COUNT) : 2;

interface RecordItem {
  audioUrl: string | null;
  blob: Blob | null;
  status: RecordStatus;
  rejectReason?: string;
}

function createEmptyRecords(): RecordItem[] {
  return Array(REPEATS).fill(null).map(() => ({ audioUrl: null, blob: null, status: "idle" as RecordStatus }));
}

interface Keyword {
  id: number;
  text: string;
}

interface KeywordListResponse {
  keywords: Keyword[];
  total: number;
}

export function useKeywordRecorder(userId: number | null, onComplete?: () => void) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [currentKeywordIdx, setCurrentKeywordIdx] = useState(0);
  /** Records per keyword index; mỗi phần tử là REPEATS bản ghi cho keyword đó (để xem/nghe lại khi bấm tab). */
  const [recordsByKeywordIdx, setRecordsByKeywordIdx] = useState<RecordItem[][]>([]);
  const [completedCounts, setCompletedCounts] = useState<number[]>([]);
  const [volumes, setVolumes] = useState<number[]>(Array(REPEATS).fill(0));

  const records = recordsByKeywordIdx[currentKeywordIdx] ?? createEmptyRecords();
  const setCurrentKeywordRecords = (fn: (prev: RecordItem[]) => RecordItem[]) => {
    setRecordsByKeywordIdx((prev) => {
      const next = prev.slice();
      const idx = currentKeywordIdxRef.current;
      next[idx] = fn(next[idx] ?? createEmptyRecords());
      return next;
    });
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const keywordsRef = useRef<Keyword[]>([]);
  const currentKeywordIdxRef = useRef(0);
  const transcriptPromiseRef = useRef<Promise<string> | null>(null);
  keywordsRef.current = keywords;
  currentKeywordIdxRef.current = currentKeywordIdx;

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await fetch(`${getApiBase()}/user/keyword`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!res.ok) throw new Error(`Không thể tải danh sách từ khóa (HTTP ${res.status})`);
        const response: KeywordListResponse = await res.json();
        setKeywords(response.keywords);
        setCompletedCounts(Array(response.keywords.length).fill(0));
        setRecordsByKeywordIdx(response.keywords.map(() => createEmptyRecords()));
        setLoading(false);
      } catch (err: any) {
        console.error("Lỗi fetch keywords:", err);
        setError(err.message || "Không thể kết nối đến server");
        setLoading(false);
      }
    };

    fetchKeywords();
  }, []);

  const currentKeyword = keywords[currentKeywordIdx]?.text || "";
  const currentKeywordId = keywords[currentKeywordIdx]?.id;
  const totalRecordings = keywords.length * REPEATS;
  const totalCompleted = completedCounts.reduce((a, b) => a + b, 0);
  const progressPercent = keywords.length > 0 ? Math.round((totalCompleted / totalRecordings) * 100) : 0;
  const isCurrentDone = records.every((r) => r.status === "accepted");
  const isAllDone = totalCompleted === totalRecordings;
  const cleanup = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setVolumes(Array(REPEATS).fill(0));
  };

  const startRecording = async (rowIndex: number) => {
    cleanup();
    setCurrentKeywordRecords((prev) =>
      prev.map((r, i) => (i === rowIndex ? { ...r, status: "recording" } : r))
    );

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      await audioCtx.resume();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      transcriptPromiseRef.current = captureTranscriptWhileRecording(3000).promise;

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);

        setCurrentKeywordRecords((prev) =>
          prev.map((r, i) =>
            i === rowIndex ? { ...r, audioUrl, blob, status: "processing" } : r
          )
        );

        const kw = keywordsRef.current[currentKeywordIdxRef.current];
        const keywordText = kw?.text ?? "";

        if (isSpeechRecognitionSupported() && keywordText) {
          // Trên mobile, recognition trả kết quả chậm sau stop(); cần chờ đủ (≥ RECOGNITION_TIMEOUT_AFTER_STOP_MS).
          const transcript = await Promise.race([
            transcriptPromiseRef.current ?? Promise.resolve(""),
            new Promise<string>((r) => setTimeout(() => r(""), 4500)),
          ]);
          transcriptPromiseRef.current = null;
          // Trên mobile, Web Speech API thường không trả transcript (onresult không fire). Nếu transcript rỗng thì bỏ qua bước kiểm tra script, chỉ kiểm tra chất lượng âm thanh.
          const skipScriptCheck = isMobile() && !transcript.trim();
          if (!skipScriptCheck) {
            const scriptValidation = validateScript(transcript, keywordText);
            if (!scriptValidation.accepted) {
              setCurrentKeywordRecords((prev) =>
                prev.map((r, i) =>
                  i === rowIndex ? { ...r, status: "rejected", rejectReason: scriptValidation.reason } : r
                )
              );
              return;
            }
          }
        }

        const validation = await validateKeywordAudio(blob);
        if (!validation.accepted) {
          setCurrentKeywordRecords((prev) =>
            prev.map((r, i) =>
              i === rowIndex ? { ...r, status: "rejected", rejectReason: validation.reason } : r
            )
          );
          return;
        }

        const keywordId = kw?.id;
        const fd = new FormData();
        const user_id_val = String(userId);
        const keyword_id_val = keywordId != null ? String(keywordId) : "";
        const repeat_index_val = String(rowIndex + 1);
        fd.append("user_id", user_id_val);
        fd.append("keyword", keywordText);
        fd.append("keyword_id", keyword_id_val);
        fd.append("repeat_index", repeat_index_val);
        fd.append("file", blob, `kw_${currentKeywordIdxRef.current}_${rowIndex}.webm`);

        if (keywordId == null) {
          setCurrentKeywordRecords((prev) =>
            prev.map((r, i) => (i === rowIndex ? { ...r, status: "rejected" } : r))
          );
          return;
        }

        try {
          const res = await fetch("/api/user/keyword/upload", {
            method: "POST",
            body: fd,
          });

          if (!res.ok) {
            let errorMessage = "Upload thất bại";
            try {
              const errorData = await res.json();
              const raw = errorData.error;
              if (raw && typeof raw === "object" && "message" in raw) {
                errorMessage = (raw as { message?: string }).message || errorMessage;
              } else if (typeof raw === "string") {
                errorMessage = raw;
              }
            } catch (e) {
              errorMessage = `Upload thất bại (HTTP ${res.status})`;
            }
            setCurrentKeywordRecords((prev) =>
              prev.map((r, i) => (i === rowIndex ? { ...r, status: "rejected", rejectReason: errorMessage } : r))
            );
            return;
          }

          const data = await res.json();
          const accepted = data.accepted === true;

          setCurrentKeywordRecords((prev) =>
            prev.map((r, i) =>
              i === rowIndex
                ? { ...r, status: accepted ? "accepted" : "rejected", rejectReason: accepted ? undefined : (data.reason || "Không được chấp nhận") }
                : r
            )
          );

          if (accepted) {
            setCompletedCounts((prev) => {
              const newCounts = [...prev];
              newCounts[currentKeywordIdx]++;
              return newCounts;
            });
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Lỗi kết nối";
          console.error("Lỗi upload:", err);
          setCurrentKeywordRecords((prev) =>
            prev.map((r, i) => (i === rowIndex ? { ...r, status: "rejected", rejectReason: msg } : r))
          );
        }
      };

      recorder.start();
      measureVolume(rowIndex);
      setTimeout(() => recorder.stop(), 3000);
    } catch (err) {
      alert("Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.");
      setCurrentKeywordRecords((prev) =>
        prev.map((r, i) => (i === rowIndex ? { ...r, status: "idle" } : r))
      );
    }
  };

  const measureVolume = (rowIndex: number) => {
    if (!analyserRef.current) return;

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const volume = Math.min(100, Math.round((avg / 128) * 120));

    setVolumes((prev) => {
      const newV = [...prev];
      newV[rowIndex] = volume;
      return newV;
    });
    rafRef.current = requestAnimationFrame(() => measureVolume(rowIndex));
  };

  const retry = (rowIndex: number) => {
    setCurrentKeywordRecords((prev) =>
      prev.map((r, i) =>
        i === rowIndex ? { audioUrl: null, blob: null, status: "idle" } : r
      )
    );
    setVolumes((prev) => {
      const newV = [...prev];
      newV[rowIndex] = 0;
      return newV;
    });
  };

  const selectKeyword = (idx: number) => {
    if (idx >= 0 && idx < keywords.length) {
      setCurrentKeywordIdx(idx);
      setVolumes(Array(REPEATS).fill(0));
    }
  };

  const nextKeyword = () => {
    if (isCurrentDone && currentKeywordIdx < keywords.length - 1) {
      setCurrentKeywordIdx((prev) => prev + 1);
      setVolumes(Array(REPEATS).fill(0));
    }
  };

  useEffect(() => {return () => cleanup()}, []);

  // Tự động chuyển sang keyword tiếp theo khi hoàn thành keyword hiện tại (nếu có nhiều keyword)
  useEffect(() => {
    if (isCurrentDone && keywords.length > 1 && currentKeywordIdx < keywords.length - 1) {
      setCurrentKeywordIdx((prev) => prev + 1);
      setVolumes(Array(REPEATS).fill(0));
    }
  }, [isCurrentDone, keywords.length, currentKeywordIdx]);

  // Tự động gọi onComplete khi tất cả keyword đã hoàn tất
  // isAllDone chỉ true khi totalCompleted === totalRecordings (tất cả keyword đã hoàn thành)
  // Chỉ gọi khi có keywords và tất cả đã hoàn thành
  const onCompleteCalledRef = useRef(false);
  useEffect(() => {
    if (isAllDone && onComplete && keywords.length > 0 && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true;
      onComplete();
    }
    // Reset khi keywords thay đổi (khi fetch lại)
    if (keywords.length === 0) {
      onCompleteCalledRef.current = false;
    }
  }, [isAllDone, onComplete, keywords.length]);

  return {
    keywords,
    currentKeywordIdx,
    currentKeyword,
    records,
    volumes,
    completedCounts,
    progressPercent,
    totalCompleted,
    totalRecordings,
    isCurrentDone,
    isAllDone,
    loading,
    error,
    startRecording,
    retry,
    nextKeyword,
    selectKeyword,
  };
}