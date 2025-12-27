import { Phone } from 'lucide-react';

export default function MomoPaymentForm({
  momoNumber,
  setMomoNumber,
  phone,
}: {
  momoNumber: string;
  setMomoNumber: (v: string) => void;
  phone: string;
}) {
  const isAuto = phone && momoNumber === phone;

  return (
    <div className="relative bg-pink-50 border-2 border-pink-200 rounded-lg p-3">
      <Phone className="absolute left-4 top-3 h-4 w-4 text-pink-600" />
      <input
        value={momoNumber}
        onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
        placeholder="Số Momo"
        className="w-full pl-12 pr-3 py-2 bg-transparent font-semibold text-pink-700 placeholder-pink-500 outline-none text-sm"
      />
      {isAuto && (
        <span className="absolute right-3 top-3 text-[10px] font-bold bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full">
          TỰ ĐỘNG
        </span>
      )}
    </div>
  );
}