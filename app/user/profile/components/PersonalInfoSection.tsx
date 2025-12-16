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
      <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Họ và tên đầy đủ"
        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-lg"
      />
    </div>
  );
}