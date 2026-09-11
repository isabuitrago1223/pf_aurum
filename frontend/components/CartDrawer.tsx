"use client";

import Link from "next/link";
import {
  LockKeyhole,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useCart } from "../context/CartContext";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function formatCustomizationLabel(key: string) {
  const labels: Record<string, string> = {
    colorDecoracion: "Color",
    platoPrincipal: "Plato principal",
    bebida: "Bebida",
    frutas: "Frutas",
    mensaje: "Mensaje",
    presentacion: "Presentación",
    estilo: "Estilo",
    color: "Color",
    dedicatoria: "Dedicatoria",
  };

  return labels[key] ?? key;
}

export default function CartDrawer({
  open,
  onClose,
}: CartDrawerProps) {
  const [mounted, setMounted] = useState(false);

  const {
    items,
    totalItems,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.precio) * item.cantidad,
    0,
  );

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [open, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-purple-950/55 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              onClose();
            }
          }}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 32,
            }}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="fixed bottom-0 right-0 top-0 flex h-dvh w-full max-w-[460px] flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-950 px-5 py-5 text-white">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-400/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-amber-300" />

                  <h2 className="font-serif text-xl font-black">
                    Tu Carrito de Compras
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar carrito"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-purple-100 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Cantidad */}
            <div className="flex shrink-0 items-center justify-between border-b border-purple-100 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">
                {totalItems}{" "}
                {totalItems === 1
                  ? "producto"
                  : "productos"}
              </p>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 transition hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Vaciar carrito
                </button>
              )}
            </div>

            {/* Lista de productos */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {items.length === 0 ? (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
                    <ShoppingBag className="h-9 w-9 text-purple-700" />
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-black text-purple-950">
                    Tu carrito está vacío
                  </h3>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
                    Explora nuestros productos y encuentra
                    el detalle perfecto para celebrar.
                  </p>

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 rounded-full bg-purple-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-800"
                  >
                    Seguir explorando
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
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
                        className="relative rounded-2xl border border-purple-100 bg-purple-50/30 p-3"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.cartItemId,
                            )
                          }
                          aria-label={`Eliminar ${item.nombre}`}
                          className="absolute right-3 top-3 z-10 text-slate-400 transition hover:text-rose-600"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="flex gap-3 pr-6">
                          {/* Imagen */}
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-amber-50">
                            {hasValidImage ? (
                              <img
                                src={item.imagen ?? ""}
                                alt={item.nombre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-800 font-black text-amber-300">
                                  A
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Información */}
                          <div className="min-w-0 flex-1">
                            <h3 className="pr-2 text-sm font-black leading-5 text-slate-800">
                              {item.nombre}
                            </h3>

                            {customizationEntries.length >
                              0 && (
                              <div className="mt-2 space-y-1 rounded-lg border border-purple-100 bg-white/80 px-2.5 py-2">
                                {customizationEntries.map(
                                  ([key, value]) => (
                                    <p
                                      key={key}
                                      className="text-[11px] leading-4 text-slate-600"
                                    >
                                      <span className="font-bold text-purple-900">
                                        {formatCustomizationLabel(
                                          key,
                                        )}
                                        :
                                      </span>{" "}
                                      {Array.isArray(
                                        value,
                                      )
                                        ? value.join(
                                            ", ",
                                          )
                                        : value}
                                    </p>
                                  ),
                                )}
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-black text-purple-900">
                                $
                                {Number(
                                  item.precio,
                                ).toLocaleString(
                                  "es-CO",
                                )}
                              </p>

                              <div className="flex items-center overflow-hidden rounded-full border border-purple-200 bg-white">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.cartItemId,
                                      Math.max(
                                        1,
                                        item.cantidad -
                                          1,
                                      ),
                                    )
                                  }
                                  className="flex h-7 w-8 items-center justify-center text-purple-700 transition hover:bg-purple-50"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>

                                <span className="min-w-7 text-center text-xs font-black text-purple-950">
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
                                  className="flex h-7 w-8 items-center justify-center text-purple-700 transition hover:bg-purple-50"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resumen fijo abajo */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-purple-100 bg-white px-5 py-5 shadow-[0_-10px_30px_rgba(76,29,149,0.08)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold text-slate-800">
                    $
                    {subtotal.toLocaleString(
                      "es-CO",
                    )}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="font-serif text-lg font-black text-purple-950">
                    Total
                  </span>

                  <span className="font-serif text-2xl font-black text-purple-800">
                    $
                    {subtotal.toLocaleString(
                      "es-CO",
                    )}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  El costo de envío se confirmará al
                  completar los datos de entrega.
                </p>

                <Link
                  href="/pedido/nuevo"
                  onClick={onClose}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-950 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:scale-[1.01]"
                >
                  Proceder al pedido
                  <span className="text-amber-300">
                    →
                  </span>
                </Link>

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Compra procesada de forma segura
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
