"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Home,
  IdCard,
  Loader2,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "../context/CartContext";
import { colombiaLocations } from "../data/colombiaLocations";

type CheckoutStep = 1 | 2 | 3 | 4;

type DeliveryMethod = "DOMICILIO" | "TIENDA";

type PaymentMethod =
  | "NEQUI"
  | "PSE";

type MoneyValue = number | string;

type CreateOrderResponse = {
  message: string;
  order: {
    id: string;
    numeroPedido: string;
    subtotal: MoneyValue;
    costoEnvio: MoneyValue;
    descuento: MoneyValue;
    total: MoneyValue;
  };
};

type WompiAcceptanceResponse = {
  acceptanceToken: string;
  acceptancePermalink: string;
  personalDataAuthToken: string;
  personalDataAuthPermalink: string;
};

type WompiPseInstitution = {
  financial_institution_code: string;
  financial_institution_name: string;
};

const PSE_BANK_DISPLAY_NAMES: Record<string, string> = {
  "1": "Bancolombia",
  "2": "Davivienda",
  "3": "Banco de Bogotá",
};

type WompiPseInstitutionsResponse = {
  institutions: WompiPseInstitution[];
};

type WompiTransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR";

type WompiPaymentResponse = {
  message: string;
  payment: {
    id: string;
    orderId: string;
    metodo: PaymentMethod;
    estado:
    | "PENDIENTE"
    | "APROBADO"
    | "RECHAZADO"
    | "REEMBOLSADO";
    monto: string;
    referencia: string | null;
    proveedorTransaccion: string | null;
  };
  transaction: {
    id: string;
    reference: string;
    status: WompiTransactionStatus;
    amount_in_cents: number;
    currency: string;
    payment_method?: {
      type?: string;
      extra?: {
        async_payment_url?: string;
      };
    };
  };
};

type ApiErrorResponse = {
  message?: string;
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
  horaEntrega: string;
  notasEntrega: string;
};

type FieldErrors = Partial<
  Record<keyof ContactData | "cantidad", string>
>;

const initialContactData: ContactData = {
  nombre: "",
  apellido: "",
  cedulaContacto: "",
  emailContacto: "",
  telefonoContacto: "",
  direccionEntrega: "",
  barrioEntrega: "",
  ciudadEntrega: "",
  departamentoEntrega: "",
  horaEntrega: "",
  notasEntrega: "",
};

type DeliveryEstimate = {
  amount: number | null;
  label: string;
};

function calculateDeliveryEstimate(
  departamento: string,
  ciudad: string,
  barrio: string,
): DeliveryEstimate {
  if (!departamento || !ciudad) {
    return {
      amount: null,
      label: "Selecciona departamento y ciudad",
    };
  }

  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const department = normalize(departamento);
  const city = normalize(ciudad);
  const neighborhood = normalize(barrio);

  /*
   * Tarifas de domicilio definidas por Aurum.
   * El frontend las muestra como referencia antes
   * de crear el pedido; el backend confirma y
   * calcula el valor definitivo.
   */
  if (
    department === "antioquia" &&
    city === "bello" &&
    neighborhood === "niquia"
  ) {
    return {
      amount: 5000,
      label: "Tarifa local Niquía",
    };
  }

  if (
    department === "antioquia" &&
    city === "bello"
  ) {
    return {
      amount: 7000,
      label: "Tarifa Bello",
    };
  }

  if (
    department === "antioquia" &&
    city === "medellin"
  ) {
    return {
      amount: 10000,
      label: "Tarifa Medellín",
    };
  }

  if (
    department === "antioquia" &&
    ["copacabana", "itagui", "envigado", "sabaneta"].includes(
      city,
    )
  ) {
    return {
      amount: 12000,
      label: "Tarifa Valle de Aburrá",
    };
  }

  if (department === "antioquia") {
    return {
      amount: 15000,
      label: "Tarifa Antioquia",
    };
  }

  return {
    amount: null,
    label: "Domicilio por confirmar",
  };
}

