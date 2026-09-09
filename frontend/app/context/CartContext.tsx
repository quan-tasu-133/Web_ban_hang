"use client";

import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    // Thêm sản phẩm vào giỏ
    const addToCart = (product) => {
        setCart((currentCart) => {
            const existingProduct = currentCart.find(
                (item) => item.id === product.id
            );

            if (existingProduct) {
                return currentCart.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              quantity: item.quantity + 1
                          }
                        : item
                );
            }

            return [
                ...currentCart,
                {
                    ...product,
                    quantity: 1
                }
            ];
        });
    };

    // Tăng số lượng
    const increaseQuantity = (productId) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.id === productId
                    ? {
                          ...item,
                          quantity: item.quantity + 1
                      }
                    : item
            )
        );
    };

    // Giảm số lượng
    const decreaseQuantity = (productId) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.id === productId
                        ? {
                              ...item,
                              quantity: item.quantity - 1
                          }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    //Xóa
    const removeFromCart = (productId) => {
        setCart((currentCart) =>
            currentCart.filter(
                (item) => item.id !== productId
            )
        );
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}