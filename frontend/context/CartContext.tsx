"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  nombre: string;
  precio: string;
  imagen: string | null;
  cantidad: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "aurum_cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem(STORAGE_KEY);

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function addItem(item: CartItem) {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) =>
          currentItem.productId === item.productId,
      );

      if (existingItem) {
        return currentItems.map((currentItem) =>
          currentItem.productId === item.productId
            ? {
                ...currentItem,
                cantidad:
                  currentItem.cantidad + item.cantidad,
              }
            : currentItem,
        );
      }

      return [...currentItems, item];
    });
  }

  function removeItem(productId: string) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.productId !== productId,
      ),
    );
  }

  function updateQuantity(
    productId: string,
    cantidad: number,
  ) {
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              cantidad,
            }
          : item,
      ),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce(
    (total, item) => total + item.cantidad,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe usarse dentro de CartProvider.",
    );
  }

  return context;
}