export default function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId") ?? "";

  const { items: cartItems, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>(1);

  const [contactData, setContactData] =
    useState<ContactData>(initialContactData);

  const [profileLoaded, setProfileLoaded] =
    useState(false);

  const [metodoEntrega, setMetodoEntrega] =
    useState<DeliveryMethod>("DOMICILIO");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("NEQUI");

  const [pseInstitutions, setPseInstitutions] =
    useState<WompiPseInstitution[]>([]);
  const [pseInstitutionCode, setPseInstitutionCode] =
    useState("");
  const [pseUserType, setPseUserType] = useState("0");
  const [pseDocumentType, setPseDocumentType] =
    useState("CC");
  const [pseDocumentNumber, setPseDocumentNumber] =
    useState("");
  const [pseAccountType, setPseAccountType] = useState("AHORROS");
  const [pseAccountNumber, setPseAccountNumber] = useState("");

  const [cantidad, setCantidad] = useState(1);

  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] =
    useState(false);
  const [acceptanceLoading, setAcceptanceLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});
  const [paymentMessage, setPaymentMessage] =
    useState("");
  const [acceptanceError, setAcceptanceError] =
    useState("");
  const [createdOrder, setCreatedOrder] = useState<{
    id: string;
    numeroPedido: string;
    subtotal: number;
    costoEnvio: number;
    descuento: number;
    total: number;
  } | null>(null);

  const [wompiAcceptance, setWompiAcceptance] =
    useState<WompiAcceptanceResponse | null>(null);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPersonalData, setAcceptPersonalData] =
    useState(false);

  const [wompiTransaction, setWompiTransaction] =
    useState<{
      id: string;
      status: WompiTransactionStatus;
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

  const deliveryEstimate = useMemo(
    () =>
      calculateDeliveryEstimate(
        contactData.departamentoEntrega,
        contactData.ciudadEntrega,
        contactData.barrioEntrega,
      ),
    [
      contactData.departamentoEntrega,
      contactData.ciudadEntrega,
      contactData.barrioEntrega,
    ],
  );

  const estimatedOrderTotal =
    cartTotal +
    (metodoEntrega === "DOMICILIO" &&
      deliveryEstimate.amount
      ? deliveryEstimate.amount
      : 0);

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
      department.name ===
      contactData.departamentoEntrega,
  );

  const cities = useMemo(
    () =>
      [...(selectedDepartment?.cities ?? [])].sort(
        (a, b) =>
          a.name.localeCompare(b.name, "es"),
      ),
    [selectedDepartment],
  );

  const selectedCity = cities.find(
    (city) =>
      city.name === contactData.ciudadEntrega,
  );

  const barrios = useMemo(
    () =>
      [...(selectedCity?.barrios ?? [])].sort(
        (a, b) => a.localeCompare(b, "es"),
      ),
    [selectedCity],
  );

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  useEffect(() => {
    const storedUser =
      localStorage.getItem("aurum_user");

    if (!storedUser) {
      setProfileLoaded(true);
      return;
    }

    try {
      const user = JSON.parse(storedUser) as {
        nombre?: string;
        email?: string;
      };

      setContactData((current) => ({
        ...current,
        nombre:
          user.nombre?.trim() ||
          current.nombre,
        emailContacto:
          user.email?.trim() ||
          current.emailContacto,
      }));
    } catch {
      // Si la información guardada no es válida,
      // dejamos el formulario con sus valores actuales.
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  function handleClose() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  function focusField(field: keyof FieldErrors) {
    window.setTimeout(() => {
      const element =
        document.getElementById(String(field));

      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        element.focus();
      }
    }, 0);
  }

  function setFieldError(
    field: keyof FieldErrors,
    message: string,
  ) {
    setFieldErrors((current) => ({
      ...current,
      [field]: message,
    }));
    focusField(field);
  }

  function updateField(
    field: keyof ContactData,
    value: string,
  ) {
    setContactData((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function handleInvalidSession() {
    localStorage.removeItem("aurum_token");
    localStorage.removeItem("aurum_user");

    const returnTo =
      `${window.location.pathname}${window.location.search}`;

    router.push(
      `/login?redirect=${encodeURIComponent(returnTo)}`,
    );
  }

  function validateStepOne() {
    setError("");
    setFieldErrors({});

    if (contactData.nombre.trim().length < 2) {
      setFieldError(
        "nombre",
        "Completa tu nombre.",
      );
      return false;
    }

    if (contactData.apellido.trim().length < 2) {
      setFieldError(
        "apellido",
        "Completa tu apellido.",
      );
      return false;
    }

    if (!contactData.cedulaContacto.trim()) {
      setFieldError(
        "cedulaContacto",
        "Ingresa tu número de cédula.",
      );
      return false;
    }

    if (
      contactData.cedulaContacto.trim().length < 5
    ) {
      setFieldError(
        "cedulaContacto",
        "Ingresa un número de cédula válido.",
      );
      return false;
    }

    if (!contactData.telefonoContacto.trim()) {
      setFieldError(
        "telefonoContacto",
        "Ingresa tu número de teléfono.",
      );
      return false;
    }

    if (
      contactData.telefonoContacto.trim().length < 7
    ) {
      setFieldError(
        "telefonoContacto",
        "Ingresa un número de teléfono válido.",
      );
      return false;
    }

    if (!contactData.emailContacto.trim()) {
      setFieldError(
        "emailContacto",
        "Ingresa tu correo electrónico.",
      );
      return false;
    }

    if (
      !contactData.emailContacto.includes("@") ||
      !contactData.emailContacto.includes(".")
    ) {
      setFieldError(
        "emailContacto",
        "Ingresa un correo electrónico válido.",
      );
      return false;
    }

    return true;
  }

  function validateStepTwo() {
    setError("");
    setFieldErrors({});

    if (metodoEntrega === "DOMICILIO") {
      if (
        !contactData.direccionEntrega.trim()
      ) {
        setFieldError(
          "direccionEntrega",
          "Ingresa la dirección de entrega.",
        );
        return false;
      }

      if (
        !contactData.departamentoEntrega.trim()
      ) {
        setFieldError(
          "departamentoEntrega",
          "Selecciona un departamento.",
        );
        return false;
      }

      if (!contactData.ciudadEntrega.trim()) {
        setFieldError(
          "ciudadEntrega",
          "Selecciona una ciudad o municipio.",
        );
        return false;
      }

      if (!contactData.barrioEntrega.trim()) {
        setFieldError(
          "barrioEntrega",
          "Selecciona un barrio.",
        );
        return false;
      }

      if (!contactData.horaEntrega.trim()) {
        setFieldError(
          "horaEntrega",
          "Selecciona una hora de entrega.",
        );
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

  async function loadWompiAcceptanceData(
    token: string,
  ) {
    try {
      setAcceptanceLoading(true);
      setAcceptanceError("");

      const response = await fetch(
        `${apiUrl}/api/payments/wompi/acceptance`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | WompiAcceptanceResponse
        | ApiErrorResponse
        | null;

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleInvalidSession();
        throw new Error("SESSION_INVALID");
      }

      if (!response.ok) {
        const message =
          data &&
            "message" in data &&
            typeof data.message === "string"
            ? data.message
            : "No fue posible obtener los términos de Wompi.";

        throw new Error(message);
      }

      const acceptanceData =
        data as WompiAcceptanceResponse;

      setWompiAcceptance(acceptanceData);
      setAcceptanceError("");

      return acceptanceData;
    } finally {
      setAcceptanceLoading(false);
    }
  }

  async function loadPseInstitutions(token: string) {
    const response = await fetch(
      `${apiUrl}/api/payments/wompi/pse/institutions`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = (await response
      .json()
      .catch(() => null)) as
      | WompiPseInstitutionsResponse
      | ApiErrorResponse
      | null;

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleInvalidSession();
      throw new Error("SESSION_INVALID");
    }

    if (!response.ok) {
      const message =
        data &&
          "message" in data &&
          typeof data.message === "string"
          ? data.message
          : "No fue posible obtener las instituciones PSE.";

      throw new Error(message);
    }

    const institutionsData =
      data as WompiPseInstitutionsResponse;

    setPseInstitutions(institutionsData.institutions);

    return institutionsData.institutions;
  }

  async function createOrderAndContinue() {
    if (!validateStepTwo()) {
      return;
    }

    /*
     * Si el pedido ya fue creado, no lo creamos
     * nuevamente al volver al paso de pago.
     */
    if (createdOrder) {
      setError("");
      setStep(3);
      return;
    }

    if (
      !productId &&
      cartItems.length === 0
    ) {
      setError(
        "Debes seleccionar al menos un producto.",
      );
      return;
    }

    const token =
      localStorage.getItem("aurum_token");

    if (!token) {
      handleInvalidSession();
      return;
    }

    let items;

    if (productId) {
      if (
        !Number.isInteger(cantidad) ||
        cantidad < 1
      ) {
        setFieldError(
          "cantidad",
          "La cantidad debe ser mayor a cero.",
        );
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
        [
          metodoEntrega === "DOMICILIO" &&
            contactData.horaEntrega.trim()
            ? `Hora de entrega: ${contactData.horaEntrega.trim()}`
            : "",
          contactData.notasEntrega.trim(),
        ]
          .filter(Boolean)
          .join(" | ") || undefined,

      items,
    };

    try {
      setLoading(true);
      setError("");
      setPaymentMessage("");

      const response = await fetch(
        `${apiUrl}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleInvalidSession();
        return;
      }

      if (response.status === 404) {
        setError(
          "Uno de los productos ya no está disponible.",
        );
        return;
      }

      if (response.status === 409) {
        const data = (await response
          .json()
          .catch(() => null)) as
          | ApiErrorResponse
          | null;

        setError(
          data?.message ??
          "No hay suficiente stock para completar el pedido.",
        );
        return;
      }

      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => null)) as
          | ApiErrorResponse
          | null;

        setError(
          data?.message ??
          "No fue posible crear el pedido. Revisa los datos e intenta nuevamente.",
        );
        return;
      }

      const data =
        (await response.json()) as CreateOrderResponse;

      setCreatedOrder({
        id: data.order.id,
        numeroPedido:
          data.order.numeroPedido,
        subtotal: Number(data.order.subtotal),
        costoEnvio: Number(data.order.costoEnvio),
        descuento: Number(data.order.descuento),
        total: Number(data.order.total),
      });

      setError("");
      setStep(3);

      /*
       * Después de crear el pedido obtenemos
       * los contratos y tokens actuales de Wompi.
       */
      try {
        await loadWompiAcceptanceData(token);
      } catch (acceptanceError) {
        if (
          acceptanceError instanceof Error &&
          acceptanceError.message === "SESSION_INVALID"
        ) {
          return;
        }

        setAcceptanceError(
          acceptanceError instanceof Error
            ? acceptanceError.message
            : "No fue posible cargar los términos de Wompi.",
        );
      }
    } catch {
      setError(
        "No fue posible conectar con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  }

  function getNequiPhoneNumber() {
    let phone =
      contactData.telefonoContacto.replace(
        /\D/g,
        "",
      );

    /*
     * Permite que el usuario haya escrito
     * +57 3001234567.
     */
    if (
      phone.length === 12 &&
      phone.startsWith("57")
    ) {
      phone = phone.slice(2);
    }

    return phone;
  }

  async function handlePaymentMethodChange(
    method: PaymentMethod,
  ) {
    setPaymentMethod(method);
    setError("");
    setPaymentMessage("");

    if (method !== "PSE" || pseInstitutions.length > 0) {
      return;
    }

    const token = localStorage.getItem("aurum_token");

    if (!token) {
      handleInvalidSession();
      return;
    }

    try {
      await loadPseInstitutions(token);
    } catch (pseError) {
      if (
        pseError instanceof Error &&
        pseError.message === "SESSION_INVALID"
      ) {
        return;
      }

      setError(
        pseError instanceof Error
          ? pseError.message
          : "No fue posible cargar las instituciones PSE.",
      );
    }
  }

  async function payWithWompi() {
    setError("");
    setPaymentMessage("");

    if (!createdOrder) {
      setError(
        "No se encontró el pedido que deseas pagar.",
      );
      return;
    }

    if (
      paymentMethod !== "NEQUI" &&
      paymentMethod !== "PSE"
    ) {
      setError(
        "Selecciona un método de pago habilitado.",
      );
      return;
    }

    const phoneNumber =
      getNequiPhoneNumber();

    if (
      paymentMethod === "NEQUI" &&
      !/^\d{10}$/.test(phoneNumber)
    ) {
      setError(
        "Para pagar con Nequi debes ingresar un celular colombiano de 10 dígitos.",
      );
      return;
    }

    if (paymentMethod === "PSE") {
      if (!pseInstitutionCode) {
        setError(
          "Selecciona una entidad financiera para pagar con PSE.",
        );
        return;
      }

      if (!pseDocumentNumber.trim()) {
        setError(
          "Ingresa el número de documento para pagar con PSE.",
        );
        return;
      }
    }

    if (!pseAccountNumber.trim()) {
      setError(
        "Ingresa un número de cuenta para continuar con el pago por PSE.",
      );
      return;
    }

    if (!acceptTerms) {
      setError(
        "Debes aceptar los términos y condiciones de Wompi.",
      );
      return;
    }

    if (!acceptPersonalData) {
      setError(
        "Debes aceptar la autorización para el tratamiento de datos personales.",
      );
      return;
    }

    const token =
      localStorage.getItem("aurum_token");

    if (!token) {
      handleInvalidSession();
      return;
    }

    try {
      setPaymentLoading(true);

      let acceptanceData =
        wompiAcceptance;

      /*
       * Si los términos no cargaron previamente,
       * intentamos obtenerlos nuevamente.
       */
      if (!acceptanceData) {
        acceptanceData =
          await loadWompiAcceptanceData(
            token,
          );
      }

      const response = await fetch(
        `${apiUrl}/api/payments/wompi`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: createdOrder.id,
            metodo: paymentMethod,
            acceptanceToken:
              acceptanceData.acceptanceToken,
            acceptPersonalAuth:
              acceptanceData.personalDataAuthToken,
            paymentMethod:
              paymentMethod === "NEQUI"
                ? {
                  type: "NEQUI",
                  phone_number: phoneNumber,
                }
                : {
                  type: "PSE",
                  user_type: Number(pseUserType),
                  user_legal_id_type:
                    pseDocumentType,
                  user_legal_id:
                    pseDocumentNumber.trim(),
                  financial_institution_code:
                    pseInstitutionCode,
                  payment_description:
                    "Pago pedido Aurum",
                },
          }),
        },
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | WompiPaymentResponse
        | ApiErrorResponse
        | null;

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleInvalidSession();
        return;
      }

      if (response.status === 409) {
        const message =
          data &&
            "message" in data &&
            typeof data.message === "string"
            ? data.message
            : "Ya existe un pago pendiente o aprobado para este pedido.";

        setError(message);
        return;
      }

      if (!response.ok) {
        const message =
          data &&
            "message" in data &&
            typeof data.message === "string"
            ? data.message
            : "No fue posible iniciar el pago con Wompi.";

        setError(message);
        return;
      }

      const paymentData =
        data as WompiPaymentResponse;

      setWompiTransaction({
        id: paymentData.transaction.id,
        status:
          paymentData.transaction.status,
      });

      if (
        paymentMethod !== "PSE" &&
        paymentData.transaction.status === "APPROVED"
      ) {
        if (isCartOrder) {
          clearCart();
        }

        setPaymentMessage(
          "El pago fue aprobado correctamente.",
        );
        setError("");
        setStep(4);
        return;
      }

      if (
        paymentMethod === "PSE" &&
        (paymentData.transaction.status === "PENDING" ||
          paymentData.transaction.status === "APPROVED")
      ) {
        const asyncPaymentUrl =
          paymentData.transaction.payment_method?.extra
            ?.async_payment_url;

        if (!asyncPaymentUrl) {
          setError(
            "Wompi inició la transacción PSE, pero no devolvió la URL para continuar el pago.",
          );
          return;
        }

        if (isCartOrder) {
          clearCart();
        }

        sessionStorage.setItem(
          "aurum_wompi_transaction_id",
          paymentData.transaction.id,
        );

        window.location.href = asyncPaymentUrl;
        return;
      }

      if (
        paymentData.transaction.status === "PENDING"
      ) {
        if (isCartOrder) {
          clearCart();
        }

        setPaymentMessage("");
        return;
      }

      if (
        paymentData.transaction.status ===
        "DECLINED" ||
        paymentData.transaction.status ===
        "VOIDED" ||
        paymentData.transaction.status ===
        "ERROR"
      ) {
        setError(
          "Wompi no aprobó la transacción. Puedes revisar los datos e intentar nuevamente.",
        );
      }
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "No fue posible conectar con Wompi.",
      );
    } finally {
      setPaymentLoading(false);
    }
  }

  async function retryAcceptanceData() {
    const token =
      localStorage.getItem("aurum_token");

    if (!token) {
      handleInvalidSession();
      return;
    }

    try {
      setError("");
      setAcceptanceError("");

      await loadWompiAcceptanceData(
        token,
      );
    } catch (acceptanceError) {
      if (
        acceptanceError instanceof Error &&
        acceptanceError.message === "SESSION_INVALID"
      ) {
        return;
      }

      setAcceptanceError(
        acceptanceError instanceof Error
          ? acceptanceError.message
          : "No fue posible cargar los términos de Wompi.",
      );
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
              const completed =
                step > item.number;
              const active =
                step === item.number;

              return (
                <div
                  key={item.number}
                  className="relative z-10 flex w-20 flex-col items-center text-center sm:w-32"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-black shadow-md transition ${completed
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
                    className={`mt-2 hidden text-[11px] font-bold sm:block ${completed
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
                      <UserRound
                        size={22}
                      />
                    </div>

                    <div>
                      <h2 className="font-serif text-2xl font-black text-purple-950">
                        Datos personales
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Revisa tus datos antes
                        de continuar con el
                        pedido.
                      </p>
                    </div>
                  </div>
                </div>

                {profileLoaded && (
                  <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-purple-700"
                      />

                      <div>
                        <p className="font-black text-purple-950">
                          Verifica tus datos antes de continuar
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Hemos completado la información disponible
                          de tu cuenta. Revisa que tus datos de
                          contacto estén correctos antes de continuar
                          con la compra.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                    <label
                      className={
                        labelClass
                      }
                    >
                      Nombre{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <UserRound
                        size={21}
                        className={
                          iconClass
                        }
                      />

                      <input
                        id="nombre"
                        type="text"
                        aria-invalid={Boolean(fieldErrors.nombre)}
                        value={
                          contactData.nombre
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            "nombre",
                            event.target
                              .value,
                          )
                        }
                        placeholder="Tu nombre"
                        className={`${fieldClass} ${fieldErrors.nombre
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                          }`}
                      />
                    </div>

                    {fieldErrors.nombre && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">
                        {fieldErrors.nombre}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Apellido{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <UserRound
                        size={21}
                        className={
                          iconClass
                        }
                      />

                      <input
                        id="apellido"
                        type="text"
                        aria-invalid={Boolean(fieldErrors.apellido)}
                        value={
                          contactData.apellido
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            "apellido",
                            event.target
                              .value,
                          )
                        }
                        placeholder="Tu apellido"
                        className={`${fieldClass} ${fieldErrors.apellido
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                          }`}
                      />
                    </div>

                    {fieldErrors.apellido && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">
                        {fieldErrors.apellido}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Cédula{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <IdCard
                        size={21}
                        className={
                          iconClass
                        }
                      />

                      <input
                        id="cedulaContacto"
                        type="text"
                        inputMode="numeric"
                        aria-invalid={Boolean(fieldErrors.cedulaContacto)}
                        value={
                          contactData.cedulaContacto
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            "cedulaContacto",
                            event.target
                              .value,
                          )
                        }
                        placeholder="Número de cédula"
                        maxLength={15}
                        className={`${fieldClass} ${fieldErrors.cedulaContacto
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                          }`}
                      />
                    </div>

                    {fieldErrors.cedulaContacto && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">
                        {fieldErrors.cedulaContacto}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Teléfono{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <Phone
                        size={21}
                        className={
                          iconClass
                        }
                      />

                      <input
                        id="telefonoContacto"
                        type="tel"
                        aria-invalid={Boolean(fieldErrors.telefonoContacto)}
                        value={
                          contactData.telefonoContacto
                        }
                        onChange={(
                          event,
                        ) =>
                          updateField(
                            "telefonoContacto",
                            event.target
                              .value,
                          )
                        }
                        placeholder="3001234567"
                        className={`${fieldClass} ${fieldErrors.telefonoContacto
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                          }`}
                      />
                    </div>

                    {fieldErrors.telefonoContacto && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">
                        {fieldErrors.telefonoContacto}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    className={labelClass}
                  >
                    Correo electrónico{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={21}
                      className={iconClass}
                    />

                    <input
                      id="emailContacto"
                      type="email"
                      aria-invalid={Boolean(fieldErrors.emailContacto)}
                      value={
                        contactData.emailContacto
                      }
                      onChange={(event) =>
                        updateField(
                          "emailContacto",
                          event.target.value,
                        )
                      }
                      placeholder="correo@ejemplo.com"
                      className={`${fieldClass} ${fieldErrors.emailContacto
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : ""
                        }`}
                    />
                  </div>

                  {fieldErrors.emailContacto && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">
                      {fieldErrors.emailContacto}
                    </p>
                  )}
                </div>

                {productId && (
                  <div className="mt-5">
                    <label
                      className={
                        labelClass
                      }
                    >
                      Cantidad{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <ShoppingBag
                        size={21}
                        className={
                          iconClass
                        }
                      />

                      <input
                        id="cantidad"
                        type="number"
                        min={1}
                        aria-invalid={Boolean(fieldErrors.cantidad)}
                        value={cantidad}
                        onChange={(
                          event,
                        ) =>
                          setCantidad(
                            Number(
                              event.target
                                .value,
                            ),
                          )
                        }
                        className={`${fieldClass} ${fieldErrors.cantidad
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                          }`}
                      />
                    </div>

                    {fieldErrors.cantidad && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">
                        {fieldErrors.cantidad}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-7 flex justify-end border-t border-purple-100 pt-5">
                  <button
                    type="button"
                    onClick={
                      goToStepTwo
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-800"
                  >
                    Siguiente: Método
                    de entrega
                    <ChevronRight
                      size={17}
                    />
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
                    Selecciona cómo deseas
                    recibir tu pedido.
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
                      setMetodoEntrega(
                        "DOMICILIO",
                      );
                      setError("");
                    }}
                    className={`rounded-2xl border-2 p-5 text-left transition ${metodoEntrega ===
                      "DOMICILIO"
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
                          Envío a
                          domicilio
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          Recibe tu pedido
                          en la dirección
                          que indiques.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMetodoEntrega(
                        "TIENDA",
                      );
                      setError("");
                    }}
                    className={`rounded-2xl border-2 p-5 text-left transition ${metodoEntrega ===
                      "TIENDA"
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
                          Recoge
                          personalmente tu
                          pedido en Aurum.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {metodoEntrega ===
                  "DOMICILIO" && (
                    <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/40 p-5">
                      <div className="mb-5 flex items-center gap-2 text-purple-800">
                        <MapPin size={19} />

                        <h3 className="font-black">
                          Datos de entrega
                        </h3>
                      </div>

                      <div>
                        <label
                          className={
                            labelClass
                          }
                        >
                          Dirección de
                          entrega{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <MapPin
                            size={21}
                            className={
                              iconClass
                            }
                          />

                          <input
                            id="direccionEntrega"
                            type="text"
                            aria-invalid={Boolean(fieldErrors.direccionEntrega)}
                            value={
                              contactData.direccionEntrega
                            }
                            onChange={(
                              event,
                            ) =>
                              updateField(
                                "direccionEntrega",
                                event.target
                                  .value,
                              )
                            }
                            placeholder="Ej: Carrera 15 #85-30"
                            className={`${fieldClass} ${fieldErrors.direccionEntrega
                              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                              : ""
                              }`}
                          />
                        </div>

                        {fieldErrors.direccionEntrega && (
                          <p className="mt-1.5 text-xs font-semibold text-red-600">
                            {fieldErrors.direccionEntrega}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 grid gap-5 md:grid-cols-3">
                        {/* DEPARTAMENTO */}
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
                              id="departamentoEntrega"
                              aria-invalid={Boolean(fieldErrors.departamentoEntrega)}
                              value={contactData.departamentoEntrega}
                              onChange={(event) => {
                                const departmentName =
                                  event.target.value;

                                const department =
                                  departments.find(
                                    (item) =>
                                      item.name === departmentName,
                                  );

                                setContactData((current) => ({
                                  ...current,
                                  departamentoEntrega:
                                    departmentName,
                                  ciudadEntrega: "",
                                  barrioEntrega: "",
                                }));
                              }}
                              className={`${selectClass} ${fieldErrors.departamentoEntrega
                                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                : ""
                                }`}
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

                          {fieldErrors.departamentoEntrega && (
                            <p className="mt-1.5 text-xs font-semibold text-red-600">
                              {fieldErrors.departamentoEntrega}
                            </p>
                          )}
                        </div>

                        {/* CIUDAD */}
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
                              id="ciudadEntrega"
                              aria-invalid={Boolean(fieldErrors.ciudadEntrega)}
                              value={contactData.ciudadEntrega}
                              onChange={(event) => {
                                setContactData((current) => ({
                                  ...current,
                                  ciudadEntrega:
                                    event.target.value,
                                  barrioEntrega: "",
                                }));
                              }}
                              className={`${selectClass} ${fieldErrors.ciudadEntrega
                                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                : ""
                                }`}
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

                          {fieldErrors.ciudadEntrega && (
                            <p className="mt-1.5 text-xs font-semibold text-red-600">
                              {fieldErrors.ciudadEntrega}
                            </p>
                          )}
                        </div>

                        {/* BARRIO */}
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
                              id="barrioEntrega"
                              aria-invalid={Boolean(fieldErrors.barrioEntrega)}
                              value={contactData.barrioEntrega}
                              onChange={(event) =>
                                updateField(
                                  "barrioEntrega",
                                  event.target.value,
                                )
                              }
                              className={`${selectClass} ${fieldErrors.barrioEntrega
                                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                : ""
                                }`}
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

                          {fieldErrors.barrioEntrega && (
                            <p className="mt-1.5 text-xs font-semibold text-red-600">
                              {fieldErrors.barrioEntrega}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* HORA DE ENTREGA */}
                      <div className="mt-5">
                        <label className={labelClass}>
                          Hora de entrega{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Clock3
                            size={20}
                            className={iconClass}
                          />

                          <select
                            value={contactData.horaEntrega}
                            onChange={(event) =>
                              updateField(
                                "horaEntrega",
                                event.target.value,
                              )
                            }
                            className={selectClass}
                          >
                            <option value="">
                              Selecciona una hora
                            </option>
                            <option value="08:00 - 10:00">
                              08:00 a. m. - 10:00 a. m.
                            </option>
                            <option value="10:00 - 12:00">
                              10:00 a. m. - 12:00 m.
                            </option>
                            <option value="12:00 - 14:00">
                              12:00 m. - 2:00 p. m.
                            </option>
                            <option value="14:00 - 16:00">
                              2:00 p. m. - 4:00 p. m.
                            </option>
                            <option value="16:00 - 18:00">
                              4:00 p. m. - 6:00 p. m.
                            </option>
                          </select>

                          <ChevronDown
                            size={18}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-purple-500"
                          />
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          Selecciona una franja aproximada para la entrega.
                        </p>
                      </div>

                      {/* TARIFA DE DOMICILIO */}
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-black text-purple-950">
                              Tarifa de domicilio desde Niquía, Bello
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {deliveryEstimate.label}. El backend confirmará
                              el valor definitivo al crear el pedido.
                            </p>
                          </div>

                          <p className="text-lg font-black text-amber-700">
                            {deliveryEstimate.amount !== null
                              ? formatPrice(deliveryEstimate.amount)
                              : "Por confirmar"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {metodoEntrega ===
                  "TIENDA" && (
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
                            No tendrás costo de
                            envío. Podrás
                            recoger
                            personalmente tu
                            pedido en Aurum
                            cuando se encuentre
                            listo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="mt-6">
                  <label
                    className={labelClass}
                  >
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
                      value={
                        contactData.notasEntrega
                      }
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
                    <ChevronLeft
                      size={17}
                    />
                    Anterior
                  </button>

                  <button
                    type="button"
                    onClick={
                      createOrderAndContinue
                    }
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Preparando pedido..."
                      : "Siguiente: Pago seguro"}

                    {!loading && (
                      <ChevronRight
                        size={17}
                      />
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
                    Pasarela de pago
                    seguro
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Realiza tu pago de
                    forma segura con
                    Wompi.
                  </p>
                </div>

                {createdOrder && (
                  <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900">
                    <p>
                      <strong>Pedido preparado:</strong>{" "}
                      {createdOrder.numeroPedido}
                    </p>

                    <div className="mt-3 grid gap-2 border-t border-purple-200 pt-3 sm:grid-cols-2">
                      <p>
                        <span className="font-bold">Domicilio confirmado:</span>{" "}
                        {formatPrice(createdOrder.costoEnvio)}
                      </p>

                      <p className="sm:text-right">
                        <span className="font-bold">Total confirmado:</span>{" "}
                        {formatPrice(createdOrder.total)}
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    <span className="font-black">
                      Atención:
                    </span>{" "}
                    {error}
                  </div>
                )}

                {paymentMessage && (
                  <div className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                    {paymentMessage}
                  </div>
                )}

                <div className="mt-6">
                  <p className="mb-3 text-sm font-black text-purple-950">
                    Método de pago
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        value:
                          "NEQUI" as PaymentMethod,
                        label: "Nequi",
                        enabled: true,
                      },
                      {
                        value: "DAVIPLATA" as PaymentMethod,
                        label: "Daviplata",
                        enabled: false,
                      },
                      {
                        value:
                          "PSE" as PaymentMethod,
                        label: "PSE",
                        enabled: true,
                      },
                      {
                        value: "TRANSFERENCIA_BANCARIA" as PaymentMethod,
                        label: "Transferencia",
                        enabled: false,
                      },
                    ].map(
                      ({
                        value,
                        label,
                        enabled,
                      }) => (
                        <button
                          key={value}
                          type="button"
                          disabled={
                            !enabled ||
                            paymentLoading
                          }
                          onClick={() => {
                            if (
                              enabled
                            ) {
                              void handlePaymentMethodChange(
                                value,
                              );
                            }
                          }}
                          className={`relative flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition ${paymentMethod ===
                            value &&
                            enabled
                            ? "border-purple-700 bg-purple-700 text-white shadow-md"
                            : enabled
                              ? "border-purple-100 bg-white text-slate-600 hover:border-purple-300"
                              : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 opacity-70"
                            }`}
                        >
                          <CreditCard
                            size={21}
                          />

                          <span className="mt-2 text-sm font-bold">
                            {label}
                          </span>

                          {!enabled && (
                            <span className="mt-1 text-[10px] font-black uppercase tracking-wide">
                              Próximamente
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-white">
                      <ShieldCheck
                        size={20}
                      />
                    </div>

                    <div>
                      <h3 className="font-black text-purple-950">
                        Pago seguro con
                        Wompi
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        El pago se
                        procesará por
                        medio de Wompi.
                        Aurum no almacena
                        claves privadas ni
                        información
                        sensible de la
                        pasarela en el
                        navegador.
                      </p>
                    </div>
                  </div>

                  {paymentMethod === "NEQUI" && (
                    <div className="mt-5 rounded-xl border border-purple-100 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <Phone
                          size={20}
                          className="mt-0.5 shrink-0 text-purple-700"
                        />

                        <div>
                          <p className="text-sm font-black text-purple-950">
                            Número Nequi
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            Se utilizará el teléfono que ingresaste en tus datos:
                          </p>

                          <p className="mt-2 font-black text-purple-700">
                            {contactData.telefonoContacto}
                          </p>

                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Debe ser un celular colombiano de 10 dígitos registrado en
                            Nequi.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "PSE" && (
                    <div className="mt-5 rounded-xl border border-purple-100 bg-white p-4">
                      <div>
                        <p className="text-sm font-black text-purple-950">
                          Pago por PSE
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Selecciona tu entidad financiera y completa los
                          datos requeridos para continuar el pago de forma
                          segura con Wompi.
                        </p>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className={labelClass}>
                            Entidad financiera
                          </label>

                          <select
                            value={pseInstitutionCode}
                            onChange={(event) =>
                              setPseInstitutionCode(event.target.value)
                            }
                            className={fieldClass}
                          >
                            <option value="">
                              Selecciona una entidad
                            </option>

                            {pseInstitutions.map((institution) => (
                              <option
                                key={
                                  institution.financial_institution_code
                                }
                                value={
                                  institution.financial_institution_code
                                }
                              >
                                {
                                  PSE_BANK_DISPLAY_NAMES[
                                  institution.financial_institution_code
                                  ] ?? institution.financial_institution_name
                                }
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>
                            Tipo de persona
                          </label>

                          <select
                            value={pseUserType}
                            onChange={(event) =>
                              setPseUserType(event.target.value)
                            }
                            className={fieldClass}
                          >
                            <option value="0">
                              Persona natural
                            </option>
                            <option value="1">
                              Persona jurídica
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className={labelClass}>
                            Tipo de documento
                          </label>

                          <select
                            value={pseDocumentType}
                            onChange={(event) =>
                              setPseDocumentType(event.target.value)
                            }
                            className={fieldClass}
                          >
                            <option value="CC">
                              Cédula de ciudadanía
                            </option>
                            <option value="CE">
                              Cédula de extranjería
                            </option>
                            <option value="NIT">
                              NIT
                            </option>
                            <option value="PP">
                              Pasaporte
                            </option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelClass}>
                            Número de documento
                          </label>

                          <input
                            type="text"
                            value={pseDocumentNumber}
                            onChange={(event) =>
                              setPseDocumentNumber(
                                event.target.value,
                              )
                            }
                            placeholder="Ingresa tu número de documento"
                            className={fieldClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>
                          Tipo de cuenta
                        </label>

                        <select
                          value={pseAccountType}
                          onChange={(event) =>
                            setPseAccountType(event.target.value)
                          }
                          className={fieldClass}
                        >
                          <option value="AHORROS">Cuenta de ahorros</option>
                          <option value="CORRIENTE">Cuenta corriente</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Número de cuenta
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={pseAccountNumber}
                          onChange={(event) =>
                            setPseAccountNumber(
                              event.target.value.replace(/\D/g, "").slice(0, 20),
                            )
                          }
                          placeholder="Ej. 12345678901"
                          className={fieldClass}
                          autoComplete="off"
                        />

                        <p className="mt-1 text-xs text-slate-500">
                          Dato de demostración. AURUM no almacena ni envía este número a Wompi.
                        </p>
                      </div>
                    </div>
                  )}

                  {acceptanceLoading && (
                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-3 text-sm font-semibold text-purple-800">
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Cargando términos
                      vigentes de Wompi...
                    </div>
                  )}

                  {!acceptanceLoading &&
                    !wompiAcceptance && (
                      <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-bold">
                          {acceptanceError ||
                            "No fue posible cargar todavía los términos de Wompi."}
                        </p>

                        <button
                          type="button"
                          onClick={
                            retryAcceptanceData
                          }
                          className="mt-3 rounded-lg bg-purple-700 px-4 py-2 text-xs font-black text-white transition hover:bg-purple-800"
                        >
                          Reintentar
                        </button>
                      </div>
                    )}

                  {wompiAcceptance && (
                    <div className="mt-5 space-y-3">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-purple-100 bg-white p-4">
                        <input
                          type="checkbox"
                          checked={
                            acceptTerms
                          }
                          onChange={(
                            event,
                          ) =>
                            setAcceptTerms(
                              event.target
                                .checked,
                            )
                          }
                          className="mt-1 h-4 w-4 accent-purple-700"
                        />

                        <span className="text-sm leading-6 text-slate-600">
                          He leído y
                          acepto los{" "}
                          <a
                            href={
                              wompiAcceptance.acceptancePermalink
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(
                              event,
                            ) =>
                              event.stopPropagation()
                            }
                            className="inline-flex items-center gap-1 font-black text-purple-700 underline underline-offset-2"
                          >
                            términos y
                            condiciones de
                            Wompi
                            <ExternalLink
                              size={
                                13
                              }
                            />
                          </a>
                          .
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-purple-100 bg-white p-4">
                        <input
                          type="checkbox"
                          checked={
                            acceptPersonalData
                          }
                          onChange={(
                            event,
                          ) =>
                            setAcceptPersonalData(
                              event.target
                                .checked,
                            )
                          }
                          className="mt-1 h-4 w-4 accent-purple-700"
                        />

                        <span className="text-sm leading-6 text-slate-600">
                          He leído y
                          acepto la{" "}
                          <a
                            href={
                              wompiAcceptance.personalDataAuthPermalink
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(
                              event,
                            ) =>
                              event.stopPropagation()
                            }
                            className="inline-flex items-center gap-1 font-black text-purple-700 underline underline-offset-2"
                          >
                            autorización
                            para el
                            tratamiento de
                            datos
                            personales
                            <ExternalLink
                              size={
                                13
                              }
                            />
                          </a>
                          .
                        </span>
                      </label>
                    </div>
                  )}

                  {paymentMethod === "NEQUI" &&
                    wompiTransaction?.status === "PENDING" && (
                      <div className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
                        <p className="font-black">
                          Solicitud enviada
                          a Nequi
                        </p>

                        <p className="mt-1 leading-6">
                          Abre la aplicación
                          Nequi en tu celular
                          y acepta la
                          solicitud de pago.
                          Wompi notificará al
                          backend cuando el
                          estado cambie.
                        </p>
                      </div>
                    )}
                </div>

                <div className="mt-7 flex flex-col justify-between gap-3 border-t border-purple-100 pt-5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        wompiTransaction
                          ?.status ===
                        "PENDING"
                      ) {
                        return;
                      }

                      setError("");
                      setStep(2);
                    }}
                    disabled={
                      paymentLoading ||
                      wompiTransaction
                        ?.status ===
                      "PENDING"
                    }
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-purple-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={17}
                    />
                    Anterior
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {wompiTransaction
                      ?.status ===
                      "PENDING" &&
                      createdOrder && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/pedidos/${createdOrder.id}`,
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-6 py-3 text-sm font-black text-purple-800 transition hover:bg-purple-50"
                        >
                          Ver estado del
                          pedido
                          <ChevronRight
                            size={17}
                          />
                        </button>
                      )}

                    <button
                      type="button"
                      onClick={
                        payWithWompi
                      }
                      disabled={
                        paymentLoading ||
                        acceptanceLoading ||
                        !wompiAcceptance ||
                        !acceptTerms ||
                        !acceptPersonalData ||
                        (paymentMethod !== "NEQUI" &&
                          paymentMethod !== "PSE") ||
                        wompiTransaction
                          ?.status ===
                        "PENDING"
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Procesando...
                        </>
                      ) : paymentMethod === "NEQUI" &&
                        wompiTransaction?.status === "PENDING" ? (
                        <>
                          <Check
                            size={17}
                          />
                          Solicitud enviada
                        </>
                      ) : (
                        <>
                          <CreditCard
                            size={17}
                          />
                          {paymentMethod === "PSE"
                            ? "Continuar con PSE"
                            : "Pagar con Nequi"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 4 */}
            {step === 4 && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <PackageCheck
                    size={36}
                  />
                </div>

                <h2 className="mt-5 font-serif text-3xl font-black text-purple-950">
                  Pago aprobado
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                  Wompi confirmó
                  correctamente el pago
                  de tu pedido. Aurum ya
                  puede continuar con la
                  preparación.
                </p>

                {createdOrder && (
                  <div className="mx-auto mt-5 max-w-sm rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-900">
                    <strong>
                      Pedido:
                    </strong>{" "}
                    {
                      createdOrder.numeroPedido
                    }
                  </div>
                )}

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
          {isCartOrder &&
            step < 3 && (
              <div className="mx-auto mt-4 flex max-w-4xl items-center justify-between rounded-2xl border border-purple-100 bg-white px-5 py-4 text-sm shadow-sm">
                <div>
                  <p className="font-bold text-purple-950">
                    {cartQuantity}{" "}
                    producto
                    {cartQuantity === 1
                      ? ""
                      : "s"}
                  </p>

                  <p className="text-xs text-slate-500">
                    En tu carrito
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Productos
                  </p>

                  <p className="text-sm font-black text-purple-700">
                    {formatPrice(cartTotal)}
                  </p>

                  {metodoEntrega === "DOMICILIO" && (
                    <>
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Domicilio
                      </p>

                      <p className="text-sm font-black text-amber-700">
                        {deliveryEstimate.amount !== null
                          ? formatPrice(deliveryEstimate.amount)
                          : "Por confirmar"}
                      </p>
                    </>
                  )}

                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Total estimado
                  </p>

                  <p className="text-lg font-black text-purple-700">
                    {metodoEntrega === "DOMICILIO" &&
                      deliveryEstimate.amount === null
                      ? formatPrice(cartTotal)
                      : formatPrice(estimatedOrderTotal)}
                  </p>
                </div>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
