import { HomeCTA } from "./components/HomeCTA";
import { HomeTracking } from "./components/HomeTracking";
import { HomeConsentCheckbox } from "./components/HomeConsentCheckbox";
import { LazyTeamSection } from "./components/LazyTeamSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KWS Collection — Đóng góp giọng nói cho AI tiếng Việt",
  description:
    "Thu thập dữ liệu giọng nói tiếng Việt chất lượng cao. Thu âm ~15 phút, nhận thù lao. Tham gia tự nguyện, bảo mật dữ liệu.",
  openGraph: {
    title: "KWS Collection — Đóng góp giọng nói cho AI tiếng Việt",
    description:
      "Thu âm ~15 phút, nhận thù lao. Góp phần xây dựng bộ dữ liệu giọng nói mở cho nghiên cứu và AI tiếng Việt.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "KWS Collection — Đóng góp giọng nói cho AI tiếng Việt",
      },
    ],
  },
};

export default function InfoPage() {
  const teamMembers = [
    {
      name: "TS. Nguyễn Tấn Hoàng Phước",
      role: "Leader",
      description:
        "Phó Trưởng khoa Khoa Khoa học & Kỹ thuật Thông tin (ĐH CNTT - ĐHQG TPHCM)",
      image: "/members/GV.jpg",
    },
    {
      name: "Lâm Ngọc Ẩn",
      role: "Team Member",
      description: "Học viên cao học",
      image: "/members/NgocAn.jpg",
    },
    {
      name: "Lê Anh Quân",
      role: "Team Member",
      description: "Sinh viên",
      image: "/members/NgocAn.jpg",
    },
    {
      name: "Đỗ Ngọc Tường Vân",
      role: "Team Member",
      description: "Sinh viên",
      image: "/members/TuongVan.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <HomeTracking />
      <div className="max-w-7xl mx-auto">
        {/* Hero — above the fold, CTA ngay visible */}
        <section className="mb-12 md:mb-16 pt-2 md:pt-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Đóng góp giọng nói của bạn cho AI tiếng Việt
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
              Thu âm ~15 phút • Nhận thù lao sau khi hoàn thành • 5 bước đơn giản
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <HomeCTA variant="primary" source="hero" />
              <HomeCTA variant="secondary" />
            </div>
          </div>
        </section>

        {/* Giới thiệu dự án — headline benefit đã đưa lên hero */}
        <section className="mb-12 md:mb-20" id="intro">
          <div className="bg-white rounded-2xl shadow-lg md:shadow-xl p-6 md:p-10 mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Giới thiệu dự án
            </h2>
            <div className="space-y-4 md:space-y-5 text-gray-700">
              <p className="text-sm md:text-base leading-relaxed">
                Dự án thu thập dữ liệu giọng nói nhằm xây dựng bộ dữ liệu âm
                thanh tiếng Việt chất lượng cao, đa dạng để phục vụ nghiên cứu,
                phát triển công nghệ và ứng dụng AI xử lý ngôn ngữ tự nhiên.
              </p>
              <p className="text-sm md:text-base leading-relaxed">
                Chúng tôi thu thập giọng nói từ nhiều độ tuổi, giới tính, vùng
                miền, đảm bảo đa dạng phương ngôn. Dữ liệu ghi âm trong điều kiện
                kiểm soát chất lượng. Chúng tôi cam kết bảo mật và chỉ sử dụng
                dữ liệu từ người tham gia tự nguyện, đã đồng ý rõ ràng.
              </p>
            </div>

            {/* Vì sao nên tham gia */}
            <div className="mt-8 md:mt-10 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Vì sao nên tham gia?
              </h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm md:text-base text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Nhận thù lao sau khi hoàn thành thu âm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Chỉ mất khoảng 15 phút, 5 bước đơn giản</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Đóng góp trực tiếp cho AI tiếng Việt và nghiên cứu mở</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Dữ liệu được bảo mật, chỉ dùng cho mục đích đã cam kết</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ — 4 câu */}
        <section className="mb-12 md:mb-20" id="faq">
          <div className="bg-white rounded-2xl shadow-lg md:shadow-xl p-6 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Câu hỏi thường gặp
            </h2>
            <dl className="mx-auto">
              <div>
                <dt className="font-semibold text-gray-900 mb-1">
                  Dữ liệu giọng nói được sử dụng như thế nào?
                </dt>
                <dd className="text-sm md:text-base text-gray-600">
                  Dữ liệu chỉ dùng cho nghiên cứu và phát triển công nghệ xử lý
                  giọng nói / AI tiếng Việt, trong khuôn khổ dự án và đã được
                  người tham gia đồng ý. Chúng tôi không bán hoặc chuyển dữ liệu
                  cho bên thứ ba vì mục đích thương mại khác.
                </dd>
              </div>
              <br />
              <div>
                <dt className="font-semibold text-gray-900 mb-1">
                  Thù lao nhận khi nào?
                </dt>
                <dd className="text-sm md:text-base text-gray-600">
                  Sau khi bạn hoàn thành đủ các bước thu âm (từ khóa + câu) và
                  được admin xác nhận, thù lao sẽ được chuyển theo phương thức
                  bạn đã đăng ký (Ví Momo, chuyển khoản ngân hàng hoặc tiền mặt).
                </dd>
              </div>
              <br />
              <div>
                <dt className="font-semibold text-gray-900 mb-1">
                Chính sách bảo mật
                </dt>
                <dd className="text-sm md:text-base text-gray-600">
                  Chúng tôi chỉ thu thập dữ liệu giọng nói và thông tin cá nhân cần thiết 
                  (tên, số điện thoại, phương thức nhận thù lao) để quản lý phiên thu thập và thanh toán. 
                  Dữ liệu được lưu trữ bảo mật, không chia sẻ cho bên thứ ba vì mục đích khác ngoài nghiên cứu 
                  và phát triển đã được đồng ý.
                </dd>
              </div>
              <br />
              <div>
                <dt className="font-semibold text-gray-900 mb-1">
                  Điều khoản tham gia
                </dt>
                <dd className="text-sm md:text-base text-gray-600">
                  Bạn tham gia tự nguyện và đồng ý thu âm theo hướng dẫn, cung cấp
                  thông tin chính xác. Bản ghi âm và dữ liệu liên quan có thể được
                  sử dụng cho mục đích nghiên cứu và phát triển AI tiếng Việt.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Thành viên — lazy load khi scroll tới */}
        <LazyTeamSection teamMembers={teamMembers} />
      </div>
    </div>
  );
}
