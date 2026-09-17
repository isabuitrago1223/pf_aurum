"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";

import { useCart } from "../context/CartContext";

type AddToCartButtonProps = {
  product: {
    id: string;
    nombre: string;
    precio: string;
    imagen: string | null;
  };
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem({
      productId: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagen,
      cantidad: 1,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <motion.button
      type="button"
      onClick={handleAddToCart}
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.97,
      }}
      className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all duration-300 ${
        added
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
          : "bg-gradient-to-r from-purple-950 via-purple-800 to-purple-700 text-white shadow-lg shadow-purple-200 hover:from-purple-900 hover:to-purple-600"
      }`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          Agregado
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          Agregar al carrito
        </>
      )}
    </motion.button>
  );
}