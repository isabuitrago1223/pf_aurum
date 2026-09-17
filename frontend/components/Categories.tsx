"use client";

import Link from "next/link";
import {
  Flower2,
  Gift,
  Heart,
  PackageOpen,
  Sparkles,
  Utensils,
} from "lucide-react";

const categories = [
  {
    nombre: "Desayunos",
    slug: "desayunos",
    icon: Utensils,
    description:
      "Sorpresas para comenzar el día de una forma inolvidable.",
  },
  {
    nombre: "Anchetas",
    slug: "anchetas",
    icon: PackageOpen,
    description:
      "Selecciones especiales para celebrar grandes momentos.",
  },
  {
    nombre: "Ramos",
    slug: "ramos",
    icon: Flower2,
    description:
      "Flores y detalles que hablan por ti.",
  },
  {
    nombre: "Regalos",
    slug: "regalos",
    icon: Gift,
    description:
      "Detalles únicos para sorprender a esa persona especial.",
  },
  {
    nombre: "Personalizados",
    slug: "personalizados",
    icon: Heart,
    description:
      "Creamos piezas hechas especialmente para ti.",
  },
];

export default function Categories() {
  return (
    <section
      id="categorias"
      className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-700">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Explora Aurum
          </div>

          <h2 className="mt-4 font-serif text-4xl font-black tracking-tight text-purple-950 sm:text-5xl">
            Encuentra el detalle perfecto
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Descubre nuestras categorías y encuentra una opción
            especial para cada ocasión, celebración y persona.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.slug}
                href={`/productos?categoria=${category.slug}`}
                className="group rounded-3xl border border-purple-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-800 transition group-hover:bg-purple-900 group-hover:text-amber-300">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mt-5 font-serif text-xl font-black text-purple-950">
                  {category.nombre}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>

                <span className="mt-5 inline-block text-xs font-black uppercase tracking-wider text-purple-700">
                  Ver categoría
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}