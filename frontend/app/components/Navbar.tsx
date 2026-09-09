"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const { cart } = useCart();

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <nav className="border-b px-6 py-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">

                <Link
                    href="/"
                    className="text-xl font-bold"
                >
                    Phone Shop
                </Link>

                <Link
                    href="/cart"
                    className="font-medium"
                >
                    🛒 Giỏ hàng ({totalQuantity})
                </Link>

            </div>
        </nav>
    );
}