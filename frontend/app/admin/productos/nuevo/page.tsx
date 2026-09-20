"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  PackagePlus,
  Save,
  Upload,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type Category = {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
};

type Occasion = {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
};

type CategoriesResponse = {
  categories?: Category[];
  message?: string;
};

type OccasionsResponse = {
  occasions?: Occasion[];
  message?: string;
};

type UploadResponse = {
  image?: {
    url: string;
    publicId: string;
  };
  message?: string;
};

type CreateProductResponse = {
  message?: string;
  product?: {
    id: string;
    nombre: string;
    slug: string;
  };
};

type ProductForm = {
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  precioAnterior: string;
  costo: string;
  stock: string;
  stockMinimo: string;
  imagenAlt: string;
  tiempoEntrega: string;
  pesoGramos: string;
  categoryId: string;
  occasionId: string;
  permitirPersonalizacion: boolean;
  destacado: boolean;
  activo: boolean;
};

const initialForm: ProductForm = {
  sku: "",
  nombre: "",
  slug: "",
  descripcion: "",
  precio: "",
  precioAnterior: "",
  costo: "",
  stock: "0",
  stockMinimo: "0",
  imagenAlt: "",
  tiempoEntrega: "",
  pesoGramos: "",
  categoryId: "",
  occasionId: "",
  permitirPersonalizacion: false,
  destacado: false,
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

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<ProductForm>(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedPublicId, setUploadedPublicId] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === form.categoryId),
    [categories, form.categoryId],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const [categoriesResponse, occasionsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/categories`),
          fetch(`${apiUrl}/api/occasions`),
        ]);

        const categoriesData =
          (await categoriesResponse.json()) as CategoriesResponse;
        const occasionsData =
          (await occasionsResponse.json()) as OccasionsResponse;

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.message ??
              "No fue posible cargar las categorías.",
          );
        }

        if (!occasionsResponse.ok) {
          throw new Error(
            occasionsData.message ??
              "No fue posible cargar las ocasiones.",
          );
        }

        if (cancelled) {
          return;
        }

        setCategories(
          (categoriesData.categories ?? []).filter(
            (category) => category.activo !== false,
          ),
        );

        setOccasions(
          (occasionsData.occasions ?? []).filter(
            (occasion) => occasion.activo !== false,
          ),
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible cargar la información necesaria.",
        );
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
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
      throw new Error("Selecciona la imagen principal del producto.");
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
    if (!form.sku.trim()) {
      return "El SKU es obligatorio.";
    }

    if (!form.nombre.trim()) {
      return "El nombre es obligatorio.";
    }

    if (!form.slug.trim()) {
      return "El slug es obligatorio.";
    }

    if (!form.descripcion.trim()) {
      return "La descripción es obligatoria.";
    }

    if (!form.precio || Number(form.precio) <= 0) {
      return "Ingresa un precio válido mayor que cero.";
    }

    if (Number(form.stock) < 0 || !Number.isInteger(Number(form.stock))) {
      return "El stock debe ser un número entero igual o mayor que cero.";
    }

    if (
      Number(form.stockMinimo) < 0 ||
      !Number.isInteger(Number(form.stockMinimo))
    ) {
      return "El stock mínimo debe ser un número entero igual o mayor que cero.";
    }

    if (!form.tiempoEntrega.trim()) {
      return "El tiempo de entrega es obligatorio.";
    }

    if (!form.categoryId) {
      return "Selecciona una categoría.";
    }

    if (!imageFile && !uploadedImageUrl) {
      return "Selecciona la imagen principal del producto.";
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
        sku: form.sku.trim(),
        nombre: form.nombre.trim(),
        slug: form.slug.trim(),
        descripcion: form.descripcion.trim(),
        precio: Number(form.precio),
        ...(form.precioAnterior
          ? { precioAnterior: Number(form.precioAnterior) }
          : {}),
        ...(form.costo ? { costo: Number(form.costo) } : {}),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
        imagen: imageUrl,
        ...(form.imagenAlt.trim()
          ? { imagenAlt: form.imagenAlt.trim() }
          : {}),
        tiempoEntrega: form.tiempoEntrega.trim(),
        ...(form.pesoGramos
          ? { pesoGramos: Number(form.pesoGramos) }
          : {}),
        permitirPersonalizacion: form.permitirPersonalizacion,
        destacado: form.destacado,
        activo: form.activo,
        categoryId: form.categoryId,
        ...(form.occasionId ? { occasionId: form.occasionId } : {}),
      };

      const response = await fetch(`${apiUrl}/api/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData =
        (await response.json()) as CreateProductResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            responseData,
            "No fue posible crear el producto.",
          ),
        );
      }

      setSuccess(
        responseData.message ?? "Producto creado correctamente.",
      );

      window.setTimeout(() => {
        router.push("/admin/productos");
        router.refresh();
      }, 900);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error al crear el producto.",
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
              href="/admin/productos"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
              aria-label="Volver a productos"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <PackagePlus className="h-6 w-6 text-amber-300" />
            </div>

            <div>
              <p className="text-sm font-semibold text-purple-200">
                Administración de catálogo
              </p>
              <h1 className="text-2xl font-black sm:text-3xl">
                Nuevo producto
              </h1>
            </div>
          </div>

          <Link
            href="/admin/productos"
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
                Información principal
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Datos con los que el producto aparecerá en el catálogo de AURUM.
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
                  maxLength={150}
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="Ej. Desayuno sorpresa premium"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  SKU *
                </span>
                <input
                  value={form.sku}
                  onChange={(event) =>
                    updateField("sku", event.target.value.toUpperCase())
                  }
                  maxLength={60}
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="AUR-001"
                />
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
                  maxLength={180}
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="desayuno-sorpresa-premium"
                />
                <span className="mt-1.5 block text-xs text-slate-500">
                  Se genera automáticamente a partir del nombre, pero puedes
                  ajustarlo.
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
                  placeholder="Describe el producto, contenido, presentación y detalles relevantes."
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                Imagen principal
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                La imagen se subirá a Cloudinary al guardar el producto.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-purple-200 bg-purple-50/40">
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Vista previa del producto"
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
                      JPG, PNG, WEBP u otro formato de imagen válido.
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
                    Tamaño máximo: 5 MB.
                  </span>
                </label>

                {imageFile && (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-bold text-slate-800">
                      Archivo:
                    </span>{" "}
                    {imageFile.name}
                  </div>
                )}

                {uploadedPublicId && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Imagen cargada correctamente.
                  </div>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Texto alternativo
                  </span>
                  <input
                    value={form.imagenAlt}
                    onChange={(event) =>
                      updateField("imagenAlt", event.target.value)
                    }
                    maxLength={180}
                    disabled={busy}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                    placeholder={form.nombre || "Descripción breve de la imagen"}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                Precio e inventario
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Configura precios, existencias y datos operativos.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Precio *
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.precio}
                  onChange={(event) =>
                    updateField("precio", event.target.value)
                  }
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="80000"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Precio anterior
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.precioAnterior}
                  onChange={(event) =>
                    updateField("precioAnterior", event.target.value)
                  }
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="95000"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Costo
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.costo}
                  onChange={(event) =>
                    updateField("costo", event.target.value)
                  }
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="45000"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Stock *
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    updateField("stock", event.target.value)
                  }
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Stock mínimo *
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockMinimo}
                  onChange={(event) =>
                    updateField("stockMinimo", event.target.value)
                  }
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Peso en gramos
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.pesoGramos}
                  onChange={(event) =>
                    updateField("pesoGramos", event.target.value)
                  }
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="1200"
                />
              </label>

              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Tiempo de entrega *
                </span>
                <input
                  value={form.tiempoEntrega}
                  onChange={(event) =>
                    updateField("tiempoEntrega", event.target.value)
                  }
                  maxLength={100}
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  placeholder="Ej. 24 a 48 horas"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                Organización del catálogo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Asigna la categoría y, si corresponde, una ocasión.
              </p>
            </div>

            {loadingOptions ? (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando categorías y ocasiones...
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Categoría *
                  </span>
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      updateField("categoryId", event.target.value)
                    }
                    required
                    disabled={busy}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>

                  {selectedCategory && (
                    <span className="mt-1.5 block text-xs text-slate-500">
                      Slug: {selectedCategory.slug}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Ocasión
                  </span>
                  <select
                    value={form.occasionId}
                    onChange={(event) =>
                      updateField("occasionId", event.target.value)
                    }
                    disabled={busy}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  >
                    <option value="">Sin ocasión específica</option>
                    {occasions.map((occasion) => (
                      <option key={occasion.id} value={occasion.id}>
                        {occasion.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-black text-slate-900">
                Configuración
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Define cómo se mostrará y administrará el producto.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
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
                    Producto activo
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Disponible para mostrarse en el catálogo.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(event) =>
                    updateField("destacado", event.target.checked)
                  }
                  disabled={busy}
                  className="mt-1 h-4 w-4 accent-purple-700"
                />
                <span>
                  <span className="block text-sm font-black text-slate-800">
                    Destacado
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Marca el producto como destacado.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.permitirPersonalizacion}
                  onChange={(event) =>
                    updateField(
                      "permitirPersonalizacion",
                      event.target.checked,
                    )
                  }
                  disabled={busy}
                  className="mt-1 h-4 w-4 accent-purple-700"
                />
                <span>
                  <span className="block text-sm font-black text-slate-800">
                    Personalizable
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Permite identificar productos con personalización.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
            <Link
              href="/admin/productos"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={busy || loadingOptions}
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
                  Crear producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}