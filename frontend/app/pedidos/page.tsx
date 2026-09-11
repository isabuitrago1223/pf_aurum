"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Eye,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

type OrderItem = {
  id: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  product?: {
    id: string;
    nombre: string;
  };
};

type Order = {
  id: string;
  numeroPedido: string;
  estado: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      const token = localStorage.getItem("aurum_token");

      if (!token) {
        setError(
          "Debes iniciar sesión para consultar tus pedidos.",
        );
        setLoading(false);
        return;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ??
          "http://localhost:4000";

        const response = await fetch(
          `${apiUrl}/api/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          setError(
            "Tu sesión no es válida o no tienes permisos para consultar pedidos.",
          );
          return;
        }

        if (!response.ok) {
          setError(
            "No fue posible cargar tus pedidos.",
          );
          return;
        }

        const data: { orders: Order[] } =
          await response.json();

        setOrders(data.orders);
      } catch {
        setError(
          "No fue posible conectar con el servidor.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  function formatPrice(value: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  }

  function getStatusClasses(status: string) {
    switch (status) {
      case "PENDIENTE":
        return "border-amber-300 bg-amber-50 text-amber-700";

      case "CONFIRMADO":
      case "APROBADO":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "EN_PREPARACION":
        return "border-purple-200 bg-purple-50 text-purple-700";

      case "ENVIADO":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "ENTREGADO":
        return "border-green-200 bg-green-50 text-green-700";

      case "CANCELADO":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      {/* CABECERA */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-purple-200 bg-gradient-to-r from-purple-950 via-purple-800 to-purple-700 px-6 py-7 text-white shadow-lg sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-purple-400/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />

            <div className="relative">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-bold text-purple-100 transition hover:text-amber-300"
              >
                <ArrowLeft size={16} />
                Volver al inicio
              </Link>

              <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-white/10 px-3 py-1.5">
                    <Sparkles
                      size={14}
                      className="text-amber-300"
                    />

                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                      Aurum Decoraciones
                    </span>
                  </div>

                  <h1 className="mt-3 font-serif text-3xl font-black sm:text-4xl">
                    Mis pedidos
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-purple-100">
                    Consulta tus compras, revisa el estado
                    de cada pedido y accede a todos sus
                    detalles.
                  </p>
                </div>

                {!loading &&
                  !error &&
                  orders.length > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                        <ShoppingBag size={19} />
                      </div>

                      <div>
                        <p className="text-xl font-black">
                          {orders.length}
                        </p>

                        <p className="text-[10px] font-bold uppercase tracking-wide text-purple-200">
                          {orders.length === 1
                            ? "Pedido"
                            : "Pedidos"}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* CARGANDO */}
          {loading && (
            <div className="rounded-[1.75rem] border border-purple-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <ShoppingBag size={24} />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-600">
                Cargando tus pedidos...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-[1.75rem] border border-purple-100 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <ShoppingBag size={24} />
              </div>

              <h2 className="mt-4 font-serif text-xl font-black text-purple-950">
                No pudimos mostrar tus pedidos
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                {error}
              </p>

              {error.includes("iniciar sesión") && (
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-800"
                >
                  Iniciar sesión
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          )}

          {/* SIN PEDIDOS */}
          {!loading &&
            !error &&
            orders.length === 0 && (
              <div className="rounded-[1.75rem] border border-purple-100 bg-white p-8 text-center shadow-sm sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                  <Package size={28} />
                </div>

                <h2 className="mt-5 font-serif text-2xl font-black text-purple-950">
                  Aún no tienes pedidos
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Cuando realices tu primera compra podrás
                  consultar aquí su estado y todos los
                  detalles.
                </p>

                <Link
                  href="/productos"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-800"
                >
                  Ver productos
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

          {/* LISTADO */}
          {!loading &&
            !error &&
            orders.length > 0 && (
              <>
                {/* ENCABEZADO DEL HISTORIAL */}
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-1 rounded-full bg-amber-400" />

                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-600">
                        Tus compras
                      </p>
                    </div>

                    <h2 className="mt-2 font-serif text-2xl font-black text-purple-950">
                      Historial de pedidos
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Tienes {orders.length} pedido
                      {orders.length === 1 ? "" : "s"}{" "}
                      registrado
                      {orders.length === 1 ? "" : "s"}.
                    </p>
                  </div>

                  <Link
                    href="/productos"
                    className="inline-flex items-center gap-2 text-sm font-black text-purple-700 transition hover:text-purple-950"
                  >
                    Seguir comprando
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* TARJETAS */}
                <div className="space-y-4">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="group overflow-hidden rounded-[1.75rem] border border-purple-100 bg-white shadow-sm transition duration-200 hover:border-purple-200 hover:shadow-md"
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                          {/* INFORMACIÓN */}
                          <div className="flex min-w-0 gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 transition group-hover:bg-purple-100">
                              <Package size={21} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                Pedido
                              </p>

                              <h3 className="mt-1 break-all text-base font-black text-purple-950 sm:text-lg">
                                {order.numeroPedido}
                              </h3>

                              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                                <CalendarDays
                                  size={15}
                                  className="text-purple-500"
                                />

                                {formatDate(
                                  order.createdAt,
                                )}
                              </div>
                            </div>
                          </div>

                          {/* ESTADO Y PRECIO */}
                          <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClasses(
                                order.estado,
                              )}`}
                            >
                              {order.estado.replaceAll(
                                "_",
                                " ",
                              )}
                            </span>

                            <div className="sm:text-right">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                Total
                              </p>

                              <p className="mt-0.5 text-xl font-black text-purple-800 sm:text-2xl">
                                {formatPrice(
                                  order.total,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* PIE */}
                        <div className="mt-5 flex flex-col justify-between gap-3 border-t border-purple-50 pt-4 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <ShoppingBag
                              size={15}
                              className="text-purple-500"
                            />

                            <span>
                              {order.items.length} producto
                              {order.items.length === 1
                                ? ""
                                : "s"}{" "}
                              en este pedido
                            </span>
                          </div>

                          <Link
                            href={`/pedidos/${order.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-50 px-4 py-2.5 text-xs font-black text-purple-800 transition hover:bg-purple-700 hover:text-white"
                          >
                            <Eye size={16} />
                            Ver detalle
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
        </div>
      </section>
    </main>
  );
}