"use client";

import { useState } from "react";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import AuthRequiredModal from "./AuthRequiredModal";
import ProductCustomizationModal from "./ProductCustomizationModal";

type Product = {
  id: string;
  slug: string;
  nombre: string;
  descripcion?: string;
  precio: string;
  precioAnterior?: string | null;
  imagen: string | null;
  imagenAlt: string | null;
  destacado: boolean;
  tiempoEntrega: string;
  permitirPersonalizacion: boolean;
  category: {
    nombre: string;
    slug: string;
  };
};

type FeaturedProductCardProps = {
  product: Product;
  index: number;
};

export default function FeaturedProductCard({
  product,
}: FeaturedProductCardProps) {
  const [modalOpen, setModalOpen] =
    useState(false);

  const [authModalOpen, setAuthModalOpen] =
    useState(false);

  const hasValidImage =
    product.imagen?.startsWith("http");

  function hasActiveSession() {
    const token =
      localStorage.getItem("aurum_token");

    const user =
      localStorage.getItem("aurum_user");

    return Boolean(token && user);
  }

  function handlePersonalize() {
    if (!hasActiveSession()) {
      setAuthModalOpen(true);
      return;
    }

    setModalOpen(true);
  }

  return (
    <>
      <article className="group overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Imagen */}
        <button
          type="button"
          onClick={handlePersonalize}
          className="block w-full text-left"
          aria-label={`Ver ${product.nombre}`}
        >
          <div className="relative h-72 overflow-hidden bg-slate-100">
            {hasValidImage ? (
              <img
                src={product.imagen ?? ""}
                alt={
                  product.imagenAlt ??
                  product.nombre
                }
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-purple-50">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-900 font-serif text-2xl font-black text-amber-300">
                    A
                  </div>

                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-purple-700">
                    Aurum Decoraciones
                  </p>
                </div>
              </div>
            )}

            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-purple-800 shadow-sm">
                {product.category.nombre}
              </span>
            </div>

            {product.destacado && (
              <div className="absolute right-4 top-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black text-purple-950 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Destacado
                </span>
              </div>
            )}
          </div>
        </button>

        {/* Información */}
        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-600">
            {product.category.nombre}
          </p>

          <button
            type="button"
            onClick={handlePersonalize}
            className="block w-full text-left"
          >
            <h3 className="mt-2 min-h-[56px] font-serif text-xl font-black leading-7 text-purple-950 transition hover:text-purple-700">
              {product.nombre}
            </h3>
          </button>

          {product.descripcion && (
            <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-600">
              {product.descripcion}
            </p>
          )}

          {/* Precio */}
          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-serif text-2xl font-black text-purple-950">
                $
                {Number(
                  product.precio,
                ).toLocaleString("es-CO")}
              </p>

              {product.precioAnterior && (
                <span className="text-xs text-slate-400 line-through">
                  $
                  {Number(
                    product.precioAnterior,
                  ).toLocaleString("es-CO")}
                </span>
              )}
            </div>
          </div>

          {/* Acción */}
          <button
            type="button"
            onClick={handlePersonalize}
            className="group/button mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-purple-900 px-5 py-3.5 text-sm font-black text-white transition hover:bg-purple-800"
          >
            {product.permitirPersonalizacion
              ? "Personalizar y agregar"
              : "Ver y agregar"}

            <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
          </button>
        </div>
      </article>

      <AuthRequiredModal
        open={authModalOpen}
        onClose={() =>
          setAuthModalOpen(false)
        }
      />

      <ProductCustomizationModal
        product={product}
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
      />
    </>
  );
}