export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#2f2a27]">

      {/* ENCABEZADO */}
      <header className="border-b border-[#eadfd8] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              Aurum
            </h1>

            <p className="text-sm text-[#7a6f69]">
              Decoraciones y detalles
            </p>
          </div>

          <nav className="flex gap-6 text-sm font-medium">
            <a href="#inicio" className="hover:opacity-70">
              Inicio
            </a>

            <a href="#categorias" className="hover:opacity-70">
              Categorías
            </a>

            <a href="#productos" className="hover:opacity-70">
              Productos
            </a>
          </nav>
        </div>
      </header>

      {/* SECCIÓN PRINCIPAL */}
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

          <a
            href="#productos"
            className="mt-8 inline-block rounded-full bg-[#2f2a27] px-7 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Ver productos
          </a>
        </div>

        <div className="flex min-h-[350px] items-center justify-center rounded-3xl bg-[#eadfd8] p-10 text-center">
          <p className="max-w-xs text-lg text-[#7a6f69]">
            Aquí irá la imagen principal de Aurum.
          </p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section id="categorias" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">

          <h2 className="text-center text-3xl font-bold">
            Nuestras categorías
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {["Anchetas", "Desayunos", "Ramos", "Regalos"].map(
              (categoria) => (
                <article
                  key={categoria}
                  className="rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-8 text-center"
                >
                  <div className="mb-5 h-32 rounded-xl bg-[#eadfd8]" />

                  <h3 className="text-xl font-semibold">
                    {categoria}
                  </h3>
                </article>
              )
            )}

          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section id="productos" className="py-16">
        <div className="mx-auto max-w-6xl px-6">

          <h2 className="text-center text-3xl font-bold">
            Productos destacados
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((producto) => (
              <article
                key={producto}
                className="overflow-hidden rounded-2xl border border-[#eadfd8] bg-white"
              >
                <div className="h-56 bg-[#eadfd8]" />

                <div className="p-6">
                  <p className="text-sm text-[#a2725e]">
                    Aurum
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Producto destacado {producto}
                  </h3>

                  <p className="mt-3 font-bold">
                    $50.000
                  </p>
                </div>
              </article>
            ))}

          </div>
        </div>
      </section>

      {/* PIE DE PÁGINA */}
      <footer className="border-t border-[#eadfd8] bg-white py-8 text-center text-sm text-[#7a6f69]">
        © 2026 Aurum Decoraciones
      </footer>

    </main>
  );
}