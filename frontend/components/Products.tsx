import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import FeaturedProductCard from "./FeaturedProductCard";

type Product = {
  id: string;
  slug: string;
  nombre: string;
  descripcion?: string;
  precio: string;
  precioAnterior?: string | null;
  imagen: string | null;
  imagenAlt: string | null;
  destacado: boolean;
  tiempoEntrega: string;
  permitirPersonalizacion: boolean;
  category: {
    nombre: string;
    slug: string;
  };
};

type ProductsResponse = {
  products: Product[];
};

async function getProducts(): Promise<Product[]> {
  try {
    const apiUrl =
      process.env.API_URL ??
      "http://localhost:4000";

    const response = await fetch(
      `${apiUrl}/api/products`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    const data: ProductsResponse =
      await response.json();

    return data.products
      .filter((product) => product.destacado)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export default async function Products() {
  const products = await getProducts();

  return (
    <section
      id="productos"
      className="bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Encabezado */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Los favoritos de Aurum
            </div>

            <h2 className="mt-4 font-serif text-4xl font-black tracking-tight text-purple-950 sm:text-5xl">
              Productos destacados
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Descubre algunos de nuestros detalles favoritos,
              creados para transformar cada celebración en un
              recuerdo inolvidable.
            </p>
          </div>

          <Link
            href="/productos"
            className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-purple-800 transition hover:text-purple-950"
          >
            Ver todo el catálogo

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Productos */}
        {products.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-purple-100 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
              <Sparkles className="h-7 w-7 text-purple-700" />
            </div>

            <h3 className="mt-5 font-serif text-xl font-black text-purple-950">
              Productos no disponibles
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              No fue posible cargar los productos en este momento.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Botón inferior */}
        {products.length > 0 && (
          <div className="mt-14 text-center">
            <p className="text-sm text-slate-500">
              ¿Quieres descubrir más detalles especiales?
            </p>

            <Link
              href="/productos"
              className="group mt-5 inline-flex items-center gap-2 rounded-full bg-purple-900 px-8 py-4 text-sm font-black text-white shadow-md transition hover:bg-purple-800"
            >
              Explorar todos los productos

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}