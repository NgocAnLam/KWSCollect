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
      <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" aria-hidden />
      <label htmlFor="profile-name" className="sr-only">Họ và tên đầy đủ</label>
      <input
        id="profile-name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Họ và tên đầy đủ…"
        autoComplete="name"
        className="w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none text-sm"
      />
    </div>
  );
}