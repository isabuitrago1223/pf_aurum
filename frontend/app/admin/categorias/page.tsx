"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FolderOpen,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

type AdminCategory = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
  orden: number;
  createdAt?: string;
  updatedAt?: string;
};

type CategoriesResponse = {
  categories: AdminCategory[];
};

type StatusResponse = {
  message?: string;
  category?: AdminCategory;
};

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "TODAS" | "ACTIVAS" | "INACTIVAS"
  >("TODAS");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const loadCategories = useCallback(
    async (refresh = false) => {
      const token = window.localStorage.getItem("aurum_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      if (refresh) {
        setRefreshing(true);
      }

      setError("");

      try {
        const response = await fetch(`${apiUrl}/api/categories/admin`, {
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
          | CategoriesResponse
          | { message?: string };

        if (!response.ok) {
          throw new Error(
            "message" in data && data.message
              ? data.message
              : "No fue posible cargar las categorías.",
          );
        }

        setCategories(
          "categories" in data && Array.isArray(data.categories)
            ? data.categories
            : [],
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar las categorías.",
        );
      } finally {
        setRefreshing(false);
      }
    },
    [apiUrl, router],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCategories() {
      const token = window.localStorage.getItem("aurum_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/categories/admin`, {
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
          | CategoriesResponse
          | { message?: string };

        if (!response.ok) {
          throw new Error(
            "message" in data && data.message
              ? data.message
              : "No fue posible cargar las categorías.",
          );
        }

        if (!cancelled) {
          setCategories(
            "categories" in data && Array.isArray(data.categories)
              ? data.categories
              : [],
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "No fue posible cargar las categorías.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialCategories();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, router]);

  async function handleStatusChange(category: AdminCategory) {
    const token = window.localStorage.getItem("aurum_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const nextStatus = !category.activo;

    setUpdatingId(category.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${apiUrl}/api/categories/${category.id}/status`,
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
          data.message ?? "No fue posible actualizar la categoría.",
        );
      }

      setCategories((currentCategories) =>
        currentCategories.map((currentCategory) =>
          currentCategory.id === category.id
            ? {
                ...currentCategory,
                ...(data.category ?? {}),
                activo: data.category?.activo ?? nextStatus,
              }
            : currentCategory,
        ),
      );

      setSuccess(
        data.message ??
          (nextStatus
            ? `"${category.nombre}" fue activada correctamente.`
            : `"${category.nombre}" fue desactivada correctamente.`),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible actualizar la categoría.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !normalizedSearch ||
        category.nombre.toLowerCase().includes(normalizedSearch) ||
        category.slug.toLowerCase().includes(normalizedSearch) ||
        category.descripcion.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "TODAS" ||
        (statusFilter === "ACTIVAS" && category.activo) ||
        (statusFilter === "INACTIVAS" && !category.activo);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-800" />
          <p className="mt-3 text-sm font-bold text-purple-950">
            Cargando categorías...
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
                <FolderOpen className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-black">
                  Administración de categorías
                </h1>
                <p className="mt-1 text-sm text-purple-200">
                  Organiza las categorías visibles en el catálogo de AURUM.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={refreshing}
                onClick={() => void loadCategories(true)}
                className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Actualizando..." : "Actualizar"}
              </button>

              <Link
                href="/admin/categorias/nueva"
                className="flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-black text-purple-950 transition hover:bg-amber-200"
              >
                <Plus className="h-4 w-4" />
                Nueva categoría
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
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
          <h2 className="text-xl font-black text-purple-950">Categorías</h2>
          <p className="mt-1 text-sm text-slate-500">
            {categories.length}{" "}
            {categories.length === 1
              ? "categoría registrada"
              : "categorías registradas"}
          </p>
        </div>

        <section className="mb-6 grid gap-4 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm md:grid-cols-2">
          <div>
            <label
              htmlFor="category-search"
              className="mb-2 block text-sm font-black text-purple-950"
            >
              Buscar categoría
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="category-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre, slug o descripción"
                className="w-full rounded-xl border border-purple-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="category-status"
              className="mb-2 block text-sm font-black text-purple-950"
            >
              Estado
            </label>

            <select
              id="category-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "TODAS" | "ACTIVAS" | "INACTIVAS",
                )
              }
              className="w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              <option value="TODAS">Todas</option>
              <option value="ACTIVAS">Activas</option>
              <option value="INACTIVAS">Inactivas</option>
            </select>
          </div>
        </section>

        {filteredCategories.length === 0 ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-10 text-center shadow-sm">
            <FolderOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-black text-purple-950">
              {categories.length === 0
                ? "No hay categorías registradas"
                : "No hay categorías que coincidan con los filtros"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => {
              const updating = updatingId === category.id;

              return (
                <article
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm"
                >
                  <div className="aspect-[16/8] w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.imagen}
                      alt={category.nombre}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black text-purple-950">
                          {category.nombre}
                        </h3>
                        <p className="mt-1 break-all text-xs font-semibold text-slate-500">
                          /{category.slug}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${
                          category.activo
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {category.activo ? "Activa" : "Inactiva"}
                      </span>
                    </div>

                    <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-600">
                      {category.descripcion}
                    </p>

                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                      <p className="text-xs font-bold text-slate-500">
                        Orden en catálogo
                      </p>
                      <p className="mt-1 text-base font-black text-purple-950">
                        {category.orden}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={`/admin/categorias/${category.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-black text-purple-950 transition hover:bg-purple-50"
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Link>

                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => void handleStatusChange(category)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          category.activo
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {updating && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {updating
                          ? "Actualizando..."
                          : category.activo
                            ? "Desactivar"
                            : "Activar"}
                      </button>
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
