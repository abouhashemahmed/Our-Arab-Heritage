import { useEffect, useState } from "react";

export default function MyProducts() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const sellerProducts = data.filter(product => product.sellerId === localStorage.getItem("userId"));
                    setProducts(sellerProducts);
                }
            })
            .catch((error) => console.error("Failed to fetch products:", error));
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">My Listings</h1>
            {products.length > 0 ? (
                <ul>
                    {products.map((product) => (
                        <li key={product.id} className="border-b py-2">
                            {product.title} - ${product.price}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">You haven't listed any products yet.</p>
            )}
        </div>
    );
}

