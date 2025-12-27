// Khoảng tuổi
export const AGE_RANGES = [
  "0-10 tuổi",
  "11-20 tuổi",
  "21-30 tuổi",
  "31-40 tuổi",
  "41-50 tuổi",
  "51-60 tuổi",
  "61-70 tuổi",
  "71-80 tuổi",
  "81-90 tuổi",
  "91-100 tuổi",
] as const;

// Danh sách ngân hàng
export const BANK_LIST = [
  { name: "Vietcombank", logo: "/banks/VCB.webp", color: "bg-green-600/50" },
  { name: "BIDV", logo: "/banks/BIDV.webp", color: "bg-orange-500/50" },
  { name: "VietinBank", logo: "/banks/CTG.webp", color: "bg-red-600/50" },
  { name: "Agribank", logo: "/banks/ARI.png", color: "bg-green-700/50" },
  { name: "Techcombank - TCB", logo: "/banks/TCB.webp", color: "bg-orange-600/50" },
  { name: "MB Bank", logo: "/banks/MBB.webp", color: "bg-purple-600/50" },
  { name: "ACB", logo: "/banks/ACB.webp", color: "bg-blue-700/50" },
  { name: "Sacombank", logo: "/banks/STB.webp", color: "bg-yellow-500/50" },
  { name: "VPBank", logo: "/banks/VPB.webp", color: "bg-purple-700/50" },
  { name: "SHB", logo: "/banks/SHB.webp", color: "bg-red-700/50" },
  { name: "TPBank", logo: "/banks/TPB.webp", color: "bg-pink-600/50" },
  { name: "Eximbank", logo: "/banks/EIB.webp", color: "bg-green-500/50" },
  { name: "HDBank", logo: "/banks/HDB.webp", color: "bg-red-500/50" },
  { name: "LPBank", logo: "/banks/LPB.webp", color: "bg-blue-800/50" },
  { name: "Nam A Bank", logo: "/banks/NAB.webp", color: "bg-blue-500/50" },
] as const;

// Các vùng miền (nếu cần dùng lại ở nơi khác)
export const REGIONS = [
  { value: "southeast", label: "Đông Nam Bộ" },
  { value: "southwest", label: "Tây Nam Bộ" },
  { value: "centralsouth", label: "Duyên hải Nam Trung Bộ" },
  { value: "centralhightlands", label: "Tây Nguyên" },
  { value: "centralnorth", label: "Bắc Trung Bộ" },
  { value: "northwest", label: "Tây Bắc Bộ" },
  { value: "northeast", label: "Đông Bắc Bộ" },
  { value: "foreigner", label: "Nước ngoài" },
] as const;

export type RegionType = typeof REGIONS[number]['value'];

// Địa điểm ghi âm
export const RECORDING_LOCATIONS = [
  "Phòng yên tĩnh",
  "Phòng có tiếng ồn nhẹ",
  "Quán cafe",
  "Ngoài trời",
  "Phương tiện giao thông",
  "Khác",
] as const;

export type RecordingLocationType = typeof RECORDING_LOCATIONS[number];