"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

type PaymentMethod =
  | "NEQUI"
  | "DAVIPLATA"
  | "PSE"
  | "TRANSFERENCIA_BANCARIA";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("NEQUI");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

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

  async function handlePayment() {
    if (!order) {
      return;
    }

    const token = localStorage.getItem("aurum_token");

    if (!token) {
      setPaymentError("Debes iniciar sesión para registrar el pago.");
      return;
    }

    setPaymentLoading(true);
    setPaymentMessage("");
    setPaymentError("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          metodo: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPaymentError(
          data?.message ?? "No fue posible registrar el pago.",
        );
        return;
      }

      setPaymentMessage(
        "Pago registrado correctamente. Estado inicial: PENDIENTE.",
      );
    } catch {
      setPaymentError("No fue posible conectar con el servidor.");
    } finally {
      setPaymentLoading(false);
    }
  }
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

  return (
    <main className="min-h-screen bg-[#fffaf7] px-6 py-12 text-[#2f2a27]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/pedidos"
            className="text-sm font-semibold text-[#a2725e] transition hover:opacity-70"
          >
← Volver a mis pedidos
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Detalle del pedido
          </h1>
        </div>

        {loading && (
          <section className="rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
            <p className="text-center text-[#7a6f69]">
              Cargando pedido...
            </p>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
            <p className="text-center text-[#7a6f69]">
              {error}
            </p>
          </section>
        )}

        {!loading && !error && order && (
          <section className="rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-[#eadfd8] pb-6 sm:flex-row">
              <div>
                <p className="text-sm text-[#7a6f69]">
                  Pedido
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {order.numeroPedido}
                </h2>

                <p className="mt-2 text-sm text-[#7a6f69]">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-sm font-semibold text-[#a2725e]">
                  {order.estado.replaceAll("_", " ")}
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold">
                Productos
              </h3>

              <div className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 rounded-2xl border border-[#eadfd8] p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.nombreProducto}
                      </p>

                      <p className="mt-1 text-sm text-[#7a6f69]">
                        Cantidad: {item.cantidad}
                      </p>

                      <p className="mt-1 text-sm text-[#7a6f69]">
                        Precio unitario: {formatPrice(item.precioUnitario)}
                      </p>
                    </div>

                    <p className="font-semibold">
                      {formatPrice(item.precioUnitario * item.cantidad)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-3 border-t border-[#eadfd8] pt-6">
              <div className="flex justify-between">
                <span className="text-[#7a6f69]">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7a6f69]">Envío</span>
                <span>{formatPrice(order.costoEnvio)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#7a6f69]">Descuento</span>
                <span>{formatPrice(order.descuento)}</span>
              </div>

              <div className="flex justify-between border-t border-[#eadfd8] pt-3 text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
            {order.estado !== "CANCELADO" && (
              <div className="mt-8 border-t border-[#eadfd8] pt-6">
                <h3 className="text-lg font-bold">Registrar pago</h3>

                <p className="mt-2 text-sm text-[#7a6f69]">
                  Selecciona el método de pago. El registro se creará inicialmente en estado PENDIENTE.
                </p>

                <div className="mt-4">
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-semibold"
                  >
                    Método de pago
                  </label>

                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value as PaymentMethod)
                    }
                    className="mt-2 w-full rounded-xl border border-[#eadfd8] bg-white px-4 py-3 outline-none"
                  >
                    <option value="NEQUI">Nequi</option>
                    <option value="DAVIPLATA">Daviplata</option>
                    <option value="PSE">PSE</option>
                    <option value="TRANSFERENCIA_BANCARIA">
                      Transferencia bancaria
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="mt-4 rounded-xl bg-[#a2725e] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentLoading
                    ? "Registrando pago..."
                    : "Registrar pago"}
                </button>

                {paymentMessage && (
                  <p className="mt-4 text-sm font-semibold text-green-700">
                    {paymentMessage}
                  </p>
                )}

                {paymentError && (
                  <p className="mt-4 text-sm font-semibold text-red-700">
                    {paymentError}
                  </p>
                )}
              </div>
            )}

            {order.estado === "CANCELADO" && (
              <div className="mt-8 border-t border-[#eadfd8] pt-6">
                <p className="text-sm font-semibold text-[#a2725e]">
                  Este pedido está cancelado y no permite registrar pagos.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
