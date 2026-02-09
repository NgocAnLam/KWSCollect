/** Layout riêng cho /user: chiều cao = viewport trừ header (h-16 / md:h-20), overflow-hidden để wizard tự scroll bên trong. */
export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] min-h-0 w-full overflow-hidden">
      {children}
    </div>
  );
}
