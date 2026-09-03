"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StoredUser = {
  id: string;
  nombre: string;
  email: string;
  role: string;
};

export default function Header() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("aurum_user");

    if (!storedUser) {
      return;
    }

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

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:opacity-70">
            Inicio
          </Link>

          <Link href="/#categorias" className="hover:opacity-70">
            Categorías
          </Link>

          <Link href="/productos" className="hover:opacity-70">
            Productos
          </Link>

          {user ? (
            <>
              <span className="font-semibold text-[#a2725e]">
                Hola, {user.nombre}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="font-semibold hover:opacity-70"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
  <Link
    href="/registro"
    className="hover:opacity-70"
  >
    Crear cuenta
  </Link>

  <Link
    href="/login"
    className="font-semibold text-[#a2725e] hover:opacity-70"
  >
    Iniciar sesión
  </Link>
</>
          )}
        </nav>
      </div>
    </header>
  );
}