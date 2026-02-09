import { Phone } from 'lucide-react';

/** Cho phép 10–11 chữ số SĐT Việt Nam, không cắt. */
const PHONE_MAX_DIGITS = 11;

export default function PhoneInput({ phone, setPhone }: { phone: string; setPhone: (v: string) => void }) {
  return (
    <div className="relative">
      <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" aria-hidden />
      <label htmlFor="profile-phone" className="sr-only">Số điện thoại</label>
      <input
        id="profile-phone"
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone((e.target.value).slice(0, PHONE_MAX_DIGITS))}
        placeholder="Số điện thoại…"
        maxLength={PHONE_MAX_DIGITS}
        spellCheck={false}
        className="w-full pl-8 pr-2.5 py-1.5 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none text-sm"
      />
    </div>
  );
}