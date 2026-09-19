"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FolderPlus,
  ImagePlus,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";

type UploadResponse = {
  image?: {
    url: string;
    publicId: string;
  };
  message?: string;
};

type CreateCategoryResponse = {
  message?: string;
  category?: {
    id: string;
    nombre: string;
    slug: string;
  };
};

type CategoryForm = {
  nombre: string;
  slug: string;
  descripcion: string;
  orden: string;
  activo: boolean;
};

const initialForm: CategoryForm = {
  nombre: "",
  slug: "",
  descripcion: "",
  orden: "0",
  activo: true,
};

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(data: unknown, fallback: string) {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export default function NewCategoryPage() {
  const router = useRouter();

  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedPublicId, setUploadedPublicId] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function updateField<K extends keyof CategoryForm>(
    field: K,
    value: CategoryForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    const nombre = event.target.value;

    setForm((current) => ({
      ...current,
      nombre,
      slug: createSlug(nombre),
    }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");
    setUploadedImageUrl("");
    setUploadedPublicId("");

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      setImageFile(null);
      setImagePreview("");
      setError("El archivo seleccionado debe ser una imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setImageFile(null);
      setImagePreview("");
      setError("La imagen no puede superar los 5 MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");
    setUploadedImageUrl("");
    setUploadedPublicId("");
  }

  async function uploadImage(authToken: string) {
    if (uploadedImageUrl) {
      return uploadedImageUrl;
    }

    if (!imageFile) {
      throw new Error("Selecciona una imagen para la categoría.");
    }

    setUploadingImage(true);

    try {
      const data = new FormData();
      data.append("image", imageFile);

      const response = await fetch(`${apiUrl}/api/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: data,
      });

      const responseData = (await response.json()) as UploadResponse;

      if (!response.ok || !responseData.image?.url) {
        throw new Error(
          responseData.message ?? "No fue posible subir la imagen.",
        );
      }

      setUploadedImageUrl(responseData.image.url);
      setUploadedPublicId(responseData.image.publicId);

      return responseData.image.url;
    } finally {
      setUploadingImage(false);
    }
  }

  function validateForm() {
    if (form.nombre.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres.";
    }

    if (form.slug.trim().length < 2) {
      return "El slug debe tener al menos 2 caracteres.";
    }

    if (!form.descripcion.trim()) {
      return "La descripción es obligatoria.";
    }

    const order = Number(form.orden);

    if (!Number.isInteger(order) || order < 0) {
      return "El orden debe ser un número entero igual o mayor que cero.";
    }

    if (!imageFile && !uploadedImageUrl) {
      return "Selecciona una imagen para la categoría.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const authToken = window.localStorage.getItem("aurum_token");

    if (!authToken) {
      setError(
        "Tu sesión no está disponible. Inicia sesión nuevamente como administrador.",
      );
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await uploadImage(authToken);

      const payload = {
        nombre: form.nombre.trim(),
        slug: form.slug.trim(),
        descripcion: form.descripcion.trim(),
        imagen: imageUrl,
        activo: form.activo,
        orden: Number(form.orden),
      };

      const response = await fetch(`${apiUrl}/api/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData =
        (await response.json()) as CreateCategoryResponse;

      if (response.status === 401 || response.status === 403) {
        window.localStorage.removeItem("aurum_token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            responseData,
            "No fue posible crear la categoría.",
          ),
        );
      }

      setSuccess(
        responseData.message ?? "Categoría creada correctamente.",
      );

      window.setTimeout(() => {
        router.push("/admin/categorias");
        router.refresh();
      }, 900);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error al crear la categoría.",
      );
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploadingImage;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-purple-900/20 bg-purple-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/categorias"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
              aria-label="Volver a categorías"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <FolderPlus className="h-6 w-6 text-amber-300" />
            </div>

            <div>
              <p className="text-sm font-semibold text-purple-200">
                Administración de catálogo
              </p>
              <h1 className="text-2xl font-black sm:text-3xl">
                Nueva categoría
              </h1>
            </div>
          </div>

          <Link
            href="/admin/categorias"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10"
          >
            Cancelar
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                Información de la categoría
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Define cómo se organizará esta categoría dentro del catálogo.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Nombre *
                </span>
                <input
                  value={form.nombre}
                  onChange={handleNameChange}
                  minLength={2}
                  maxLength={80}
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="Ej. Flores"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Orden *
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.orden}
                  onChange={(event) =>
                    updateField("orden", event.target.value)
                  }
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Las categorías se muestran de menor a mayor orden.
                </span>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Slug *
                </span>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", createSlug(event.target.value))
                  }
                  minLength={2}
                  maxLength={100}
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="flores"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Se genera automáticamente desde el nombre y puede ajustarse.
                </span>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Descripción *
                </span>
                <textarea
                  value={form.descripcion}
                  onChange={(event) =>
                    updateField("descripcion", event.target.value)
                  }
                  required
                  disabled={busy}
                  rows={5}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="Describe qué productos reúne esta categoría."
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                Imagen de la categoría
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                La imagen se subirá a Cloudinary al guardar la categoría.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-purple-200 bg-purple-50/40">
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Vista previa de la categoría"
                      className="h-64 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={busy}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/75 text-white transition hover:bg-slate-950 disabled:opacity-50"
                      aria-label="Quitar imagen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="px-6 text-center">
                    <ImagePlus className="mx-auto h-10 w-10 text-purple-400" />
                    <p className="mt-3 text-sm font-bold text-slate-700">
                      Sin imagen seleccionada
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Selecciona una imagen de máximo 5 MB.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Archivo de imagen *
                  </span>

                  <span className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-bold text-purple-800 transition hover:bg-purple-100">
                    <Upload className="h-4 w-4" />
                    {imageFile ? "Cambiar imagen" : "Seleccionar imagen"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={busy}
                      className="sr-only"
                    />
                  </span>

                  <span className="mt-2 block text-xs text-slate-500">
                    Formatos de imagen válidos. Tamaño máximo: 5 MB.
                  </span>
                </label>

                {imageFile && (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-bold text-slate-800">Archivo:</span>{" "}
                    {imageFile.name}
                  </div>
                )}

                {uploadedPublicId && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Imagen cargada correctamente.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-black text-slate-900">
                Estado
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Las categorías activas pueden mostrarse en el catálogo público.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) =>
                  updateField("activo", event.target.checked)
                }
                disabled={busy}
                className="mt-1 h-4 w-4 accent-purple-700"
              />
              <span>
                <span className="block text-sm font-black text-slate-800">
                  Categoría activa
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Déjala activa para que esté disponible en el catálogo.
                </span>
              </span>
            </label>
          </section>

          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
            <Link
              href="/admin/categorias"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-950 px-6 py-3 text-sm font-black text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadingImage ? "Subiendo imagen..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Crear categoría
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

