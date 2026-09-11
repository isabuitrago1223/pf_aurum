"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type ProductCustomization = Record<
  string,
  string | string[]
>;

export type CartItem = {
  cartItemId: string;
  productId: string;
  nombre: string;
  precio: string;
  imagen: string | null;
  cantidad: number;
  personalizacion?: ProductCustomization;
};

type NewCartItem = Omit<CartItem, "cartItemId">;

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  addItem: (item: NewCartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (
    cartItemId: string,
    cantidad: number,
  ) => void;
  clearCart: () => void;
};

const CartContext = createContext<
  CartContextValue | undefined
>(undefined);

const STORAGE_KEY = "aurum_cart";

function createCartItemId(
  productId: string,
  personalizacion?: ProductCustomization,
) {
  if (!personalizacion) {
    return productId;
  }

  return `${productId}-${JSON.stringify(
    personalizacion,
  )}`;
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedCart =
      localStorage.getItem(STORAGE_KEY);

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          const normalizedCart = parsedCart.map(
            (item) => ({
              ...item,
              cartItemId:
                item.cartItemId ??
                createCartItemId(
                  item.productId,
                  item.personalizacion,
                ),
            }),
          );

          setItems(normalizedCart);
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

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [items, loaded]);

  function addItem(item: NewCartItem) {
    const cartItemId = createCartItemId(
      item.productId,
      item.personalizacion,
    );

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) =>
          currentItem.cartItemId === cartItemId,
      );

      if (existingItem) {
        return currentItems.map(
          (currentItem) =>
            currentItem.cartItemId === cartItemId
              ? {
                  ...currentItem,
                  cantidad:
                    currentItem.cantidad +
                    item.cantidad,
                }
              : currentItem,
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          cartItemId,
        },
      ];
    });
  }

  function removeItem(cartItemId: string) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.cartItemId !== cartItemId,
      ),
    );
  }

  function updateQuantity(
    cartItemId: string,
    cantidad: number,
  ) {
    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartItemId === cartItemId
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
    (total, item) =>
      total + item.cantidad,
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