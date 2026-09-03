"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
        setError("Debes iniciar sesión para consultar tus pedidos.");
        setLoading(false);
        return;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const response = await fetch(`${apiUrl}/api/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          setError(
            "Tu sesión no es válida o no tienes permisos para consultar pedidos.",
          );
          return;
        }

        if (!response.ok) {
          setError("No fue posible cargar tus pedidos.");
          return;
        }

        const data = await response.json();

        setOrders(data);
      } catch {
        setError("No fue posible conectar con el servidor.");
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

  return (
    <main className="min-h-screen bg-[#fffaf7] px-6 py-12 text-[#2f2a27]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-semibold text-[#a2725e] transition hover:opacity-70"
          >
            ← Volver al inicio
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Mis pedidos
          </h1>

          <p className="mt-2 text-[#7a6f69]">
            Consulta el estado y el detalle de tus pedidos realizados en Aurum.
          </p>
        </div>

        {loading && (
          <section className="rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
            <p className="text-center text-[#7a6f69]">
              Cargando tus pedidos...
            </p>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
            <p className="text-center text-[#7a6f69]">
              {error}
            </p>

            {!localStorage.getItem("aurum_token") && (
              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="font-semibold text-[#a2725e] hover:opacity-70"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </section>
        )}

        {!loading && !error && orders.length === 0 && (
          <section className="rounded-3xl border border-[#eadfd8] bg-white p-8 shadow-sm">
            <p className="text-center text-[#7a6f69]">
              Aún no tienes pedidos registrados.
            </p>
          </section>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-3xl border border-[#eadfd8] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm text-[#7a6f69]">
                      Pedido
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
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

                    <p className="mt-2 text-xl font-bold">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-[#eadfd8] pt-5">
                  <p className="text-sm text-[#7a6f69]">
                    {order.items.length} producto
                    {order.items.length === 1 ? "" : "s"} en este pedido
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}