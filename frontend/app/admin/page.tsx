"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CircleDollarSign,
    Clock3,
    LogOut,
    PackageCheck,
    PackageOpen,
    RefreshCw,
    ShoppingBag,
    Sparkles,
    Truck,
    UserRoundCheck,
    Users,
} from "lucide-react";

type AdminUser = {
    id: string;
    nombre: string;
    email: string;
    role: string;
};

type DashboardResponse = {
    resumen: {
        clientes: {
            total: number;
            activos: number;
            suspendidos: number;
            pendientesVerificacion: number;
        };
        productos: {
            total: number;
            activos: number;
            stockBajo: number;
        };
        pedidos: {
            total: number;
            pendientes: number;
            enPreparacion: number;
            enCamino: number;
            entregados: number;
            cancelados: number;
        };
        ventas: {
            pagosAprobados: number;
            totalAprobado: number;
        };
    };
    alertas: {
        productosStockBajo: Array<{
            id: string;
            sku: string;
            nombre: string;
            stock: number;
            stockMinimo: number;
        }>;
    };
    ultimosPedidos: Array<{
        id: string;
        numeroPedido: string;
        estado: string;
        metodoEntrega: string;
        total: number | string;
        createdAt: string;
        user: {
            id: string;
            nombre: string;
            apellido: string;
            email: string;
        };
    }>;
};

function formatMoney(value: number | string) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "$0";
    }

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getStatusClasses(status: string) {
    switch (status) {
        case "PENDIENTE":
            return "bg-amber-100 text-amber-800";
        case "EN_PREPARACION":
            return "bg-purple-100 text-purple-800";
        case "EN_CAMINO":
            return "bg-blue-100 text-blue-800";
        case "ENTREGADO":
            return "bg-emerald-100 text-emerald-800";
        case "CANCELADO":
            return "bg-red-100 text-red-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case "PENDIENTE":
            return "Pendiente";
        case "EN_PREPARACION":
            return "En preparación";
        case "EN_CAMINO":
            return "En camino";
        case "ENTREGADO":
            return "Entregado";
        case "CANCELADO":
            return "Cancelado";
        default:
            return status;
    }
}

