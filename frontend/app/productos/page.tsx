import Link from "next/link";
import ProductCatalog from "../../components/ProductCatalog";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7] px-6 py-16 text-[#2f2a27]">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-block text-sm font-semibold text-[#a2725e] transition hover:opacity-70"
        >
          ← Volver al inicio
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          Catálogo de productos
        </h1>

        <p className="mt-4 max-w-2xl text-[#7a6f69]">
          Explora los detalles disponibles en Aurum Decoraciones y encuentra
          una opción especial para cada ocasión.
        </p>

        <ProductCatalog />
      </div>
    </main>
  );
}