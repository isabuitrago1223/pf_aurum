"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  IdCard,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useCart } from "../context/CartContext";
import { colombiaLocations } from "../data/colombiaLocations";

type CheckoutStep = 1 | 2 | 3 | 4;

type DeliveryMethod = "DOMICILIO" | "TIENDA";

type PaymentMethod =
  | "NEQUI"
  | "DAVIPLATA"
  | "PSE"
  | "TRANSFERENCIA_BANCARIA";

type CreateOrderResponse = {
  message: string;
  order: {
    id: string;
    numeroPedido: string;
  };
};

type ContactData = {
  nombre: string;
  apellido: string;
  cedulaContacto: string;
  emailContacto: string;
  telefonoContacto: string;
  direccionEntrega: string;
  barrioEntrega: string;
  ciudadEntrega: string;
  departamentoEntrega: string;
  notasEntrega: string;
};

const initialContactData: ContactData = {
  nombre: "",
  apellido: "",
  cedulaContacto: "",
  emailContacto: "",
  telefonoContacto: "",
  direccionEntrega: "",
  barrioEntrega: "",
  ciudadEntrega: "Medellín",
  departamentoEntrega: "Antioquia",
  notasEntrega: "",
};

export default function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId") ?? "";

  const { items: cartItems, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>(1);

  const [contactData, setContactData] =
    useState<ContactData>(initialContactData);

  const [metodoEntrega, setMetodoEntrega] =
    useState<DeliveryMethod>("DOMICILIO");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("NEQUI");

  const [cantidad, setCantidad] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createdOrder, setCreatedOrder] = useState<{
    id: string;
    numeroPedido: string;
  } | null>(null);

  const isCartOrder = !productId && cartItems.length > 0;

  const cartQuantity = cartItems.reduce(
    (total, item) => total + item.cantidad,
    0,
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.precio) * item.cantidad,
    0,
  );

  const orderItems = useMemo(() => {
    if (productId) {
      return null;
    }

    return cartItems.map((item) => ({
      productId: item.productId,
      cantidad: item.cantidad,
      personalizacion: item.personalizacion,
    }));
  }, [productId, cartItems]);

  const departments = useMemo(
    () =>
      [...colombiaLocations].sort((a, b) =>
        a.name.localeCompare(b.name, "es"),
      ),
    [],
  );

  const selectedDepartment = departments.find(
    (department) =>
      department.name === contactData.departamentoEntrega,
  );

  const cities = useMemo(
    () =>
      [...(selectedDepartment?.cities ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, "es"),
      ),
    [selectedDepartment],
  );

  const selectedCity = cities.find(
    (city) => city.name === contactData.ciudadEntrega,
  );

  const barrios = useMemo(
    () =>
      [...(selectedCity?.barrios ?? [])].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [selectedCity],
  );

  function handleClose() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  function updateField(
    field: keyof ContactData,
    value: string,
  ) {
    setContactData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateStepOne() {
    setError("");

    if (contactData.nombre.trim().length < 2) {
      setError("Debes completar tu nombre.");
      return false;
    }

    if (contactData.apellido.trim().length < 2) {
      setError("Debes completar tu apellido.");
      return false;
    }

    if (!contactData.cedulaContacto.trim()) {
      setError("Debes ingresar tu número de cédula.");
      return false;
    }

    if (contactData.cedulaContacto.trim().length < 5) {
      setError("Ingresa un número de cédula válido.");
      return false;
    }

    if (!contactData.telefonoContacto.trim()) {
      setError("Debes ingresar tu número de teléfono.");
      return false;
    }

    if (contactData.telefonoContacto.trim().length < 7) {
      setError("Ingresa un número de teléfono válido.");
      return false;
    }

    if (!contactData.emailContacto.trim()) {
      setError("Debes ingresar tu correo electrónico.");
      return false;
    }

    if (
      !contactData.emailContacto.includes("@") ||
      !contactData.emailContacto.includes(".")
    ) {
      setError("Ingresa un correo electrónico válido.");
      return false;
    }

    return true;
  }

  function validateStepTwo() {
    setError("");

    if (metodoEntrega === "DOMICILIO") {
      if (!contactData.direccionEntrega.trim()) {
        setError("Debes ingresar la dirección de entrega.");
        return false;
      }

      if (!contactData.departamentoEntrega.trim()) {
        setError("Selecciona un departamento.");
        return false;
      }

      if (!contactData.ciudadEntrega.trim()) {
        setError("Selecciona una ciudad o municipio.");
        return false;
      }

      if (!contactData.barrioEntrega.trim()) {
        setError("Selecciona un barrio.");
        return false;
      }
    }

    return true;
  }

  function goToStepTwo() {
    if (!validateStepOne()) {
      return;
    }

    setError("");
    setStep(2);
  }

  async function createOrderAndContinue() {
    if (!validateStepTwo()) {
      return;
    }

    if (!productId && cartItems.length === 0) {
      setError("Debes seleccionar al menos un producto.");
      return;
    }

    const token = localStorage.getItem("aurum_token");

    if (!token) {
      setError(
        "Debes iniciar sesión para continuar con tu pedido.",
      );
      return;
    }

    let items;

    if (productId) {
      if (!Number.isInteger(cantidad) || cantidad < 1) {
        setError("La cantidad debe ser mayor a cero.");
        return;
      }

      items = [
        {
          productId,
          cantidad,
        },
      ];
    } else {
      items = orderItems ?? [];
    }

    const nombreContacto =
      `${contactData.nombre.trim()} ${contactData.apellido.trim()}`.trim();

    const body = {
      metodoEntrega,

      nombreContacto,

      cedulaContacto:
        contactData.cedulaContacto.trim(),

      emailContacto:
        contactData.emailContacto.trim(),

      telefonoContacto:
        contactData.telefonoContacto.trim(),

      direccionEntrega:
        metodoEntrega === "DOMICILIO"
          ? contactData.direccionEntrega.trim()
          : undefined,

      barrioEntrega:
        metodoEntrega === "DOMICILIO"
          ? contactData.barrioEntrega.trim()
          : undefined,

      ciudadEntrega:
        metodoEntrega === "DOMICILIO"
          ? contactData.ciudadEntrega.trim()
          : undefined,

      departamentoEntrega:
        metodoEntrega === "DOMICILIO"
          ? contactData.departamentoEntrega.trim()
          : undefined,

      notasEntrega:
        contactData.notasEntrega.trim() || undefined,

      items,
    };

    try {
      setLoading(true);
      setError("");

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        setError(
          "Tu sesión no es válida. Inicia sesión nuevamente.",
        );
        return;
      }

      if (response.status === 404) {
        setError(
          "Uno de los productos ya no está disponible.",
        );
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

      const data: CreateOrderResponse =
        await response.json();

      setCreatedOrder({
        id: data.order.id,
        numeroPedido: data.order.numeroPedido,
      });

      if (isCartOrder) {
        clearCart();
      }

      setError("");
      setStep(3);
    } catch {
      setError(
        "No fue posible conectar con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  const steps = [
    {
      number: 1,
      label: "Datos personales",
    },
    {
      number: 2,
      label: "Método de entrega",
    },
    {
      number: 3,
      label: "Pago",
    },
    {
      number: 4,
      label: "Confirmación",
    },
  ];

  const fieldClass =
    "w-full rounded-2xl border border-purple-200 bg-white py-3.5 pl-12 pr-4 text-[15px] font-medium text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-purple-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100";

  const selectClass =
    "w-full appearance-none rounded-2xl border border-purple-200 bg-white py-3.5 pl-12 pr-11 text-[15px] font-medium text-slate-700 outline-none transition hover:border-purple-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100";

  const labelClass =
    "mb-2 block text-sm font-black text-slate-700";

  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-purple-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/50 p-3 backdrop-blur-sm sm:p-6">
      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar"
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-purple-200 bg-[#fffaf7] shadow-2xl">
        {/* CABECERA */}
        <header className="flex shrink-0 items-center justify-between bg-gradient-to-r from-purple-950 via-purple-800 to-purple-700 px-5 py-5 text-white sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              Aurum Decoraciones
            </p>

            <h1 className="mt-1 font-serif text-2xl font-black sm:text-3xl">
              Finalizar compra
            </h1>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar pedido"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={21} />
          </button>
        </header>

        {/* PASOS */}
        <div className="shrink-0 border-b border-purple-100 bg-white px-4 py-5 sm:px-10">
          <div className="relative mx-auto flex max-w-3xl justify-between">
            <div className="absolute left-[7%] right-[7%] top-5 h-[3px] bg-slate-200" />

            <div
              className="absolute left-[7%] top-5 h-[3px] bg-purple-700 transition-all duration-300"
              style={{
                width:
                  step === 1
                    ? "0%"
                    : step === 2
                      ? "29%"
                      : step === 3
                        ? "57%"
                        : "86%",
              }}
            />

            {steps.map((item) => {
              const completed = step > item.number;
              const active = step === item.number;

              return (
                <div
                  key={item.number}
                  className="relative z-10 flex w-20 flex-col items-center text-center sm:w-32"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-black shadow-md transition ${
                      completed
                        ? "bg-emerald-600 text-white"
                        : active
                          ? "bg-purple-700 text-white"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {completed ? (
                      <Check
                        size={17}
                        strokeWidth={3}
                      />
                    ) : (
                      item.number
                    )}
                  </div>

                  <span
                    className={`mt-2 hidden text-[11px] font-bold sm:block ${
                      completed
                        ? "text-emerald-700"
                        : active
                          ? "text-purple-800"
                          : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
          <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-purple-100 bg-white p-5 shadow-sm sm:p-8">
            {/* PASO 1 */}
            {step === 1 && (
              <div>
                <div className="border-b border-purple-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                      <UserRound size={22} />
                    </div>

                    <div>
                      <h2 className="font-serif text-2xl font-black text-purple-950">
                        Datos personales
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Completa tus datos para continuar con el
                        pedido.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    <span className="font-black">
                      Atención:
                    </span>{" "}
                    {error}
                  </div>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Nombre{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <UserRound
                        size={21}
                        className={iconClass}
                      />

                      <input
                        type="text"
                        value={contactData.nombre}
                        onChange={(event) =>
                          updateField(
                            "nombre",
                            event.target.value,
                          )
                        }
                        placeholder="Tu nombre"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Apellido{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <UserRound
                        size={21}
                        className={iconClass}
                      />

                      <input
                        type="text"
                        value={contactData.apellido}
                        onChange={(event) =>
                          updateField(
                            "apellido",
                            event.target.value,
                          )
                        }
                        placeholder="Tu apellido"
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Cédula{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <IdCard
                        size={21}
                        className={iconClass}
                      />

                      <input
                        type="text"
                        inputMode="numeric"
                        value={contactData.cedulaContacto}
                        onChange={(event) =>
                          updateField(
                            "cedulaContacto",
                            event.target.value,
                          )
                        }
                        placeholder="Número de cédula"
                        maxLength={15}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Teléfono{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Phone
                        size={21}
                        className={iconClass}
                      />

                      <input
                        type="tel"
                        value={contactData.telefonoContacto}
                        onChange={(event) =>
                          updateField(
                            "telefonoContacto",
                            event.target.value,
                          )
                        }
                        placeholder="3001234567"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className={labelClass}>
                    Correo electrónico{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={21}
                      className={iconClass}
                    />

                    <input
                      type="email"
                      value={contactData.emailContacto}
                      onChange={(event) =>
                        updateField(
                          "emailContacto",
                          event.target.value,
                        )
                      }
                      placeholder="correo@ejemplo.com"
                      className={fieldClass}
                    />
                  </div>
                </div>

                {productId && (
                  <div className="mt-5">
                    <label className={labelClass}>
                      Cantidad{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <ShoppingBag
                        size={21}
                        className={iconClass}
                      />

                      <input
                        type="number"
                        min={1}
                        value={cantidad}
                        onChange={(event) =>
                          setCantidad(
                            Number(event.target.value),
                          )
                        }
                        className={fieldClass}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-7 flex justify-end border-t border-purple-100 pt-5">
                  <button
                    type="button"
                    onClick={goToStepTwo}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-800"
                  >
                    Siguiente: Método de entrega
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2 */}
            {step === 2 && (
              <div>
                <div className="border-b border-purple-100 pb-5">
                  <h2 className="font-serif text-2xl font-black text-purple-950">
                    Método de entrega
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecciona cómo deseas recibir tu pedido.
                  </p>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    <span className="font-black">
                      Atención:
                    </span>{" "}
                    {error}
                  </div>
                )}

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoEntrega("DOMICILIO");
                      setError("");
                    }}
                    className={`rounded-2xl border-2 p-5 text-left transition ${
                      metodoEntrega === "DOMICILIO"
                        ? "border-purple-600 bg-purple-50 shadow-sm"
                        : "border-purple-100 bg-white hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-white">
                        <Truck size={21} />
                      </div>

                      <div>
                        <h3 className="font-black text-purple-950">
                          Envío a domicilio
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          Recibe tu pedido en la dirección que
                          indiques.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMetodoEntrega("TIENDA");
                      setError("");
                    }}
                    className={`rounded-2xl border-2 p-5 text-left transition ${
                      metodoEntrega === "TIENDA"
                        ? "border-purple-600 bg-purple-50 shadow-sm"
                        : "border-purple-100 bg-white hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-white">
                        <Store size={21} />
                      </div>

                      <div>
                        <h3 className="font-black text-purple-950">
                          Recoger en tienda
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          Recoge personalmente tu pedido en Aurum.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {metodoEntrega === "DOMICILIO" && (
                  <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/40 p-5">
                    <div className="mb-5 flex items-center gap-2 text-purple-800">
                      <MapPin size={19} />

                      <h3 className="font-black">
                        Datos de entrega
                      </h3>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Dirección de entrega{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <MapPin
                          size={21}
                          className={iconClass}
                        />

                        <input
                          type="text"
                          value={contactData.direccionEntrega}
                          onChange={(event) =>
                            updateField(
                              "direccionEntrega",
                              event.target.value,
                            )
                          }
                          placeholder="Ej: Carrera 15 #85-30"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-3">
                      <div>
                        <label className={labelClass}>
                          Barrio{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Home
                            size={20}
                            className={iconClass}
                          />

                          <select
                            value={contactData.barrioEntrega}
                            onChange={(event) =>
                              updateField(
                                "barrioEntrega",
                                event.target.value,
                              )
                            }
                            className={selectClass}
                          >
                            <option value="">
                              Selecciona un barrio
                            </option>

                            {barrios.map((barrio) => (
                              <option
                                key={barrio}
                                value={barrio}
                              >
                                {barrio}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Ciudad{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Building2
                            size={20}
                            className={iconClass}
                          />

                          <select
                            value={contactData.ciudadEntrega}
                            onChange={(event) => {
                              setContactData((current) => ({
                                ...current,
                                ciudadEntrega:
                                  event.target.value,
                                barrioEntrega: "",
                              }));
                            }}
                            className={selectClass}
                          >
                            <option value="">
                              Selecciona una ciudad
                            </option>

                            {cities.map((city) => (
                              <option
                                key={city.name}
                                value={city.name}
                              >
                                {city.name}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-purple-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Departamento{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <MapPin
                            size={20}
                            className={iconClass}
                          />

                          <select
                            value={
                              contactData.departamentoEntrega
                            }
                            onChange={(event) => {
                              const departmentName =
                                event.target.value;

                              const department =
                                departments.find(
                                  (item) =>
                                    item.name === departmentName,
                                );

                              const orderedCities = [
                                ...(department?.cities ?? []),
                              ].sort((a, b) =>
                                a.name.localeCompare(
                                  b.name,
                                  "es",
                                ),
                              );

                              const preferredMedellin =
                                orderedCities.find(
                                  (city) =>
                                    city.name === "Medellín",
                                );

                              const firstCity =
                                preferredMedellin?.name ??
                                orderedCities[0]?.name ??
                                "";

                              setContactData((current) => ({
                                ...current,
                                departamentoEntrega:
                                  departmentName,
                                ciudadEntrega: firstCity,
                                barrioEntrega: "",
                              }));
                            }}
                            className={selectClass}
                          >
                            <option value="">
                              Selecciona departamento
                            </option>

                            {departments.map((department) => (
                              <option
                                key={department.name}
                                value={department.name}
                              >
                                {department.name}
                              </option>
                            ))}
                          </select>

                          <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {metodoEntrega === "TIENDA" && (
                  <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50 p-5">
                    <div className="flex items-start gap-3">
                      <Store
                        size={20}
                        className="mt-0.5 shrink-0 text-purple-700"
                      />

                      <div>
                        <p className="font-black text-purple-950">
                          Recogida en tienda
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          No tendrás costo de envío. Podrás recoger
                          personalmente tu pedido en Aurum cuando se
                          encuentre listo.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <label className={labelClass}>
                    Notas adicionales
                    <span className="ml-2 text-xs font-medium text-slate-400">
                      Opcional
                    </span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={21}
                      className="pointer-events-none absolute left-4 top-4 text-purple-600"
                    />

                    <textarea
                      rows={3}
                      maxLength={500}
                      value={contactData.notasEntrega}
                      onChange={(event) =>
                        updateField(
                          "notasEntrega",
                          event.target.value,
                        )
                      }
                      placeholder="Indicaciones para la entrega o detalles importantes."
                      className="w-full resize-none rounded-2xl border border-purple-200 bg-white py-3.5 pl-12 pr-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-purple-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                <div className="mt-7 flex flex-col justify-between gap-3 border-t border-purple-100 pt-5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-purple-800"
                  >
                    <ChevronLeft size={17} />
                    Anterior
                  </button>

                  <button
                    type="button"
                    onClick={createOrderAndContinue}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Preparando pedido..."
                      : "Siguiente: Pago seguro"}

                    {!loading && (
                      <ChevronRight size={17} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3 */}
            {step === 3 && (
              <div>
                <div className="border-b border-purple-100 pb-5">
                  <h2 className="font-serif text-2xl font-black text-purple-950">
                    Pasarela de pago seguro
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecciona el método con el que deseas realizar
                    el pago.
                  </p>
                </div>

                {createdOrder && (
                  <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900">
                    <strong>Pedido preparado:</strong>{" "}
                    {createdOrder.numeroPedido}
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["NEQUI", "Nequi"],
                    ["DAVIPLATA", "Daviplata"],
                    ["PSE", "PSE"],
                    [
                      "TRANSFERENCIA_BANCARIA",
                      "Transferencia bancaria",
                    ],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          value as PaymentMethod,
                        )
                      }
                      className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition ${
                        paymentMethod === value
                          ? "border-purple-700 bg-purple-700 text-white shadow-md"
                          : "border-purple-100 bg-white text-slate-600 hover:border-purple-300"
                      }`}
                    >
                      <CreditCard size={21} />

                      <span className="mt-2 text-sm font-bold">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-700 text-white">
                      <CreditCard size={19} />
                    </div>

                    <div>
                      <h3 className="font-black text-purple-950">
                        Pago seguro con Wompi
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        La pasarela real se conectará con la
                        integración de pagos del backend.
                      </p>
                    </div>
                  </div>

                  {paymentMethod !== "NEQUI" && (
                    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                      Este método todavía no está habilitado en el
                      flujo final.
                    </div>
                  )}
                </div>

                <div className="mt-7 flex flex-col justify-between gap-3 border-t border-purple-100 pt-5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(2);
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-purple-800"
                  >
                    <ChevronLeft size={17} />
                    Anterior
                  </button>

                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white opacity-55"
                  >
                    <CreditCard size={17} />
                    Pago pendiente de integrar
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4 */}
            {step === 4 && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <PackageCheck size={36} />
                </div>

                <h2 className="mt-5 font-serif text-3xl font-black text-purple-950">
                  Pedido confirmado
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                  Este paso aparecerá cuando Wompi confirme
                  correctamente el pago.
                </p>

                {createdOrder && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/pedidos/${createdOrder.id}`,
                      )
                    }
                    className="mt-6 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-800"
                  >
                    Ver mi pedido
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RESUMEN DEL CARRITO */}
          {isCartOrder && step < 3 && (
            <div className="mx-auto mt-4 flex max-w-4xl items-center justify-between rounded-2xl border border-purple-100 bg-white px-5 py-4 text-sm shadow-sm">
              <div>
                <p className="font-bold text-purple-950">
                  {cartQuantity} producto
                  {cartQuantity === 1 ? "" : "s"}
                </p>

                <p className="text-xs text-slate-500">
                  En tu carrito
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Total productos
                </p>

                <p className="text-lg font-black text-purple-700">
                  {formatPrice(cartTotal)}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}