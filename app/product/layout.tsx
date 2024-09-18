import MainLayout from "@/app/components/Layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout>{children}</MainLayout>
  );
}
