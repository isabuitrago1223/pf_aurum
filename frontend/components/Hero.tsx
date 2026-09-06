import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center"
    >
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#a2725e]">
          Momentos que se recuerdan
        </p>

        <h2 className="text-4xl font-bold leading-tight md:text-6xl">
          Detalles especiales para personas especiales
        </h2>

        <p className="mt-6 max-w-xl text-lg leading-8 text-[#6d625d]">
          Encuentra desayunos, anchetas, ramos y regalos pensados para
          celebrar cada ocasión.
        </p>

        <Link
          href="/productos"
          className="mt-8 inline-block rounded-full bg-[#2f2a27] px-7 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Ver productos
        </Link>
      </div>

      <div className="flex min-h-[350px] items-center justify-center rounded-3xl bg-[#eadfd8] p-10 text-center">
        <p className="max-w-xs text-lg text-[#7a6f69]">
          Aquí irá la imagen principal de Aurum.
        </p>
      </div>
    </section>
  );
}