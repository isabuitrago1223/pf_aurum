const categorias = ["Anchetas", "Desayunos", "Ramos", "Regalos"];

export default function Categories() {
  return (
    <section id="categorias" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold">
          Nuestras categorías
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((categoria) => (
            <article
              key={categoria}
              className="rounded-2xl border border-[#eadfd8] bg-[#fffaf7] p-8 text-center"
            >
              <div className="mb-5 h-32 rounded-xl bg-[#eadfd8]" />

              <h3 className="text-xl font-semibold">
                {categoria}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}