import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]); // ✅ Ensure products is always an array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:4000/products");
        const data = await response.json();

        console.log("🔍 RAW API RESPONSE:", data); // ✅ Log API response

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response: Expected an array");
        }

        // ✅ Ensure all products have necessary properties
        const sanitizedProducts = data.map((product) => ({
          id: product.id || `missing-id-${Math.random()}`,
          title: product.title || "Untitled Product",
          description: product.description || "No description available",
          price: product.price || "N/A",
          images: product.images || [],
        }));

        setProducts(sanitizedProducts);
      } catch (error) {
        console.error("❌ Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Products</h1>

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}


