import { Map, MapPin } from 'lucide-react';
import { RegionType } from '../constants/Constants';

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
        <Map className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" aria-hidden />
        <label htmlFor="profile-region" className="sr-only">Vùng miền</label>
        <select
          id="profile-region"
          name="region"
          value={region}
          onChange={(e) => setRegion(e.target.value as RegionType)}
          aria-label="Vùng miền"
          className="w-full pl-8 pr-7 py-1.5 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none appearance-none text-sm"
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
      <div className="relative mt-2">
        <MapPin className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" aria-hidden />
        <label htmlFor="profile-location" className="sr-only">Địa điểm ghi âm</label>
        <select
          id="profile-location"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Địa điểm ghi âm"
          className="w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none text-sm"
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