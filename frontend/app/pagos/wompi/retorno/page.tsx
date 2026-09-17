"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type WompiStatusResponse = {
    payment: {
        estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
        orderId: string;
    };
    transaction: {
        id: string;
        status:
        | "PENDING"
        | "APPROVED"
        | "DECLINED"
        | "VOIDED"
        | "ERROR";
    };
    message?: string;
};

type OrderResponse = {
    order: {
        id: string;
        numeroPedido: string;
        estado: string;
        total: number;
    };
    message?: string;
};

function WompiReturnContent() {
    const searchParams = useSearchParams();

    const [transactionId, setTransactionId] = useState(
        searchParams.get("id") ??
        searchParams.get("transaction_id") ??
        "",
    );

    const [loading, setLoading] = useState(
        Boolean(transactionId),
    );
    const [status, setStatus] = useState("");
    const [orderId, setOrderId] = useState("");
    const [error, setError] = useState("");
    const [order, setOrder] = useState<OrderResponse["order"] | null>(null);
    const [downloadingReceipt, setDownloadingReceipt] = useState(false);
    const [receiptError, setReceiptError] = useState("");

    useEffect(() => {
        if (transactionId) {
            return;
        }

        const storedTransactionId = sessionStorage.getItem(
            "aurum_wompi_transaction_id",
        );

        if (storedTransactionId) {
            setTransactionId(storedTransactionId);
        }
    }, [transactionId]);

    useEffect(() => {
        if (!transactionId) {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("aurum_token");

        if (!token) {
            setError(
                "Tu sesión no está disponible. Inicia sesión para verificar el pago.",
            );
            setLoading(false);
            return;
        }

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ??
            "http://localhost:4000";

        async function checkPaymentStatus() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${apiUrl}/api/payments/wompi/${encodeURIComponent(transactionId)}/status`,
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
                    | WompiStatusResponse
                    | { message?: string }
                    | null;

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.removeItem("aurum_token");
                    localStorage.removeItem("aurum_user");

                    setError(
                        "Tu sesión expiró. Inicia sesión nuevamente para verificar el pago.",
                    );
                    return;
                }

                if (!response.ok) {
                    setError(
                        data?.message ??
                        "No fue posible verificar el estado del pago.",
                    );
                    return;
                }

                const paymentData =
                    data as WompiStatusResponse;

                setStatus(paymentData.payment.estado);
                setOrderId(paymentData.payment.orderId);
            } catch {
                setError(
                    "No fue posible conectar con AURUM para verificar el pago.",
                );
            } finally {
                setLoading(false);
            }
        }

        void checkPaymentStatus();
    }, [transactionId]);
    useEffect(() => {
        if (status !== "APROBADO" || !orderId) {
            return;
        }

        const token = localStorage.getItem("aurum_token");

        if (!token) {
            return;
        }

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ??
            "http://localhost:4000";

        async function loadOrder() {
            try {
                const response = await fetch(
                    `${apiUrl}/api/orders/${encodeURIComponent(orderId)}`,
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
                    | OrderResponse
                    | { message?: string }
                    | null;

                if (!response.ok) {
                    setError(
                        data?.message ??
                        "El pago fue aprobado, pero no fue posible cargar el pedido.",
                    );
                    return;
                }

                const orderData = data as OrderResponse;
                setOrder(orderData.order);
            } catch {
                setError(
                    "El pago fue aprobado, pero no fue posible cargar la información del pedido.",
                );
            }
        }

        void loadOrder();
    }, [status, orderId]);

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
                process.env.NEXT_PUBLIC_API_URL ??
                "http://localhost:4000";

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
                setReceiptError(
                    "No fue posible descargar el comprobante.",
                );
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
            setReceiptError(
                "No fue posible conectar con el servidor.",
            );
        } finally {
            setDownloadingReceipt(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-16">
            <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-black text-purple-950">
                    Estado de tu pago
                </h1>

                {loading && (
                    <div className="mt-6">
                        <p className="font-semibold text-purple-800">
                            Verificando tu pago con Wompi...
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                            Estamos consultando el estado de la transacción.
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="mt-6 rounded-xl bg-red-50 p-4">
                        <p className="font-bold text-red-700">
                            No pudimos verificar el pago
                        </p>
                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {!loading && !error && status === "APROBADO" && (
                    <div className="mt-6">
                        <p className="text-sm font-bold uppercase tracking-wider text-purple-700">
                            Paso 4 — Confirmación
                        </p>

                        <div className="mt-3 rounded-xl bg-emerald-50 p-5">
                            <p className="text-lg font-black text-emerald-700">
                                Pago aprobado
                            </p>

                            <p className="mt-2 text-sm text-emerald-700">
                                Wompi confirmó correctamente tu pago. Tu pedido
                                continuará con el proceso de preparación.
                            </p>

                            {order && (
                                <div className="mt-5 border-t border-emerald-200 pt-4">
                                    <p className="text-sm text-slate-600">
                                        Número de pedido
                                    </p>

                                    <p className="mt-1 text-lg font-black text-purple-950">
                                        {order.numeroPedido}
                                    </p>

                                    <p className="mt-3 text-sm text-slate-600">
                                        Estado del pedido
                                    </p>

                                    <p className="mt-1 font-bold text-purple-800">
                                        {order.estado.replaceAll("_", " ")}
                                    </p>

                                    <a
                                        href={`/pedidos/${order.id}`}
                                        className="mt-5 inline-flex rounded-xl bg-purple-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-800"
                                    >
                                        Ver mi pedido
                                    </a>
                                                                        <button
                                        type="button"
                                        onClick={handleDownloadReceipt}
                                        disabled={downloadingReceipt}
                                        className="ml-3 mt-5 inline-flex rounded-xl border border-purple-950 px-5 py-3 text-sm font-bold text-purple-950 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {downloadingReceipt
                                            ? "Descargando..."
                                            : "Descargar comprobante"}
                                    </button>

                                    {receiptError && (
                                        <p className="mt-3 text-sm font-semibold text-red-600">
                                            {receiptError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!loading && !error && status === "RECHAZADO" && (
                    <div className="mt-6 rounded-xl bg-red-50 p-4">
                        <p className="font-bold text-red-700">
                            Pago rechazado
                        </p>
                        <p className="mt-1 text-sm text-red-600">
                            La transacción no fue aprobada por Wompi.
                        </p>
                    </div>
                )}

                {!loading && !error && status === "PENDIENTE" && (
                    <div className="mt-6 rounded-xl bg-amber-50 p-4">
                        <p className="font-bold text-amber-700">
                            Pago pendiente
                        </p>
                        <p className="mt-1 text-sm text-amber-700">
                            Wompi todavía está procesando la transacción.
                        </p>
                    </div>
                )}

                {!loading &&
                    !error &&
                    !transactionId &&
                    !status && (
                        <div className="mt-6 rounded-xl bg-amber-50 p-4">
                            <p className="font-bold text-amber-700">
                                No encontramos la transacción
                            </p>
                            <p className="mt-1 text-sm text-amber-700">
                                No recibimos ni encontramos el identificador
                                necesario para consultar el pago.
                            </p>
                        </div>
                    )}
            </div>
        </main>
    );
}

function LoadingWompiReturn() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm">
                <p className="text-sm font-bold text-purple-800">
                    Cargando información del pago...
                </p>
            </div>
        </main>
    );
}

export default function WompiReturnPage() {
    return (
        <Suspense fallback={<LoadingWompiReturn />}>
            <WompiReturnContent />
        </Suspense>
    );
}