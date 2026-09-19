"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarHeart,
  Edit3,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Occasion = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  activo: boolean;
};

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export default function AdminOccasionsPage() {
  const router = useRouter();

  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("aurum_token");
  }, []);

  const handleUnauthorized = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("aurum_token");
    }

    router.replace("/login");
  }, [router]);

  const fetchOccasions = useCallback(async () => {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/occasions/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setError(
          "No tienes permisos de administrador para consultar las ocasiones.",
        );
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            data?.error ??
            "No fue posible cargar las ocasiones.",
        );
      }

      const receivedOccasions = Array.isArray(data)
        ? data
        : Array.isArray(data?.occasions)
          ? data.occasions
          : [];

      setOccasions(receivedOccasions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar las ocasiones.",
      );
    } finally {
      setRefreshing(false);
    }
  }, [getToken, handleUnauthorized]);

  useEffect(() => {
    const loadInitialOccasions = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("aurum_token")
          : null;

      if (!token) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("aurum_token");
        }

        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/occasions/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("aurum_token");
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          setError(
            "No tienes permisos de administrador para consultar las ocasiones.",
          );
          return;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ??
              data?.error ??
              "No fue posible cargar las ocasiones.",
          );
        }

        const receivedOccasions = Array.isArray(data)
          ? data
          : Array.isArray(data?.occasions)
            ? data.occasions
            : [];

        setOccasions(receivedOccasions);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar las ocasiones.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInitialOccasions();
  }, [router]);

  const filteredOccasions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return occasions.filter((occasion) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        occasion.nombre.toLowerCase().includes(normalizedSearch) ||
        occasion.slug.toLowerCase().includes(normalizedSearch) ||
        (occasion.descripcion ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && occasion.activo) ||
        (statusFilter === "INACTIVE" && !occasion.activo);

      return matchesSearch && matchesStatus;
    });
  }, [occasions, search, statusFilter]);

  async function handleStatusChange(occasion: Occasion) {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setChangingId(occasion.id);
      setError(null);

      const response = await fetch(
        `${API_URL}/api/occasions/${occasion.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activo: !occasion.activo,
          }),
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        setError(
          "No tienes permisos de administrador para cambiar el estado.",
        );
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ??
            data?.error ??
            "No fue posible cambiar el estado de la ocasión.",
        );
      }

      setOccasions((current) =>
        current.map((item) =>
          item.id === occasion.id
            ? {
                ...item,
                activo: !occasion.activo,
              }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cambiar el estado.",
      );
    } finally {
      setChangingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-purple-900/20 bg-purple-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-medium text-purple-200">
              Panel administrativo
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Ocasiones</h1>
            <p className="mt-1 text-sm text-purple-100/80">
              Administra las ocasiones disponibles para los productos de
              AURUM.
            </p>
          </div>

          <Link
            href="/admin/ocasiones/nueva"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-purple-950 transition hover:bg-amber-300"
          >
            <Plus className="h-4 w-4" />
            Nueva ocasión
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6">
        <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Buscar
                </span>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nombre, slug o descripción"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Estado
                </span>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="ALL">Todas</option>
                  <option value="ACTIVE">Activas</option>
                  <option value="INACTIVE">Inactivas</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={() => void fetchOccasions()}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-900 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Actualizar
            </button>
          </div>
        </section>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-5 overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Listado de ocasiones
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredOccasions.length} de {occasions.length} ocasiones
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center px-5 py-10">
              <div className="text-center">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-purple-800" />
                <p className="mt-3 text-sm text-slate-500">
                  Cargando ocasiones...
                </p>
              </div>
            </div>
          ) : filteredOccasions.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center px-5 py-10">
              <div className="max-w-md text-center">
                <CalendarHeart className="mx-auto h-9 w-9 text-purple-300" />
                <h3 className="mt-3 font-semibold text-slate-900">
                  No encontramos ocasiones
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Prueba cambiando la búsqueda o el filtro seleccionado.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ocasión
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Slug
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredOccasions.map((occasion) => (
                    <tr
                      key={occasion.id}
                      className="transition hover:bg-purple-50/40"
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-slate-900">
                          {occasion.nombre}
                        </p>

                        <p className="mt-1 max-w-xl text-sm text-slate-500">
                          {occasion.descripcion || "Sin descripción"}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {occasion.slug}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            occasion.activo
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {occasion.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/ocasiones/${occasion.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-900"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Editar
                          </Link>

                          <button
                            type="button"
                            disabled={changingId === occasion.id}
                            onClick={() =>
                              void handleStatusChange(occasion)
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              occasion.activo
                                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {changingId === occasion.id
                              ? "Guardando..."
                              : occasion.activo
                                ? "Desactivar"
                                : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}