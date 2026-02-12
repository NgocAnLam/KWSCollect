import { Phone } from 'lucide-react';

export default function MomoPaymentForm({
  momoNumber,
  setMomoNumber,
  phone,
  error,
}: {
  momoNumber: string;
  setMomoNumber: (v: string) => void;
  phone: string;
  error?: string;
}) {
  const isAuto = phone && momoNumber === phone;

  return (
    <div>
      <div className="relative">
        <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400 pointer-events-none" aria-hidden />
        <label htmlFor="profile-momo" className="sr-only">Số tài khoản Momo</label>
        <input
          id="profile-momo"
          name="momo_number"
          type="tel"
          inputMode="numeric"
          value={momoNumber}
          onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
          placeholder="Số tài khoản Momo…"
          spellCheck={false}
          className={`w-full pl-8 pr-16 py-1.5 border rounded-md bg-white text-gray-800 placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none text-sm ${error ? "border-red-500" : "border-gray-300"}`}
        />
        {isAuto && (
          <span className="absolute right-2 top-2 text-[10px] font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
            Tự động
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}