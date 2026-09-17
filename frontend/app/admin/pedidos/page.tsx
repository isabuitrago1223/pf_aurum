"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";

type OrderStatus =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  nombreProducto: string;
  imagenProducto: string | null;
  cantidad: number;
  precioUnitario: number | string;
  descuentoUnitario: number | string;
  personalizacion: unknown;
  createdAt: string;
};

type AdminOrder = {
  id: string;
  numeroPedido: string;
  userId: string;
  estado: OrderStatus;
  metodoEntrega: string;
  nombreContacto: string;
  cedulaContacto: string | null;
  emailContacto: string;
  telefonoContacto: string;
  direccionEntrega: string | null;
  barrioEntrega: string | null;
  ciudadEntrega: string | null;
  departamentoEntrega: string | null;
  notasEntrega: string | null;
  direccionRecogida: string | null;
  fechaRecogida: string | null;
  horaRecogida: string | null;
  costoEnvio: number | string;
  subtotal: number | string;
  descuento: number | string;
  total: number | string;
  fechaEstimadaEntrega: string | null;
  enlaceRastreo: string | null;
  motivoCancelacion: string | null;
  canceladoAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
};

type OrdersResponse = {
  orders: AdminOrder[];
};

type UpdateResponse = {
  message: string;
  order: AdminOrder;
};

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["EN_CAMINO", "CANCELADO"],
  EN_CAMINO: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
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

function statusLabel(status: OrderStatus) {
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
  }
}

function statusClasses(status: OrderStatus) {
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
  }
}

