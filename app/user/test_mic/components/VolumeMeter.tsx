interface VolumeMeterProps {
  volume: number;
}

export default function VolumeMeter({ volume }: VolumeMeterProps) {
  const getColor = () => {
    if (volume > 30) return "bg-green-500";
    if (volume > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between text-sm mb-1">
        <span>Mức âm thanh</span>
        <span>{Math.round(volume)}%</span>
      </div>
      <div className="h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-100 ${getColor()}`}
          style={{ width: `${volume}%` }}
        />
      </div>
    </div>
  );
}