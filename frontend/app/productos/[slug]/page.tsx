import { notFound } from "next/navigation";

import ProductDetailView from "../../../components/ProductDetailView";

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

async function getProduct(
  slug: string,
): Promise<Product | null> {
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

    const data: ProductResponse =
      await response.json();

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

  return <ProductDetailView product={product} />;
}