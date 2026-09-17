"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

type ClientStatus =
  | "ACTIVO"
  | "SUSPENDIDO"
  | "PENDIENTE_VERIFICACION";

type Client = {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  direccion: string | null;
  barrio: string | null;
  ciudad: string | null;
  departamento: string | null;
  fechaNacimiento: string | null;
  email: string;
  authProvider: string;
  role: string;
  estado: ClientStatus;
  emailVerifiedAt: string | null;
  acceptedTermsAt: string | null;
  acceptedPrivacyAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ClientsResponse = {
  clients: Client[];
};

type StatusResponse = {
  message: string;
  client: Client;
};

function statusLabel(status: ClientStatus) {
  switch (status) {
    case "ACTIVO":
      return "Activo";
    case "SUSPENDIDO":
      return "Suspendido";
    case "PENDIENTE_VERIFICACION":
      return "Pendiente de verificación";
  }
}

function statusClasses(status: ClientStatus) {
  switch (status) {
    case "ACTIVO":
      return "bg-emerald-100 text-emerald-800";
    case "SUSPENDIDO":
      return "bg-red-100 text-red-700";
    case "PENDIENTE_VERIFICACION":
      return "bg-amber-100 text-amber-800";
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(date);
}

export default function AdminClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ClientStatus | ""
  >("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getSession() {
    const token = localStorage.getItem("aurum_token");
    const storedUser = localStorage.getItem("aurum_user");

    if (!token || !storedUser) {
      router.replace("/login");
      return null;
    }

    try {
      const currentUser = JSON.parse(storedUser) as {
        role?: string;
      };

      if (currentUser.role !== "ADMIN") {
        router.replace("/");
        return null;
      }
    } catch {
      localStorage.removeItem("aurum_token");
      localStorage.removeItem("aurum_user");
      router.replace("/login");
      return null;
    }

    return token;
  }

  async function loadClients(
    buscar = search,
    estado = statusFilter,
    initial = false,
  ) {
    const token = getSession();

    if (!token) {
      return;
    }

    if (initial) {
      setLoading(true);
    } else {
      setSearching(true);
    }

    setError("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const params = new URLSearchParams();

      if (buscar.trim()) {
        params.set("buscar", buscar.trim());
      }

      if (estado) {
        params.set("estado", estado);
      }

      const query = params.toString();

      const response = await fetch(
        `${apiUrl}/api/clients${query ? `?${query}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "Tu cuenta no tiene permisos para administrar clientes.",
        );
        return;
      }

      const data = (await response.json()) as
        | ClientsResponse
        | { message?: string };

      if (!response.ok) {
        setError(
          "message" in data && data.message
            ? data.message
            : "No fue posible cargar los clientes.",
        );
        return;
      }

      setClients((data as ClientsResponse).clients);
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadClients("", "", true);
  }, 0);

  return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    void loadClients();
  }

  async function handleStatusChange(
    client: Client,
    estado: ClientStatus,
  ) {
    if (client.estado === estado) {
      return;
    }

    const token = getSession();

    if (!token) {
      return;
    }

    setUpdatingId(client.id);
    setError("");
    setSuccess("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/clients/${client.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estado,
          }),
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      const data = (await response.json()) as
        | StatusResponse
        | { message?: string };

      if (response.status === 403) {
        setError(
          "Tu cuenta no tiene permisos para modificar clientes.",
        );
        return;
      }

      if (!response.ok) {
        setError(
          "message" in data && data.message
            ? data.message
            : "No fue posible actualizar el estado del cliente.",
        );
        return;
      }

      const updated = data as StatusResponse;

      setClients((current) =>
        current.map((item) =>
          item.id === updated.client.id
            ? updated.client
            : item,
        ),
      );

      setSuccess(updated.message);
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-800" />
          <p className="mt-3 text-sm font-bold text-purple-950">
            Cargando clientes...
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

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-black">
                Administración de clientes
              </h1>
              <p className="mt-1 text-sm text-purple-200">
                Consulta y gestiona las cuentas de clientes de AURUM.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        <form
          onSubmit={handleSearch}
          className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-[1fr_260px_auto]">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                Buscar cliente
              </span>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Nombre, apellido, email o cédula"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                Estado
              </span>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as ClientStatus | "",
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">Todos</option>
                <option value="ACTIVO">Activo</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="PENDIENTE_VERIFICACION">
                  Pendiente de verificación
                </option>
              </select>
            </label>

            <button
              type="submit"
              disabled={searching}
              className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-purple-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-purple-950">
              Clientes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {clients.length}{" "}
              {clients.length === 1
                ? "cliente encontrado"
                : "clientes encontrados"}
            </p>
          </div>
        </div>

        {clients.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-purple-100 bg-white p-10 text-center shadow-sm">
            <UserRound className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-black text-purple-950">
              No encontramos clientes
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Prueba con otros criterios de búsqueda.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {clients.map((client) => (
              <article
                key={client.id}
                className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-purple-950">
                        {client.nombre} {client.apellido}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClasses(
                          client.estado,
                        )}`}
                      >
                        {statusLabel(client.estado)}
                      </span>
                    </div>

                    <p className="mt-1 break-all text-sm text-slate-600">
                      {client.email}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span>
                        Cédula: {client.cedula || "Sin registrar"}
                      </span>
                      <span>
                        Teléfono:{" "}
                        {client.telefono || "Sin registrar"}
                      </span>
                      <span>
                        Registro: {formatDate(client.createdAt)}
                      </span>
                      <span>
                        Último ingreso:{" "}
                        {formatDate(client.lastLoginAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label>
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                        Estado de cuenta
                      </span>

                      <select
                        value={client.estado}
                        disabled={updatingId === client.id}
                        onChange={(event) =>
                          void handleStatusChange(
                            client,
                            event.target.value as ClientStatus,
                          )
                        }
                        className="w-full min-w-56 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="ACTIVO">Activo</option>
                        <option value="SUSPENDIDO">
                          Suspendido
                        </option>
                        <option value="PENDIENTE_VERIFICACION">
                          Pendiente de verificación
                        </option>
                      </select>
                    </label>

                    <Link
                      href={`/admin/clientes/${client.id}`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-black text-purple-800 transition hover:bg-purple-50"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalle
                    </Link>
                  </div>
                </div>

                {updatingId === client.id && (
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-purple-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Actualizando estado...
                  </div>
                )}

                {client.emailVerifiedAt && (
                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    Correo electrónico verificado
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}