import { DollarSign } from 'lucide-react';

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
}: {
  paymentMethod: 'momo' | 'bank' | 'cash' | 'none';
  setPaymentMethod: (v: 'momo' | 'bank' | 'cash' | 'none') => void;
}) {
  const getButtonClass = (id: typeof paymentMethod) => {
    const base = "py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors";
    if (paymentMethod === id) {
      return `${base} bg-indigo-600 text-white border-2 border-indigo-500 shadow-sm`;
    }
    return `${base} bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200`;
  };

  const methods = [
    { id: 'momo' as const, label: 'Momo' },
    { id: 'bank' as const, label: 'Ngân hàng' },
    { id: 'cash' as const, label: 'Tiền mặt' },
    { id: 'none' as const, label: 'Không nhận' },
  ];

  return (
    <div>
      <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
        <DollarSign className="h-3.5 w-3.5" />
        Cách nhận thù lao
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {methods.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPaymentMethod(item.id)}
            className={getButtonClass(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}