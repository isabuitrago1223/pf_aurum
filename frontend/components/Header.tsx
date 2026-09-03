import Link from "next/link";

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
          <Link href="/" className="hover:opacity-70">
            Inicio
          </Link>

          <Link href="/#categorias" className="hover:opacity-70">
            Categorías
          </Link>

          <Link href="/productos" className="hover:opacity-70">
            Productos
          </Link>

          <Link
            href="/login"
            className="font-semibold text-[#a2725e] hover:opacity-70"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}