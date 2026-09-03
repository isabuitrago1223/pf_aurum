export default function Products() {
  return (
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
  );
}
