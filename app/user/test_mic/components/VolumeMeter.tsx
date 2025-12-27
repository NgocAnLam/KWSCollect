import { forwardRef, useImperativeHandle, useRef } from "react";

interface VolumeMeterProps {volume?: number;}
export interface VolumeMeterHandle {setVolume: (volume: number) => void;}

const VolumeMeter = forwardRef<VolumeMeterHandle, VolumeMeterProps>(({ volume = 0 }, ref) => {
  const barRef = useRef<HTMLDivElement>(null);
  const getColor = () => {
    if (volume > 30) return "bg-green-500";
    if (volume > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  useImperativeHandle(ref, () => ({
    setVolume: (vol: number) => {
      if (barRef.current) barRef.current.style.width = `${Math.min(100, vol)}%`;
    },
  }));

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between text-sm mb-1">
        <span>Mức âm thanh</span>
        <span>{Math.round(volume)}%</span>
      </div>
      <div className="h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          ref={barRef}
          className={`h-full transition-all duration-75 ${getColor()} `}
          style={{ width: `${volume}%` }}
        />
      </div>
    </div>
  );
});

VolumeMeter.displayName = "VolumeMeter";
export default VolumeMeter;