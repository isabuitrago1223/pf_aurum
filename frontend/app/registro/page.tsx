"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
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
  const googleSectionRef = useRef<HTMLDivElement>(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cedula, setCedula] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [barrio, setBarrio] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedDataPolicy, setAcceptedDataPolicy] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const allPoliciesAccepted =
    acceptedTerms && acceptedPrivacy && acceptedDataPolicy;

  function isEmailRegistrationEmpty() {
    return (
      !nombre.trim() &&
      !apellido.trim() &&
      !email.trim() &&
      !telefono.trim() &&
      !cedula.trim() &&
      !fechaNacimiento &&
      !direccion.trim() &&
      !barrio.trim() &&
      !ciudad.trim() &&
      !departamento.trim() &&
      !password &&
      !confirmPassword
    );
  }

  function goToGoogleIfAppropriate(
    nextTerms: boolean,
    nextPrivacy: boolean,
    nextDataPolicy: boolean,
  ) {
    const allAccepted =
      nextTerms && nextPrivacy && nextDataPolicy;

    if (!allAccepted || !isEmailRegistrationEmpty()) {
      return;
    }

    setError("");

    window.setTimeout(() => {
      googleSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  function handleTermsChange(checked: boolean) {
    setAcceptedTerms(checked);

    goToGoogleIfAppropriate(
      checked,
      acceptedPrivacy,
      acceptedDataPolicy,
    );
  }

  function handlePrivacyChange(checked: boolean) {
    setAcceptedPrivacy(checked);

    goToGoogleIfAppropriate(
      acceptedTerms,
      checked,
      acceptedDataPolicy,
    );
  }

  function handleDataPolicyChange(checked: boolean) {
    setAcceptedDataPolicy(checked);

    goToGoogleIfAppropriate(
      acceptedTerms,
      acceptedPrivacy,
      checked,
    );
  }

  function saveSession(data: RegisterResponse) {
    localStorage.setItem("aurum_token", data.token);
    localStorage.setItem(
      "aurum_user",
      JSON.stringify(data.user),
    );

    router.push("/");
    router.refresh();
  }

  function validatePassword(value: string) {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[^A-Za-z0-9]/.test(value)
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    const cleanNombre = nombre.trim();
    const cleanApellido = apellido.trim();
    const cleanEmail = email.trim();
    const cleanTelefono = telefono.trim();
    const cleanCedula = cedula.trim();
    const cleanDireccion = direccion.trim();
    const cleanBarrio = barrio.trim();
    const cleanCiudad = ciudad.trim();
    const cleanDepartamento = departamento.trim();

    if (!cleanNombre || !cleanApellido) {
      setError(
        "Completa tu nombre y apellido para crear la cuenta con correo.",
      );
      return;
    }

    if (
      cleanNombre.length < 2 ||
      cleanApellido.length < 2
    ) {
      setError(
        "El nombre y el apellido deben tener al menos 2 caracteres.",
      );
      return;
    }

    if (!cleanCedula) {
      setError(
        "Ingresa tu cédula para crear la cuenta con correo.",
      );
      return;
    }

    if (!/^\d{6,15}$/.test(cleanCedula)) {
      setError(
        "La cédula debe contener únicamente entre 6 y 15 números.",
      );
      return;
    }

    if (!fechaNacimiento) {
      setError(
        "Selecciona tu fecha de nacimiento para continuar.",
      );
      return;
    }

    if (!cleanEmail) {
      setError(
        "Ingresa tu correo electrónico para crear la cuenta.",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!cleanTelefono) {
      setError(
        "Ingresa tu número de teléfono para continuar.",
      );
      return;
    }

    if (!/^\+?[0-9\s-]{7,20}$/.test(cleanTelefono)) {
      setError("Ingresa un número de teléfono válido.");
      return;
    }

    if (!cleanDireccion) {
      setError(
        "Ingresa tu dirección para crear la cuenta con correo.",
      );
      return;
    }

    if (cleanDireccion.length < 5) {
      setError(
        "La dirección debe tener al menos 5 caracteres.",
      );
      return;
    }

    if (
      !cleanBarrio ||
      !cleanCiudad ||
      !cleanDepartamento
    ) {
      setError(
        "Completa barrio, ciudad y departamento para continuar.",
      );
      return;
    }

    if (
      cleanBarrio.length < 2 ||
      cleanCiudad.length < 2 ||
      cleanDepartamento.length < 2
    ) {
      setError(
        "Completa correctamente barrio, ciudad y departamento.",
      );
      return;
    }

    if (!password) {
      setError(
        "Crea una contraseña para registrar tu cuenta.",
      );
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "La contraseña debe tener mínimo 8 caracteres e incluir mayúscula, minúscula, número y símbolo.",
      );
      return;
    }

    if (!confirmPassword) {
      setError("Confirma tu contraseña para continuar.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!allPoliciesAccepted) {
      setError(
        "Acepta los términos, la política de privacidad y la política de tratamiento de datos para crear tu cuenta.",
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
            nombre: cleanNombre,
            apellido: cleanApellido,
            cedula: cleanCedula,
            telefono: cleanTelefono,
            direccion: cleanDireccion,
            barrio: cleanBarrio,
            ciudad: cleanCiudad,
            departamento: cleanDepartamento,
            fechaNacimiento,
            email: cleanEmail,
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

        if (response.status === 400) {
          setError(
            errorData.message ??
              errorData.error ??
              "Revisa los datos ingresados e inténtalo nuevamente.",
          );
          return;
        }

        if (response.status === 409) {
          setError(
            errorData.message ??
              errorData.error ??
              "El correo o la cédula ya están registrados.",
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
        "No fue posible conectar con AURUM. Verifica tu conexión e inténtalo nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(
    credential: string,
  ) {
    setError("");

    if (!allPoliciesAccepted) {
      setError(
        "Antes de continuar con Google, acepta las tres políticas de registro.",
      );
      return;
    }

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

  const inputClass =
    "w-full rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60";

  const iconInputClass =
    "w-full rounded-xl border border-purple-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:opacity-60";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-slate-950 px-4 py-8">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-black/15 backdrop-blur-sm" />

      <section className="relative z-10 mx-auto w-full max-w-[820px] overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-2xl shadow-black/30">
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
              Crear cuenta
            </h1>

            <p className="mt-1.5 text-xs leading-5 text-purple-100 sm:text-sm">
              Regístrate para guardar tus pedidos y
              personalizaciones.
            </p>
          </div>
        </header>

        <div className="px-6 py-6 sm:px-8">
          <div
            ref={googleSectionRef}
            className={
              allPoliciesAccepted
                ? "scroll-mt-8 rounded-2xl border border-purple-300 bg-purple-50/70 p-4 shadow-sm transition"
                : "scroll-mt-8"
            }
          >
            <GoogleAuthButton
              mode="register"
              disabled={disabled}
              onCredential={handleGoogleCredential}
              onError={setError}
            />

            {allPoliciesAccepted ? (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-purple-200 bg-white px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-purple-700" />

                <p className="text-xs font-bold leading-5 text-purple-800 sm:text-sm">
                  ¡Listo! Ya aceptaste las políticas.
                  Continúa con Google.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-purple-700" />

                <p className="text-xs font-semibold leading-5 text-purple-800 sm:text-sm">
                  ¿Es tu primera vez en AURUM? Acepta las
                  tres políticas de registro que aparecen
                  más abajo antes de continuar con Google.
                </p>
              </div>
            )}

            {googleLoading && (
              <p className="mt-2 text-center text-xs font-medium text-purple-700">
                Continuando con Google...
              </p>
            )}
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              O crea tu cuenta con correo
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <h2 className="text-sm font-black text-purple-900">
                Información personal
              </h2>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
                      autoComplete="given-name"
                      value={nombre}
                      onChange={(event) =>
                        setNombre(event.target.value)
                      }
                      minLength={2}
                      maxLength={80}
                      disabled={disabled}
                      placeholder="Tu nombre"
                      className={iconInputClass}
                    />
                  </div>
                </div>

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
                      autoComplete="family-name"
                      value={apellido}
                      onChange={(event) =>
                        setApellido(event.target.value)
                      }
                      minLength={2}
                      maxLength={80}
                      disabled={disabled}
                      placeholder="Tu apellido"
                      className={iconInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cedula"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    Cédula
                  </label>

                  <input
                    id="cedula"
                    type="text"
                    inputMode="numeric"
                    value={cedula}
                    onChange={(event) =>
                      setCedula(
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    minLength={6}
                    maxLength={15}
                    disabled={disabled}
                    placeholder="Número de cédula"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="fechaNacimiento"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    Fecha de nacimiento
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                    <input
                      id="fechaNacimiento"
                      type="date"
                      value={fechaNacimiento}
                      onChange={(event) =>
                        setFechaNacimiento(
                          event.target.value,
                        )
                      }
                      disabled={disabled}
                      className={iconInputClass}
                    />
                  </div>
                </div>

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
                      maxLength={120}
                      disabled={disabled}
                      placeholder="ejemplo@correo.com"
                      className={iconInputClass}
                    />
                  </div>
                </div>

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
                      autoComplete="tel"
                      value={telefono}
                      onChange={(event) =>
                        setTelefono(event.target.value)
                      }
                      minLength={7}
                      maxLength={20}
                      disabled={disabled}
                      placeholder="3001234567"
                      className={iconInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-purple-100 pt-5">
              <h2 className="text-sm font-black text-purple-900">
                Dirección
              </h2>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="direccion"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    Dirección
                  </label>

                  <div className="relative">
                    <Home className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                    <input
                      id="direccion"
                      type="text"
                      autoComplete="street-address"
                      value={direccion}
                      onChange={(event) =>
                        setDireccion(event.target.value)
                      }
                      minLength={5}
                      maxLength={160}
                      disabled={disabled}
                      placeholder="Ej. Calle 10 # 20-30"
                      className={iconInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="barrio"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    Barrio
                  </label>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                    <input
                      id="barrio"
                      type="text"
                      value={barrio}
                      onChange={(event) =>
                        setBarrio(event.target.value)
                      }
                      minLength={2}
                      maxLength={80}
                      disabled={disabled}
                      placeholder="Tu barrio"
                      className={iconInputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ciudad"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    Ciudad
                  </label>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                    <input
                      id="ciudad"
                      type="text"
                      autoComplete="address-level2"
                      value={ciudad}
                      onChange={(event) =>
                        setCiudad(event.target.value)
                      }
                      minLength={2}
                      maxLength={80}
                      disabled={disabled}
                      placeholder="Ej. Bello"
                      className={iconInputClass}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="departamento"
                    className="mb-1.5 block text-sm font-bold text-slate-700"
                  >
                    Departamento
                  </label>

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />

                    <input
                      id="departamento"
                      type="text"
                      autoComplete="address-level1"
                      value={departamento}
                      onChange={(event) =>
                        setDepartamento(
                          event.target.value,
                        )
                      }
                      minLength={2}
                      maxLength={80}
                      disabled={disabled}
                      placeholder="Ej. Antioquia"
                      className={iconInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-purple-100 pt-5">
              <h2 className="text-sm font-black text-purple-900">
                Seguridad
              </h2>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
                      minLength={8}
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
                      minLength={8}
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

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Usa mínimo 8 caracteres e incluye una
                mayúscula, una minúscula, un número y un
                símbolo.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-purple-200 bg-purple-50/70 p-4">
              <p className="mb-2 text-xs font-bold text-purple-900">
                Políticas necesarias para crear tu cuenta
              </p>

              <label className="flex items-start gap-3 text-xs leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    handleTermsChange(
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
                    handlePrivacyChange(
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
                    handleDataPolicyChange(
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
              <div
                role="alert"
                className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-800"
              >
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