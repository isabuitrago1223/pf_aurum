"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

type StoredUser = {
  id: string;
  nombre: string;
  email: string;
  role: string;
};

export default function Header() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const storedUser = localStorage.getItem("aurum_user");

    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("aurum_user");
      localStorage.removeItem("aurum_token");
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("aurum_token");
    localStorage.removeItem("aurum_user");

    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Barra superior */}
      <div className="bg-[#4b1f63] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        ✨ Detalles que convierten momentos especiales en recuerdos inolvidables
      </div>

      {/* Encabezado principal */}
      <div className="border-b border-[#eee7f1] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#5d2875] to-[#32113f] text-xl font-bold text-[#e7bd5b] shadow-sm">
              A
            </div>

            <div className="leading-none">
              <p className="text-2xl font-bold tracking-[0.08em] text-[#4b1f63]">
                AURUM
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-[#a67c2d]">
                Decoraciones
              </p>
            </div>
          </Link>

          {/* Buscador escritorio */}
          <form
            action="/productos"
            className="hidden w-full max-w-xl items-center rounded-full border border-[#ded2e4] bg-[#faf7fb] px-5 lg:flex"
          >
            <input
              type="search"
              name="buscar"
              placeholder="¿Qué detalle estás buscando?"
              className="w-full bg-transparent py-3 text-sm text-[#392b3e] outline-none placeholder:text-[#94879a]"
            />

            <button
              type="submit"
              aria-label="Buscar"
              className="text-xl text-[#5d2875] transition hover:scale-110"
            >
              ⌕
            </button>
          </form>

          {/* Acciones escritorio */}
          <div className="hidden items-center gap-5 md:flex">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === "CLIENTE" && (
                  <Link
                    href="/pedidos"
                    className="text-sm font-medium text-[#55485a] transition hover:text-[#5d2875]"
                  >
                    Mis pedidos
                  </Link>
                )}

                <div className="text-right">
                  <p className="text-xs text-[#8a7c90]">Hola,</p>
                  <p className="max-w-28 truncate text-sm font-semibold text-[#4b1f63]">
                    {user.nombre}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-[#76687b] transition hover:text-[#4b1f63]"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#4b1f63] transition hover:opacity-70"
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/registro"
                  className="rounded-full border border-[#5d2875] px-4 py-2 text-sm font-semibold text-[#5d2875] transition hover:bg-[#5d2875] hover:text-white"
                >
                  Crear cuenta
                </Link>
              </div>
            )}

            <Link
              href="/carrito"
              aria-label={`Carrito con ${totalItems} productos`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#f5eef7] text-xl text-[#4b1f63] transition hover:bg-[#eadcef]"
            >
              🛒

              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d5a73b] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Botones móvil */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              aria-label="Abrir buscador"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5eef7] text-lg text-[#4b1f63]"
            >
              ⌕
            </button>

            <Link
              href="/carrito"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f5eef7]"
              aria-label="Carrito"
            >
              🛒

              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d5a73b] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Abrir menú"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4b1f63] text-xl text-white"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Buscador móvil */}
        {searchOpen && (
          <div className="border-t border-[#eee7f1] px-5 py-3 md:hidden">
            <form
              action="/productos"
              className="flex items-center rounded-full border border-[#ded2e4] bg-[#faf7fb] px-4"
            >
              <input
                type="search"
                name="buscar"
                placeholder="Buscar regalos..."
                className="w-full bg-transparent py-3 text-sm outline-none"
              />

              <button type="submit" aria-label="Buscar">
                ⌕
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav className="hidden border-b border-[#eee7f1] bg-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-6 py-3 text-sm font-semibold text-[#594b5e]">
          <Link href="/" className="transition hover:text-[#9a6a13]">
            Inicio
          </Link>

          <Link
            href="/#categorias"
            className="transition hover:text-[#9a6a13]"
          >
            Categorías
          </Link>

          <Link
            href="/productos"
            className="transition hover:text-[#9a6a13]"
          >
            Todos los productos
          </Link>

          <Link
            href="/productos"
            className="transition hover:text-[#9a6a13]"
          >
            Regalos
          </Link>

          <Link
            href="/productos"
            className="transition hover:text-[#9a6a13]"
          >
            Ocasiones especiales
          </Link>
        </div>
      </nav>

      {/* Menú móvil */}
      {menuOpen && (
        <nav className="border-b border-[#ded2e4] bg-white px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold text-[#55485a]">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Inicio
            </Link>

            <Link href="/#categorias" onClick={() => setMenuOpen(false)}>
              Categorías
            </Link>

            <Link href="/productos" onClick={() => setMenuOpen(false)}>
              Productos
            </Link>

            {user?.role === "CLIENTE" && (
              <Link href="/pedidos" onClick={() => setMenuOpen(false)}>
                Mis pedidos
              </Link>
            )}

            {!user && (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  Iniciar sesión
                </Link>

                <Link href="/registro" onClick={() => setMenuOpen(false)}>
                  Crear cuenta
                </Link>
              </>
            )}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-left text-[#5d2875]"
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}