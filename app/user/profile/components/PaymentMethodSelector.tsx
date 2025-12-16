import { DollarSign } from 'lucide-react';

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
}: {
  paymentMethod: 'momo' | 'bank' | 'cash' | 'none';
  setPaymentMethod: (v: 'momo' | 'bank' | 'cash' | 'none') => void;
}) {
  const methods = [
    { id: 'momo' as const, label: 'Momo', color: 'pink' },
    { id: 'bank' as const, label: 'Ngân hàng', color: 'blue' },
    { id: 'cash' as const, label: 'Tiền mặt', color: 'green' },
    { id: 'none' as const, label: 'Không nhận', color: 'gray' },
  ];

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        Chọn cách nhận tiền
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {methods.map((item) => (
          <button
            key={item.id}
            onClick={() => setPaymentMethod(item.id)}
            className={`py-4 rounded-xl font-medium transition-all ${
              paymentMethod === item.id
                ? `bg-${item.color}-600 text-white shadow-lg ring-4 ring-${item.color}-100`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}