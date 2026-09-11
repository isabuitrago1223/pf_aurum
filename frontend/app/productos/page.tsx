import Link from "next/link";
import {
  ArrowLeft,
  Gift,
  Sparkles,
} from "lucide-react";

import ProductCatalog from "../../components/ProductCatalog";

type ProductsPageProps = {
  searchParams: Promise<{
    categoria?: string;
    ocasion?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const categoria = params.categoria;
  const ocasion = params.ocasion;

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-900">
      <section className="px-5 pb-5 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-800 transition hover:text-purple-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-purple-100 bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-9 lg:px-11">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-purple-100/70 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-amber-100/70 blur-3xl" />

            <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />

                  <span className="text-xs font-black uppercase tracking-[0.16em] text-purple-800">
                    Aurum Decoraciones
                  </span>
                </div>

                <h1 className="mt-5 font-serif text-4xl font-black tracking-tight text-purple-950 sm:text-5xl">
                  Catálogo de productos
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Encuentra detalles especiales para cumpleaños,
                  aniversarios, amor y amistad y todos esos momentos
                  que merecen convertirse en un recuerdo inolvidable.
                </p>
              </div>

              <div className="hidden lg:flex lg:items-center lg:justify-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-purple-950 via-purple-800 to-purple-700 shadow-lg shadow-purple-100">
                  <Gift className="h-12 w-12 text-amber-300" />

                  <div className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-amber-300">
                    <Sparkles className="h-4 w-4 text-purple-950" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProductCatalog
            selectedCategory={categoria}
            selectedOccasion={ocasion}
          />
        </div>
      </section>
    </main>
  );
}