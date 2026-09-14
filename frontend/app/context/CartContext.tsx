"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode
} from "react";
import { useAuth } from "./AuthContext";
import { Product } from "../components/ProductCard";

export interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    name: string;
    brand: string;
    price: number | string;
    image?: string;
}

export interface CartContextType {
    cart: CartItem[];
    loading: boolean;
    addToCart: (product: Product | { id: number; [key: string]: unknown }) => Promise<void>;
    increaseQuantity: (productId: number) => Promise<void>;
    decreaseQuantity: (productId: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    // =========================
    // Lấy token
    // =========================
    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =========================
    // Lấy giỏ hàng từ backend
    // =========================
    const fetchCart = useCallback(async () => {
        try {
            const token = getToken();

            if (!token) {
                setCart([]);
                setLoading(false);
                return;
            }

            const response = await fetch(
                "http://localhost:5000/cart",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Không thể lấy giỏ hàng");
            }

            const data = await response.json();

            setCart(data.items || []);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    // =========================
    // Khi Context được tạo hoặc User thay đổi
    // =========================
    useEffect(() => {
        fetchCart();
    }, [user, fetchCart]);

    // =========================
    // Thêm sản phẩm
    // =========================
    const addToCart = async (product: Product | { id: number; [key: string]: unknown }) => {
        try {
            const token = getToken();

            if (!token) {
                alert("Vui lòng đăng nhập");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/cart",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId: product.id,
                        quantity: 1
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Không thể thêm sản phẩm");
            }

            // Lấy lại cart từ database
            await fetchCart();

        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // Tăng số lượng
    // =========================
    const increaseQuantity = async (productId: number) => {
        try {
            const token = getToken();

            const item = cart.find(
                (item) => item.product_id === productId
            );

            if (!item) return;

            await fetch(
                `http://localhost:5000/cart/${productId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        quantity: item.quantity + 1
                    })
                }
            );

            await fetchCart();

        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // Giảm số lượng
    // =========================
    const decreaseQuantity = async (productId: number) => {
        try {
            const token = getToken();

            const item = cart.find(
                (item) => item.product_id === productId
            );

            if (!item) return;

            if (item.quantity === 1) {
                await removeFromCart(productId);
                return;
            }

            await fetch(
                `http://localhost:5000/cart/${productId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        quantity: item.quantity - 1
                    })
                }
            );

            await fetchCart();

        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // Xóa sản phẩm
    // =========================
    const removeFromCart = async (productId: number) => {
        try {
            const token = getToken();

            await fetch(
                `http://localhost:5000/cart/${productId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchCart();

        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // Xóa toàn bộ giỏ
    // =========================
    const clearCart = async () => {
        try {
            const token = getToken();

            await fetch(
                "http://localhost:5000/cart",
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCart([]);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                addToCart,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart(): CartContextType {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart phải được sử dụng bên trong CartProvider");
    }
    return context;
}