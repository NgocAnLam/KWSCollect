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
    <div className="relative bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
      <Phone className="absolute left-6 top-5 h-5 w-5 text-pink-600" />
      <input
        value={momoNumber}
        onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
        placeholder="Số Momo"
        className="w-full pl-14 pr-4 py-4 bg-transparent font-bold text-pink-700 placeholder-pink-500 outline-none text-lg"
      />
      {isAuto && (
        <span className="absolute right-4 top-5 text-xs font-bold bg-pink-200 text-pink-800 px-3 py-1 rounded-full">
          TỰ ĐỘNG
        </span>
      )}
    </div>
  );
}