import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]); // ✅ Ensure products is always an array
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState(""); // ✅ Added filter state

  useEffect(() => {
    async function fetchProducts() {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/products`;
      if (country) {
        url += `?country=${encodeURIComponent(country)}`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("🔍 Debug: API Response:", data);

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
          country: product.country || "Unknown", // ✅ Added country field
        }));

        setProducts(sanitizedProducts);
      } catch (error) {
        console.error("❌ Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [country]); // ✅ Re-fetch products when country filter changes

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Products</h1>

      {/* ✅ Country Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="country" className="block text-lg font-semibold mb-2">
          Filter by Country:
        </label>
        <select
          id="country"
          className="border p-2 rounded-md"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">All Countries</option>
          <option value="Palestine">Palestine</option>
          <option value="Morocco">Morocco</option>
          <option value="Lebanon">Lebanon</option>
          <option value="Egypt">Egypt</option>
          <option value="Syria">Syria</option>
          <option value="Iraq">Iraq</option>
          <option value="Algeria">Algeria</option>
          <option value="Tunisia">Tunisia</option>
          <option value="Jordan">Jordan</option>
          <option value="Saudi Arabia">Saudi Arabia</option>
          <option value="Kuwait">Kuwait</option>
          <option value="UAE">UAE</option>
          <option value="Qatar">Qatar</option>
          <option value="Bahrain">Bahrain</option>
          <option value="Oman">Oman</option>
          <option value="Yemen">Yemen</option>
          <option value="Sudan">Sudan</option>
          <option value="Somalia">Somalia</option>
          <option value="Comoros">Comoros</option>
          <option value="Mauritania">Mauritania</option>
          <option value="Djibouti">Djibouti</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}




