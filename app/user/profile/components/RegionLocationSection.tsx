import { Mic, MapPin } from 'lucide-react';
import { REGIONS, RECORDING_LOCATIONS, RegionType } from '../constants/Constants';


interface RegionLocationSectionProps {
  region: RegionType;
  setRegion: (v: RegionType) => void;
  location: string;
  setLocation: (v: string) => void;
}

export default function RegionLocationSection({
  region,
  setRegion,
  location,
  setLocation,
}: RegionLocationSectionProps) {
  return (
    <>
      {/* Vùng miền */}
      <div className="relative">
        <Mic className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as RegionType)}
          className="w-full pl-12 pr-10 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-lg"
        >
          <option value="" disabled>Chọn vùng miền</option>
          <option value="southeast">Đông Nam Bộ</option>
          <option value="southwest">Tây Nam Bộ</option>
          <option value="centralsouth">Duyên hải Nam Trung Bộ</option>
          <option value="centralhightlands">Tây Nguyên</option>
          <option value="centralnorth">Bắc Trung Bộ</option>
          <option value="northwest">Tây Bắc Bộ</option>
          <option value="northeast">Đông Bắc Bộ</option>
          <option value="foreigner">Nước ngoài</option>
        </select>
      </div>

      {/* Địa điểm ghi âm */}
      <div className="relative mt-4">
        <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
        >
          <option>Phòng yên tĩnh</option>
          <option>Phòng có tiếng ồn nhẹ</option>
          <option>Quán cafe</option>
          <option>Ngoài trời</option>
          <option>Phương tiện giao thông</option>
          <option>Khác</option>
        </select>
      </div>
    </>
  );
}