import { User } from 'lucide-react';

export default function PersonalInfoSection({
  name,
  setName,
}: {
  name: string;
  setName: (v: string) => void;
}) {
  return (
    <div className="relative">
      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Họ và tên đầy đủ"
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
      />
    </div>
  );
}