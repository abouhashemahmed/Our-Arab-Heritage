import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useCart } from "@/context/CartContext";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch product: ${res.statusText}`);
        }

        const data = await res.json();
        if (!data || Object.keys(data).length === 0) {
          throw new Error("Product not found");
        }

        setProduct({
          id: data.id || `missing-id-${Math.random()}`,
          title: data.title || "Untitled Product",
          description: data.description || "No description available",
          price: data.price || 0,
          images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ["/no-image.png"],
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
    return <p className="text-center text-gray-500" role="status">Loading product...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500" role="alert">Error: {error}</p>;
  }

  return (
    <>
      <Head>
        <title>{`${product.title} | Our Arab Heritage`}</title>
        <meta name="description" content={product.description} />
        <meta property="og:image" content={product.images?.[0]} />
      </Head>

      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow text-center">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-64 object-cover rounded-lg"
        />
        <h1 className="text-3xl font-bold mt-4 text-gray-900 dark:text-white">
          {product.title}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          {product.description}
        </p>
        <p className="text-green-600 dark:text-green-400 font-bold mt-2">
          ${parseFloat(product.price).toFixed(2)}
        </p>

        <div className="flex justify-center flex-wrap gap-4 mt-6">
          <button
            onClick={() => addToCart(product)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Add to Cart 🛒
          </button>

          <Link href="/checkout">
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
              Checkout Now
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

