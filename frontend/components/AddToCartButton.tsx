"use client";

import { useState } from "react";
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
    <button
      type="button"
      onClick={handleAddToCart}
      className="inline-block rounded-lg bg-[#a2725e] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
    >
      {added ? "Agregado ✓" : "Agregar al carrito"}
    </button>
  );
}