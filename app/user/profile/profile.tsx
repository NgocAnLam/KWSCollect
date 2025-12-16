"use client";
import { useState, useEffect } from 'react';
import PersonalInfoSection from "./components/PersonalInfoSection";
import AgeGenderSection from "./components/AgeGenderSection";
import RegionLocationSection from "./components/RegionLocationSection";
import PhoneInput from "./components/PhoneInput";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import MomoPaymentForm from "./components/MomoPaymentForm";
import BankPaymentForm from "./components/BankPaymentForm";
import SubmitButton from "./components/SubmitButton";

export default function UserInfoForm({ onCreated }: { onCreated: (u: any) => void }) {
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
    if (!name.trim()) return alert('Vui lòng nhập họ và tên');
    if (!phone.trim() || phone.length < 9) return alert('Số điện thoại không hợp lệ');
    if (!ageRange) return alert('Vui lòng chọn khoảng tuổi');
    if (!gender) return alert('Vui lòng chọn giới tính');
    if (!region) return alert('Vui lòng chọn vùng miền');

    if (paymentMethod === 'momo' && !momoNumber.trim()) return alert('Vui lòng nhập số Momo');
    if (paymentMethod === 'bank') {
      if (!bankName) return alert('Vui lòng chọn ngân hàng');
      if (!bankAccountNumber.trim()) return alert('Vui lòng nhập số tài khoản');
      if (!bankAccountName.trim()) return alert('Vui lòng nhập tên chủ tài khoản');
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_USER_PROFILE_URL}`, {
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
    } 
    catch (err: any) {alert(err.message || 'Không thể kết nối server')} 
    finally {setLoading(false)}
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            Đăng ký tham gia thu âm
          </h2>
          <p className="text-center mt-2 opacity-90">Nhận tiền ngay sau khi hoàn thành</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <PersonalInfoSection name={name} setName={setName} />
          <AgeGenderSection ageRange={ageRange} setAgeRange={setAgeRange} gender={gender} setGender={setGender} />
          <RegionLocationSection region={region} setRegion={setRegion} location={location} setLocation={setLocation} />
          <PhoneInput phone={phone} setPhone={setPhone} />
          <PaymentMethodSelector paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

          {paymentMethod === 'momo' && (
            <MomoPaymentForm 
            momoNumber={momoNumber} 
            setMomoNumber={setMomoNumber} 
            phone={phone} 
            />
          )}

          {paymentMethod === 'bank' && (
            <BankPaymentForm
            bankName={bankName}
            setBankName={setBankName}
            bankAccountNumber={bankAccountNumber}
            setBankAccountNumber={setBankAccountNumber}
            bankAccountName={bankAccountName}
            setBankAccountName={setBankAccountName}
            />
          )}
          {paymentMethod === 'cash' && (
            <div className="text-center py-8 text-green-600">
              <p className="text-xl font-bold">Bạn sẽ nhận tiền mặt khi hoàn thành</p>
            </div>
          )}
          {paymentMethod === 'none' && (
            <div className="text-center py-8 text-gray-600">
              <p className="text-xl font-medium">Cảm ơn bạn đã tham gia tình nguyện!</p>
            </div>
          )}

          <SubmitButton loading={loading} onClick={submit} />
        </div>
      </div>
    </div>
  );
}
