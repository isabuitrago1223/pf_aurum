"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  House,
  MapPin,
  Package,
  ReceiptText,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
} from "lucide-react";

type OrderItem = {
  id: string;
  productId: string;
  nombreProducto: string;
  imagenProducto: string | null;
  cantidad: number;
  precioUnitario: number;
  descuentoUnitario: number;
  personalizacion: unknown | null;
};

type Order = {
  id: string;
  numeroPedido: string;
  estado: string;

  metodoEntrega: "DOMICILIO" | "TIENDA";

  nombreContacto: string;
  cedulaContacto: string | null;
  emailContacto: string;
  telefonoContacto: string;

  direccionEntrega: string | null;
  barrioEntrega: string | null;
  ciudadEntrega: string | null;
  departamentoEntrega: string | null;
  notasEntrega: string | null;

  direccionRecogida: string | null;
  fechaRecogida: string | null;
  horaRecogida: string | null;

  costoEnvio: number;
  subtotal: number;
  descuento: number;
  total: number;

  fechaEstimadaEntrega: string | null;
  enlaceRastreo: string | null;
  motivoCancelacion: string | null;
  canceladoAt: string | null;

  createdAt: string;
  updatedAt: string;

  items: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      const token = localStorage.getItem("aurum_token");

      if (!token) {
        setError("Debes iniciar sesión para consultar este pedido.");
        setLoading(false);
        return;
      }

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          setError(
            "Tu sesión no es válida o no tienes permisos para consultar este pedido.",
          );
          return;
        }

        if (response.status === 404) {
          setError("El pedido no existe o no pertenece a tu cuenta.");
          return;
        }

        if (!response.ok) {
          setError("No fue posible cargar el pedido.");
          return;
        }

        const data: { order: Order } = await response.json();

        setOrder(data.order);
      } catch {
        setError("No fue posible conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  function formatPrice(value: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  }

  function getStatusClasses(status: string) {
    switch (status) {
      case "PENDIENTE":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "EN_PREPARACION":
        return "border-purple-200 bg-purple-50 text-purple-700";

      case "EN_CAMINO":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "ENTREGADO":
        return "border-green-200 bg-green-50 text-green-700";

      case "CANCELADO":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  }

  function formatPersonalization(value: unknown) {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "Personalización registrada";
    }
  }

  async function handleDownloadReceipt() {
    if (!order || downloadingReceipt) {
      return;
    }

    const token = localStorage.getItem("aurum_token");

    if (!token) {
      setReceiptError(
        "Debes iniciar sesión nuevamente para descargar el comprobante.",
      );
      return;
    }

    setDownloadingReceipt(true);
    setReceiptError("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/orders/${order.id}/receipt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        setReceiptError(
          "Tu sesión no es válida o no tienes permisos para descargar este comprobante.",
        );
        return;
      }

      if (response.status === 404) {
        setReceiptError(
          "No fue posible encontrar el comprobante de este pedido.",
        );
        return;
      }

      if (!response.ok) {
        setReceiptError("No fue posible descargar el comprobante.");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = `comprobante-${order.numeroPedido}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch {
      setReceiptError("No fue posible conectar con el servidor.");
    } finally {
      setDownloadingReceipt(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7fb] text-[#2f123f]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2f123f] via-[#4b1f63] to-[#6b2a83] px-5 py-12 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/pedidos"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#f0c85b] transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Volver a mis pedidos
          </Link>

          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f0c85b]">
              Aurum Decoraciones
            </p>

            <h1 className="mt-3 font-serif text-4xl font-black sm:text-5xl">
              Detalle del pedido
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#eee5f2] sm:text-base">
              Consulta los productos, la entrega, los valores y el estado
              actual de tu pedido.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {loading && (
            <div className="rounded-[2rem] border border-[#e7ddec] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-[#6b2a83]">
                <ShoppingBag size={25} />
              </div>

              <p className="mt-4 font-bold text-[#5f5363]">
                Cargando pedido...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-[2rem] border border-[#e7ddec] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-[#6b2a83]">
                <Package size={25} />
              </div>

              <h2 className="mt-4 font-serif text-xl font-black text-[#351641]">
                No pudimos mostrar este pedido
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#807385]">
                {error}
              </p>

              {error.includes("iniciar sesión") && (
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center rounded-xl bg-[#6b2a83] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4b1f63]"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          )}

          {!loading && !error && order && (
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-[#6b2a83]">
                      <ReceiptText size={22} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a8aa0]">
                        Pedido
                      </p>

                      <h2 className="mt-1 text-xl font-black text-[#351641]">
                        {order.numeroPedido}
                      </h2>

                      <div className="mt-2 flex items-center gap-2 text-sm text-[#807385]">
                        <CalendarDays size={15} />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusClasses(
                        order.estado,
                      )}`}
                    >
                      {order.estado.replaceAll("_", " ")}
                    </span>

                    <p className="mt-3 text-2xl font-black text-[#351641]">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-[#6b2a83]">
                    <UserRound size={20} />
                  </div>

                  <h3 className="font-serif text-2xl font-black text-[#351641]">
                    Datos de contacto
                  </h3>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                      Nombre
                    </p>
                    <p className="mt-1 font-bold text-[#351641]">
                      {order.nombreContacto}
                    </p>
                  </div>

                  {order.cedulaContacto && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                        Cédula
                      </p>
                      <p className="mt-1 font-bold text-[#351641]">
                        {order.cedulaContacto}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                      Correo
                    </p>
                    <p className="mt-1 break-words font-bold text-[#351641]">
                      {order.emailContacto}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                      Teléfono
                    </p>
                    <p className="mt-1 font-bold text-[#351641]">
                      {order.telefonoContacto}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-[#6b2a83]">
                    {order.metodoEntrega === "DOMICILIO" ? (
                      <Truck size={20} />
                    ) : (
                      <Store size={20} />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                      Método de entrega
                    </p>

                    <h3 className="font-serif text-2xl font-black text-[#351641]">
                      {order.metodoEntrega === "DOMICILIO"
                        ? "Entrega a domicilio"
                        : "Recogida en tienda"}
                    </h3>
                  </div>
                </div>

                {order.metodoEntrega === "DOMICILIO" ? (
                  <div className="mt-5 space-y-4">
                    {order.direccionEntrega && (
                      <div className="flex gap-3">
                        <MapPin
                          size={18}
                          className="mt-0.5 shrink-0 text-[#6b2a83]"
                        />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                            Dirección
                          </p>
                          <p className="mt-1 font-bold text-[#351641]">
                            {order.direccionEntrega}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-3">
                      {order.barrioEntrega && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                            Barrio
                          </p>
                          <p className="mt-1 font-bold text-[#351641]">
                            {order.barrioEntrega}
                          </p>
                        </div>
                      )}

                      {order.ciudadEntrega && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                            Ciudad
                          </p>
                          <p className="mt-1 font-bold text-[#351641]">
                            {order.ciudadEntrega}
                          </p>
                        </div>
                      )}

                      {order.departamentoEntrega && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                            Departamento
                          </p>
                          <p className="mt-1 font-bold text-[#351641]">
                            {order.departamentoEntrega}
                          </p>
                        </div>
                      )}
                    </div>

                    {order.notasEntrega && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                          Indicaciones
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#6d5f72]">
                          {order.notasEntrega}
                        </p>
                      </div>
                    )}

                    {order.fechaEstimadaEntrega && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                          Fecha estimada de entrega
                        </p>
                        <p className="mt-1 font-bold text-[#351641]">
                          {formatDate(order.fechaEstimadaEntrega)}
                        </p>
                      </div>
                    )}

                    {order.enlaceRastreo && (
                      <a
                        href={order.enlaceRastreo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-black text-[#6b2a83] transition hover:text-[#351641]"
                      >
                        <House size={16} />
                        Consultar seguimiento
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {order.direccionRecogida && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                          Punto de recogida
                        </p>
                        <p className="mt-1 font-bold text-[#351641]">
                          {order.direccionRecogida}
                        </p>
                      </div>
                    )}

                    {order.fechaRecogida && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                          Fecha
                        </p>
                        <p className="mt-1 font-bold text-[#351641]">
                          {formatDate(order.fechaRecogida)}
                        </p>
                      </div>
                    )}

                    {order.horaRecogida && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#9a8aa0]">
                          Hora
                        </p>
                        <p className="mt-1 font-bold text-[#351641]">
                          {order.horaRecogida}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {order.estado === "CANCELADO" &&
                  order.motivoCancelacion && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-red-700">
                        Motivo de cancelación
                      </p>
                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {order.motivoCancelacion}
                      </p>
                    </div>
                  )}
              </section>

              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <h3 className="font-serif text-2xl font-black text-[#351641]">
                  Productos
                </h3>

                <div className="mt-5 space-y-4">
                  {order.items.map((item) => {
                    const personalization = formatPersonalization(
                      item.personalizacion,
                    );

                    const itemTotal =
                      (item.precioUnitario - item.descuentoUnitario) *
                      item.cantidad;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between gap-4 rounded-2xl border border-[#eee5f2] bg-[#fdfbfe] p-5 sm:flex-row sm:items-start"
                      >
                        <div className="min-w-0">
                          <p className="font-black text-[#351641]">
                            {item.nombreProducto}
                          </p>

                          <p className="mt-2 text-sm text-[#807385]">
                            Cantidad: {item.cantidad}
                          </p>

                          <p className="mt-1 text-sm text-[#807385]">
                            Precio unitario:{" "}
                            {formatPrice(item.precioUnitario)}
                          </p>

                          {item.descuentoUnitario > 0 && (
                            <p className="mt-1 text-sm text-[#807385]">
                              Descuento unitario:{" "}
                              {formatPrice(item.descuentoUnitario)}
                            </p>
                          )}

                          {personalization && (
                            <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/60 p-3">
                              <p className="text-xs font-black uppercase tracking-wide text-[#6b2a83]">
                                Personalización
                              </p>
                              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#6d5f72]">
                                {personalization}
                              </p>
                            </div>
                          )}
                        </div>

                        <p className="shrink-0 text-lg font-black text-[#351641]">
                          {formatPrice(itemTotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <h3 className="font-serif text-2xl font-black text-[#351641]">
                  Resumen del pedido
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#807385]">Subtotal</span>
                    <span className="font-bold text-[#351641]">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#807385]">Envío</span>
                    <span className="font-bold text-[#351641]">
                      {formatPrice(order.costoEnvio)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-[#807385]">Descuento</span>
                    <span className="font-bold text-[#351641]">
                      {formatPrice(order.descuento)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#eee5f2] pt-4 text-lg">
                    <span className="font-black text-[#351641]">
                      Total
                    </span>

                    <span className="font-black text-[#6b2a83]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#e7ddec] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-serif text-xl font-black text-[#351641]">
                      Comprobante del pedido
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#807385]">
                      Descarga el comprobante PDF correspondiente a este pedido.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    disabled={downloadingReceipt}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6b2a83] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#4b1f63] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download size={17} />
                    {downloadingReceipt
                      ? "Descargando..."
                      : "Descargar comprobante"}
                  </button>
                </div>

                {receiptError && (
                  <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
                    {receiptError}
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}