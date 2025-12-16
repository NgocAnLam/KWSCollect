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
        <Users className="absolute left-4 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
        <select
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          className="w-full pl-12 pr-10 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none text-lg font-medium bg-white transition-all"
        >
          <option value="">Chọn khoảng tuổi</option>
          {AGE_RANGES.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>

        {/* Icon mũi tên xuống tùy chỉnh (đẹp hơn default) */}
        <ChevronDown className="absolute right-4 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>

      {/* Giới tính */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          { value: 'male' as const, label: 'Nam' },
          { value: 'female' as const, label: 'Nữ' },
        ].map((g) => (
          <button
            key={g.value}
            onClick={() => setGender(g.value)}
            className={`py-4 rounded-xl font-medium transition-all ${
              gender === g.value
                ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-100'
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