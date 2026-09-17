"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  PackageOpen,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type ClientStatus =
  | "ACTIVO"
  | "SUSPENDIDO"
  | "PENDIENTE_VERIFICACION";

type ClientOrder = {
  id: string;
  numeroPedido: string;
  estado: string;
  metodoEntrega: string;
  subtotal: number | string;
  costoEnvio: number | string;
  descuento: number | string;
  total: number | string;
  createdAt: string;
  updatedAt: string;
};

type ClientDetail = {
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
  orders: ClientOrder[];
};

type ClientResponse = {
  client: ClientDetail;
};

function formatMoney(value: number | string) {
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
    timeStyle: "short",
  }).format(date);
}

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

function orderStatusLabel(status: string) {
  switch (status) {
    case "PENDIENTE":
      return "Pendiente";
    case "EN_PREPARACION":
      return "En preparación";
    case "EN_CAMINO":
      return "En camino";
    case "ENTREGADO":
      return "Entregado";
    case "CANCELADO":
      return "Cancelado";
    default:
      return status;
  }
}

function orderStatusClasses(status: string) {
  switch (status) {
    case "PENDIENTE":
      return "bg-amber-100 text-amber-800";
    case "EN_PREPARACION":
      return "bg-purple-100 text-purple-800";
    case "EN_CAMINO":
      return "bg-blue-100 text-blue-800";
    case "ENTREGADO":
      return "bg-emerald-100 text-emerald-800";
    case "CANCELADO":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function AdminClientDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const clientId = params.id;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClient() {
      const token = localStorage.getItem("aurum_token");
      const storedUser = localStorage.getItem("aurum_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = JSON.parse(storedUser) as {
          role?: string;
        };

        if (currentUser.role !== "ADMIN") {
          router.replace("/");
          return;
        }
      } catch {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ??
          "http://localhost:4000";

        const response = await fetch(
          `${apiUrl}/api/clients/${clientId}`,
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
            "Tu cuenta no tiene permisos para consultar este cliente.",
          );
          return;
        }

        const data = (await response.json()) as
          | ClientResponse
          | { message?: string };

        if (!response.ok) {
          setError(
            "message" in data && data.message
              ? data.message
              : "No fue posible cargar el cliente.",
          );
          return;
        }

        setClient((data as ClientResponse).client);
      } catch {
        setError("No fue posible conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    }

    void loadClient();
  }, [clientId, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-800" />
          <p className="mt-3 text-sm font-bold text-purple-950">
            Cargando cliente...
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
            href="/admin/clientes"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a clientes
          </Link>

          <h1 className="mt-4 text-2xl font-black">
            Detalle del cliente
          </h1>

          <p className="mt-1 text-sm text-purple-200">
            Información de cuenta e historial de pedidos.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {client && (
          <>
            <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-800">
                    <UserRound className="h-7 w-7" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black text-purple-950">
                        {client.nombre} {client.apellido}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClasses(
                          client.estado,
                        )}`}
                      >
                        {statusLabel(client.estado)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Cliente AURUM
                    </p>
                  </div>
                </div>

                <div className="text-sm text-slate-500 md:text-right">
                  <p>
                    Registrado: {formatDate(client.createdAt)}
                  </p>
                  <p className="mt-1">
                    Último ingreso: {formatDate(client.lastLoginAt)}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase text-slate-400">
                      Correo
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                      {client.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">
                      Teléfono
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {client.telefono || "Sin registrar"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">
                      Cédula
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {client.cedula || "Sin registrar"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">
                      Dirección
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {client.direccion || "Sin registrar"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {[
                        client.barrio,
                        client.ciudad,
                        client.departamento,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Ubicación sin registrar"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">
                      Fecha de nacimiento
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDate(client.fechaNacimiento)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">
                      Proveedor de acceso
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {client.authProvider}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400">
                  Correo verificado
                </p>
                <p className="mt-2 text-sm font-bold text-purple-950">
                  {client.emailVerifiedAt
                    ? formatDate(client.emailVerifiedAt)
                    : "Pendiente"}
                </p>
              </article>

              <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400">
                  Términos aceptados
                </p>
                <p className="mt-2 text-sm font-bold text-purple-950">
                  {formatDate(client.acceptedTermsAt)}
                </p>
              </article>

              <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase text-slate-400">
                  Privacidad aceptada
                </p>
                <p className="mt-2 text-sm font-bold text-purple-950">
                  {formatDate(client.acceptedPrivacyAt)}
                </p>
              </article>
            </section>

            <section className="mt-8">
              <div>
                <h2 className="text-xl font-black text-purple-950">
                  Historial de pedidos
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {client.orders.length}{" "}
                  {client.orders.length === 1
                    ? "pedido registrado"
                    : "pedidos registrados"}
                </p>
              </div>

              {client.orders.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-purple-100 bg-white p-10 text-center shadow-sm">
                  <PackageOpen className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-black text-purple-950">
                    Este cliente aún no tiene pedidos
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid gap-4">
                  {client.orders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-purple-950">
                              {order.numeroPedido}
                            </p>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black ${orderStatusClasses(
                                order.estado,
                              )}`}
                            >
                              {orderStatusLabel(order.estado)}
                            </span>
                          </div>

                          <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-lg font-black text-purple-950">
                            {formatMoney(order.total)}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {order.metodoEntrega === "DOMICILIO"
                              ? "Domicilio"
                              : order.metodoEntrega === "TIENDA"
                                ? "Recogida en tienda"
                                : order.metodoEntrega}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:grid-cols-3">
                        <span>
                          Subtotal:{" "}
                          <strong className="text-slate-700">
                            {formatMoney(order.subtotal)}
                          </strong>
                        </span>

                        <span>
                          Envío:{" "}
                          <strong className="text-slate-700">
                            {formatMoney(order.costoEnvio)}
                          </strong>
                        </span>

                        <span>
                          Descuento:{" "}
                          <strong className="text-slate-700">
                            {formatMoney(order.descuento)}
                          </strong>
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}