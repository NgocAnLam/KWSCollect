import Image from 'next/image';

export default function InfoPage() {
    const teamMembers = [
        {
        name: 'TS. Nguyễn Tấn Hoàng Phước',
        role: 'Leader',
        description: 'Phó Trưởng khoa Khoa Khoa học & Kỹ thuật Thông tin (ĐH CNTT - ĐHQG TPHCM)',
        image: '/members/GV.jpg',
        },
        {
        name: 'Lâm Ngọc Ẩn',
        role: 'Team Member',
        description: 'Học viên cao học',
        image: '/members/NgocAn.jpg',
        },
        {
        name: 'Lê Anh Quân',
        role: 'Team Member',
        description: 'Sinh viên',
        image: '/members/NgocAn.jpg',
        },
        {
        name: 'Đỗ Ngọc Tường Vân',
        role: 'Team Member',
        description: 'Sinh viên',
        image: '/members/TuongVan.jpg',
        },
    ];


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            {/* Phần Giới thiệu dự án */}
            <section className="mb-12 md:mb-20">
            <div className="bg-white rounded-2xl shadow-lg md:shadow-xl p-6 md:p-10 mb-8 md:mb-12">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Giới thiệu dự án
                </h1>
                <div className="space-y-4 md:space-y-6 text-gray-700">
                    <p className="text-sm md:text-base leading-relaxed">
                    Dự án thu thập dữ liệu giọng nói nhằm xây dựng bộ dữ liệu âm thanh tiếng Việt chất lượng cao, đa dạng và phong phú để phục vụ cho các mục đích nghiên cứu, phát triển công nghệ và các ứng dụng trí tuệ nhân tạo liên quan đến xử lý ngôn ngữ tự nhiên.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed">
                    Chúng tôi tập trung thu thập giọng nói từ nhiều độ tuổi, giới tính, vùng miền và ngữ cảnh khác nhau, đảm bảo tính đại diện và đa dạng về phương ngôn, ngữ điệu. Toàn bộ dữ liệu được ghi âm trong điều kiện kiểm soát chất lượng cao.
                    </p>
                    <p className="text-sm md:text-base leading-relaxed">
                    Dự án không chỉ góp phần thúc đẩy nghiên cứu khoa học trong lĩnh vực xử lý giọng nói tiếng Việt – một ngôn ngữ còn hạn chế về nguồn tài nguyên mở – mà còn tạo nền tảng cho việc phát triển các sản phẩm AI tiếng Việt thực tế, gần gũi hơn với người dùng Việt Nam. Chúng tôi cam kết tuân thủ nghiêm ngặt các quy định về quyền riêng tư và bảo mật dữ liệu, chỉ sử dụng dữ liệu từ những người tham gia tự nguyện và đã đồng ý rõ ràng.
                    </p>
                </div>
            </div>
            </section>

            {/* Phần Giới thiệu thành viên */}
            <section className="mb-12 md:mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6 md:mb-12">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Thành viên
                </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {teamMembers.map((member, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg overflow-hidden hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                    <div className="relative h-64 md:h-80 w-full">
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                    />
                    </div>
                    <div className="p-4 md:p-6 text-center">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">{member.name}</h3>
                    <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs md:text-sm font-medium mb-2 md:mb-3">
                        {member.role}
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{member.description}</p>
                    </div>
                </div>
                ))}
            </div>
            </section>

        </div>
        </div>
    );
}