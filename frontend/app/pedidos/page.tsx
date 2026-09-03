import Link from "next/link";

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7] px-6 py-12 text-[#2f2a27]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-semibold text-[#a2725e] transition hover:opacity-70"
          >
            ← Volver al inicio
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Mis pedidos
          </h1>

          <p className="mt-2 text-[#7a6f69]">
            Consulta el estado y el detalle de tus pedidos realizados en Aurum.
          </p>
        </div>

        <section className="rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
          <p className="text-center text-[#7a6f69]">
            Aún no hemos cargado tus pedidos.
          </p>
        </section>
      </div>
    </main>
  );
}
