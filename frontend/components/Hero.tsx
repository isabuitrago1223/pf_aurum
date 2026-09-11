"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  MessageSquare,
  Palette,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-purple-800/50 bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950 text-white shadow-2xl">
        {/* Decoración de fondo */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-12 -left-12 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Contenido principal */}
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:px-12">
          {/* Texto */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-300" />

              <span>
                Aurum Decoraciones • Detalles con Amor
              </span>
            </div>

            <h1 className="font-serif text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              &quot;Creamos momentos{" "}
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                inolvidables
              </span>{" "}
              en cada detalle.&quot;
            </h1>

            <p className="mx-auto max-w-xl text-sm font-light leading-relaxed text-purple-200 sm:text-base lg:mx-0">
              Sorprende a quien más amas con desayunos hechos al
              instante, anchetas gourmet seleccionadas, ramos
              florales de lavanda y regalos 100% personalizados con
              entrega garantizada.
            </p>

            {/* Botones */}
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
              <Link
                href="/productos"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-8 py-4 text-sm font-black text-purple-950 shadow-xl transition-all hover:from-amber-300 hover:to-amber-500 sm:w-auto"
              >
                <span>Comprar ahora</span>

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/productos"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-700/60 bg-purple-900/60 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-purple-800/80 sm:w-auto"
              >
                <span>Ver catálogo</span>
              </Link>
            </div>
          </div>

          {/* Imagen */}
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="group relative overflow-hidden rounded-3xl border-2 border-amber-400/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000&auto=format&fit=crop"
                alt="Desayuno Sorpresa Aurum Decoraciones"
                className="h-96 w-full object-cover transition-transform duration-700 group-hover:scale-105 lg:h-[460px]"
              />

              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-purple-950/80 via-transparent to-transparent p-6">
                <div className="w-full rounded-2xl border border-purple-100 bg-white/95 p-4 text-purple-950 shadow-lg backdrop-blur-md">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                        Favorito de Temporada
                      </span>

                      <h3 className="font-serif text-sm font-bold text-slate-900">
                        Desayuno Sorpresa Aurum Deluxe
                      </h3>
                    </div>

                    <span className="shrink-0 font-serif text-base font-black text-purple-900">
                      $145.000 COP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="grid grid-cols-2 gap-6 border-t border-purple-800/50 bg-purple-950/80 px-6 py-6 text-center lg:grid-cols-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
              <CalendarCheck className="h-5 w-5" />
            </div>

            <span className="text-xs font-bold text-white">
              Entregas programadas
            </span>

            <span className="text-[11px] text-purple-200">
              Eliges día y hora exacta
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
              <Palette className="h-5 w-5" />
            </div>

            <span className="text-xs font-bold text-white">
              Productos personalizados
            </span>

            <span className="text-[11px] text-purple-200">
              Colores, globos y frutas
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
              <MessageSquare className="h-5 w-5" />
            </div>

            <span className="text-xs font-bold text-white">
              Atención por WhatsApp
            </span>

            <span className="text-[11px] text-purple-200">
              Asesoría inmediata 24/7
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <span className="text-xs font-bold text-white">
              Pago seguro
            </span>

            <span className="text-[11px] text-purple-200">
              PSE, Nequi & Daviplata
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
