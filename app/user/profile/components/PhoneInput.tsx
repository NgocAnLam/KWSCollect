import { Phone } from 'lucide-react';

export default function PhoneInput({ phone, setPhone }: { phone: string; setPhone: (v: string) => void }) {
  return (
    <div className="relative">
      <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
        placeholder="Số điện thoại"
        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
      />
    </div>
  );
}