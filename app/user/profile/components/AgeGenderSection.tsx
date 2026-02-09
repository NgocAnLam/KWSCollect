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
        <Users className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" aria-hidden />
        <label htmlFor="profile-age-range" className="sr-only">Khoảng tuổi</label>
        <select
          id="profile-age-range"
          name="age_range"
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          aria-label="Khoảng tuổi"
          className="w-full pl-8 pr-7 py-1.5 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none appearance-none text-sm font-medium bg-white transition-colors"
        >
          <option value="">Chọn khoảng tuổi</option>
          {AGE_RANGES.map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" aria-hidden />
      </div>

      {/* Giới tính */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {[
          { value: 'male' as const, label: 'Nam' },
          { value: 'female' as const, label: 'Nữ' },
        ].map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => setGender(g.value)}
            className={`py-1.5 rounded-md text-sm font-medium transition-colors ${
              gender === g.value
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-100'
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