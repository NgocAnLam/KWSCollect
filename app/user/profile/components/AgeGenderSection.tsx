import { Users, ChevronDown } from 'lucide-react';
import { AGE_RANGES } from '../constants/Constants';


export default function AgeGenderSection({
  ageRange,
  setAgeRange,
  gender,
  setGender,
}: {
  ageRange: string;
  setAgeRange: (v: string) => void;
  gender: 'male' | 'female';
  setGender: (v: 'male' | 'female') => void;
}) {
  return (
    <>
      {/* Khoảng tuổi */}
      <div className="relative">
        <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <select
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none text-sm font-medium bg-white transition-all"
        >
          <option value="">Chọn khoảng tuổi</option>
          {AGE_RANGES.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>

        {/* Icon mũi tên xuống tùy chỉnh (đẹp hơn default) */}
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Giới tính */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {[
          { value: 'male' as const, label: 'Nam' },
          { value: 'female' as const, label: 'Nữ' },
        ].map((g) => (
          <button
            key={g.value}
            onClick={() => setGender(g.value)}
            className={`py-2 rounded-lg text-sm font-medium transition-all ${
              gender === g.value
                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </>
  );
}