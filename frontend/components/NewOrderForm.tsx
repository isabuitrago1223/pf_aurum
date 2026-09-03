"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type CreateOrderResponse = {
  message: string;
  order: {
    id: string;
    numeroPedido: string;
  };
};

export default function NewOrderForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") ?? "";

  const [metodoEntrega, setMetodoEntrega] = useState<
    "DOMICILIO" | "TIENDA"
  >("DOMICILIO");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!productId) {
      setError("Debes seleccionar un producto.");
      return;
    }

    const token = localStorage.getItem("aurum_token");

    if (!token) {
      setError("Debes iniciar sesión para realizar un pedido.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const cantidad = Number(formData.get("cantidad"));

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      setError("La cantidad debe ser mayor a cero.");
      return;
    }

    const body = {
      metodoEntrega,
      nombreContacto: String(
        formData.get("nombreContacto") ?? "",
      ).trim(),
      cedulaContacto:
        String(formData.get("cedulaContacto") ?? "").trim() ||
        undefined,
      emailContacto: String(
        formData.get("emailContacto") ?? "",
      ).trim(),
      telefonoContacto: String(
        formData.get("telefonoContacto") ?? "",
      ).trim(),
      direccionEntrega:
        metodoEntrega === "DOMICILIO"
          ? String(
              formData.get("direccionEntrega") ?? "",
            ).trim()
          : undefined,
      barrioEntrega:
        metodoEntrega === "DOMICILIO"
          ? String(
              formData.get("barrioEntrega") ?? "",
            ).trim()
          : undefined,
      ciudadEntrega:
        metodoEntrega === "DOMICILIO"
          ? String(
              formData.get("ciudadEntrega") ?? "",
            ).trim()
          : undefined,
      departamentoEntrega:
        metodoEntrega === "DOMICILIO"
          ? String(
              formData.get("departamentoEntrega") ?? "",
            ).trim()
          : undefined,
      notasEntrega:
        String(formData.get("notasEntrega") ?? "").trim() ||
        undefined,
      items: [
        {
          productId,
          cantidad,
        },
      ],
    };

    try {
      setLoading(true);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(`${apiUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401 || response.status === 403) {
        setError(
          "Tu sesión no es válida. Inicia sesión nuevamente.",
        );
        return;
      }

      if (response.status === 404) {
        setError("El producto ya no está disponible.");
        return;
      }

      if (response.status === 409) {
        const data = await response.json();

        setError(
          data.message ??
            "No hay suficiente stock para completar el pedido.",
        );
        return;
      }

      if (!response.ok) {
        setError(
          "No fue posible crear el pedido. Revisa los datos e intenta nuevamente.",
        );
        return;
      }

      const data: CreateOrderResponse = await response.json();

      window.location.href = `/pedidos/${data.order.id}`;
    } catch {
      setError("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f5] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/productos"
          className="text-sm font-semibold text-[#a2725e] hover:opacity-70"
        >
          ← Volver al catálogo
        </Link>

        <div className="mt-6 rounded-2xl border border-[#eadfd8] bg-white p-8">
          <h1 className="text-3xl font-bold">
            Crear pedido
          </h1>

          <p className="mt-2 text-[#7a6f69]">
            Completa los datos necesarios para realizar tu pedido.
          </p>

          {!productId && (
            <div className="mt-6 rounded-lg border border-[#eadfd8] bg-[#faf7f5] p-4">
              <p className="text-sm text-[#7a6f69]">
                No se seleccionó ningún producto.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                {error}
              </p>

              {error.includes("iniciar sesión") && (
                <Link
                  href="/login"
                  className="mt-2 inline-block text-sm font-semibold text-[#a2725e]"
                >
                  Ir a iniciar sesión
                </Link>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            <div>
              <label
                htmlFor="cantidad"
                className="mb-2 block text-sm font-semibold"
              >
                Cantidad
              </label>

              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min="1"
                defaultValue="1"
                required
                className="w-full rounded-lg border border-[#d8cbc4] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>

            <div>
              <label
                htmlFor="metodoEntrega"
                className="mb-2 block text-sm font-semibold"
              >
                Método de entrega
              </label>

              <select
                id="metodoEntrega"
                name="metodoEntrega"
                value={metodoEntrega}
                onChange={(event) =>
                  setMetodoEntrega(
                    event.target.value as
                      | "DOMICILIO"
                      | "TIENDA",
                  )
                }
                className="w-full rounded-lg border border-[#d8cbc4] px-4 py-3 outline-none focus:border-[#a2725e]"
              >
                <option value="DOMICILIO">
                  Domicilio
                </option>

                <option value="TIENDA">
                  Recoger en tienda
                </option>
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="nombreContacto"
                  className="mb-2 block text-sm font-semibold"
                >
                  Nombre de contacto
                </label>

                <input
                  id="nombreContacto"
                  name="nombreContacto"
                  type="text"
                  required
                  className="w-full rounded-lg border border-[#d8cbc4] px-4 py-3 outline-none focus:border-[#a2725e]"
                />
              </div>

              <div>
                <label
                  htmlFor="cedulaContacto"
                  className="mb-2 block text-sm font-semibold"
                >
                  Cédula
                </label>

                <input
                  id="cedulaContacto"
                  name="cedulaContacto"
                  type="text"
                  maxLength={15}
                  className="w-full rounded-lg border border-[#d8cbc4] px-4 py-3 outline-none focus:border-[#a2725e]"
                />
              </div>

              <div>
                <label
                  htmlFor="emailContacto"
                  className="mb-2 block text-sm font-semibold"
                >
                  Correo
                </label>

                <input
                  id="emailContacto"
                  name="emailContacto"
                  type="email"
                  required
                  className="w-full rounded-lg border border-[#d8cbc4] px-4 py-3 outline-none focus:border-[#a2725e]"
                />
              </div>

              <div>
                <label
                  htmlFor="telefonoContacto"
                  className="mb-2 block text-sm font-semibold"
                >
                  Teléfono
                </label>

                <input
                  id="telefonoContacto"
                  name="telefonoContacto"
                  type="tel"
                  minLength={7}
                  maxLength={20}
                  required
                  className="w-full rounded-lg border border-[#d8cbc4] px-4 py-3 outline-none focus:border-[#a2725e]"
                />
              </div>
            </div>

            {metodoEntrega === "DOMICILIO" && (
              <div className="space-y-5 rounded-xl bg-[#faf7f5] p-5">
                <h2 className="text-lg font-semibold">
                  Dirección de entrega
                </h2>

                <input
                  name="direccionEntrega"
                  type="text"
                  placeholder="Dirección"
                  maxLength={160}
                  required
                  className="w-full rounded-lg border border-[#d8cbc4] bg-white px-4 py-3 outline-none focus:border-[#a2725e]"
                />

                <input
                  name="barrioEntrega"
                  type="text"
                  placeholder="Barrio"
                  maxLength={80}
                  required
                  className="w-full rounded-lg border border-[#d8cbc4] bg-white px-4 py-3 outline-none focus:border-[#a2725e]"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <input
                    name="ciudadEntrega"
                    type="text"
                    placeholder="Ciudad"
                    maxLength={80}
                    required
                    className="w-full rounded-lg border border-[#d8cbc4] bg-white px-4 py-3 outline-none focus:border-[#a2725e]"
                  />

                  <input
                    name="departamentoEntrega"
                    type="text"
                    placeholder="Departamento"
                    maxLength={80}
                    required
                    className="w-full rounded-lg border border-[#d8cbc4] bg-white px-4 py-3 outline-none focus:border-[#a2725e]"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="notasEntrega"
                className="mb-2 block text-sm font-semibold"
              >
                Notas adicionales
              </label>

              <textarea
                id="notasEntrega"
                name="notasEntrega"
                rows={4}
                maxLength={500}
                className="w-full rounded-lg border border-[#d8cbc4] px-4 py-3 outline-none focus:border-[#a2725e]"
              />
            </div>

            <button
              type="submit"
              disabled={!productId || loading}
              className="w-full rounded-lg bg-[#a2725e] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creando pedido..."
                : "Realizar pedido"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
