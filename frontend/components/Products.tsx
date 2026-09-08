import Link from "next/link";

type Product = {
  id: string;
  slug: string;
  nombre: string;
  precio: string;
  precioAnterior?: string | null;
  imagen: string | null;
  imagenAlt: string | null;
  destacado: boolean;
  category: {
    nombre: string;
  };
};

type ProductsResponse = {
  products: Product[];
};

async function getProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";

    const response = await fetch(`${apiUrl}/api/products`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data: ProductsResponse = await response.json();

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
    <section id="productos" className="bg-[#faf7fb] py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#a67c2d]">
              Los favoritos de Aurum
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#351641] sm:text-4xl">
              Productos destacados
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-[#746879]">
              Detalles especiales seleccionados para sorprender en cada
              ocasión.
            </p>
          </div>

          <Link
            href="/productos"
            className="inline-flex w-fit rounded-full border border-[#5d2875] px-6 py-3 text-sm font-bold text-[#5d2875] transition hover:bg-[#5d2875] hover:text-white"
          >
            Ver todo el catálogo
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="mt-12 rounded-[1.75rem] border border-[#e7ddec] bg-white p-10 text-center">
            <p className="text-[#746879]">
              No fue posible cargar los productos en este momento.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[1.75rem] border border-[#e7ddec] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={`/productos/${product.slug}`} className="block">
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-[#f4edf7] to-[#eee4f2]">
                    {product.imagen?.startsWith("http") ? (
                      <img
                        src={product.imagen}
                        alt={product.imagenAlt ?? product.nombre}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-8 text-center">
                        <div>
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#4b1f63] text-3xl font-bold text-[#e0b84f] shadow-lg">
                            A
                          </div>

                          <p className="mt-4 text-sm font-semibold text-[#6c5874]">
                            Imagen del producto
                          </p>
                        </div>
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#5d2875] shadow-sm">
                      {product.category.nombre}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="min-h-[56px] text-xl font-bold leading-7 text-[#351641] transition group-hover:text-[#6b2a83]">
                      {product.nombre}
                    </h3>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#918397]">
                          Precio
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[#9a6a13]">
                          $
                          {Number(product.precio).toLocaleString("es-CO")}
                        </p>
                      </div>

                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2e9f5] text-lg font-bold text-[#5d2875] transition group-hover:bg-[#5d2875] group-hover:text-white">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}