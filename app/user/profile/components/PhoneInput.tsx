import { Phone } from 'lucide-react';

export default function PhoneInput({ phone, setPhone }: { phone: string; setPhone: (v: string) => void }) {
  return (
    <div className="relative">
      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
        placeholder="Số điện thoại"
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
      />
    </div>
  );
}