import { Description } from '@radix-ui/react-dialog';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github, Send } from 'lucide-react'; // Cài lucide-react nếu chưa có: npm i lucide-react

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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            {/* Phần Giới thiệu dự án */}
            <section className="mb-20 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Giới thiệu dự án</h1>
            <div className="prose prose-lg mx-auto text-gray-700">
                <p className="mb-4">
                Dự án thu thập dữ liệu giọng nói là một sáng kiến nghiên cứu nhằm xây dựng bộ dữ liệu âm thanh tiếng Việt chất lượng cao, đa dạng và phong phú để phục vụ cho các mục đích nghiên cứu, phát triển công nghệ và các ứng dụng trí tuệ nhân tạo liên quan đến xử lý ngôn ngữ tự nhiên.
                </p>
                <p className="mb-4">
                Chúng tôi tập trung thu thập giọng nói từ nhiều độ tuổi, giới tính, vùng miền và ngữ cảnh khác nhau trên toàn lãnh thổ Việt Nam, đảm bảo tính đại diện và đa dạng về phương ngôn, ngữ điệu. Toàn bộ dữ liệu được ghi âm trong điều kiện kiểm soát chất lượng cao, kèm theo bản ghi văn bản (transcription) chính xác và thông tin metadata chi tiết.
                </p>
                <p>
                Dự án không chỉ góp phần thúc đẩy nghiên cứu khoa học trong lĩnh vực xử lý giọng nói tiếng Việt – một ngôn ngữ còn hạn chế về nguồn tài nguyên mở – mà còn tạo nền tảng cho việc phát triển các sản phẩm AI tiếng Việt thực tế, gần gũi hơn với người dùng Việt Nam. Chúng tôi cam kết tuân thủ nghiêm ngặt các quy định về quyền riêng tư và bảo mật dữ liệu, chỉ sử dụng dữ liệu từ những người tham gia tự nguyện và đã đồng ý rõ ràng.
                </p>
            </div>
            </section>

            {/* Phần Giới thiệu thành viên */}
            <section className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Thành viên</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                    <div className="relative h-80 w-full">
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                    />
                    </div>
                    <div className="p-2 text-center">
                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-indigo-600 font-medium mt-1">{member.role}</p>
                    <p className="text-gray-600 text-sm mt-3">{member.description}</p>
                    </div>
                </div>
                ))}
            </div>
            </section>

        </div>
        </div>
    );
}