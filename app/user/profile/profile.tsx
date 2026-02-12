"use client";

import { useState, useEffect, useRef } from "react";
import { getApiBase } from "@/lib/api";
import { trackEvent, TRACK_EVENTS } from "@/lib/tracking";
import type { RegionType } from "./constants/types";
import { RECORDING_LOCATIONS } from "./constants/Constants";
import PersonalInfoSection from "./components/PersonalInfoSection";
import AgeGenderSection from "./components/AgeGenderSection";
import RegionLocationSection from "./components/RegionLocationSection";
import PhoneInput from "./components/PhoneInput";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import MomoPaymentForm from "./components/MomoPaymentForm";
import BankPaymentForm from "./components/BankPaymentForm";

export interface UserInfoFormProps {
  onCreated: (u: { id: number; session_id?: number }) => void;
  onValidityChange?: (v: boolean) => void;
  onRegisterSubmit?: (fn: () => Promise<void>) => void;
}

export default function UserInfoForm({
  onCreated,
  onValidityChange,
  onRegisterSubmit,
}: UserInfoFormProps) {
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("21-30 tuổi");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [region, setRegion] = useState<RegionType>("southeast");
  const [phone, setPhone] = useState("");
  const phoneRef = useRef(phone);
  const [location, setLocation] = useState<string>(RECORDING_LOCATIONS[0]);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "bank" | "cash" | "none">("momo");
  const paymentMethodRef = useRef(paymentMethod);
  const [momoNumber, setMomoNumber] = useState("");
  const momoRef = useRef(momoNumber);
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const bankNameRef = useRef(bankName);
  const bankAccountNumberRef = useRef(bankAccountNumber);
  const bankAccountNameRef = useRef(bankAccountName);
  const [loading, setLoading] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState<{ phone?: string; momo?: string; bank_account?: string }>({});

  useEffect(() => {
    phoneRef.current = phone;
  }, [phone]);
  useEffect(() => {
    momoRef.current = momoNumber;
  }, [momoNumber]);
  useEffect(() => {
    paymentMethodRef.current = paymentMethod;
  }, [paymentMethod]);
  useEffect(() => {
    bankNameRef.current = bankName;
  }, [bankName]);
  useEffect(() => {
    bankAccountNumberRef.current = bankAccountNumber;
  }, [bankAccountNumber]);
  useEffect(() => {
    bankAccountNameRef.current = bankAccountName;
  }, [bankAccountName]);
  useEffect(() => {
    if (paymentMethod === "momo" && phone.trim()) setMomoNumber(phone.trim());
    else if (paymentMethod !== "momo") setMomoNumber("");
  }, [phone, paymentMethod]);

  const normalizePhone = (raw: string) => {
    const s = raw.trim().replace(/\D/g, "");
    if (s.length === 9 && s[0] !== "0") return "0" + s;
    return s;
  };

  const submit = async () => {
    if (!name.trim()) throw new Error('Vui lòng nhập họ và tên');
    const currentPhone = (phoneRef.current ?? phone).trim().replace(/\D/g, '');
    if (currentPhone.length < 9) throw new Error('Số điện thoại không hợp lệ (ít nhất 9 chữ số)');
    if (!ageRange) throw new Error('Vui lòng chọn khoảng tuổi');
    if (!gender) throw new Error('Vui lòng chọn giới tính');
    if (!region) throw new Error('Vui lòng chọn vùng miền');

    const currentPaymentMethod = paymentMethodRef.current ?? paymentMethod;
    const currentMomo = (momoRef.current ?? momoNumber).trim();
    const currentBankName = bankNameRef.current ?? bankName;
    const currentBankAccountNumber = (bankAccountNumberRef.current ?? bankAccountNumber).trim();
    const currentBankAccountName = (bankAccountNameRef.current ?? bankAccountName).trim();
    if (currentPaymentMethod === 'momo' && !currentMomo) throw new Error('Vui lòng nhập số Momo');
    if (currentPaymentMethod === 'bank') {
      if (!currentBankName) throw new Error('Vui lòng chọn ngân hàng');
      if (!currentBankAccountNumber) throw new Error('Vui lòng nhập số tài khoản');
      if (!currentBankAccountName) throw new Error('Vui lòng nhập tên chủ tài khoản');
    }

    setDuplicateErrors({});
    const phoneToSend = normalizePhone(phoneRef.current ?? phone);
    const checkBody: { phone?: string; momo?: string; bank_account?: string } = { phone: phoneToSend };
    if (currentPaymentMethod === "momo" && currentMomo) checkBody.momo = normalizePhone(currentMomo);
    if (currentPaymentMethod === "bank" && currentBankAccountNumber) checkBody.bank_account = currentBankAccountNumber;

    const checkRes = await fetch(`${getApiBase()}/user/profile/check-duplicates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(checkBody),
    });
    if (checkRes.ok) {
      const dup = await checkRes.json();
      if (dup.phone_exists || dup.momo_exists || dup.bank_account_exists) {
        const errs: { phone?: string; momo?: string; bank_account?: string } = {};
        if (dup.phone_exists) errs.phone = "Số điện thoại đã được đăng ký. Vui lòng nhập số khác.";
        if (dup.momo_exists) errs.momo = "Số Momo đã được đăng ký. Vui lòng nhập số khác.";
        if (dup.bank_account_exists) errs.bank_account = "Số tài khoản ngân hàng đã được đăng ký. Vui lòng nhập số khác.";
        setDuplicateErrors(errs);
        throw new Error("Thông tin đã tồn tại. Vui lòng kiểm tra và điền lại số điện thoại / số Momo / số tài khoản.");
      }
    }

    setLoading(true);
    const payload = {
      name: name.trim(),
      age_range: ageRange,
      gender,
      region,
      phone: phoneToSend,
      location,
      payment_method: currentPaymentMethod,
      payment_info:
        currentPaymentMethod === 'momo'
          ? (currentMomo ? normalizePhone(currentMomo) : null)
          : currentPaymentMethod === 'bank'
          ? `${currentBankName}|${currentBankAccountNumber}|${currentBankAccountName}`
          : null,
      payment_label:
        currentPaymentMethod === 'momo'
          ? (currentMomo ? `Momo: ${normalizePhone(currentMomo)}` : 'Momo')
          : currentPaymentMethod === 'bank'
          ? `${currentBankName} - ${currentBankAccountName} (${currentBankAccountNumber})`
          : currentPaymentMethod === 'cash'
          ? 'Nhận tiền mặt'
          : 'Không nhận tiền',
    };

    try {
      const res = await fetch(`${getApiBase()}/user/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || 'Lỗi server');
      }

      const userData = await res.json();
      trackEvent(TRACK_EVENTS.USER_STEP1_COMPLETE, { user_id: userData?.id });
      onCreated(userData);
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isValid = !!(
    name.trim() &&
    phone.trim() && phone.trim().replace(/\D/g, '').length >= 9 &&
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
    <div className="max-w-5xl mx-auto px-4 py-4 w-full space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Hero: Thông tin cá nhân (đồng bộ Bước 2–5) */}
        <div className="bg-gradient-to-b from-indigo-50 to-white px-4 py-2 border-b border-gray-100">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
            Thông tin cá nhân
          </p>
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Đăng ký tham gia thu âm
          </h2>
        </div>

        {/* Nội dung: 2 cột trên md+ */}
        <div className="p-4 overflow-y-auto text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Cột trái: thông tin cá nhân */}
            <div className="space-y-3">
              <PersonalInfoSection name={name} setName={setName} />
              <div>
                <PhoneInput
                  phone={phone}
                  setPhone={(v) => {
                    setPhone(v);
                    phoneRef.current = v;
                    setDuplicateErrors((e) => (e.phone ? { ...e, phone: undefined } : e));
                  }}
                  error={duplicateErrors.phone}
                />
                {duplicateErrors.phone && (
                  <p className="mt-1 text-xs text-red-600" role="alert">{duplicateErrors.phone}</p>
                )}
              </div>
              <AgeGenderSection ageRange={ageRange} setAgeRange={setAgeRange} gender={gender} setGender={setGender} />
              <RegionLocationSection region={region} setRegion={setRegion} location={location} setLocation={setLocation} />
            </div>

            {/* Cột phải: thanh toán (sticky trên md+) */}
            <div className="space-y-3 md:sticky md:top-4 md:self-start">
              <div className="bg-gray-50/80 rounded-lg border border-gray-200 p-3 md:max-w-sm">
                <PaymentMethodSelector paymentMethod={paymentMethod} setPaymentMethod={(v) => { setPaymentMethod(v); paymentMethodRef.current = v; }} />

                {paymentMethod === "momo" && (
                  <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                    <MomoPaymentForm
                      momoNumber={momoNumber}
                      setMomoNumber={(v) => {
                        setMomoNumber(v);
                        momoRef.current = v;
                        setDuplicateErrors((e) => (e.momo ? { ...e, momo: undefined } : e));
                      }}
                      phone={phone}
                      error={duplicateErrors.momo}
                    />
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
                    <BankPaymentForm
                      bankName={bankName}
                      setBankName={setBankName}
                      bankAccountNumber={bankAccountNumber}
                      setBankAccountNumber={(v) => {
                        setBankAccountNumber(v);
                        bankAccountNumberRef.current = v;
                        setDuplicateErrors((e) => (e.bank_account ? { ...e, bank_account: undefined } : e));
                      }}
                      bankAccountName={bankAccountName}
                      setBankAccountName={setBankAccountName}
                      bankAccountError={duplicateErrors.bank_account}
                    />
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="mt-3 p-3 bg-emerald-50/80 rounded-md border border-emerald-200 text-center">
                    <p className="text-xs font-semibold text-emerald-800">Tiền mặt</p>
                    <p className="text-xs text-emerald-700 mt-0.5">Bạn sẽ nhận tiền mặt khi hoàn thành thu âm.</p>
                  </div>
                )}

                {paymentMethod === "none" && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-md border border-gray-200 text-center">
                    <p className="text-xs font-medium text-gray-700">Không nhận tiền</p>
                    <p className="text-xs text-gray-600 mt-0.5">Cảm ơn bạn đã tham gia tình nguyện.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}