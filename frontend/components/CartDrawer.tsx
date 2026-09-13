"use client";

import Link from "next/link";
import {
  Check,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import { useCart } from "../context/CartContext";

export default function CatalogCartDrawer() {
  const {
    items,
    totalItems,
    removeItem,
    updateQuantity,
    isCartDrawerOpen,
    closeCartDrawer,
  } = useCart();

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.precio) *
        item.cantidad,
    0,
  );

  return (
    <>
      {/* FONDO OSCURO */}
      {isCartDrawerOpen && (
        <button
          type="button"
          aria-label="Cerrar carrito"
          onClick={closeCartDrawer}
          className="fixed inset-0 z-[80] bg-purple-950/25 backdrop-blur-[2px]"
        />
      )}

      {/* DRAWER */}
      <aside
        className={`fixed right-0 top-0 z-[90] flex h-dvh w-full max-w-[430px] flex-col border-l border-purple-100 bg-white shadow-2xl transition-transform duration-300 ${
          isCartDrawerOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* ENCABEZADO */}
        <div className="border-b border-purple-100 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-900 text-white">
                <ShoppingCart className="h-5 w-5" />

                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-black text-white">
                    {totalItems}
                  </span>
                )}
              </div>

              <div>
                <h2 className="font-serif text-2xl font-black text-purple-950">
                  Tu carrito
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Revisa tus productos antes
                  de continuar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCartDrawer}
              className="flex h-9 w-9 items-center justify-center rounded-full text-purple-700 transition hover:bg-purple-100"
              aria-label="Cerrar carrito"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-50">
                <ShoppingCart className="h-7 w-7 text-purple-400" />
              </div>

              <h3 className="mt-5 font-serif text-xl font-black text-purple-950">
                Tu carrito está vacío
              </h3>

              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Agrega un detalle especial
                desde nuestro catálogo.
              </p>

              <button
                type="button"
                onClick={closeCartDrawer}
                className="mt-6 rounded-full bg-purple-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-800"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const subtotal =
                  Number(item.precio) *
                  item.cantidad;

                const hasImage =
                  item.imagen?.startsWith(
                    "http",
                  ) ||
                  item.imagen?.startsWith(
                    "/",
                  );

                return (
                  <article
                    key={item.cartItemId}
                    className="rounded-[1.5rem] border border-purple-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-3">
                      {/* IMAGEN */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 via-purple-50 to-amber-50">
                        {hasImage ? (
                          <img
                            src={
                              item.imagen ?? ""
                            }
                            alt={item.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900 font-black text-amber-300">
                              A
                            </div>
                          </div>
                        )}
                      </div>

                      {/* INFORMACIÓN */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="line-clamp-2 font-serif text-sm font-black leading-5 text-purple-950">
                              {item.nombre}
                            </h3>

                            <p className="mt-1 text-sm font-black text-purple-700">
                              $
                              {Number(
                                item.precio,
                              ).toLocaleString(
                                "es-CO",
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.cartItemId,
                              )
                            }
                            aria-label="Eliminar producto"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* CANTIDAD */}
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center overflow-hidden rounded-xl border border-purple-200">
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  item.cantidad >
                                  1
                                ) {
                                  updateQuantity(
                                    item.cartItemId,
                                    item.cantidad -
                                      1,
                                  );
                                }
                              }}
                              className="flex h-8 w-8 items-center justify-center text-purple-700 transition hover:bg-purple-50"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="flex h-8 min-w-9 items-center justify-center border-x border-purple-200 px-2 text-xs font-black text-purple-950">
                              {item.cantidad}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.cartItemId,
                                  item.cantidad +
                                    1,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center text-purple-700 transition hover:bg-purple-50"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="text-sm font-black text-purple-950">
                            $
                            {subtotal.toLocaleString(
                              "es-CO",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* RESUMEN */}
        {items.length > 0 && (
          <div className="border-t border-purple-100 bg-white px-5 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Total (
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "producto"
                    : "productos"}
                  )
                </p>
              </div>

              <p className="font-serif text-2xl font-black text-purple-800">
                $
                {total.toLocaleString(
                  "es-CO",
                )}
              </p>
            </div>

            <Link
              href="/carrito"
              onClick={closeCartDrawer}
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-900 via-purple-800 to-fuchsia-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-100 transition hover:shadow-xl"
            >
              Ver carrito completo
            </Link>

            <button
              type="button"
              onClick={closeCartDrawer}
              className="mt-3 w-full rounded-2xl border border-purple-200 bg-white px-5 py-3.5 text-sm font-bold text-purple-800 transition hover:bg-purple-50"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>

    </>
  );
}