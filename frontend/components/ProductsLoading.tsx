export default function ProductsLoading() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold">
          Productos destacados
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-[#eadfd8] bg-white"
            >
              <div className="h-56 animate-pulse bg-[#eadfd8]" />

              <div className="p-6">
                <div className="h-4 w-24 animate-pulse rounded bg-[#eadfd8]" />

                <div className="mt-4 h-6 w-full animate-pulse rounded bg-[#eadfd8]" />

                <div className="mt-4 h-5 w-28 animate-pulse rounded bg-[#eadfd8]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}