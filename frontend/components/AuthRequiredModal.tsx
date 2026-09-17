"use client";

import Link from "next/link";
import {
  LockKeyhole,
  LogIn,
  UserPlus,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import { createPortal } from "react-dom";
import {
  useEffect,
  useState,
} from "react";

type AuthRequiredModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthRequiredModal({
  open,
  onClose,
}: AuthRequiredModalProps) {
  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [open, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-purple-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 16,
              scale: 0.97,
            }}
            transition={{
              duration: 0.18,
            }}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-purple-100 bg-white shadow-2xl"
          >
            {/* CABECERA */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-950 px-6 py-7 text-center text-white">
              <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-purple-400/20 blur-3xl" />

              {/* X */}
              <button
                type="button"
                aria-label="Cerrar"
                onMouseDown={(event) =>
                  event.stopPropagation()
                }
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onClose();
                }}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-purple-100 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/50 bg-white/10 text-amber-300">
                  <LockKeyhole className="h-8 w-8" />
                </div>

                <h2 className="mt-4 font-serif text-2xl font-black">
                  Acceso requerido
                </h2>

                <p className="mt-1 text-sm text-purple-100">
                  Aurum Decoraciones
                </p>
              </div>
            </div>

            {/* CONTENIDO */}
            <div className="px-6 py-7 sm:px-8">
              <p className="mx-auto max-w-md text-center text-base font-semibold leading-7 text-slate-700">
                Para agregar productos al
                carrito o personalizarlos,
                debes iniciar sesión o crear
                una cuenta.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-900 px-5 py-3.5 text-sm font-black text-white transition hover:bg-purple-800"
                >
                  <LogIn className="h-4 w-4 text-amber-300" />
                  Iniciar sesión
                </Link>

                <Link
                  href="/registro"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3.5 text-sm font-black text-purple-900 transition hover:bg-purple-100"
                >
                  <UserPlus className="h-4 w-4" />
                  Crear cuenta
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}