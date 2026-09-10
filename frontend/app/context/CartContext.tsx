"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { useAuth } from "./AuthContext";



const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
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
    const fetchCart = async () => {
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

            setCart(data.items);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Khi Context được tạo
    // =========================
    useEffect(() => {
        fetchCart();
    }, [user]);

    // =========================
    // Thêm sản phẩm
    // =========================
    const addToCart = async (product) => {
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
    const increaseQuantity = async (productId) => {
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
    const decreaseQuantity = async (productId) => {
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
    const removeFromCart = async (productId) => {
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

export function useCart() {
    return useContext(CartContext);
}