"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  Gift,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";

import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

type StoredUser = {
  id: string;
  nombre: string;
  email: string;
  role: string;
};

type OccasionItem = {
  label: string;
  slug: string | null;
};

type CategoryMenu = {
  label: string;
  slug: string;
  title: string;
  occasions: OccasionItem[];
};

const categoryMenus: CategoryMenu[] = [
  {
    label: "Anchetas",
    slug: "anchetas",
    title: "Ocasiones especiales en anchetas",
    occasions: [
      {
        label: "Día de la Madre",
        slug: "dia-de-la-madre",
      },
      {
        label: "Día del Padre",
        slug: "dia-del-padre",
      },
      {
        label: "Cumpleaños",
        slug: "cumpleanos",
      },
      {
        label: "Amor y Amistad",
        slug: "amor-y-amistad",
      },
      {
        label: "Navidad",
        slug: null,
      },
      {
        label: "Empresas",
        slug: null,
      },
      {
        label: "Otros",
        slug: null,
      },
    ],
  },
  {
    label: "Desayunos",
    slug: "desayunos",
    title: "Ocasiones especiales en desayunos",
    occasions: [
      {
        label: "Cumpleaños",
        slug: "cumpleanos",
      },
      {
        label: "Aniversarios",
        slug: "aniversario",
      },
      {
        label: "Día de la Madre",
        slug: "dia-de-la-madre",
      },
      {
        label: "Día del Padre",
        slug: "dia-del-padre",
      },
      {
        label: "Amor y Amistad",
        slug: "amor-y-amistad",
      },
      {
        label: "Sorpresas",
        slug: null,
      },
      {
        label: "Otros",
        slug: null,
      },
    ],
  },
  {
    label: "Ramos",
    slug: "ramos",
    title: "Ocasiones especiales en ramos",
    occasions: [
      {
        label: "Cumpleaños",
        slug: "cumpleanos",
      },
      {
        label: "Aniversarios",
        slug: "aniversario",
      },
      {
        label: "Amor",
        slug: "san-valentin",
      },
      {
        label: "Día de la Madre",
        slug: "dia-de-la-madre",
      },
      {
        label: "Grados",
        slug: "graduacion",
      },
      {
        label: "Detalles especiales",
        slug: null,
      },
      {
        label: "Otros",
        slug: null,
      },
    ],
  },
  {
    label: "Regalos",
    slug: "regalos",
    title: "Ocasiones especiales en regalos",
    occasions: [
      {
        label: "Cumpleaños",
        slug: "cumpleanos",
      },
      {
        label: "Aniversarios",
        slug: "aniversario",
      },
      {
        label: "Amor y Amistad",
        slug: "amor-y-amistad",
      },
      {
        label: "Graduaciones",
        slug: "graduacion",
      },
      {
        label: "Navidad",
        slug: null,
      },
      {
        label: "Empresas",
        slug: null,
      },
      {
        label: "Otros",
        slug: null,
      },
    ],
  },
  {
    label: "Personalizados",
    slug: "personalizados",
    title: "Detalles personalizados",
    occasions: [
      {
        label: "Cumpleaños",
        slug: "cumpleanos",
      },
      {
        label: "Aniversarios",
        slug: "aniversario",
      },
      {
        label: "Parejas",
        slug: "san-valentin",
      },
      {
        label: "Familia",
        slug: null,
      },
      {
        label: "Amigos",
        slug: "amor-y-amistad",
      },
      {
        label: "Empresas",
        slug: null,
      },
      {
        label: "Otros",
        slug: null,
      },
    ],
  },
];

const popularSearches = [
  {
    label: "Desayunos",
    href: "/productos?categoria=desayunos",
  },
  {
    label: "Anchetas",
    href: "/productos?categoria=anchetas",
  },
  {
    label: "Ramos",
    href: "/productos?categoria=ramos",
  },
  {
    label: "Regalos",
    href: "/productos?categoria=regalos",
  },
  {
    label: "Personalizados",
    href: "/productos?categoria=personalizados",
  },
];

