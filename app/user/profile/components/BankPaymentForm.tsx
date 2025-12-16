import Image from 'next/image';
import { BANK_LIST } from '../constants/Constants';

export default function BankPaymentForm({
  bankName,
  setBankName,
  bankAccountNumber,
  setBankAccountNumber,
  bankAccountName,
  setBankAccountName,
}: {
  bankName: string;
  setBankName: (v: string) => void;
  bankAccountNumber: string;
  setBankAccountNumber: (v: string) => void;
  bankAccountName: string;
  setBankAccountName: (v: string) => void;
}) {
  const selectedBank = BANK_LIST.find((b) => b.name === bankName);
  const bankColor = selectedBank?.color || "bg-gray-500";

  return (
    <div className="space-y-4">
      <select
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        className={`w-full px-4 py-4 rounded-xl text-white font-bold text-lg ${bankName ? bankColor : 'bg-gray-500'}`}
      >
        <option value="">Chọn ngân hàng</option>
        {BANK_LIST.map((bank) => (
          <option key={bank.name} value={bank.name}>
            {bank.name}
          </option>
        ))}
      </select>

      {selectedBank && (
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl bg-white p-2">
            <Image
              src={selectedBank.logo}
              alt={bankName}
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        </div>
      )}

      <input
        value={bankAccountNumber}
        onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
        placeholder="Số tài khoản"
        className={`w-full px-4 py-4 rounded-xl font-bold text-white placeholder-white/70 ${bankColor}`}
      />

      <input
        value={bankAccountName}
        onChange={(e) => setBankAccountName(e.target.value.toUpperCase().replace(/Đ/g, 'D'))}
        placeholder="Tên chủ tài khoản (VIẾT HOA)"
        className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl font-bold tracking-wider"
      />
    </div>
  );
}