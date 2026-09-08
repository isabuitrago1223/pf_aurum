import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2f123f] via-[#4b1f63] to-[#6b2a83] shadow-xl">
        <div className="grid min-h-[520px] items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:px-14 lg:py-16">
          {/* Contenido */}
          <div className="relative z-10">
            <span className="inline-flex rounded-full border border-[#d9b45b]/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#f4d783] backdrop-blur">
              Detalles hechos para emocionar
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Creamos momentos inolvidables en cada detalle
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#eee5f2] sm:text-lg">
              Sorprende a quienes más quieres con desayunos, anchetas,
              ramos, regalos y detalles personalizados para cada ocasión.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/productos"
                className="rounded-full bg-[#d6a83a] px-7 py-3.5 text-sm font-bold text-[#2f123f] transition hover:-translate-y-0.5 hover:bg-[#e0bb5b]"
              >
                Ver productos
              </Link>

              <Link
                href="/#categorias"
                className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explorar categorías
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-[#e8dff0]">
              <div className="flex items-center gap-2">
                <span className="text-[#f0c85b]">✓</span>
                Entregas con amor
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#f0c85b]">✓</span>
                Personalización especial
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#f0c85b]">✓</span>
                Detalles únicos
              </div>
            </div>
          </div>

          {/* Espacio visual */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#d6a83a]/20 blur-3xl" />
            <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

            <div className="relative w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-sm">
              <div className="flex min-h-[360px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 text-center">
                <div>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#d6a83a] text-3xl font-bold text-[#3b174d] shadow-lg">
                    A
                  </div>

                  <p className="mt-6 text-xl font-semibold text-white">
                    Aurum Decoraciones
                  </p>

                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#e8dff0]">
                    Aquí mostraremos una imagen destacada real del catálogo
                    cuando los productos estén vinculados correctamente con
                    Cloudinary.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}