import Link from "next/link";

type Product = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string | null;
  imagenAlt: string | null;
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

    return data.products;
  } catch {
    return [];
  }
}

export default async function ProductCatalog() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-[#eadfd8] bg-white p-8 text-center">
        <p className="text-[#7a6f69]">
          No fue posible cargar el catálogo en este momento.
        </p>
      </div>
    );
  }

  return (
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

            <h2 className="mt-1 text-xl font-semibold">
              {product.nombre}
            </h2>

            <p className="mt-3 font-bold">
              ${Number(product.precio).toLocaleString("es-CO")}
            </p>

            <Link
              href={`/pedido/nuevo?productId=${product.id}`}
              className="mt-5 inline-block rounded-lg bg-[#a2725e] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Comprar
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}