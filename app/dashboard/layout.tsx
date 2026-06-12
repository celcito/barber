import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId: string = user?.id as string;
  if (!userId) redirect("/login");
  const { data: saloes } = await supabase
    .from("saloes")
    .select("nome, slug")
    .eq("id", userId);

  const salao = saloes?.[0] as { nome: string; slug: string } | undefined;

  return (
    <div className="min-h-dynamic bg-surface">
      <DashboardSidebar salaoNome={salao?.nome || "The Shop"} />
      <main className="lg:ml-64">
        {children}
      </main>
    </div>
  );
}
