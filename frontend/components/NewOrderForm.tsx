"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function NewOrderForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId") ?? "";

  const [metodoEntrega, setMetodoEntrega] = useState<
    "DOMICILIO" | "TIENDA"
  >("DOMICILIO");

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

          <form className="mt-8 space-y-6">
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
                    event.target.value as "DOMICILIO" | "TIENDA",
                  )
                }
                className="w-full rounded-lg border border-[#d8cbc4] px-4 py-3 outline-none focus:border-[#a2725e]"
              >
                <option value="DOMICILIO">Domicilio</option>
                <option value="TIENDA">Recoger en tienda</option>
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
                  required
                  className="w-full rounded-lg border border-[#d8cbc4] bg-white px-4 py-3 outline-none focus:border-[#a2725e]"
                />

                <input
                  name="barrioEntrega"
                  type="text"
                  placeholder="Barrio"
                  required
                  className="w-full rounded-lg border border-[#d8cbc4] bg-white px-4 py-3 outline-none focus:border-[#a2725e]"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <input
                    name="ciudadEntrega"
                    type="text"
                    placeholder="Ciudad"
                    required
                    className="w-full rounded-lg border border-[#d8cbc4] bg-white px-4 py-3 outline-none focus:border-[#a2725e]"
                  />

                  <input
                    name="departamentoEntrega"
                    type="text"
                    placeholder="Departamento"
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
              type="button"
              disabled={!productId}
              className="w-full rounded-lg bg-[#a2725e] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar pedido
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}