import Link from "next/link";

import {
  ArrowLeft,
  Gift,
  Search,
  Sparkles,
} from "lucide-react";

import CatalogCartDrawer from "../../components/CartDrawer";
import ProductCatalog from "../../components/ProductCatalog";

type ProductsPageProps = {
  searchParams: Promise<{
    categoria?: string;
    ocasion?: string;
    buscar?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const categoria =
    params.categoria;

  const ocasion =
    params.ocasion;

  const buscar =
    params.buscar;

  return (
    <main className="min-h-screen bg-[#fff9fc] text-slate-900">
      {/* HERO */}
      <section className="px-5 pb-5 pt-7 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-800 transition hover:text-purple-950"
          >
            <ArrowLeft className="h-4 w-4" />

            Volver al inicio
          </Link>

          <div className="relative mt-5 overflow-hidden rounded-[2.2rem] border border-purple-100 bg-gradient-to-br from-white via-purple-50/80 to-fuchsia-100/60 px-6 py-8 shadow-sm sm:px-9 sm:py-10 lg:px-11">
            {/* DECORACIÓN */}
            <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-purple-300/40 blur-3xl" />

            <div className="pointer-events-none absolute bottom-[-120px] left-[40%] h-72 w-72 rounded-full bg-fuchsia-200/40 blur-3xl" />

            <div className="pointer-events-none absolute right-[22%] top-10 h-40 w-40 rounded-full bg-purple-200/50 blur-2xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-4xl">
                {/* ETIQUETA */}
                <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4 text-amber-500" />

                  <span className="text-xs font-black uppercase tracking-[0.18em] text-purple-800">
                    Aurum Decoraciones
                  </span>
                </div>

                {/* TÍTULO */}
                <h1 className="mt-5 font-serif text-4xl font-black tracking-tight text-purple-950 sm:text-5xl lg:text-6xl">
                  Catálogo de productos
                </h1>

                {/* TEXTO */}
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Encuentra detalles
                  especiales para
                  cumpleaños, aniversarios,
                  amor y amistad y todos
                  esos momentos que merecen
                  convertirse en un recuerdo
                  inolvidable.
                </p>

                {/* BUSCADOR + CARRITO */}
                <div className="mt-7 flex items-stretch gap-3">
                  <form
                    action="/productos"
                    method="GET"
                    className="relative flex-1"
                  >
                    {categoria && (
                      <input
                        type="hidden"
                        name="categoria"
                        value={categoria}
                      />
                    )}

                    {ocasion && (
                      <input
                        type="hidden"
                        name="ocasion"
                        value={ocasion}
                      />
                    )}

                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                    <input
                      type="search"
                      name="buscar"
                      defaultValue={
                        buscar ?? ""
                      }
                      placeholder="Buscar ramos, desayunos, regalos..."
                      className="h-14 w-full rounded-2xl border-2 border-purple-300 bg-white/95 pl-14 pr-5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
                    />
                  </form>

                  {/* CARRITO REAL */}
                  <CatalogCartDrawer />
                </div>

                {/* BÚSQUEDA ACTUAL */}
                {buscar && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-slate-500">
                      Resultados para:
                    </span>

                    <span className="font-black text-purple-800">
                      &quot;
                      {buscar}
                      &quot;
                    </span>

                    <Link
                      href="/productos"
                      className="ml-1 font-bold text-purple-700 underline underline-offset-4 hover:text-purple-950"
                    >
                      Limpiar
                    </Link>
                  </div>
                )}
              </div>

              {/* ICONO */}
              <div className="hidden lg:flex lg:items-center lg:justify-center">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-[2.2rem] bg-gradient-to-br from-purple-950 via-purple-800 to-fuchsia-600 shadow-xl shadow-purple-200/70">
                  <Gift className="h-14 w-14 text-amber-300" />

                  <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-amber-300 shadow">
                    <Sparkles className="h-4 w-4 text-purple-950" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section className="px-5 pb-16 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProductCatalog
            selectedCategory={
              categoria
            }
            selectedOccasion={
              ocasion
            }
            searchQuery={buscar}
          />
        </div>
      </section>
    </main>
  );
}