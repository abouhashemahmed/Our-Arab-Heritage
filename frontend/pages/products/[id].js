import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link"; // ✅ Import Link for Checkout Button
import { useCart } from "@/context/CartContext"; // ✅ Import Cart Context

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart(); // ✅ Ensuring useCart() is used correctly
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return; // ✅ Prevents unnecessary fetch calls if `id` is undefined

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch product: ${res.statusText}`);
        }
        const data = await res.json();

        if (!data || Object.keys(data).length === 0) {
          throw new Error("Product not found");
        }

        // ✅ Ensure product has required properties to prevent crashes
        setProduct({
          id: data.id || `missing-id-${Math.random()}`,
          title: data.title || "Untitled Product",
          description: data.description || "No description available",
          price: data.price || "N/A",
          images: data.images && data.images.length > 0 ? data.images : ["/no-image.png"],
        });
      } catch (err) {
        console.error("❌ Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <img
        src={product.images[0]} 
        alt={product.title}
        className="w-full h-60 object-cover rounded-lg"
      />
      <h1 className="text-3xl font-bold mt-4">{product.title}</h1>
      <p className="text-gray-700 mt-2">{product.description}</p>
      <p className="text-green-500 font-bold mt-2">${product.price}</p>

      {/* ✅ Add to Cart Button */}
      <button
        onClick={() => addToCart(product)}
        className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        Add to Cart 🛒
      </button>

      {/* ✅ Checkout Button */}
      <Link href="/checkout">
        <button className="mt-6 ml-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
          Checkout Now
        </button>
      </Link>
    </div>
  );
}
