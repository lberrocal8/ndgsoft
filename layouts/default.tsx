import { Head } from "./head";
import { Navbar } from "@/components/navbar";
import { MesaProvider } from "@/providers/mesaProvider";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Head />
      <Navbar />
      <MesaProvider>
        <main className="container mx-auto max-w-7xl px-4 flex-grow pt-2">
          {children}
        </main>
      </MesaProvider>
    </div>
  );
}
