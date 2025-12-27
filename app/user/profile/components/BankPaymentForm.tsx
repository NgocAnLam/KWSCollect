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
    <div className="space-y-3">
      <select
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        className={`w-full px-3 py-2 pr-12 rounded-lg text-white font-semibold text-sm ${bankName ? bankColor : 'bg-gray-500'}`}
        style={{
          backgroundImage: bankName ? `url(${selectedBank?.logo})` : undefined,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '40px',
        }}
      >
        <option value="">Chọn ngân hàng</option>
        {BANK_LIST.map((bank) => (
          <option key={bank.name} value={bank.name}>
            {bank.name}
          </option>
        ))}
      </select>

      <input
        value={bankAccountNumber}
        onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
        placeholder="Số tài khoản"
        className={`w-full px-3 py-2 rounded-lg font-semibold text-white placeholder-white/70 ${bankColor} text-sm`}
      />

      <input
        value={bankAccountName}
        onChange={(e) => setBankAccountName(e.target.value.toUpperCase().replace(/Đ/g, 'D'))}
        placeholder="Tên chủ tài khoản (VIẾT HOA)"
        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold tracking-wide text-sm"
      />
    </div>
  );
}