"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

type Category = {
  id: string;
  nombre: string;
  slug: string;
};

type Occasion = {
  id: string;
  nombre: string;
  slug: string;
};

type AdminProduct = {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number | string;
  precioAnterior: number | string | null;
  costo: number | string | null;
  stock: number;
  stockMinimo: number;
  imagen: string;
  imagenAlt: string | null;
  tiempoEntrega: string;
  pesoGramos: number | null;
  permitirPersonalizacion: boolean;
  opcionesPersonalizacion: unknown;
  destacado: boolean;
  activo: boolean;
  categoryId: string;
  occasionId: string | null;
  category: Category;
  occasion: Occasion | null;
  createdAt: string;
  updatedAt: string;
};

type ProductsResponse = {
  products: AdminProduct[];
};

type StatusResponse = {
  message?: string;
  product?: AdminProduct;
};

function formatMoney(value: number | string | null) {
  if (value === null) {
    return "Sin precio";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "TODOS" | "ACTIVOS" | "INACTIVOS"
  >("TODOS");
  const [stockFilter, setStockFilter] = useState<
    "TODOS" | "DISPONIBLE" | "BAJO" | "AGOTADO"
  >("TODOS");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const loadProducts = useCallback(
    async (refresh = false) => {
      const token = window.localStorage.getItem("aurum_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(`${apiUrl}/api/products/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          window.localStorage.removeItem("aurum_token");
          router.replace("/login");
          return;
        }

        const data = (await response.json()) as
          | ProductsResponse
          | { message?: string };

        if (!response.ok) {
          throw new Error(
            "message" in data && data.message
              ? data.message
              : "No fue posible cargar los productos.",
          );
        }

        setProducts(
          "products" in data && Array.isArray(data.products)
            ? data.products
            : [],
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar los productos.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiUrl, router],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialProducts() {
      const token = window.localStorage.getItem("aurum_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/products/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          window.localStorage.removeItem("aurum_token");
          router.replace("/login");
          return;
        }

        const data = (await response.json()) as
          | ProductsResponse
          | { message?: string };

        if (!response.ok) {
          throw new Error(
            "message" in data && data.message
              ? data.message
              : "No fue posible cargar los productos.",
          );
        }

        if (!cancelled) {
          setProducts(
            "products" in data && Array.isArray(data.products)
              ? data.products
              : [],
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No fue posible cargar los productos.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialProducts();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, router]);

  async function handleStatusChange(product: AdminProduct) {
    const token = window.localStorage.getItem("aurum_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const nextStatus = !product.activo;

    setUpdatingId(product.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${apiUrl}/api/products/${product.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activo: nextStatus,
          }),
        },
      );

      if (response.status === 401 || response.status === 403) {
        window.localStorage.removeItem("aurum_token");
        router.replace("/login");
        return;
      }

      const data = (await response.json()) as StatusResponse;

      if (!response.ok) {
        throw new Error(
          data.message ?? "No fue posible actualizar el producto.",
        );
      }

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.id === product.id
            ? {
                ...currentProduct,
                ...(data.product ?? {}),
                activo: data.product?.activo ?? nextStatus,
              }
            : currentProduct,
        ),
      );

      setSuccess(
        nextStatus
          ? `"${product.nombre}" fue activado correctamente.`
          : `"${product.nombre}" fue desactivado correctamente.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible actualizar el producto.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.nombre.toLowerCase().includes(normalizedSearch) ||
        product.sku.toLowerCase().includes(normalizedSearch) ||
        product.slug.toLowerCase().includes(normalizedSearch) ||
        product.category.nombre.toLowerCase().includes(normalizedSearch) ||
        product.occasion?.nombre
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "TODOS" ||
        (statusFilter === "ACTIVOS" && product.activo) ||
        (statusFilter === "INACTIVOS" && !product.activo);

      const matchesStock =
        stockFilter === "TODOS" ||
        (stockFilter === "AGOTADO" && product.stock === 0) ||
        (stockFilter === "BAJO" &&
          product.stock > 0 &&
          product.stock <= product.stockMinimo) ||
        (stockFilter === "DISPONIBLE" &&
          product.stock > product.stockMinimo);

      return matchesSearch && matchesStatus && matchesStock;
    });
  }, [products, search, statusFilter, stockFilter]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-800" />
          <p className="mt-3 text-sm font-bold text-purple-950">
            Cargando productos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-purple-900/20 bg-purple-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                <Package className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-black">
                  Administración de productos
                </h1>
                <p className="mt-1 text-sm text-purple-200">
                  Gestiona catálogo, inventario, precios y disponibilidad.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={refreshing}
                onClick={() => void loadProducts(true)}
                className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                {refreshing ? "Actualizando..." : "Actualizar"}
              </button>

              <Link
                href="/admin/productos/nuevo"
                className="flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-black text-purple-950 transition hover:bg-amber-200"
              >
                <Plus className="h-4 w-4" />
                Nuevo producto
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        <div className="mb-5">
          <h2 className="text-xl font-black text-purple-950">
            Productos
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {products.length}{" "}
            {products.length === 1
              ? "producto registrado"
              : "productos registrados"}
          </p>
        </div>

        <section className="mb-6 grid gap-4 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm lg:grid-cols-3">
          <div>
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-black text-purple-950"
            >
              Buscar producto
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre, SKU, categoría u ocasión"
                className="w-full rounded-xl border border-purple-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="product-status"
              className="mb-2 block text-sm font-black text-purple-950"
            >
              Estado
            </label>

            <select
              id="product-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "TODOS"
                    | "ACTIVOS"
                    | "INACTIVOS",
                )
              }
              className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              <option value="TODOS">Todos</option>
              <option value="ACTIVOS">Activos</option>
              <option value="INACTIVOS">Inactivos</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="product-stock"
              className="mb-2 block text-sm font-black text-purple-950"
            >
              Inventario
            </label>

            <select
              id="product-stock"
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(
                  event.target.value as
                    | "TODOS"
                    | "DISPONIBLE"
                    | "BAJO"
                    | "AGOTADO",
                )
              }
              className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              <option value="TODOS">Todo el inventario</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="BAJO">Stock bajo</option>
              <option value="AGOTADO">Agotado</option>
            </select>
          </div>
        </section>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-10 text-center shadow-sm">
            <Package className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-black text-purple-950">
              {products.length === 0
                ? "No hay productos registrados"
                : "No hay productos que coincidan con los filtros"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProducts.map((product) => {
              const stockLow =
                product.stock > 0 &&
                product.stock <= product.stockMinimo;
              const outOfStock = product.stock === 0;
              const updating = updatingId === product.id;

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                    <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imagen}
                        alt={product.imagenAlt ?? product.nombre}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-purple-950">
                              {product.nombre}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                                product.activo
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {product.activo ? "Activo" : "Inactivo"}
                            </span>

                            {product.destacado && (
                              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800">
                                Destacado
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            SKU: {product.sku}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                            <span>
                              <strong className="text-purple-950">
                                Categoría:
                              </strong>{" "}
                              {product.category.nombre}
                            </span>

                            <span>
                              <strong className="text-purple-950">
                                Ocasión:
                              </strong>{" "}
                              {product.occasion?.nombre ?? "Sin ocasión"}
                            </span>
                          </div>
                        </div>

                        <div className="text-left lg:text-right">
                          <p className="text-lg font-black text-purple-950">
                            {formatMoney(product.precio)}
                          </p>

                          {product.precioAnterior !== null && (
                            <p className="text-xs text-slate-400 line-through">
                              {formatMoney(product.precioAnterior)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            Stock actual
                          </p>
                          <p
                            className={`mt-1 text-base font-black ${
                              outOfStock
                                ? "text-red-700"
                                : stockLow
                                  ? "text-amber-700"
                                  : "text-emerald-700"
                            }`}
                          >
                            {product.stock}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            Stock mínimo
                          </p>
                          <p className="mt-1 text-base font-black text-purple-950">
                            {product.stockMinimo}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-bold text-slate-500">
                            Entrega
                          </p>
                          <p className="mt-1 text-sm font-black text-purple-950">
                            {product.tiempoEntrega}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-black text-purple-950 transition hover:bg-purple-50"
                        >
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </Link>

                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => void handleStatusChange(product)}
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            product.activo
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {updating && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          {updating
                            ? "Actualizando..."
                            : product.activo
                              ? "Desactivar"
                              : "Activar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}