"use client";
import { useState, useEffect } from 'react';
import PersonalInfoSection from "./components/PersonalInfoSection";
import AgeGenderSection from "./components/AgeGenderSection";
import RegionLocationSection from "./components/RegionLocationSection";
import PhoneInput from "./components/PhoneInput";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import MomoPaymentForm from "./components/MomoPaymentForm";
import BankPaymentForm from "./components/BankPaymentForm";

export default function UserInfoForm({ onCreated, onValidityChange, onRegisterSubmit }: { onCreated: (u: any) => void; onValidityChange?: (v: boolean) => void; onRegisterSubmit?: (fn: () => Promise<void>) => void; }) {
  const [name, setName] = useState("Lâm Ngọc Ẩn");
  const [ageRange, setAgeRange] = useState("21-30 tuổi");
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [region, setRegion] = useState<'southeast' | 'southwest' | 'centralsouth' | 'centralhightlands' | 'centralnorth' | 'northwest' | 'northeast' | 'foreigner'>('southeast');
  const [phone, setPhone] = useState("0355978430");
  const [location, setLocation] = useState('Phòng yên tĩnh');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'bank' | 'cash' | 'none'>('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paymentMethod === 'momo' && phone.trim()) setMomoNumber(phone.trim()) 
    else if (paymentMethod !== 'momo') setMomoNumber('');
  }, [phone, paymentMethod]);

  const submit = async () => {
    if (!name.trim()) throw new Error('Vui lòng nhập họ và tên');
    if (!phone.trim() || phone.length < 9) throw new Error('Số điện thoại không hợp lệ');
    if (!ageRange) throw new Error('Vui lòng chọn khoảng tuổi');
    if (!gender) throw new Error('Vui lòng chọn giới tính');
    if (!region) throw new Error('Vui lòng chọn vùng miền');

    if (paymentMethod === 'momo' && !momoNumber.trim()) throw new Error('Vui lòng nhập số Momo');
    if (paymentMethod === 'bank') {
      if (!bankName) throw new Error('Vui lòng chọn ngân hàng');
      if (!bankAccountNumber.trim()) throw new Error('Vui lòng nhập số tài khoản');
      if (!bankAccountName.trim()) throw new Error('Vui lòng nhập tên chủ tài khoản');
    }

    setLoading(true);
    const payload = {
      name: name.trim(),
      age_range: ageRange,
      gender,
      region,
      phone: phone.trim(),
      location,
      payment_method: paymentMethod,
      payment_info:
        paymentMethod === 'momo'
          ? momoNumber.trim()
          : paymentMethod === 'bank'
          ? `${bankName}|${bankAccountNumber}|${bankAccountName}`
          : null,
      payment_label:
        paymentMethod === 'momo'
          ? `Momo: ${momoNumber}`
          : paymentMethod === 'bank'
          ? `${bankName} - ${bankAccountName} (${bankAccountNumber})`
          : paymentMethod === 'cash'
          ? 'Nhận tiền mặt'
          : 'Không nhận tiền',
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || 'Lỗi server');
      }

      const userData = await res.json();
      onCreated(userData);
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isValid = !!(
    name.trim() &&
    phone.trim() && phone.trim().length >= 9 &&
    ageRange &&
    gender &&
    region &&
    (paymentMethod === 'momo'
      ? momoNumber.trim()
      : paymentMethod === 'bank'
      ? bankName && bankAccountNumber.trim() && bankAccountName.trim()
      : true)
  );

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    onRegisterSubmit?.(submit);
  }, [onRegisterSubmit]);

  return (
    <div className="bg-white rounded-xl shadow-sm h-auto max-h-[90vh] p-0 overflow-auto">
      {/* Container chính giới hạn chiều cao và cho phép cuộn bên trong */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-auto max-h-[80vh] flex flex-col">
        
        {/* Header gradient cố định */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex-shrink-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            Đăng ký tham gia thu âm
          </h2>
        </div>

        {/* Nội dung cuộn được - chia thành 2 cột trên md+ */}
        <div className="p-1 sm:p-2 overflow-y-auto flex-1 text-sm hide-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Left column: personal info */}
            <div className="space-y-2">
              <PersonalInfoSection name={name} setName={setName} />
              <PhoneInput phone={phone} setPhone={setPhone} />
              <AgeGenderSection ageRange={ageRange} setAgeRange={setAgeRange} gender={gender} setGender={setGender} />
              <RegionLocationSection region={region} setRegion={setRegion} location={location} setLocation={setLocation} />
            </div>

            {/* Right column: payment info (sticky card on md+) */}
            <div className="space-y-2 md:sticky md:top-4 md:self-start md:w-full md:max-w-sm md:ml-auto bg-white p-2 rounded-lg shadow">
              <PaymentMethodSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

              {paymentMethod === 'momo' && (
                <div className="p-2 bg-purple-50 rounded-md border border-purple-200">
                  <MomoPaymentForm 
                    momoNumber={momoNumber} 
                    setMomoNumber={setMomoNumber} 
                    phone={phone} 
                  />
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
                  <BankPaymentForm
                    bankName={bankName}
                    setBankName={setBankName}
                    bankAccountNumber={bankAccountNumber}
                    setBankAccountNumber={setBankAccountNumber}
                    bankAccountName={bankAccountName}
                    setBankAccountName={setBankAccountName}
                  />
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-3 bg-green-50 rounded-md border border-green-200 text-center">
                  <div className="text-green-600">
                    <svg className="w-10 h-10 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-bold">Bạn sẽ nhận tiền mặt khi hoàn thành</p>
                    <p className="mt-1 text-green-700 text-sm">Chúng tôi sẽ thanh toán trực tiếp sau buổi thu âm</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'none' && (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-center">
                  <div className="text-gray-600">
                    <svg className="w-10 h-10 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-5.657a1 1 0 010-1.414l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414-1.414-1.414a1 1 0 00-1.414 1.414l1.414 1.414-1.414 1.414a1 1 0 001.414 1.414l1.414-1.414 1.414 1.414a1 1 0 001.414-1.414L11.414 11l1.414-1.414a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">Cảm ơn bạn đã tham gia tình nguyện!</p>
                    <p className="mt-1 text-sm">Sự đóng góp của bạn rất quý giá ❤️</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}