export default function AdminDashboardPage() {
    const router = useRouter();

    const [user, setUser] = useState<AdminUser | null>(null);
    const [dashboard, setDashboard] =
        useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    async function loadDashboard(isRefresh = false) {
        const token = localStorage.getItem("aurum_token");
        const storedUser = localStorage.getItem("aurum_user");

        if (!token || !storedUser) {
            router.replace("/login");
            return;
        }

        let currentUser: AdminUser;

        try {
            currentUser = JSON.parse(storedUser) as AdminUser;
        } catch {
            localStorage.removeItem("aurum_token");
            localStorage.removeItem("aurum_user");
            router.replace("/login");
            return;
        }

        if (currentUser.role !== "ADMIN") {
            router.replace("/");
            return;
        }

        setUser(currentUser);
        setError("");

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL ??
                "http://localhost:4000";

            const response = await fetch(
                `${apiUrl}/api/admin/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
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
                    "Tu cuenta no tiene permisos para acceder al panel administrativo.",
                );
                return;
            }

            if (!response.ok) {
                setError(
                    "No fue posible cargar el panel administrativo.",
                );
                return;
            }

            const data: DashboardResponse = await response.json();

            setDashboard(data);
        } catch {
            setError("No fue posible conectar con el servidor.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadDashboard();
        }, 0);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleLogout() {
        localStorage.removeItem("aurum_token");
        localStorage.removeItem("aurum_user");
        router.replace("/");
        router.refresh();
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-purple-950 text-amber-300">
                        <Sparkles className="h-6 w-6" />
                    </div>

                    <p className="mt-4 text-sm font-bold text-purple-950">
                        Cargando panel administrativo...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-purple-900/20 bg-purple-950 text-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <div className="flex items-center gap-2 text-amber-300">
                            <Sparkles className="h-5 w-5" />

                            <span className="text-xs font-black uppercase tracking-[0.18em]">
                                Aurum Decoraciones
                            </span>
                        </div>

                        <h1 className="mt-2 text-2xl font-black">
                            Panel administrativo
                        </h1>

                        {user && (
                            <p className="mt-1 text-sm text-purple-200">
                                Sesión de {user.nombre}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/"
                            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10"
                        >
                            Ver tienda
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-purple-950 transition hover:bg-purple-50"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-purple-600">
                            Resumen general
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-purple-950">
                            Estado de AURUM
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Clientes, catálogo, pedidos y ventas en un solo lugar.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={refreshing}
                        onClick={() => void loadDashboard(true)}
                        className="flex w-fit items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-bold text-purple-800 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                        {refreshing ? "Actualizando..." : "Actualizar"}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {dashboard && (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                                        <Users className="h-5 w-5" />
                                    </div>

                                    <span className="text-xs font-bold text-slate-400">
                                        Clientes
                                    </span>
                                </div>

                                <p className="mt-5 text-3xl font-black text-purple-950">
                                    {dashboard.resumen.clientes.total}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {dashboard.resumen.clientes.activos} activos
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                                        {
                                            dashboard.resumen.clientes
                                                .pendientesVerificacion
                                        }{" "}
                                        pendientes
                                    </span>

                                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">
                                        {dashboard.resumen.clientes.suspendidos}{" "}
                                        suspendidos
                                    </span>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                        <Boxes className="h-5 w-5" />
                                    </div>

                                    <span className="text-xs font-bold text-slate-400">
                                        Productos
                                    </span>
                                </div>

                                <p className="mt-5 text-3xl font-black text-purple-950">
                                    {dashboard.resumen.productos.total}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {dashboard.resumen.productos.activos} activos
                                </p>

                                <div className="mt-4">
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                        {dashboard.resumen.productos.stockBajo} con
                                        stock bajo
                                    </span>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>

                                    <span className="text-xs font-bold text-slate-400">
                                        Pedidos
                                    </span>
                                </div>

                                <p className="mt-5 text-3xl font-black text-purple-950">
                                    {dashboard.resumen.pedidos.total}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {dashboard.resumen.pedidos.entregados} entregados
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                                        {dashboard.resumen.pedidos.pendientes} pendientes
                                    </span>

                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                                        {dashboard.resumen.pedidos.enCamino} en camino
                                    </span>
                                </div>
                            </article>

                            <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                        <CircleDollarSign className="h-5 w-5" />
                                    </div>

                                    <span className="text-xs font-bold text-slate-400">
                                        Ventas aprobadas
                                    </span>
                                </div>

                                <p className="mt-5 text-2xl font-black text-purple-950">
                                    {formatMoney(
                                        dashboard.resumen.ventas.totalAprobado,
                                    )}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    {dashboard.resumen.ventas.pagosAprobados} pagos
                                    aprobados
                                </p>
                            </article>
                        </section>

                        <section className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                            <article className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                                    <div>
                                        <h3 className="font-black text-purple-950">
                                            Últimos pedidos
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Los cinco pedidos más recientes.
                                        </p>
                                    </div>

                                    <Link
                                        href="/admin/pedidos"
                                        className="flex items-center gap-1 text-xs font-black text-purple-700 hover:text-purple-950"
                                    >
                                        Administrar
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {dashboard.ultimosPedidos.length === 0 ? (
                                        <p className="p-6 text-sm text-slate-500">
                                            Aún no hay pedidos registrados.
                                        </p>
                                    ) : (
                                        dashboard.ultimosPedidos.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-black text-purple-950">
                                                            {order.numeroPedido}
                                                        </p>

                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${getStatusClasses(
                                                                order.estado,
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                order.estado,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 truncate text-sm text-slate-600">
                                                        {order.user.nombre}{" "}
                                                        {order.user.apellido}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        {formatDate(
                                                            order.createdAt,
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="sm:text-right">
                                                    <p className="font-black text-purple-950">
                                                        {formatMoney(order.total)}
                                                    </p>

                                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                                        {order.metodoEntrega ===
                                                        "DOMICILIO"
                                                            ? "Domicilio"
                                                            : order.metodoEntrega ===
                                                                "TIENDA"
                                                              ? "Recogida en tienda"
                                                              : order.metodoEntrega}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </article>

                            <article className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-600" />

                                        <h3 className="font-black text-purple-950">
                                            Alertas de inventario
                                        </h3>
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Productos activos en su nivel mínimo o por
                                        debajo.
                                    </p>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {dashboard.alertas.productosStockBajo.length ===
                                    0 ? (
                                        <div className="p-6 text-center">
                                            <PackageCheck className="mx-auto h-8 w-8 text-emerald-600" />

                                            <p className="mt-2 text-sm font-bold text-slate-700">
                                                Inventario sin alertas
                                            </p>
                                        </div>
                                    ) : (
                                        dashboard.alertas.productosStockBajo.map(
                                            (product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center justify-between gap-4 px-5 py-4"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-black text-purple-950">
                                                            {product.nombre}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            SKU: {product.sku}
                                                        </p>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <p className="text-sm font-black text-red-700">
                                                            {product.stock}
                                                        </p>

                                                        <p className="text-[10px] font-semibold text-slate-400">
                                                            mínimo{" "}
                                                            {product.stockMinimo}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    )}
                                </div>
                            </article>
                        </section>

                        <section className="mt-8 grid gap-4 md:grid-cols-2">
                            <Link
                                href="/admin/clientes"
                                className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                                        <UserRoundCheck className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <p className="font-black text-purple-950">
                                            Administrar clientes
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Consultar clientes y gestionar su estado.
                                        </p>
                                    </div>
                                </div>

                                <ArrowRight className="h-5 w-5 text-purple-400 transition group-hover:translate-x-1" />
                            </Link>

                            <Link
                                href="/admin/pedidos"
                                className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                        <Truck className="h-6 w-6" />
                                    </div>

                                    <div>
                                        <p className="font-black text-purple-950">
                                            Administrar pedidos
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Revisar pedidos y actualizar sus estados.
                                        </p>
                                    </div>
                                </div>

                                <ArrowRight className="h-5 w-5 text-purple-400 transition group-hover:translate-x-1" />
                            </Link>
                        </section>

                        <section className="mt-8">
                            <div className="mb-4">
                                <h2 className="text-lg font-black text-purple-950">
                                    Gestión de catálogo
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Administra los productos, categorías y ocasiones
                                    de AURUM.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Link
                                    href="/admin/productos"
                                    className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                                            <Boxes className="h-6 w-6" />
                                        </div>

                                        <div>
                                            <p className="font-black text-purple-950">
                                                Administrar productos
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Crear, editar y gestionar los
                                                productos del catálogo.
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="h-5 w-5 shrink-0 text-purple-400 transition group-hover:translate-x-1" />
                                </Link>

                                <Link
                                    href="/admin/categorias"
                                    className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                            <PackageOpen className="h-6 w-6" />
                                        </div>

                                        <div>
                                            <p className="font-black text-purple-950">
                                                Administrar categorías
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Organizar y mantener las categorías
                                                del catálogo.
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="h-5 w-5 shrink-0 text-purple-400 transition group-hover:translate-x-1" />
                                </Link>

                                <Link
                                    href="/admin/ocasiones"
                                    className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                                            <Sparkles className="h-6 w-6" />
                                        </div>

                                        <div>
                                            <p className="font-black text-purple-950">
                                                Administrar ocasiones
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Gestionar las ocasiones disponibles
                                                para los productos.
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="h-5 w-5 shrink-0 text-purple-400 transition group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}