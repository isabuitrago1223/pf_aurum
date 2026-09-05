"use client";

import Link from "next/link";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.precio) * item.cantidad,
    0,
  );

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf7] px-6 py-16 text-[#2f2a27]">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/productos"
            className="text-sm font-semibold text-[#a2725e] hover:opacity-70"
          >
            ← Volver al catálogo
          </Link>

          <div className="mt-10 rounded-2xl border border-[#eadfd8] bg-white p-10 text-center">
            <h1 className="text-3xl font-bold">
              Tu carrito está vacío
            </h1>

            <p className="mt-3 text-[#7a6f69]">
              Agrega productos del catálogo para comenzar tu pedido.
            </p>

            <Link
              href="/productos"
              className="mt-6 inline-block rounded-lg bg-[#a2725e] px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] px-6 py-16 text-[#2f2a27]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/productos"
          className="text-sm font-semibold text-[#a2725e] hover:opacity-70"
        >
          ← Seguir comprando
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">
            Carrito de compras
          </h1>

          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-semibold text-red-600 hover:opacity-70"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <article
              key={item.productId}
              className="flex flex-col gap-5 rounded-2xl border border-[#eadfd8] bg-white p-5 sm:flex-row sm:items-center"
            >
              <div className="h-32 w-full overflow-hidden rounded-xl bg-[#eadfd8] sm:w-32">
                {item.imagen ? (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#7a6f69]">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {item.nombre}
                </h2>

                <p className="mt-2 font-bold text-[#a2725e]">
                  ${Number(item.precio).toLocaleString("es-CO")}
                </p>
              </div>

              <div>
                <label
                  htmlFor={`cantidad-${item.productId}`}
                  className="mb-2 block text-sm font-semibold"
                >
                  Cantidad
                </label>

                <input
                  id={`cantidad-${item.productId}`}
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(event) =>
                    updateQuantity(
                      item.productId,
                      Number(event.target.value),
                    )
                  }
                  className="w-24 rounded-lg border border-[#d8cbc4] px-3 py-2"
                />
              </div>

              <div className="sm:text-right">
                <p className="font-bold">
                  $
                  {(
                    Number(item.precio) * item.cantidad
                  ).toLocaleString("es-CO")}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    removeItem(item.productId)
                  }
                  className="mt-3 text-sm font-semibold text-red-600 hover:opacity-70"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-[#eadfd8] bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold">
              Total
            </span>

            <span className="text-2xl font-bold">
              ${total.toLocaleString("es-CO")}
            </span>
          </div>

          <p className="mt-2 text-sm text-[#7a6f69]">
            El valor final será validado por Aurum al crear el pedido.
          </p>

          <Link
            href="/pedido/nuevo"
            className="mt-6 block rounded-lg bg-[#a2725e] px-6 py-3 text-center font-semibold text-white transition hover:opacity-90"
          >
            Continuar con el pedido
          </Link>
        </section>
      </div>
    </main>
  );
}