
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Package,
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

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  orden: number;
};

type AdminProduct = {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string | number;
  precioAnterior: string | number | null;
  costo: string | number | null;
  stock: number;
  stockMinimo: number;
  imagen: string;
  imagenAlt: string | null;
  tiempoEntrega: string;
  pesoGramos: number | null;
  permitirPersonalizacion: boolean;
  opcionesPersonalizacion?: unknown;
  destacado: boolean;
  activo: boolean;
  categoryId: string;
  occasionId: string | null;
  category?: Category | null;
  occasion?: Occasion | null;
  images?: ProductImage[];
};

type ProductsResponse = {
  products?: AdminProduct[];
  message?: string;
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

type UpdateProductResponse = {
  message?: string;
  product?: AdminProduct;
};

type AddProductImageResponse = {
  message?: string;
  image?: ProductImage;
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

const emptyForm: ProductForm = {
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

function toInputValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedPublicId, setUploadedPublicId] = useState("");


  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState("");
  const [galleryAlt, setGalleryAlt] = useState("");
  const [galleryOrder, setGalleryOrder] = useState("0");
  const [addingGalleryImage, setAddingGalleryImage] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [gallerySuccess, setGallerySuccess] = useState("");

  const [loading, setLoading] = useState(true);
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
    async function loadProduct() {
      const token = localStorage.getItem("aurum_token");
      const storedUser = localStorage.getItem("aurum_user");

      if (!token || !storedUser) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = JSON.parse(storedUser) as {
          role?: string;
        };

        if (currentUser.role !== "ADMIN") {
          router.replace("/");
          return;
        }
      } catch {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [
          productsResponse,
          categoriesResponse,
          occasionsResponse,
        ] = await Promise.all([
          fetch(`${apiUrl}/api/products/admin`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }),
          fetch(`${apiUrl}/api/categories`, {
            cache: "no-store",
          }),
          fetch(`${apiUrl}/api/occasions`, {
            cache: "no-store",
          }),
        ]);

        if (productsResponse.status === 401) {
          localStorage.removeItem("aurum_token");
          localStorage.removeItem("aurum_user");
          router.replace("/login");
          return;
        }

        if (productsResponse.status === 403) {
          setError(
            "Tu cuenta no tiene permisos para administrar productos.",
          );
          return;
        }

        const productsData =
          (await productsResponse.json()) as ProductsResponse;
        const categoriesData =
          (await categoriesResponse.json()) as CategoriesResponse;
        const occasionsData =
          (await occasionsResponse.json()) as OccasionsResponse;

        if (!productsResponse.ok) {
          throw new Error(
            productsData.message ??
              "No fue posible cargar los productos.",
          );
        }

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

        const foundProduct = (productsData.products ?? []).find(
          (item) => item.id === productId,
        );

        if (!foundProduct) {
          setError("Producto no encontrado.");
          return;
        }

        const availableCategories =
          categoriesData.categories ?? [];
        const availableOccasions =
          occasionsData.occasions ?? [];

        setCategories(
          availableCategories.filter(
            (category) =>
              category.activo !== false ||
              category.id === foundProduct.categoryId,
          ),
        );

        setOccasions(
          availableOccasions.filter(
            (occasion) =>
              occasion.activo !== false ||
              occasion.id === foundProduct.occasionId,
          ),
        );

        setProduct(foundProduct);
        setCurrentImageUrl(foundProduct.imagen);
        setImagePreview(foundProduct.imagen);

        const existingGallery = [...(foundProduct.images ?? [])].sort(
          (a, b) => a.orden - b.orden,
        );
        setGalleryImages(existingGallery);
        setGalleryOrder(
          String(
            existingGallery.length > 0
              ? Math.max(...existingGallery.map((image) => image.orden)) + 1
              : 0,
          ),
        );

        setForm({
          sku: foundProduct.sku,
          nombre: foundProduct.nombre,
          slug: foundProduct.slug,
          descripcion: foundProduct.descripcion,
          precio: toInputValue(foundProduct.precio),
          precioAnterior: toInputValue(
            foundProduct.precioAnterior,
          ),
          costo: toInputValue(foundProduct.costo),
          stock: String(foundProduct.stock),
          stockMinimo: String(foundProduct.stockMinimo),
          imagenAlt: foundProduct.imagenAlt ?? "",
          tiempoEntrega: foundProduct.tiempoEntrega,
          pesoGramos: toInputValue(foundProduct.pesoGramos),
          categoryId: foundProduct.categoryId,
          occasionId: foundProduct.occasionId ?? "",
          permitirPersonalizacion:
            foundProduct.permitirPersonalizacion,
          destacado: foundProduct.destacado,
          activo: foundProduct.activo,
        });
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible conectar con el servidor.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProduct();
  }, [apiUrl, productId, router]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);


  useEffect(() => {
    return () => {
      if (galleryPreview.startsWith("blob:")) {
        URL.revokeObjectURL(galleryPreview);
      }
    };
  }, [galleryPreview]);

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
    }));
  }

  function regenerateSlug() {
    updateField("slug", createSlug(form.nombre));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");
    setUploadedImageUrl("");
    setUploadedPublicId("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      setError("El archivo seleccionado debe ser una imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setError("La imagen no puede superar los 5 MB.");
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function cancelImageChange() {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setUploadedImageUrl("");
    setUploadedPublicId("");
    setImagePreview(currentImageUrl);
  }

  async function uploadImage(authToken: string) {
    if (uploadedImageUrl) {
      return uploadedImageUrl;
    }

    if (!imageFile) {
      return currentImageUrl;
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

      if (response.status === 401) {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        throw new Error("Tu sesión expiró.");
      }

      if (response.status === 403) {
        throw new Error(
          "Tu cuenta no tiene permisos para subir imágenes.",
        );
      }

      const responseData = (await response.json()) as UploadResponse;

      if (!response.ok || !responseData.image?.url) {
        throw new Error(
          responseData.message ??
            "No fue posible subir la nueva imagen.",
        );
      }

      setUploadedImageUrl(responseData.image.url);
      setUploadedPublicId(responseData.image.publicId);

      return responseData.image.url;
    } finally {
      setUploadingImage(false);
    }
  }

  function handleGalleryImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    setGalleryError("");
    setGallerySuccess("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      setGalleryError("El archivo seleccionado debe ser una imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setGalleryError("La imagen no puede superar los 5 MB.");
      return;
    }

    if (galleryPreview.startsWith("blob:")) {
      URL.revokeObjectURL(galleryPreview);
    }

    const nextOrder =
      galleryImages.length > 0
        ? Math.max(...galleryImages.map((image) => image.orden)) + 1
        : 0;

    setGalleryFile(file);
    setGalleryPreview(URL.createObjectURL(file));
    setGalleryOrder(String(nextOrder));
  }

  function cancelGalleryImage() {
    if (galleryPreview.startsWith("blob:")) {
      URL.revokeObjectURL(galleryPreview);
    }

    setGalleryFile(null);
    setGalleryPreview("");
    setGalleryAlt("");
    setGalleryError("");
    setGallerySuccess("");

    const nextOrder =
      galleryImages.length > 0
        ? Math.max(...galleryImages.map((image) => image.orden)) + 1
        : 0;

    setGalleryOrder(String(nextOrder));
  }

  async function handleAddGalleryImage() {
    setGalleryError("");
    setGallerySuccess("");
    setError("");
    setSuccess("");

    if (!galleryFile) {
      setGalleryError("Selecciona una imagen para agregar a la galería.");
      return;
    }

    const parsedOrder = Number(galleryOrder);

    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      setGalleryError(
        "El orden de la imagen debe ser un número entero igual o mayor que cero.",
      );
      return;
    }

    if (galleryAlt.trim().length > 180) {
      setGalleryError(
        "El texto alternativo no puede superar los 180 caracteres.",
      );
      return;
    }

    const authToken = localStorage.getItem("aurum_token");

    if (!authToken) {
      router.replace("/login");
      return;
    }

    setAddingGalleryImage(true);

    try {
      const uploadData = new FormData();
      uploadData.append("image", galleryFile);

      const uploadResponse = await fetch(`${apiUrl}/api/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: uploadData,
      });

      if (uploadResponse.status === 401) {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      if (uploadResponse.status === 403) {
        setGalleryError(
          "Tu cuenta no tiene permisos para subir imágenes.",
        );
        return;
      }

      const uploadResponseData =
        (await uploadResponse.json()) as UploadResponse;

      if (!uploadResponse.ok || !uploadResponseData.image?.url) {
        throw new Error(
          uploadResponseData.message ??
            "No fue posible subir la imagen de la galería.",
        );
      }

      const imageResponse = await fetch(
        `${apiUrl}/api/products/${productId}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: uploadResponseData.image.url,
            ...(galleryAlt.trim()
              ? { alt: galleryAlt.trim() }
              : {}),
            orden: parsedOrder,
          }),
        },
      );

      if (imageResponse.status === 401) {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      if (imageResponse.status === 403) {
        setGalleryError(
          "Tu cuenta no tiene permisos para administrar la galería.",
        );
        return;
      }

      const imageResponseData =
        (await imageResponse.json()) as AddProductImageResponse;

      if (!imageResponse.ok || !imageResponseData.image) {
        throw new Error(
          imageResponseData.message ??
            "La imagen se subió, pero no fue posible asociarla al producto.",
        );
      }

      const updatedGallery = [
        ...galleryImages,
        imageResponseData.image,
      ].sort((a, b) => a.orden - b.orden);

      setGalleryImages(updatedGallery);

      if (galleryPreview.startsWith("blob:")) {
        URL.revokeObjectURL(galleryPreview);
      }

      setGalleryFile(null);
      setGalleryPreview("");
      setGalleryAlt("");
      setGalleryOrder(
        String(
          Math.max(...updatedGallery.map((image) => image.orden)) + 1,
        ),
      );
      setGallerySuccess(
        imageResponseData.message ??
          "Imagen agregada a la galería correctamente.",
      );
    } catch (requestError) {
      setGalleryError(
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error al agregar la imagen a la galería.",
      );
    } finally {
      setAddingGalleryImage(false);
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

    if (
      form.precioAnterior &&
      Number(form.precioAnterior) <= 0
    ) {
      return "El precio anterior debe ser mayor que cero.";
    }

    if (form.costo && Number(form.costo) <= 0) {
      return "El costo debe ser mayor que cero.";
    }

    if (
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      return "El stock debe ser un número entero igual o mayor que cero.";
    }

    if (
      Number(form.stockMinimo) < 0 ||
      !Number.isInteger(Number(form.stockMinimo))
    ) {
      return "El stock mínimo debe ser un número entero igual o mayor que cero.";
    }

    if (
      form.pesoGramos &&
      (!Number.isInteger(Number(form.pesoGramos)) ||
        Number(form.pesoGramos) <= 0)
    ) {
      return "El peso debe ser un número entero mayor que cero.";
    }

    if (!form.tiempoEntrega.trim()) {
      return "El tiempo de entrega es obligatorio.";
    }

    if (!form.categoryId) {
      return "Selecciona una categoría.";
    }

    if (!currentImageUrl && !imageFile) {
      return "El producto debe tener una imagen principal.";
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

    const authToken = localStorage.getItem("aurum_token");

    if (!authToken) {
      router.replace("/login");
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
        ...(form.occasionId
          ? { occasionId: form.occasionId }
          : {}),
      };

      const response = await fetch(
        `${apiUrl}/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "Tu cuenta no tiene permisos para actualizar productos.",
        );
        return;
      }

      const responseData =
        (await response.json()) as UpdateProductResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            responseData,
            "No fue posible actualizar el producto.",
          ),
        );
      }

      const updatedProduct = responseData.product;

      if (updatedProduct) {
        setProduct(updatedProduct);
        setCurrentImageUrl(updatedProduct.imagen);
        setImagePreview(updatedProduct.imagen);
      } else {
        setCurrentImageUrl(imageUrl);
        setImagePreview(imageUrl);
      }

      setImageFile(null);
      setUploadedImageUrl("");
      setUploadedPublicId("");

      setSuccess(
        responseData.message ??
          "Producto actualizado correctamente.",
      );

      window.setTimeout(() => {
        router.push("/admin/productos");
        router.refresh();
      }, 900);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error al actualizar el producto.",
      );
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploadingImage || addingGalleryImage;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-purple-800" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Cargando producto...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-purple-900/20 bg-purple-950 text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-5 sm:px-6">
            <Link
              href="/admin/productos"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
              aria-label="Volver a productos"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <p className="text-sm font-semibold text-purple-200">
                Administración de catálogo
              </p>
              <h1 className="text-2xl font-black">
                Editar producto
              </h1>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-xl font-black text-slate-900">
              No fue posible cargar el producto
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {error || "Producto no encontrado."}
            </p>
            <Link
              href="/admin/productos"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
              <Package className="h-6 w-6 text-amber-300" />
            </div>

            <div>
              <p className="text-sm font-semibold text-purple-200">
                Administración de catálogo
              </p>
              <h1 className="text-2xl font-black sm:text-3xl">
                Editar producto
              </h1>
              <p className="mt-1 text-sm text-purple-200">
                {product.nombre}
              </p>
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
                Actualiza los datos visibles del producto en el catálogo.
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
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  SKU *
                </span>
                <input
                  value={form.sku}
                  onChange={(event) =>
                    updateField(
                      "sku",
                      event.target.value.toUpperCase(),
                    )
                  }
                  maxLength={60}
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                />
              </label>

              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Slug *
                </span>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        createSlug(event.target.value),
                      )
                    }
                    maxLength={180}
                    required
                    disabled={busy}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={regenerateSlug}
                    disabled={busy || !form.nombre.trim()}
                    className="rounded-xl border border-purple-200 px-4 py-3 text-sm font-bold text-purple-800 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Regenerar
                  </button>
                </div>
              </div>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Descripción *
                </span>
                <textarea
                  value={form.descripcion}
                  onChange={(event) =>
                    updateField(
                      "descripcion",
                      event.target.value,
                    )
                  }
                  required
                  disabled={busy}
                  rows={5}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
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
                Conserva la imagen actual o selecciona una nueva para
                subirla a Cloudinary.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-purple-200 bg-purple-50/40">
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt={
                        form.imagenAlt ||
                        form.nombre ||
                        "Imagen del producto"
                      }
                      className="h-64 w-full object-cover"
                    />

                    {imageFile && (
                      <button
                        type="button"
                        onClick={cancelImageChange}
                        disabled={busy}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/75 text-white transition hover:bg-slate-950 disabled:opacity-50"
                        aria-label="Cancelar cambio de imagen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="px-6 text-center">
                    <ImagePlus className="mx-auto h-10 w-10 text-purple-400" />
                    <p className="mt-3 text-sm font-bold text-slate-700">
                      Sin imagen
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Cambiar imagen
                  </span>

                  <span className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-bold text-purple-800 transition hover:bg-purple-100">
                    <Upload className="h-4 w-4" />
                    Seleccionar nueva imagen

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={busy}
                      className="sr-only"
                    />
                  </span>

                  <span className="mt-2 block text-xs text-slate-500">
                    Tamaño máximo: 5 MB. Si no seleccionas otra
                    imagen, se conservará la actual.
                  </span>
                </label>

                {imageFile && (
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-bold text-slate-800">
                      Nueva imagen:
                    </span>{" "}
                    {imageFile.name}
                  </div>
                )}

                {uploadedPublicId && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Nueva imagen cargada correctamente.
                  </div>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Texto alternativo
                  </span>
                  <input
                    value={form.imagenAlt}
                    onChange={(event) =>
                      updateField(
                        "imagenAlt",
                        event.target.value,
                      )
                    }
                    maxLength={180}
                    disabled={busy}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                Galería de imágenes
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Agrega imágenes complementarias del producto. Las imágenes
                con un número de orden menor se muestran primero.
              </p>
            </div>

            {galleryError && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                {galleryError}
              </div>
            )}

            {gallerySuccess && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {gallerySuccess}
              </div>
            )}

            {galleryImages.length > 0 ? (
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {galleryImages.map((image) => (
                  <article
                    key={image.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.alt || product.nombre}
                      className="h-48 w-full object-cover"
                    />

                    <div className="space-y-1 p-4">
                      <p className="text-sm font-black text-slate-800">
                        Orden: {image.orden}
                      </p>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {image.alt || "Sin texto alternativo"}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mb-6 rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 px-6 py-8 text-center">
                <ImagePlus className="mx-auto h-9 w-9 text-purple-400" />
                <p className="mt-3 text-sm font-black text-slate-800">
                  Este producto todavía no tiene imágenes adicionales
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Puedes agregar la primera imagen desde el formulario de abajo.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4 sm:p-5">
              <h3 className="text-sm font-black text-slate-900">
                Agregar imagen a la galería
              </h3>

              <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
                <div className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-purple-200 bg-white">
                  {galleryPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={galleryPreview}
                        alt="Vista previa de la nueva imagen"
                        className="h-48 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={cancelGalleryImage}
                        disabled={busy}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/75 text-white transition hover:bg-slate-950 disabled:opacity-50"
                        aria-label="Cancelar imagen de galería"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="px-5 text-center">
                      <ImagePlus className="mx-auto h-9 w-9 text-purple-400" />
                      <p className="mt-2 text-xs font-bold text-slate-600">
                        Vista previa
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Imagen *
                    </span>
                    <span className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm font-bold text-purple-800 transition hover:bg-purple-50">
                      <Upload className="h-4 w-4" />
                      Seleccionar imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryImageChange}
                        disabled={busy}
                        className="sr-only"
                      />
                    </span>
                    <span className="mt-2 block text-xs text-slate-500">
                      Tamaño máximo: 5 MB.
                    </span>
                  </label>

                  {galleryFile && (
                    <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600">
                      <span className="font-bold text-slate-800">
                        Archivo:
                      </span>{" "}
                      {galleryFile.name}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">
                        Texto alternativo
                      </span>
                      <input
                        value={galleryAlt}
                        onChange={(event) =>
                          setGalleryAlt(event.target.value)
                        }
                        maxLength={180}
                        disabled={busy}
                        placeholder={product.nombre}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700">
                        Orden
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={galleryOrder}
                        onChange={(event) =>
                          setGalleryOrder(event.target.value)
                        }
                        disabled={busy}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleAddGalleryImage()}
                    disabled={busy || !galleryFile}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-950 px-5 py-3 text-sm font-black text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {addingGalleryImage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Agregando imagen...
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-4 w-4" />
                        Agregar a la galería
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-500">
                    Por ahora la galería permite agregar imágenes. No mostramos
                    opciones de eliminar o reordenar imágenes existentes porque
                    el backend todavía no expone esos endpoints.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-black text-slate-900">
                Precio e inventario
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Actualiza precios, existencias y datos operativos.
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
                    updateField(
                      "precioAnterior",
                      event.target.value,
                    )
                  }
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
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
                    updateField(
                      "stockMinimo",
                      event.target.value,
                    )
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
                    updateField(
                      "pesoGramos",
                      event.target.value,
                    )
                  }
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                />
              </label>

              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Tiempo de entrega *
                </span>
                <input
                  value={form.tiempoEntrega}
                  onChange={(event) =>
                    updateField(
                      "tiempoEntrega",
                      event.target.value,
                    )
                  }
                  maxLength={100}
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
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
                Modifica la categoría y la ocasión asociadas.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Categoría *
                </span>
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    updateField(
                      "categoryId",
                      event.target.value,
                    )
                  }
                  required
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                >
                  <option value="">
                    Selecciona una categoría
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.nombre}
                      {!category.activo ? " (inactiva)" : ""}
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
                    updateField(
                      "occasionId",
                      event.target.value,
                    )
                  }
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-slate-100"
                >
                  {!product.occasionId && (
                    <option value="">
                      Sin ocasión específica
                    </option>
                  )}

                  {occasions.map((occasion) => (
                    <option
                      key={occasion.id}
                      value={occasion.id}
                    >
                      {occasion.nombre}
                      {!occasion.activo ? " (inactiva)" : ""}
                    </option>
                  ))}
                </select>

                {product.occasionId && (
                  <span className="mt-1.5 block text-xs text-amber-700">
                    Por ahora, un producto que ya tiene ocasión debe
                    conservar una ocasión seleccionada.
                  </span>
                )}
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-black text-slate-900">
                Configuración
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Controla el estado y las opciones comerciales del
                producto.
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
                    Define si está disponible en el catálogo.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(event) =>
                    updateField(
                      "destacado",
                      event.target.checked,
                    )
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
                    Permite identificarlo como producto personalizable.
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
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-950 px-6 py-3 text-sm font-black text-white transition hover:bg-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadingImage
                    ? "Subiendo imagen..."
                    : "Guardando cambios..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
