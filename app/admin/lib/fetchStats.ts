// app/admin/lib/fetchStats.ts
export async function getPendingPaymentCount(): Promise<number> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_STATS_URL}`, { cache: "no-store" });
    if (!res.ok) return 0;
    const users = await res.json();
    return users.filter((u: any) => u.payment_status !== "paid").length;
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return 0;
  }
}