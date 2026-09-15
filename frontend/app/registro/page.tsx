"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";

import GoogleAuthButton from "../components/auth/GoogleAuthButton";

type RegisterResponse = {
  token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    role: string;
  };
};

type ErrorResponse = {
  message?: string;
  error?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [documento, setDocumento] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] =
    useState(false);
  const [acceptedDataPolicy, setAcceptedDataPolicy] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] =
    useState(false);

  function saveSession(data: RegisterResponse) {
    localStorage.setItem("aurum_token", data.token);

    localStorage.setItem(
      "aurum_user",
      JSON.stringify(data.user),
    );

    router.push("/");
    router.refresh();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (
      !acceptedTerms ||
      !acceptedPrivacy ||
      !acceptedDataPolicy
    ) {
      setError(
        "Debes aceptar los términos, la política de privacidad y la política de tratamiento de datos.",
      );
      return;
    }

    setLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            apellido,
            email,
            telefono,
            documento,
            password,
            acceptedTerms,
            acceptedPrivacy,
            acceptedDataPolicy,
          }),
        },
      );

      if (!response.ok) {
        let errorData: ErrorResponse = {};

        try {
          errorData = await response.json();
        } catch {
          // El backend puede responder sin JSON.
        }

        if (response.status === 409) {
          setError(
            errorData.message ??
              errorData.error ??
              "Ya existe una cuenta con estos datos.",
          );
          return;
        }

        if (response.status === 429) {
          setError(
            "Has realizado demasiados intentos. Espera unos minutos e inténtalo nuevamente.",
          );
          return;
        }

        setError(
          errorData.message ??
            errorData.error ??
            "No fue posible crear la cuenta.",
        );
        return;
      }

      const data: RegisterResponse =
        await response.json();

      saveSession(data);
    } catch {
      setError(
        "No fue posible crear la cuenta en este momento.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(
    credential: string,
  ) {
    setError("");
    setGoogleLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential,
            acceptedTerms,
            acceptedPrivacy,
            acceptedDataPolicy,
          }),
        },
      );

      if (!response.ok) {
        let errorData: ErrorResponse = {};

        try {
          errorData = await response.json();
        } catch {
          // El backend puede responder sin JSON.
        }

        if (response.status === 400) {
          if (
            !acceptedTerms ||
            !acceptedPrivacy ||
            !acceptedDataPolicy
          ) {
            setError(
              "Si es tu primera vez en AURUM, acepta los términos, la política de privacidad y la política de tratamiento de datos antes de continuar con Google.",
            );
            return;
          }

          setError(
            errorData.message ??
              errorData.error ??
              "Google no pudo validar los datos de registro.",
          );
          return;
        }

        if (response.status === 403) {
          setError(
            errorData.message ??
              errorData.error ??
              "Tu cuenta no tiene permitido acceder con Google.",
          );
          return;
        }

        if (response.status === 409) {
          setError(
            errorData.message ??
              errorData.error ??
              "Este correo ya está vinculado a otra cuenta de Google.",
          );
          return;
        }

        if (response.status === 429) {
          setError(
            "Has realizado demasiados intentos. Espera unos minutos e inténtalo nuevamente.",
          );
          return;
        }

        setError(
          errorData.message ??
            errorData.error ??
            "No fue posible continuar con Google.",
        );
        return;
      }

      const data: RegisterResponse =
        await response.json();

      saveSession(data);
    } catch {
      setError(
        "No fue posible conectar con Google en este momento.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  const disabled = loading || googleLoading;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-slate-950 px-4 py-6">
      {/* Fondo */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-black/15 backdrop-blur-sm" />

      <section className="relative z-10 w-full max-w-[760px] overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-2xl shadow-black/30">
        {/* Cabecera */}
        <header className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-950 px-6 py-5 text-white sm:px-8">
          <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl" />

          <Link
            href="/"
            aria-label="Cerrar"
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-purple-100 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Link>

          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-purple-950 shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>

              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-300">
                Aurum Decoraciones
              </span>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-black tracking-tight sm:text-[2.25rem]">
              Crear Cuenta
            </h1>

            <p className="mt-1.5 text-xs leading-5 text-purple-100 sm:text-sm">
              Regístrate para guardar tus pedidos y
              personalizaciones.
            </p>
          </div>
        </header>

        <div className="px-6 py-5 sm:px-8">
          {/* Google */}
          <GoogleAuthButton
            mode="register"
            disabled={disabled}
            onCredential={handleGoogleCredential}
            onError={setError}
          />

          <p className="mt-2 text-center text-xs leading-5 text-slate-500">
            Si es tu primera vez en AURUM, acepta las
            políticas de registro que aparecen abajo antes
            de continuar con Google.
          </p>

          {googleLoading && (
            <p className="mt-2 text-center text-xs font-medium text-slate-500">
              Continuando con Google...
            </p>
          )}

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              O crea tu cuenta con correo
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Nombre
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="nombre"
                    type="text"
                    value={nombre}
                    onChange={(event) =>
                      setNombre(event.target.value)
                    }
                    required
                    disabled={disabled}
                    placeholder="Tu nombre"
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Apellido */}
              <div>
                <label
                  htmlFor="apellido"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Apellido
                </label>

                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="apellido"
                    type="text"
                    value={apellido}
                    onChange={(event) =>
                      setApellido(event.target.value)
                    }
                    required
                    disabled={disabled}
                    placeholder="Tu apellido"
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    disabled={disabled}
                    placeholder="ejemplo@correo.com"
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="telefono"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Teléfono
                </label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="telefono"
                    type="tel"
                    value={telefono}
                    onChange={(event) =>
                      setTelefono(event.target.value)
                    }
                    required
                    disabled={disabled}
                    placeholder="3001234567"
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Documento */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="documento"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Documento
                </label>

                <input
                  id="documento"
                  type="text"
                  value={documento}
                  onChange={(event) =>
                    setDocumento(event.target.value)
                  }
                  required
                  disabled={disabled}
                  placeholder="Número de documento"
                  className="w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Contraseña
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                    disabled={disabled}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    disabled={disabled}
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-700 disabled:opacity-60"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-bold text-slate-700"
                >
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    required
                    disabled={disabled}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                    disabled={disabled}
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-700 disabled:opacity-60"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Consentimientos */}
            <div className="space-y-2 rounded-xl border border-purple-100 bg-purple-50/60 p-4">
              <label className="flex items-start gap-3 text-xs leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(
                      event.target.checked,
                    )
                  }
                  disabled={disabled}
                  className="mt-1 h-4 w-4 accent-purple-700"
                />

                <span>
                  Acepto los términos y condiciones de
                  AURUM.
                </span>
              </label>

              <label className="flex items-start gap-3 text-xs leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(event) =>
                    setAcceptedPrivacy(
                      event.target.checked,
                    )
                  }
                  disabled={disabled}
                  className="mt-1 h-4 w-4 accent-purple-700"
                />

                <span>
                  Acepto la política de privacidad.
                </span>
              </label>

              <label className="flex items-start gap-3 text-xs leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptedDataPolicy}
                  onChange={(event) =>
                    setAcceptedDataPolicy(
                      event.target.checked,
                    )
                  }
                  disabled={disabled}
                  className="mt-1 h-4 w-4 accent-purple-700"
                />

                <span>
                  Autorizo el tratamiento de mis datos
                  personales.
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-xl bg-gradient-to-r from-purple-800 via-purple-700 to-purple-800 px-6 py-3 text-sm font-black text-amber-300 shadow-lg shadow-purple-200 transition duration-300 hover:-translate-y-0.5 hover:from-purple-900 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creando cuenta..."
                : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-4 rounded-xl bg-purple-50 px-5 py-2.5 text-center">
            <p className="text-xs text-slate-600">
              ¿Ya tienes una cuenta?
            </p>

            <Link
              href="/login"
              className="inline-block text-sm font-black text-purple-700 transition hover:text-purple-900"
            >
              Iniciar sesión
            </Link>
          </div>

          <Link
            href="/"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-5 py-2.5 text-sm font-bold text-purple-800 transition hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}