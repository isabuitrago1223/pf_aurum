"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarHeart, Save } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewOccasionPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);

  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setNombre(value);

    if (!slugEdited) {
      setSlug(createSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(createSlug(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("aurum_token")
        : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    const cleanName = nombre.trim();
    const cleanSlug = slug.trim();
    const cleanDescription = descripcion.trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      setError("El nombre debe tener entre 2 y 80 caracteres.");
      return;
    }

    if (cleanSlug.length < 2 || cleanSlug.length > 100) {
      setError("El slug debe tener entre 2 y 100 caracteres.");
      return;
    }

    if (cleanDescription.length > 255) {
      setError("La descripción no puede superar los 255 caracteres.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/occasions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: cleanName,
          slug: cleanSlug,
          descripcion: cleanDescription || undefined,
          activo,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("aurum_token");
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "No tienes permisos de administrador para crear ocasiones.",
        );
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            data?.message ??
              data?.error ??
              "Ya existe una ocasión con ese nombre o slug.",
          );
        }

        throw new Error(
          data?.message ??
            data?.error ??
            "No fue posible crear la ocasión.",
        );
      }

      router.push("/admin/ocasiones");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al crear la ocasión.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-purple-900/20 bg-purple-950 text-white">
        <div className="mx-auto max-w-5xl px-5 py-5 sm:px-6">
          <Link
            href="/admin/ocasiones"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a ocasiones
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <CalendarHeart className="h-5 w-5 text-amber-300" />
            </div>

            <div>
              <p className="text-sm font-medium text-purple-200">
                Panel administrativo
              </p>
              <h1 className="text-2xl font-semibold">Nueva ocasión</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-purple-100 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              Información de la ocasión
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Crea una ocasión para clasificar los productos de AURUM.
            </p>
          </div>

          <div className="space-y-5 px-5 py-6 sm:px-6">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre *
                </span>

                <input
                  type="text"
                  value={nombre}
                  onChange={(event) =>
                    handleNameChange(event.target.value)
                  }
                  minLength={2}
                  maxLength={80}
                  required
                  placeholder="Ej. Cumpleaños"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Entre 2 y 80 caracteres.
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Slug *
                </span>

                <input
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    handleSlugChange(event.target.value)
                  }
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="cumpleanos"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Se genera automáticamente a partir del nombre, pero puedes
                  editarlo.
                </p>
              </label>
            </div>

            <label className="block">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">
                  Descripción
                </span>

                <span className="text-xs text-slate-400">
                  {descripcion.length}/255
                </span>
              </div>

              <textarea
                value={descripcion}
                onChange={(event) =>
                  setDescripcion(event.target.value)
                }
                maxLength={255}
                rows={5}
                placeholder="Describe brevemente esta ocasión..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Campo opcional. Máximo 255 caracteres.
              </p>
            </label>

            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(event) => setActivo(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-800 focus:ring-purple-500"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Ocasión activa
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Las ocasiones activas pueden mostrarse y utilizarse en el
                    catálogo.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Link
              href="/admin/ocasiones"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Crear ocasión"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}