function personalizationText(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Personalización registrada";
  }
}

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(
    null,
  );
  const [cancelOrderId, setCancelOrderId] = useState<
    string | null
  >(null);
  const [cancelReason, setCancelReason] = useState("");

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

  async function loadOrders(isRefresh = false) {
    const token = getSession();

    if (!token) {
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/orders/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "Tu cuenta no tiene permisos para administrar pedidos.",
        );
        return;
      }

      const data = (await response.json()) as
        | OrdersResponse
        | { message?: string };

      if (!response.ok) {
        setError(
          "message" in data && data.message
            ? data.message
            : "No fue posible cargar los pedidos.",
        );
        return;
      }

      setOrders((data as OrdersResponse).orders);
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadOrders();
  }, 0);

  return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  async function updateStatus(
    order: AdminOrder,
    estado: OrderStatus,
    motivoCancelacion?: string,
  ) {
    const token = getSession();

    if (!token) {
      return;
    }

    setUpdatingId(order.id);
    setError("");
    setSuccess("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const body: {
        estado: OrderStatus;
        motivoCancelacion?: string;
      } = {
        estado,
      };

      if (estado === "CANCELADO" && motivoCancelacion) {
        body.motivoCancelacion = motivoCancelacion;
      }

      const response = await fetch(
        `${apiUrl}/api/orders/admin/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      const data = (await response.json()) as
        | UpdateResponse
        | { message?: string };

      if (response.status === 403) {
        setError(
          "Tu cuenta no tiene permisos para modificar pedidos.",
        );
        return;
      }

      if (!response.ok) {
        setError(
          "message" in data && data.message
            ? data.message
            : "No fue posible actualizar el pedido.",
        );
        return;
      }

      const updated = data as UpdateResponse;

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id
            ? {
                ...item,
                ...updated.order,
                user: item.user,
              }
            : item,
        ),
      );

      setSuccess(updated.message);
      setCancelOrderId(null);
      setCancelReason("");
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setUpdatingId(null);
    }
  }

  function requestStatusChange(
    order: AdminOrder,
    estado: OrderStatus,
  ) {
    if (estado === "CANCELADO") {
      setCancelOrderId(order.id);
      setCancelReason("");
      setError("");
      setSuccess("");
      return;
    }

    void updateStatus(order, estado);
  }

  function confirmCancellation(order: AdminOrder) {
    const reason = cancelReason.trim();

    if (reason.length < 5 || reason.length > 500) {
      setError(
        "El motivo de cancelación debe tener entre 5 y 500 caracteres.",
      );
      return;
    }

    void updateStatus(order, "CANCELADO", reason);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-800" />
          <p className="mt-3 text-sm font-bold text-purple-950">
            Cargando pedidos...
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
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                  <ShoppingBag className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="text-2xl font-black">
                    Administración de pedidos
                  </h1>
                  <p className="mt-1 text-sm text-purple-200">
                    Consulta pedidos y gestiona su proceso de entrega.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshing}
              onClick={() => void loadOrders(true)}
              className="flex w-fit items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
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
            Pedidos
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {orders.length}{" "}
            {orders.length === 1
              ? "pedido registrado"
              : "pedidos registrados"}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-10 text-center shadow-sm">
            <Package className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-black text-purple-950">
              No hay pedidos registrados
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const expanded = expandedId === order.id;
              const allowedStates =
                validTransitions[order.estado];
              const cancelling = cancelOrderId === order.id;
              const updating = updatingId === order.id;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-purple-950">
                            {order.numeroPedido}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClasses(
                              order.estado,
                            )}`}
                          >
                            {statusLabel(order.estado)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <UserRound className="h-3.5 w-3.5" />
                            {order.user.nombre}{" "}
                            {order.user.apellido}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDate(order.createdAt)}
                          </span>

                          <span className="flex items-center gap-1.5">
                            {order.metodoEntrega === "DOMICILIO" ? (
                              <Truck className="h-3.5 w-3.5" />
                            ) : (
                              <Store className="h-3.5 w-3.5" />
                            )}
                            {order.metodoEntrega === "DOMICILIO"
                              ? "Domicilio"
                              : order.metodoEntrega === "TIENDA"
                                ? "Recogida en tienda"
                                : order.metodoEntrega}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="sm:text-right">
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Total
                          </p>
                          <p className="mt-1 text-xl font-black text-purple-950">
                            {formatMoney(order.total)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expanded ? null : order.id,
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-black text-purple-800 transition hover:bg-purple-50"
                        >
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          {expanded
                            ? "Ocultar detalle"
                            : "Ver detalle"}
                        </button>
                      </div>
                    </div>

                    {allowedStates.length > 0 && (
                      <div className="mt-5 border-t border-slate-100 pt-5">
                        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
                          Acciones disponibles
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {allowedStates.map((nextStatus) => (
                            <button
                              key={nextStatus}
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                requestStatusChange(
                                  order,
                                  nextStatus,
                                )
                              }
                              className={
                                nextStatus === "CANCELADO"
                                  ? "rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                                  : "rounded-xl bg-purple-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-purple-900 disabled:opacity-50"
                              }
                            >
                              {updating ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Actualizando...
                                </span>
                              ) : nextStatus === "CANCELADO" ? (
                                "Cancelar pedido"
                              ) : (
                                `Cambiar a ${statusLabel(
                                  nextStatus,
                                )}`
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {allowedStates.length === 0 && (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <p className="text-xs font-semibold text-slate-500">
                          Este pedido se encuentra en un estado final y
                          no admite más cambios.
                        </p>
                      </div>
                    )}

                    {cancelling && (
                      <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />

                          <div className="w-full">
                            <p className="font-black text-red-800">
                              Cancelar {order.numeroPedido}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-red-700">
                              La cancelación es un estado final. El
                              backend devolverá automáticamente al
                              inventario las unidades de este pedido.
                            </p>

                            <label className="mt-4 block">
                              <span className="mb-2 block text-xs font-black text-red-800">
                                Motivo de cancelación
                              </span>

                              <textarea
                                value={cancelReason}
                                maxLength={500}
                                onChange={(event) =>
                                  setCancelReason(
                                    event.target.value,
                                  )
                                }
                                placeholder="Escribe el motivo de la cancelación"
                                className="min-h-24 w-full resize-y rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                              />

                              <p className="mt-1 text-right text-[10px] font-semibold text-red-600">
                                {cancelReason.trim().length}/500
                              </p>
                            </label>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={updating}
                                onClick={() =>
                                  confirmCancellation(order)
                                }
                                className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-800 disabled:opacity-50"
                              >
                                Confirmar cancelación
                              </button>

                              <button
                                type="button"
                                disabled={updating}
                                onClick={() => {
                                  setCancelOrderId(null);
                                  setCancelReason("");
                                }}
                                className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                Volver
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {expanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <section>
                          <h4 className="font-black text-purple-950">
                            Cliente y contacto
                          </h4>

                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p>
                              <strong>Cuenta:</strong>{" "}
                              {order.user.nombre}{" "}
                              {order.user.apellido}
                            </p>
                            <p>
                              <strong>Nombre de contacto:</strong>{" "}
                              {order.nombreContacto}
                            </p>
                            <p>
                              <strong>Email:</strong>{" "}
                              {order.emailContacto}
                            </p>
                            <p>
                              <strong>Teléfono:</strong>{" "}
                              {order.telefonoContacto}
                            </p>
                            <p>
                              <strong>Cédula:</strong>{" "}
                              {order.cedulaContacto ||
                                "Sin registrar"}
                            </p>
                          </div>
                        </section>

                        <section>
                          <h4 className="font-black text-purple-950">
                            Entrega
                          </h4>

                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            {order.metodoEntrega === "DOMICILIO" ? (
                              <>
                                <p className="flex items-start gap-2">
                                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                                  <span>
                                    {order.direccionEntrega ||
                                      "Dirección sin registrar"}
                                    {order.barrioEntrega
                                      ? `, ${order.barrioEntrega}`
                                      : ""}
                                    {order.ciudadEntrega
                                      ? `, ${order.ciudadEntrega}`
                                      : ""}
                                    {order.departamentoEntrega
                                      ? `, ${order.departamentoEntrega}`
                                      : ""}
                                  </span>
                                </p>

                                <p>
                                  <strong>
                                    Fecha estimada:
                                  </strong>{" "}
                                  {formatDate(
                                    order.fechaEstimadaEntrega,
                                  )}
                                </p>
                              </>
                            ) : (
                              <>
                                <p>
                                  <strong>
                                    Dirección de recogida:
                                  </strong>{" "}
                                  {order.direccionRecogida ||
                                    "Sin registrar"}
                                </p>
                                <p>
                                  <strong>Fecha:</strong>{" "}
                                  {formatDate(
                                    order.fechaRecogida,
                                  )}
                                </p>
                                <p>
                                  <strong>Hora:</strong>{" "}
                                  {order.horaRecogida ||
                                    "Sin registrar"}
                                </p>
                              </>
                            )}

                            {order.notasEntrega && (
                              <p>
                                <strong>Notas:</strong>{" "}
                                {order.notasEntrega}
                              </p>
                            )}

                            {order.enlaceRastreo && (
                              <p className="break-all">
                                <strong>Rastreo:</strong>{" "}
                                <a
                                  href={order.enlaceRastreo}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-purple-700 underline"
                                >
                                  Abrir enlace
                                </a>
                              </p>
                            )}
                          </div>
                        </section>
                      </div>

                      <section className="mt-7">
                        <h4 className="font-black text-purple-950">
                          Productos
                        </h4>

                        <div className="mt-3 grid gap-3">
                          {order.items.map((item) => {
                            const personalization =
                              personalizationText(
                                item.personalizacion,
                              );

                            return (
                              <div
                                key={item.id}
                                className="rounded-xl border border-slate-200 bg-white p-4"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <p className="font-black text-slate-800">
                                      {item.nombreProducto}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Cantidad: {item.cantidad}
                                    </p>

                                    {personalization && (
                                      <div className="mt-3">
                                        <p className="text-[10px] font-black uppercase text-purple-600">
                                          Personalización
                                        </p>
                                        <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-xs leading-5 text-slate-600">
                                          {personalization}
                                        </pre>
                                      </div>
                                    )}
                                  </div>

                                  <div className="shrink-0 sm:text-right">
                                    <p className="text-sm font-black text-purple-950">
                                      {formatMoney(
                                        item.precioUnitario,
                                      )}
                                    </p>
                                    <p className="mt-1 text-[10px] text-slate-400">
                                      Precio unitario
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section className="mt-7 rounded-xl border border-purple-100 bg-white p-4">
                        <div className="ml-auto max-w-sm space-y-2 text-sm">
                          <div className="flex justify-between gap-4 text-slate-600">
                            <span>Subtotal</span>
                            <span>
                              {formatMoney(order.subtotal)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 text-slate-600">
                            <span>Envío</span>
                            <span>
                              {formatMoney(order.costoEnvio)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 text-slate-600">
                            <span>Descuento</span>
                            <span>
                              {formatMoney(order.descuento)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-4 border-t border-slate-100 pt-2 text-base font-black text-purple-950">
                            <span>Total</span>
                            <span>
                              {formatMoney(order.total)}
                            </span>
                          </div>
                        </div>
                      </section>

                      {order.estado === "CANCELADO" && (
                        <section className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                          <p className="text-xs font-black uppercase text-red-700">
                            Pedido cancelado
                          </p>
                          <p className="mt-2 text-sm text-red-800">
                            <strong>Motivo:</strong>{" "}
                            {order.motivoCancelacion ||
                              "Sin motivo registrado"}
                          </p>
                          <p className="mt-1 text-xs text-red-600">
                            {formatDate(order.canceladoAt)}
                          </p>
                        </section>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}