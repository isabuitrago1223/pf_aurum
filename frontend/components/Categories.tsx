import Link from "next/link";

const categorias = [
  {
    nombre: "Anchetas",
    descripcion: "Detalles llenos de sabores y sorpresas.",
    icono: "🎁",
    slug: "anchetas",
  },
  {
    nombre: "Desayunos",
    descripcion: "La forma más especial de comenzar el día.",
    icono: "☕",
    slug: "desayunos",
  },
  {
    nombre: "Ramos",
    descripcion: "Flores para expresar lo que llevas en el corazón.",
    icono: "💐",
    slug: "ramos",
  },
  {
    nombre: "Regalos",
    descripcion: "Detalles únicos para personas inolvidables.",
    icono: "✨",
    slug: "regalos",
  },
];

export default function Categories() {
  return (
    <section id="categorias" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#a67c2d]">
            Encuentra el detalle perfecto
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#351641] sm:text-4xl">
            Nuestras categorías
          </h2>

          <p className="mt-4 leading-7 text-[#746879]">
            Tenemos opciones especiales para celebrar cada momento y
            sorprender a las personas que más quieres.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((categoria) => (
            <Link
              key={categoria.slug}
              href={`/productos?categoria=${categoria.slug}`}
              className="group"
            >
              <article className="relative h-full overflow-hidden rounded-[1.75rem] border border-[#eadff0] bg-[#faf7fb] p-7 transition duration-300 hover:-translate-y-2 hover:border-[#d7b65c] hover:shadow-xl">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#5d2875]/5 transition group-hover:bg-[#d6a83a]/10" />

                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4b1f63] to-[#6b2a83] text-3xl shadow-md transition duration-300 group-hover:scale-105">
                    {categoria.icono}
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#351641]">
                    {categoria.nombre}
                  </h3>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#746879]">
                    {categoria.descripcion}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#9a6a13]">
                    Ver productos
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/productos"
            className="inline-flex rounded-full border border-[#5d2875] px-7 py-3 text-sm font-bold text-[#5d2875] transition hover:bg-[#5d2875] hover:text-white"
          >
            Ver todo el catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}