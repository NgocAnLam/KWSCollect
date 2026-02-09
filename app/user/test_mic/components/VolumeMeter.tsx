import { forwardRef, useImperativeHandle, useRef } from "react";

interface VolumeMeterProps {volume?: number;}
export interface VolumeMeterHandle {setVolume: (volume: number) => void;}

const VolumeMeter = forwardRef<VolumeMeterHandle, VolumeMeterProps>(({ volume = 0 }, ref) => {
  const barRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    setVolume: (vol: number) => {
      if (barRef.current) barRef.current.style.width = `${Math.min(100, vol)}%`;
    },
  }));

  const barColor =
    volume > 30 ? "bg-emerald-500" : volume > 10 ? "bg-amber-500" : "bg-gray-300";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5 px-0.5">
        <span>Mức âm thanh</span>
        <span className="font-medium tabular-nums">{Math.round(volume)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className={`h-full transition-[height,background-color] duration-75 rounded-full ${barColor}`}
          style={{ width: `${Math.min(100, volume)}%` }}
        />
      </div>
    </div>
  );
});

VolumeMeter.displayName = "VolumeMeter";
export default VolumeMeter;