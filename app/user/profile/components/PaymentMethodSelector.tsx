import { DollarSign } from 'lucide-react';

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
}: {
  paymentMethod: 'momo' | 'bank' | 'cash' | 'none';
  setPaymentMethod: (v: 'momo' | 'bank' | 'cash' | 'none') => void;
}) {
  const getButtonClass = (id: typeof paymentMethod) => {
    const base = "py-2 rounded-lg text-sm font-medium transition-all";
    const inactive = "bg-gray-100 text-gray-700 hover:bg-gray-200";

    if (paymentMethod === id) {
      switch (id) {
        case 'momo':
          return `${base} bg-pink-600 text-white shadow-md ring-2 ring-pink-100`;
        case 'bank':
          return `${base} bg-blue-600 text-white shadow-md ring-2 ring-blue-100`;
        case 'cash':
          return `${base} bg-green-600 text-white shadow-md ring-2 ring-green-100`;
        case 'none':
          return `${base} bg-gray-600 text-white shadow-md ring-2 ring-gray-100`;
        default:
          return inactive;
      }
    }

    return `${base} ${inactive}`;
  };

  const methods = [
    { id: 'momo' as const, label: 'Momo' },
    { id: 'bank' as const, label: 'Ngân hàng' },
    { id: 'cash' as const, label: 'Tiền mặt' },
    { id: 'none' as const, label: 'Không nhận' },
  ];

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Chọn cách nhận tiền
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {methods.map((item) => (
          <button
            key={item.id}
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