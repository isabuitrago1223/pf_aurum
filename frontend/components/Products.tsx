type Product = {
  id: string;
  nombre: string;
  precio: string;
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
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Products() {
  const products = await getProducts();

  return (
    <section id="productos" className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold">
          Productos destacados
        </h2>

        {products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#eadfd8] bg-white p-8 text-center">
            <p className="text-[#7a6f69]">
              No fue posible cargar los productos en este momento.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-[#eadfd8] bg-white"
              >
                <div className="h-56 overflow-hidden bg-[#eadfd8]">
                  {product.imagen && (
                    <img
                      src={product.imagen}
                      alt={product.imagenAlt ?? product.nombre}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="p-6">
                  <p className="text-sm text-[#a2725e]">
                    {product.category.nombre}
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {product.nombre}
                  </h3>

                  <p className="mt-3 font-bold">
                    ${Number(product.precio).toLocaleString("es-CO")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}