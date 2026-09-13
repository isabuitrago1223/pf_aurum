"use client";

import Link from "next/link";
import {
  ArrowLeft,
  LockKeyhole,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";

import { useCart } from "../../context/CartContext";

function formatCustomizationLabel(key: string) {
  const labels: Record<string, string> = {
    colorDecoracion: "Color de la decoración",
    platoPrincipal: "Plato principal",
    bebida: "Bebida",
    frutas: "Frutas",
    mensaje: "Mensaje personalizado",
    presentacion: "Presentación",
    estilo: "Estilo",
    color: "Color",
    dedicatoria: "Dedicatoria",
  };

  return labels[key] ?? key;
}

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

  const totalItems = items.reduce(
    (sum, item) => sum + item.cantidad,
    0,
  );

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf7] text-purple-950">
        <section className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-purple-900 to-purple-800 px-6 py-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-6xl">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al catálogo
            </Link>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-[2rem] border border-purple-100 bg-white p-10 text-center shadow-sm sm:p-14">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f2e9f5]">
                <ShoppingBag className="h-9 w-9 text-purple-800" />
              </div>

              <h1 className="mt-6 font-serif text-3xl font-black text-purple-950 sm:text-4xl">
                Tu carrito está vacío
              </h1>

              <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-500">
                Aún no has agregado productos. Explora nuestro
                catálogo y encuentra el detalle perfecto para ese
                momento especial.
              </p>

              <Link
                href="/productos"
                className="mt-7 inline-flex rounded-full bg-purple-950 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
              >
                Explorar productos
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf7] text-purple-950">
      {/* Encabezado */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-purple-900 to-purple-800 px-6 py-10 text-white">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Seguir comprando
          </Link>

          <div className="mt-7">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              <Sparkles className="h-4 w-4" />
              Aurum Decoraciones
            </div>

            <h1 className="mt-2 font-serif text-4xl font-black sm:text-5xl">
              Carrito de compras
            </h1>

            <p className="mt-3 text-sm text-purple-100">
              Revisa tus productos y personalizaciones antes de
              continuar con el pedido.
            </p>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="bg-gradient-to-b from-[#fffaf7] via-white to-purple-50/40 px-5 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.5fr_0.8fr]">
          {/* Productos */}
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-black text-purple-950">
                  Tus productos
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "producto en el carrito"
                    : "productos en el carrito"}
                </p>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vaciar carrito
              </button>
            </div>

            <div className="space-y-5">
              {items.map((item) => {
                const subtotal =
                  Number(item.precio) * item.cantidad;

                const hasValidImage =
                  item.imagen?.startsWith("http");

                const customizationEntries =
                  item.personalizacion
                    ? Object.entries(
                        item.personalizacion,
                      )
                    : [];

                return (
                  <article
                    key={item.cartItemId}
                    className="overflow-hidden rounded-[1.75rem] border border-purple-100 bg-white p-5 shadow-[0_10px_35px_rgba(76,29,149,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(76,29,149,0.10)]"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      {/* Imagen */}
                      <div className="h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 via-purple-50 to-amber-50 sm:h-36 sm:w-36">
                        {hasValidImage ? (
                          <img
                            src={item.imagen ?? ""}
                            alt={item.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="relative flex h-full items-center justify-center overflow-hidden text-center">
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-300/30 blur-2xl" />

                            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-amber-300/30 blur-2xl" />

                            <div className="relative">
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-950 via-purple-800 to-purple-600 text-xl font-black text-amber-300 shadow-lg">
                                A
                              </div>

                              <p className="mt-2 px-2 text-[10px] font-bold uppercase tracking-wide text-[#6c5874]">
                                Aurum
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Información */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-lg font-black leading-6 text-purple-950">
                          {item.nombre}
                        </h3>

                        <p className="mt-2 text-lg font-black text-amber-700">
                          $
                          {Number(
                            item.precio,
                          ).toLocaleString("es-CO")}
                        </p>

                        {/* Personalización */}
                        {customizationEntries.length >
                          0 && (
                          <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
                            <div className="mb-3 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-600" />

                              <p className="text-xs font-black uppercase tracking-[0.12em] text-purple-900">
                                Tu personalización
                              </p>
                            </div>

                            <div className="space-y-2">
                              {customizationEntries.map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex flex-col gap-1 text-sm sm:flex-row sm:gap-2"
                                  >
                                    <span className="font-bold text-purple-950">
                                      {formatCustomizationLabel(
                                        key,
                                      )}
                                      :
                                    </span>

                                    <span className="text-slate-600">
                                      {Array.isArray(
                                        value,
                                      )
                                        ? value.join(
                                            ", ",
                                          )
                                        : value}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-end gap-5">
                          <div>
                            <label
                              htmlFor={`cantidad-${item.cartItemId}`}
                              className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                            >
                              Cantidad
                            </label>

                            <input
                              id={`cantidad-${item.cartItemId}`}
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(event) =>
                                updateQuantity(
                                  item.cartItemId,
                                  Number(
                                    event.target
                                      .value,
                                  ),
                                )
                              }
                              className="w-24 rounded-xl border border-purple-200 bg-purple-50/50 px-3 py-2.5 font-semibold text-purple-950 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.cartItemId,
                              )
                            }
                            className="mb-1 inline-flex items-center gap-1.5 text-sm font-bold text-red-600 transition hover:opacity-70"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="border-t border-purple-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-right">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Subtotal
                        </p>

                        <p className="mt-2 text-xl font-black text-purple-950">
                          $
                          {subtotal.toLocaleString(
                            "es-CO",
                          )}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Resumen */}
          <aside>
            <div className="sticky top-6 rounded-[1.75rem] border border-purple-100 bg-white p-6 shadow-[0_14px_40px_rgba(76,29,149,0.08)]">
              <p className="text-sm font-black uppercase tracking-[0.15em] text-amber-700">
                Resumen del pedido
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Productos
                  </span>

                  <span className="font-semibold text-purple-950">
                    ${total.toLocaleString("es-CO")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Envío
                  </span>

                  <span className="font-semibold text-purple-950">
                    Por confirmar
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-purple-100" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Total productos
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Antes de costos adicionales
                  </p>
                </div>

                <p className="text-3xl font-black text-amber-700">
                  ${total.toLocaleString("es-CO")}
                </p>
              </div>

              <p className="mt-5 rounded-2xl bg-purple-50 p-4 text-xs leading-5 text-slate-600">
                El valor final será validado por Aurum al
                crear el pedido, incluyendo los datos de
                entrega y cualquier costo adicional
                aplicable.
              </p>

              <Link
                href="/pedido/nuevo"
                className="mt-6 block w-full rounded-full bg-purple-950 px-6 py-3.5 text-center text-sm font-black text-white shadow-lg transition hover:scale-[1.01]"
              >
                Continuar con el pedido
              </Link>

              <Link
                href="/productos"
                className="mt-3 block w-full rounded-full border border-purple-300 px-6 py-3.5 text-center text-sm font-bold text-purple-800 transition hover:bg-purple-50"
              >
                Agregar más productos
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-400">
                <LockKeyhole className="h-4 w-4" />
                <span>
                  Compra procesada de forma segura
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}