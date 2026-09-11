import ProductCatalogClient, {
  CatalogProduct,
} from "./ProductCatalogClient";

type ProductsResponse = {
  products: CatalogProduct[];
};

type ProductCatalogProps = {
  selectedCategory?: string;
  selectedOccasion?: string;
};

async function getProducts(): Promise<CatalogProduct[]> {
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

    return data.products;
  } catch {
    return [];
  }
}

export default async function ProductCatalog({
  selectedCategory,
  selectedOccasion,
}: ProductCatalogProps) {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-purple-100 bg-white p-10 text-center shadow-sm">
        <p className="font-semibold text-slate-600">
          No fue posible cargar el catálogo en este momento.
        </p>
      </div>
    );
  }

  return (
    <ProductCatalogClient
      products={products}
      selectedCategory={selectedCategory}
      selectedOccasion={selectedOccasion}
    />
  );
}