import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#2f2a27]">
      {/* ENCABEZADO */}
      <Header />

      {/* SECCIÓN PRINCIPAL */}
      <Hero />

      {/* CATEGORÍAS */}
      <Categories />

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