"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  PackageCheck,
  Sparkles,
} from "lucide-react";

import AddToCartButton from "./AddToCartButton";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  orden: number;
};

type Product = {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  precioAnterior: string | null;
  stock: number;
  imagen: string;
  imagenAlt: string | null;
  tiempoEntrega: string;
  permitirPersonalizacion: boolean;
  destacado: boolean;
  category: {
    id: string;
    nombre: string;
    slug: string;
  };
  occasion: {
    id: string;
    nombre: string;
    slug: string;
  } | null;
  images: ProductImage[];
};

type ProductDetailViewProps = {
  product: Product;
};

export default function ProductDetailView({
  product,
}: ProductDetailViewProps) {
  const hasValidMainImage =
    product.imagen?.startsWith("http");

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf7fb] text-purple-950">
      {/* Encabezado */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 px-5 py-10 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/productos"
            className="group inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

            Volver al catálogo
          </Link>

          <div className="mt-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.17em] text-amber-300 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />

              Detalle Aurum
            </div>
          </div>
        </div>
      </section>

      {/* Producto */}
      <section className="relative px-5 py-14 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Imagen */}
          <motion.div
            initial={{
              opacity: 0,
              x: -35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <div className="group overflow-hidden rounded-[2rem] border border-purple-100 bg-white shadow-xl shadow-purple-100/50">
              <div className="relative h-[500px] overflow-hidden bg-gradient-to-br from-purple-100 via-purple-50 to-amber-50">
                {hasValidMainImage ? (
                  <img
                    src={product.imagen}
                    alt={
                      product.imagenAlt ??
                      product.nombre
                    }
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative flex h-full items-center justify-center overflow-hidden">
                    <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-purple-400/30 blur-3xl" />

                    <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />

                    <motion.div
                      whileHover={{
                        scale: 1.06,
                        rotate: 3,
                      }}
                      className="relative text-center"
                    >
                      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-purple-950 via-purple-800 to-purple-600 text-5xl font-black text-amber-300 shadow-2xl">
                        A
                      </div>

                      <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-purple-700">
                        Aurum Decoraciones
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Imagen pendiente de Cloudinary
                      </p>
                    </motion.div>
                  </div>
                )}

                {product.destacado && (
                  <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-2 text-xs font-black text-purple-950 shadow-lg">
                    <Sparkles className="h-4 w-4" />
                    Producto destacado
                  </span>
                )}
              </div>
            </div>

            {/* Galería */}
            {product.images.length > 0 && (
              <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="group overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    {image.url.startsWith("http") ? (
                      <img
                        src={image.url}
                        alt={
                          image.alt ??
                          product.nombre
                        }
                        className="h-28 w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center bg-purple-50 text-sm font-black text-purple-700">
                        Aurum
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Información */}
          <motion.div
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.08,
            }}
            className="lg:py-2"
          >
            {/* Etiquetas */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-purple-100 px-4 py-2 text-xs font-black text-purple-800">
                {product.category.nombre}
              </span>

              {product.occasion && (
                <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-800">
                  {product.occasion.nombre}
                </span>
              )}
            </div>

            <h1 className="mt-6 font-serif text-4xl font-black leading-tight text-purple-950 sm:text-5xl">
              {product.nombre}
            </h1>

            <p className="mt-3 text-xs font-bold uppercase tracking-[0.17em] text-slate-400">
              SKU: {product.sku}
            </p>

            {/* Precio */}
            <div className="mt-7 flex flex-wrap items-end gap-4">
              <p className="text-4xl font-black text-amber-700">
                $
                {Number(
                  product.precio,
                ).toLocaleString("es-CO")}
              </p>

              {product.precioAnterior && (
                <p className="pb-1 text-lg text-slate-400 line-through">
                  $
                  {Number(
                    product.precioAnterior,
                  ).toLocaleString("es-CO")}
                </p>
              )}
            </div>

            <p className="mt-7 text-base leading-8 text-slate-600">
              {product.descripcion}
            </p>

            {/* Información */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <motion.div
                whileHover={{
                  y: -4,
                }}
                className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
              >
                <PackageCheck className="h-6 w-6 text-purple-700" />

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-amber-700">
                  Disponibilidad
                </p>

                <p className="mt-2 font-bold text-purple-950">
                  {product.stock > 0
                    ? `${product.stock} unidades disponibles`
                    : "Producto agotado"}
                </p>
              </motion.div>

              <motion.div
                whileHover={{
                  y: -4,
                }}
                className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
              >
                <Clock3 className="h-6 w-6 text-purple-700" />

                <p className="mt-4 text-xs font-black uppercase tracking-wide text-amber-700">
                  Tiempo de entrega
                </p>

                <p className="mt-2 font-bold text-purple-950">
                  {product.tiempoEntrega}
                </p>
              </motion.div>
            </div>

            {/* Cobertura */}
            <motion.div
              whileHover={{
                y: -3,
              }}
              className="mt-4 flex gap-4 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-800">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                  Zona de entrega
                </p>

                <p className="mt-2 text-sm font-semibold leading-6 text-purple-950">
                  Entregas en Medellín, Bello y zonas
                  disponibles del Valle de Aburrá.
                </p>
              </div>
            </motion.div>

            {/* Personalización */}
            {product.permitirPersonalizacion && (
              <motion.div
                whileHover={{
                  scale: 1.01,
                }}
                className="relative mt-6 overflow-hidden rounded-[1.5rem] border border-purple-200 bg-gradient-to-r from-purple-100 via-purple-50 to-amber-50 p-6"
              >
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple-300/30 blur-3xl" />

                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-950 to-purple-700 text-amber-300 shadow-lg">
                    <Heart className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-serif text-lg font-black text-purple-950">
                      Producto personalizable
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Este producto permite personalización.
                      Podrás indicar los detalles especiales
                      durante el proceso de creación del pedido.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Seguridad */}
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />

              <span>
                Pedido gestionado directamente por Aurum
                Decoraciones.
              </span>
            </div>

            {/* Acciones */}
            <div className="mt-8 space-y-3">
              {product.stock > 0 ? (
                <>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      nombre: product.nombre,
                      precio: product.precio,
                      imagen: product.imagen,
                    }}
                  />

                  <motion.div
                    whileHover={{
                      scale: 1.015,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    <Link
                      href={`/pedido/nuevo?productId=${product.id}`}
                      className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-4 text-sm font-black text-purple-950 shadow-lg transition hover:from-amber-300 hover:to-amber-500"
                    >
                      Comprar ahora

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-full bg-slate-300 px-6 py-4 text-sm font-bold text-white"
                >
                  Producto agotado
                </button>
              )}

              <Link
                href="/productos"
                className="block w-full rounded-full border border-purple-800 bg-white px-6 py-3.5 text-center text-sm font-bold text-purple-900 transition hover:bg-purple-50"
              >
                Seguir explorando
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