export default function Header() {
  const [user, setUser] =
    useState<StoredUser | null>(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [cartOpen, setCartOpen] =
    useState(false);

  const [
    activeCategoryMenu,
    setActiveCategoryMenu,
  ] = useState<string | null>(null);

  const { totalItems } = useCart();

  const userMenuRef =
    useRef<HTMLDivElement>(null);

  const categoryNavRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("aurum_user");

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

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      const target = event.target as Node;

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }

      if (
        categoryNavRef.current &&
        !categoryNavRef.current.contains(target)
      ) {
        setActiveCategoryMenu(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("aurum_token");
    localStorage.removeItem("aurum_user");

    setUser(null);
    setUserMenuOpen(false);

    window.location.href = "/";
  }

  function toggleCategoryMenu(
    slug: string,
  ) {
    setSearchOpen(false);
    setUserMenuOpen(false);

    setActiveCategoryMenu((current) =>
      current === slug ? null : slug,
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-purple-100 bg-white shadow-sm">
        {/* BARRA SUPERIOR */}
        <div className="bg-purple-950 px-4 py-1.5 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-purple-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />

            <span>
              Detalles inolvidables para celebrar momentos
              especiales
            </span>

            <span className="hidden font-bold text-amber-300 md:inline">
              • Aurum Decoraciones
            </span>
          </div>
        </div>

        {/* NAVBAR PRINCIPAL */}
        <div className="relative z-[70] bg-white">
          <div className="mx-auto flex h-[74px] max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
            {/* LOGO */}
            <Link
              href="/"
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-950 text-amber-300 shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <span className="block font-serif text-2xl font-black leading-none text-purple-950">
                  Aurum
                </span>

                <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.22em] text-purple-600">
                  Decoraciones
                </span>
              </div>
            </Link>

            {/* BUSCADOR */}
            <div className="relative z-[90] hidden flex-1 md:block">
              <div className="mx-auto max-w-2xl">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-500" />

                  <input
                    type="search"
                    placeholder="Buscar por producto, regalo, flores, ocasión..."
                    onFocus={() => {
                      setActiveCategoryMenu(null);
                      setUserMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    onBlur={() =>
                      window.setTimeout(
                        () => setSearchOpen(false),
                        180,
                      )
                    }
                    className="w-full rounded-full border border-purple-200 bg-[#fdfbfe] py-2.5 pl-11 pr-5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
                  />

                  <AnimatePresence>
                    {searchOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -5,
                        }}
                        transition={{
                          duration: 0.15,
                        }}
                        className="absolute left-0 right-0 top-[calc(100%+10px)] z-[100] rounded-2xl border border-purple-100 bg-white p-4 shadow-2xl"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="h-3.5 w-3.5 text-purple-500" />

                          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-purple-950">
                            Búsquedas populares
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {popularSearches.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() =>
                                setSearchOpen(false)
                              }
                              className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-800 transition hover:border-purple-300 hover:bg-purple-100"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {/* CARRITO */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-purple-100 bg-white text-purple-900 transition hover:border-purple-200 hover:bg-purple-50"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="h-5 w-5" />

                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-purple-950">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* USUARIO */}
              <div
                ref={userMenuRef}
                className="relative hidden sm:block"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategoryMenu(null);
                    setSearchOpen(false);

                    setUserMenuOpen(
                      (current) => !current,
                    );
                  }}
                  className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-white px-3 py-2 text-purple-950 shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-950 text-xs font-black uppercase text-amber-300">
                    {user
                      ? user.nombre
                          .trim()
                          .charAt(0)
                          .toUpperCase()
                      : "U"}
                  </div>

                  <div className="hidden text-left lg:block">
                    <p className="max-w-[110px] truncate text-xs font-black leading-none text-purple-950">
                      {user
                        ? user.nombre.split(" ")[0]
                        : "Usuario"}
                    </p>

                    <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-purple-400">
                      {user
                        ? "Mi cuenta"
                        : "Ingresar"}
                    </p>
                  </div>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-purple-500 transition-transform ${
                      userMenuOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -5,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.15,
                      }}
                      className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[250px] overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-2xl shadow-purple-950/10"
                    >
                      {user ? (
                        <>
                          {/* DATOS DEL USUARIO */}
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-950 text-sm font-black uppercase text-amber-300">
                                {user.nombre
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-black text-purple-950">
                                  {user.nombre}
                                </p>

                                <p className="mt-1 truncate text-[11px] text-slate-500">
                                  {user.email}
                                </p>

                                <span className="mt-2 inline-flex rounded-full bg-purple-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-purple-700">
                                  {user.role === "CLIENTE"
                                    ? "Cliente"
                                    : user.role}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* OPCIONES */}
                          <div className="border-t border-purple-50">
                            {user.role === "CLIENTE" && (
                              <Link
                                href="/pedidos"
                                onClick={() =>
                                  setUserMenuOpen(false)
                                }
                                className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-purple-50 hover:text-purple-950"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                                  <ShoppingBag className="h-4 w-4" />
                                </div>

                                <span>
                                  Mis pedidos
                                </span>
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 border-t border-purple-50 px-4 py-3 text-left text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                                <X className="h-4 w-4" />
                              </div>

                              <span>
                                Cerrar sesión
                              </span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-950 text-amber-300">
                                <User className="h-5 w-5" />
                              </div>

                              <div>
                                <p className="text-sm font-black text-purple-950">
                                  Mi cuenta
                                </p>

                                <p className="mt-1 text-[11px] text-slate-500">
                                  Ingresa para continuar
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-purple-50">
                            <Link
                              href="/login"
                              onClick={() =>
                                setUserMenuOpen(false)
                              }
                              className="block px-4 py-3 text-xs font-bold text-purple-950 transition hover:bg-purple-50"
                            >
                              Iniciar sesión
                            </Link>

                            <Link
                              href="/registro"
                              onClick={() =>
                                setUserMenuOpen(false)
                              }
                              className="block border-t border-purple-50 px-4 py-3 text-xs font-bold text-purple-950 transition hover:bg-purple-50"
                            >
                              Crear cuenta
                            </Link>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* BOTÓN MÓVIL */}
              <button
                type="button"
                onClick={() =>
                  setMobileOpen(
                    (current) => !current,
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-100 bg-white text-purple-900 sm:hidden"
                aria-label="Abrir menú"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN DE CATEGORÍAS */}
        <nav className="relative z-40 hidden border-t border-purple-50 bg-white md:block">
          <div
            ref={categoryNavRef}
            className="mx-auto flex h-[54px] max-w-7xl items-center justify-center gap-2 px-6"
          >
            <Link
              href="/productos"
              onClick={() =>
                setActiveCategoryMenu(null)
              }
              className="rounded-full bg-purple-900 px-5 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-purple-800"
            >
              Todos los productos
            </Link>

            {categoryMenus.map((category) => {
              const isOpen =
                activeCategoryMenu ===
                category.slug;

              return (
                <div
                  key={category.slug}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleCategoryMenu(
                        category.slug,
                      )
                    }
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold transition ${
                      isOpen
                        ? "bg-purple-900 text-white"
                        : "text-slate-700 hover:bg-purple-50 hover:text-purple-900"
                    }`}
                  >
                    {category.label}

                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -5,
                        }}
                        transition={{
                          duration: 0.15,
                        }}
                        className="absolute left-1/2 top-[calc(100%+9px)] z-[80] w-[420px] -translate-x-1/2 overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-2xl"
                      >
                        {/* CABECERA */}
                        <div className="flex items-center justify-between border-b border-purple-100 px-5 py-4">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-purple-950">
                              {category.title}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              Elige una ocasión especial
                            </p>
                          </div>

                          <Sparkles className="h-4 w-4 text-amber-500" />
                        </div>

                        {/* OCASIONES */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 p-4">
                          {category.occasions.map(
                            (occasion) => {
                              if (!occasion.slug) {
                                return (
                                  <div
                                    key={occasion.label}
                                    title="Próximamente"
                                    className="flex cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-400"
                                  >
                                    <Heart className="h-3.5 w-3.5 shrink-0 text-purple-200" />

                                    <span>
                                      {occasion.label}
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={occasion.label}
                                  href={`/productos?categoria=${category.slug}&ocasion=${occasion.slug}`}
                                  onClick={() =>
                                    setActiveCategoryMenu(
                                      null,
                                    )
                                  }
                                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-purple-50 hover:text-purple-900"
                                >
                                  <Heart className="h-3.5 w-3.5 shrink-0 text-purple-400" />

                                  <span>
                                    {occasion.label}
                                  </span>
                                </Link>
                              );
                            },
                          )}
                        </div>

                        {/* VER TODOS */}
                        <div className="border-t border-purple-50 bg-purple-50/50 p-3">
                          <Link
                            href={`/productos?categoria=${category.slug}`}
                            onClick={() =>
                              setActiveCategoryMenu(
                                null,
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-purple-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-purple-800"
                          >
                            <Gift className="h-4 w-4 text-amber-300" />

                            Ver todos en{" "}
                            {category.label}
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </nav>

        {/* MENÚ MÓVIL */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              className="overflow-hidden border-t border-purple-100 bg-white sm:hidden"
            >
              <nav className="space-y-2 px-5 py-5">
                <Link
                  href="/productos"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="block rounded-xl bg-purple-900 px-4 py-3 text-sm font-bold text-white"
                >
                  Todos los productos
                </Link>

                {categoryMenus.map(
                  (category) => (
                    <Link
                      key={category.slug}
                      href={`/productos?categoria=${category.slug}`}
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-purple-950 transition hover:bg-purple-50"
                    >
                      {category.label}

                      <ChevronDown className="h-4 w-4 -rotate-90 text-purple-400" />
                    </Link>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setCartOpen(true);
                  }}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-purple-950 hover:bg-purple-50"
                >
                  Carrito ({totalItems})
                </button>

                {user ? (
                  <>
                    <div className="rounded-xl bg-purple-50 px-4 py-3">
                      <p className="text-xs font-black text-purple-950">
                        {user.nombre}
                      </p>

                      <p className="mt-1 truncate text-[11px] text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    {user.role === "CLIENTE" && (
                      <Link
                        href="/pedidos"
                        onClick={() =>
                          setMobileOpen(false)
                        }
                        className="block rounded-xl px-4 py-3 text-sm font-bold text-purple-950 hover:bg-purple-50"
                      >
                        Mis pedidos
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="block rounded-xl px-4 py-3 text-sm font-bold text-purple-950 hover:bg-purple-50"
                    >
                      Iniciar sesión
                    </Link>

                    <Link
                      href="/registro"
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="block rounded-xl px-4 py-3 text-sm font-bold text-purple-950 hover:bg-purple-50"
                    >
                      Crear cuenta
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer
        open={cartOpen}
        onClose={() =>
          setCartOpen(false)
        }
      />
    </>
  );
}