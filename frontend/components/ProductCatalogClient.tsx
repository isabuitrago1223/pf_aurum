"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Package,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import AddToCartButton from "./AddToCartButton";
import AuthRequiredModal from "./AuthRequiredModal";
import ProductCustomizationModal from "./ProductCustomizationModal";

export type CatalogProduct = {
  id: string;
  slug: string;
  nombre: string;
  descripcion?: string;
  precio: string;
  precioAnterior?: string | null;
  stock: number;
  imagen: string | null;
  imagenAlt: string | null;
  destacado?: boolean;
  tiempoEntrega: string;
  permitirPersonalizacion: boolean;
  category: {
    nombre: string;
    slug: string;
  };
  occasion?: {
    nombre: string;
    slug: string;
  } | null;
};

type ProductCatalogClientProps = {
  products: CatalogProduct[];
  selectedCategory?: string;
  selectedOccasion?: string;
};

export default function ProductCatalogClient({
  products,
  selectedCategory,
  selectedOccasion,
}: ProductCatalogClientProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<CatalogProduct | null>(null);

  const [authModalOpen, setAuthModalOpen] =
    useState(false);

  function hasActiveSession() {
    const token =
      localStorage.getItem("aurum_token");

    const user =
      localStorage.getItem("aurum_user");

    return Boolean(token && user);
  }

  function handleOpenProduct(
    product: CatalogProduct,
  ) {
    if (!hasActiveSession()) {
      setAuthModalOpen(true);
      return;
    }

    setSelectedProduct(product);
  }

  function handleAddWithoutSession() {
    setAuthModalOpen(true);
  }

  const categories = Array.from(
    new Map(
      products.map((product) => [
        product.category.slug,
        {
          nombre: product.category.nombre,
          slug: product.category.slug,
        },
      ]),
    ).values(),
  );

  const filteredProducts = products.filter(
    (product) => {
      const matchesCategory =
        !selectedCategory ||
        product.category.slug ===
          selectedCategory;

      const matchesOccasion =
        !selectedOccasion ||
        product.occasion?.slug ===
          selectedOccasion;

      return (
        matchesCategory &&
        matchesOccasion
      );
    },
  );

  function getStockStatus(stock: number) {
    if (stock <= 0) {
      return {
        label: "Agotado",
        className:
          "bg-red-50 text-red-700",
        icon: TriangleAlert,
      };
    }

    if (stock <= 5) {
      return {
        label: `Últimas ${stock} unidades`,
        className:
          "bg-amber-50 text-amber-700",
        icon: TriangleAlert,
      };
    }

    return {
      label: `Disponible · ${stock} unidades`,
      className:
        "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  return (
    <>
      <div>
        {/* FILTROS */}
        <div className="rounded-[1.5rem] border border-purple-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-serif text-lg font-black text-purple-950">
                Encuentra tu detalle ideal
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "producto encontrado"
                  : "productos encontrados"}
              </p>

              {selectedOccasion && (
                <p className="mt-1 text-xs font-semibold text-purple-700">
                  Ocasión seleccionada:{" "}
                  {products.find(
                    (product) =>
                      product.occasion?.slug ===
                      selectedOccasion,
                  )?.occasion?.nombre ??
                    selectedOccasion}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/productos"
                className={
                  !selectedCategory
                    ? "rounded-full bg-purple-900 px-4 py-2 text-xs font-bold text-white"
                    : "rounded-full border border-purple-100 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-800 transition hover:bg-purple-100"
                }
              >
                Todos
              </Link>

              {categories.map(
                (category) => {
                  const isActive =
                    selectedCategory ===
                    category.slug;

                  return (
                    <Link
                      key={
                        category.slug
                      }
                      href={`/productos?categoria=${category.slug}`}
                      className={
                        isActive
                          ? "rounded-full bg-purple-900 px-4 py-2 text-xs font-bold text-white"
                          : "rounded-full border border-purple-100 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-800 transition hover:bg-purple-100"
                      }
                    >
                      {
                        category.nombre
                      }
                    </Link>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* SIN RESULTADOS */}
        {filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-purple-100 bg-white p-10 text-center shadow-sm">
            <Package className="mx-auto h-9 w-9 text-purple-400" />

            <h2 className="mt-4 font-serif text-xl font-black text-purple-950">
              No encontramos productos
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No hay productos disponibles
              para esta categoría y ocasión.
            </p>

            <Link
              href="/productos"
              className="mt-5 inline-flex rounded-full bg-purple-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple-800"
            >
              Ver todos los productos
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(
              (product) => {
                const stockStatus =
                  getStockStatus(
                    product.stock,
                  );

                const StockIcon =
                  stockStatus.icon;

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[1.5rem] border border-purple-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* IMAGEN */}
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenProduct(
                          product,
                        )
                      }
                      className="block w-full text-left"
                    >
                      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-purple-50 via-purple-50 to-amber-50">
                        {product.imagen?.startsWith(
                          "http",
                        ) ||
                        product.imagen?.startsWith(
                          "/",
                        ) ? (
                          <img
                            src={
                              product.imagen
                            }
                            alt={
                              product.imagenAlt ??
                              product.nombre
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-900 text-2xl font-black text-amber-300 shadow-md">
                                A
                              </div>

                              <p className="mt-3 text-xs font-bold text-purple-700">
                                Aurum
                                Decoraciones
                              </p>
                            </div>
                          </div>
                        )}

                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-purple-800 shadow-sm">
                          {
                            product.category
                              .nombre
                          }
                        </span>

                        {product.destacado && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1.5 text-[10px] font-black text-purple-950 shadow-sm">
                            <Sparkles className="h-3 w-3" />
                            Destacado
                          </span>
                        )}
                      </div>
                    </button>

                    {/* CONTENIDO */}
                    <div className="p-5">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenProduct(
                            product,
                          )
                        }
                        className="block w-full text-left"
                      >
                        <h2 className="line-clamp-2 font-serif text-lg font-black leading-6 text-purple-950 transition hover:text-purple-700">
                          {product.nombre}
                        </h2>
                      </button>

                      {product.descripcion && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {
                            product.descripcion
                          }
                        </p>
                      )}

                      {/* OCASIÓN */}
                      {product.occasion && (
                        <div className="mt-3">
                          <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                            {
                              product
                                .occasion
                                .nombre
                            }
                          </span>
                        </div>
                      )}

                      {/* STOCK + ENTREGA */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${stockStatus.className}`}
                        >
                          <StockIcon className="h-3.5 w-3.5" />

                          {
                            stockStatus.label
                          }
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-700">
                          <Clock3 className="h-3.5 w-3.5" />

                          {
                            product.tiempoEntrega
                          }
                        </span>
                      </div>

                      {/* PRECIO */}
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                            Precio
                          </p>

                          <p className="mt-1 font-serif text-2xl font-black text-amber-700">
                            $
                            {Number(
                              product.precio,
                            ).toLocaleString(
                              "es-CO",
                            )}
                          </p>
                        </div>

                        {product.precioAnterior && (
                          <span className="pb-1 text-xs text-slate-400 line-through">
                            $
                            {Number(
                              product.precioAnterior,
                            ).toLocaleString(
                              "es-CO",
                            )}
                          </span>
                        )}
                      </div>

                      {/* ACCIONES */}
                      <div className="mt-5 grid gap-2">
                        <button
                          type="button"
                          disabled={
                            product.stock <= 0
                          }
                          onClick={() =>
                            handleOpenProduct(
                              product,
                            )
                          }
                          className="w-full rounded-full border border-purple-300 bg-white px-4 py-2.5 text-xs font-black text-purple-900 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          {product.stock <= 0
                            ? "Producto agotado"
                            : product.permitirPersonalizacion
                              ? "Personalizar"
                              : "Ver detalles"}
                        </button>

                        {product.stock > 0 &&
                          (hasActiveSession() ? (
                            <AddToCartButton
                              product={{
                                id: product.id,
                                nombre:
                                  product.nombre,
                                precio:
                                  product.precio,
                                imagen:
                                  product.imagen,
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={
                                handleAddWithoutSession
                              }
                              className="w-full rounded-full bg-purple-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-purple-800"
                            >
                              Agregar al
                              carrito
                            </button>
                          ))}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </div>

      <AuthRequiredModal
        open={authModalOpen}
        onClose={() =>
          setAuthModalOpen(false)
        }
      />

      <ProductCustomizationModal
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onClose={() =>
          setSelectedProduct(null)
        }
      />
    </>
  );
}