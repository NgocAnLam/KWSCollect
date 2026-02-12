import { BANK_LIST } from '../constants/Constants';

const inputBase =
  'w-full px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none text-sm';

export default function BankPaymentForm({
  bankName,
  setBankName,
  bankAccountNumber,
  setBankAccountNumber,
  bankAccountName,
  setBankAccountName,
  bankAccountError,
}: {
  bankName: string;
  setBankName: (v: string) => void;
  bankAccountNumber: string;
  setBankAccountNumber: (v: string) => void;
  bankAccountName: string;
  setBankAccountName: (v: string) => void;
  bankAccountError?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="profile-bank-name" className="sr-only">Ngân hàng</label>
      <select
        id="profile-bank-name"
        name="bank_name"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        aria-label="Ngân hàng"
        className={`${inputBase} appearance-none pr-8 bg-white`}
      >
        <option value="">Chọn ngân hàng</option>
        {BANK_LIST.map((bank) => (
          <option key={bank.name} value={bank.name}>
            {bank.name}
          </option>
        ))}
      </select>

      <div>
        <label htmlFor="profile-bank-account" className="sr-only">Số tài khoản</label>
        <input
          id="profile-bank-account"
          name="bank_account_number"
          value={bankAccountNumber}
          onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="Số tài khoản…"
          className={`${inputBase} ${bankAccountError ? "border-red-500" : ""}`}
        />
        {bankAccountError && <p className="mt-1 text-xs text-red-600" role="alert">{bankAccountError}</p>}
      </div>

      <label htmlFor="profile-bank-account-name" className="sr-only">Tên chủ tài khoản</label>
      <input
        id="profile-bank-account-name"
        name="bank_account_name"
        value={bankAccountName}
        onChange={(e) => setBankAccountName(e.target.value.toUpperCase().replace(/Đ/g, 'D'))}
        placeholder="Tên chủ tài khoản (VIẾT HOA)…"
        className={`${inputBase} font-semibold tracking-wide`}
      />
    </div>
  );
}