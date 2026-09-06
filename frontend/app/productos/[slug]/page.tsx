import Link from "next/link";
import { notFound } from "next/navigation";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  orden: number;
};

type Product = {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  precioAnterior: string | null;
  stock: number;
  imagen: string;
  imagenAlt: string | null;
  tiempoEntrega: string;
  permitirPersonalizacion: boolean;
  destacado: boolean;
  category: {
    id: string;
    nombre: string;
    slug: string;
  };
  occasion: {
    id: string;
    nombre: string;
    slug: string;
  } | null;
  images: ProductImage[];
};

type ProductResponse = {
  product: Product;
};

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const apiUrl =
      process.env.API_URL ?? "http://localhost:4000";

    const response = await fetch(
      `${apiUrl}/api/products/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const data: ProductResponse = await response.json();

    return data.product;
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] px-6 py-12 text-[#2f2a27]">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/productos"
          className="text-sm font-semibold text-[#a2725e] transition hover:opacity-70"
        >
          ← Volver al catálogo
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <section>
            <div className="overflow-hidden rounded-2xl bg-[#eadfd8]">
              <img
                src={product.imagen}
                alt={product.imagenAlt ?? product.nombre}
                className="h-[500px] w-full object-cover"
              />
            </div>

            {product.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-[#eadfd8] bg-white"
                  >
                    <img
                      src={image.url}
                      alt={image.alt ?? product.nombre}
                      className="h-28 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="lg:py-4">
            <p className="text-sm font-semibold text-[#a2725e]">
              {product.category.nombre}
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {product.nombre}
            </h1>

            {product.occasion && (
              <p className="mt-3 text-sm text-[#7a6f69]">
                Ocasión: {product.occasion.nombre}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <p className="text-3xl font-bold">
                ${Number(product.precio).toLocaleString("es-CO")}
              </p>

              {product.precioAnterior && (
                <p className="text-lg text-[#9a918c] line-through">
                  $
                  {Number(product.precioAnterior).toLocaleString(
                    "es-CO",
                  )}
                </p>
              )}
            </div>

            <p className="mt-6 leading-7 text-[#625954]">
              {product.descripcion}
            </p>

            <div className="mt-8 space-y-3 rounded-xl bg-white p-5">
              <p>
                <span className="font-semibold">
                  Disponibilidad:
                </span>{" "}
                {product.stock > 0
                  ? `${product.stock} unidades`
                  : "Agotado"}
              </p>

              <p>
                <span className="font-semibold">
                  Tiempo de entrega:
                </span>{" "}
                {product.tiempoEntrega}
              </p>

              {product.permitirPersonalizacion && (
                <p className="text-[#a2725e]">
                  Este producto permite personalización.
                </p>
              )}
            </div>

            {product.stock > 0 ? (
              <Link
                href={`/pedido/nuevo?productId=${product.id}`}
                className="mt-8 inline-block rounded-lg bg-[#a2725e] px-8 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Comprar
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-8 cursor-not-allowed rounded-lg bg-[#d8cbc4] px-8 py-3 font-semibold text-white"
              >
                Producto agotado
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}