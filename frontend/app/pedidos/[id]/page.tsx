"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Package,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";

type OrderItem = {
  id: string;
  productId: string;
  nombreProducto: string;
  imagenProducto: string | null;
  cantidad: number;
  precioUnitario: number;
};

type Order = {
  id: string;
  numeroPedido: string;
  estado: string;
  subtotal: number;
  costoEnvio: number;
  descuento: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      const token = localStorage.getItem("aurum_token");

      if (!token) {
        setError("Debes iniciar sesión para consultar este pedido.");
        setLoading(false);
        return;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          setError(
            "Tu sesión no es válida o no tienes permisos para consultar este pedido.",
          );
          return;
        }

        if (response.status === 404) {
          setError("El pedido no existe o no pertenece a tu cuenta.");
          return;
        }

        if (!response.ok) {
          setError("No fue posible cargar el pedido.");
          return;
        }

        const data: { order: Order } = await response.json();

        setOrder(data.order);
      } catch {
        setError("No fue posible conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

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
        return "border-amber-200 bg-amber-50 text-amber-700";

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
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7fb] text-[#2f123f]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2f123f] via-[#4b1f63] to-[#6b2a83] px-5 py-12 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/pedidos"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#f0c85b] transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Volver a mis pedidos
          </Link>

          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f0c85b]">
              Aurum Decoraciones
            </p>

            <h1 className="mt-3 font-serif text-4xl font-black sm:text-5xl">
              Detalle del pedido
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#eee5f2] sm:text-base">
              Consulta los productos, valores y estado actual de tu pedido.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {loading && (
            <div className="rounded-[2rem] border border-[#e7ddec] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-[#6b2a83]">
                <ShoppingBag size={25} />
              </div>

              <p className="mt-4 font-bold text-[#5f5363]">
                Cargando pedido...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-[2rem] border border-[#e7ddec] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-[#6b2a83]">
                <Package size={25} />
              </div>

              <h2 className="mt-4 font-serif text-xl font-black text-[#351641]">
                No pudimos mostrar este pedido
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#807385]">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && order && (
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-[#6b2a83]">
                      <ReceiptText size={22} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a8aa0]">
                        Pedido
                      </p>

                      <h2 className="mt-1 text-xl font-black text-[#351641]">
                        {order.numeroPedido}
                      </h2>

                      <div className="mt-2 flex items-center gap-2 text-sm text-[#807385]">
                        <CalendarDays size={15} />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusClasses(
                        order.estado,
                      )}`}
                    >
                      {order.estado.replaceAll("_", " ")}
                    </span>

                    <p className="mt-3 text-2xl font-black text-[#351641]">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <h3 className="font-serif text-2xl font-black text-[#351641]">
                  Productos
                </h3>

                <div className="mt-5 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-[#eee5f2] bg-[#fdfbfe] p-5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-black text-[#351641]">
                          {item.nombreProducto}
                        </p>

                        <p className="mt-2 text-sm text-[#807385]">
                          Cantidad: {item.cantidad}
                        </p>

                        <p className="mt-1 text-sm text-[#807385]">
                          Precio unitario:{" "}
                          {formatPrice(item.precioUnitario)}
                        </p>
                      </div>

                      <p className="text-lg font-black text-[#351641]">
                        {formatPrice(
                          item.precioUnitario * item.cantidad,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <h3 className="font-serif text-2xl font-black text-[#351641]">
                  Resumen del pedido
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#807385]">Subtotal</span>
                    <span className="font-bold text-[#351641]">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#807385]">Envío</span>
                    <span className="font-bold text-[#351641]">
                      {formatPrice(order.costoEnvio)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#807385]">Descuento</span>
                    <span className="font-bold text-[#351641]">
                      {formatPrice(order.descuento)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#eee5f2] pt-4 text-lg">
                    <span className="font-black text-[#351641]">
                      Total
                    </span>

                    <span className="font-black text-[#6b2a83]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#eadff0] bg-[#f8f1fb] p-6 text-sm leading-6 text-[#6d5f72]">
                La opción de pago se conectará después con la integración de
                Wompi. Por ahora esta pantalla muestra únicamente la información
                del pedido para no interferir con la integración de pagos.
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}