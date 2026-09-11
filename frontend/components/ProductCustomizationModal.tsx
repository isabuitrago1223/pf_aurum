"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  customizationByCategory,
  ProductCustomizationConfig,
} from "../config/productCustomization";

import { useCart } from "../context/CartContext";

type Product = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: string;
  imagen: string | null;
  imagenAlt: string | null;
  tiempoEntrega: string;
  permitirPersonalizacion: boolean;
  category: {
    nombre: string;
    slug: string;
  };
};

type ProductCustomizationModalProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
};

type SelectionValue =
  | string
  | string[]
  | undefined;

type Selections = Record<
  string,
  SelectionValue
>;

export default function ProductCustomizationModal({
  product,
  open,
  onClose,
}: ProductCustomizationModalProps) {
  const { addItem } = useCart();

  const [selections, setSelections] =
    useState<Selections>({});

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const config: ProductCustomizationConfig | null =
    useMemo(() => {
      if (!product) {
        return null;
      }

      return (
        customizationByCategory[
          product.category.slug
        ] ?? null
      );
    }, [product]);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelections({});
    setQuantity(1);
    setAdded(false);
  }, [product]);

  function selectSingle(
    groupId: string,
    value: string,
  ) {
    setSelections((current) => ({
      ...current,
      [groupId]: value,
    }));
  }

  function selectMultiple(
    groupId: string,
    value: string,
    maxSelections?: number,
  ) {
    setSelections((current) => {
      const currentValues = Array.isArray(
        current[groupId],
      )
        ? (current[groupId] as string[])
        : [];

      const alreadySelected =
        currentValues.includes(value);

      if (alreadySelected) {
        return {
          ...current,
          [groupId]: currentValues.filter(
            (item) => item !== value,
          ),
        };
      }

      if (
        maxSelections &&
        currentValues.length >= maxSelections
      ) {
        return current;
      }

      return {
        ...current,
        [groupId]: [
          ...currentValues,
          value,
        ],
      };
    });
  }

  function updateText(
    groupId: string,
    value: string,
  ) {
    setSelections((current) => ({
      ...current,
      [groupId]: value,
    }));
  }

  function handleAddToCart() {
    if (!product) {
      return;
    }

    const cleanPersonalization =
      Object.fromEntries(
        Object.entries(
          selections,
        ).filter(([, value]) => {
          if (Array.isArray(value)) {
            return value.length > 0;
          }

          return Boolean(value);
        }),
      ) as Record<
        string,
        string | string[]
      >;

    addItem({
      productId: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagen,
      cantidad: quantity,
      personalizacion:
        Object.keys(
          cleanPersonalization,
        ).length > 0
          ? cleanPersonalization
          : undefined,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  if (!product) {
    return null;
  }

  const hasValidImage =
    product.imagen?.startsWith("http");

  const groups = config?.groups ?? [];

  const firstGroup =
    groups[0] ?? null;

  const remainingGroups =
    groups.slice(1);

  function renderGroup(
    group: (typeof groups)[number],
  ) {
    const selectedValue =
      selections[group.id];

    return (
      <section key={group.id}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.08em] text-purple-950">
            {group.label}

            {group.type === "multiple" &&
            group.maxSelections
              ? ` (Escoger máximo ${group.maxSelections})`
              : ""}
          </h3>

          {group.type === "multiple" &&
            Array.isArray(selectedValue) && (
              <span className="shrink-0 text-[10px] font-bold text-purple-600">
                {selectedValue.length}/
                {group.maxSelections} seleccionadas
              </span>
            )}
        </div>

        {group.type === "single" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.options?.map((option) => {
              const active =
                selectedValue === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    selectSingle(
                      group.id,
                      option.value,
                    )
                  }
                  className={`flex min-h-[31px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                    active
                      ? "border-purple-700 bg-purple-800 text-white shadow-sm"
                      : "border-purple-100 bg-white text-slate-600 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {active && (
                    <Check className="h-3 w-3 text-amber-300" />
                  )}

                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {group.type === "multiple" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.options?.map((option) => {
              const values =
                Array.isArray(selectedValue)
                  ? selectedValue
                  : [];

              const active =
                values.includes(
                  option.value,
                );

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    selectMultiple(
                      group.id,
                      option.value,
                      group.maxSelections,
                    )
                  }
                  className={`flex min-h-[31px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                    active
                      ? "border-purple-700 bg-purple-800 text-white shadow-sm"
                      : "border-purple-100 bg-white text-slate-600 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  {active && (
                    <Check className="h-3 w-3 text-amber-300" />
                  )}

                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {group.type === "text" && (
          <textarea
            rows={2}
            placeholder={group.placeholder}
            value={
              typeof selectedValue ===
              "string"
                ? selectedValue
                : ""
            }
            onChange={(event) =>
              updateText(
                group.id,
                event.target.value,
              )
            }
            className="w-full resize-none rounded-lg border border-purple-100 bg-white px-3 py-2 text-[10px] leading-4 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        )}
      </section>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-purple-950/70 p-3 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 14,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 14,
              scale: 0.98,
            }}
            transition={{
              duration: 0.18,
            }}
            className="flex max-h-[86vh] w-full max-w-[790px] flex-col overflow-hidden rounded-[1.25rem] border border-white/60 bg-white shadow-2xl"
          >
            {/* ENCABEZADO */}
            <div className="shrink-0 bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-950 px-5 py-3.5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-300" />

                  <h2 className="font-serif text-[17px] font-black">
                    Personalizar Producto
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-purple-100 transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CONTENIDO */}
            <div className="overflow-y-auto">
              <div className="grid gap-5 p-5 lg:grid-cols-[0.93fr_1.07fr]">
                {/* COLUMNA IZQUIERDA */}
                <div>
                  {/* IMAGEN */}
                  <div className="relative overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-purple-50 to-amber-50 shadow-sm">
                    <div className="relative h-[270px]">
                      {hasValidImage ? (
                        <img
                          src={
                            product.imagen ??
                            ""
                          }
                          alt={
                            product.imagenAlt ??
                            product.nombre
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="relative flex h-full items-center justify-center overflow-hidden">
                          <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-purple-300/25 blur-3xl" />

                          <div className="absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-amber-200/45 blur-3xl" />

                          <div className="relative text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-950 via-purple-800 to-purple-600 text-2xl font-black text-amber-300 shadow-lg">
                              A
                            </div>

                            <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-purple-700">
                              Aurum Decoraciones
                            </p>

                            <p className="mt-1 text-[9px] text-slate-500">
                              Imagen pendiente de Cloudinary
                            </p>
                          </div>
                        </div>
                      )}

                      <span className="absolute left-3 top-3 rounded-full bg-purple-800 px-3 py-1 text-[9px] font-black text-amber-300 shadow">
                        {product.category.nombre}
                      </span>
                    </div>
                  </div>

                  {/* ENTREGA */}
                  <div className="mt-3 rounded-xl border border-purple-100 bg-[#fbf8fd] p-3.5">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5 text-purple-600" />

                      <p className="text-[10px] font-black text-purple-950">
                        Tiempo de Entrega Estimado:
                      </p>
                    </div>

                    <span className="mt-2 inline-flex rounded-lg border border-purple-50 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm">
                      {product.tiempoEntrega}
                    </span>

                    {product.descripcion && (
                      <p className="mt-3 text-[10px] leading-[1.5] text-slate-500">
                        {product.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div>
                  <h1 className="font-serif text-[22px] font-black leading-[1.1] text-slate-900">
                    {product.nombre}
                  </h1>

                  <p className="mt-2 font-serif text-[23px] font-black text-purple-800">
                    $
                    {Number(
                      product.precio,
                    ).toLocaleString(
                      "es-CO",
                    )}
                  </p>

                  {product.permitirPersonalizacion &&
                  config ? (
                    <>
                      {/* PRIMER GRUPO */}
                      {firstGroup && (
                        <div className="mt-4">
                          {renderGroup(
                            firstGroup,
                          )}
                        </div>
                      )}

                      {/* DEMÁS OPCIONES */}
                      {remainingGroups.length >
                        0 && (
                        <div className="mt-4 rounded-xl border border-purple-100 bg-[#fcf9fd] p-4">
                          <div className="mb-4 flex items-center gap-2 border-b border-purple-100 pb-3">
                            <Sparkles className="h-4 w-4 text-purple-600" />

                            <h3 className="text-[10px] font-black uppercase tracking-[0.08em] text-purple-950">
                              {config.title}
                            </h3>
                          </div>

                          <div className="space-y-4">
                            {remainingGroups.map(
                              (group) =>
                                renderGroup(
                                  group,
                                ),
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-4 text-[10px] text-slate-600">
                      Este producto no requiere
                      personalización adicional.
                    </div>
                  )}

                  {/* CANTIDAD Y TOTAL */}
                  <div className="mt-4 flex items-end justify-between border-t border-purple-100 pt-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-purple-950">
                        Cantidad
                      </p>

                      <div className="mt-2 inline-flex items-center overflow-hidden rounded-full border border-purple-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(
                              (current) =>
                                Math.max(
                                  1,
                                  current - 1,
                                ),
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center text-purple-700 transition hover:bg-purple-50"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="h-3 w-3" />
                        </button>

                        <span className="min-w-8 text-center text-[11px] font-black text-purple-950">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(
                              (current) =>
                                current + 1,
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center text-purple-700 transition hover:bg-purple-50"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 text-[17px] font-black text-amber-700">
                        $
                        {(
                          Number(
                            product.precio,
                          ) * quantity
                        ).toLocaleString(
                          "es-CO",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* BOTONES */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-purple-200 bg-white px-4 py-2.5 text-[10px] font-black text-purple-800 transition hover:bg-purple-50"
                    >
                      Seguir comprando
                    </button>

                    <motion.button
                      type="button"
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={
                        handleAddToCart
                      }
                      className={`flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[10px] font-black text-white shadow-sm transition ${
                        added
                          ? "bg-emerald-600"
                          : "bg-gradient-to-r from-purple-950 via-purple-800 to-purple-700"
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Agregado
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Agregar al carrito
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}