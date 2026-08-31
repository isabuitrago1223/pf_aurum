export default function Header() {
  return (
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
  );
}