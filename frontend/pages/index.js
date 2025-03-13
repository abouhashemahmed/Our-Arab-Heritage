import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [country, setCountry] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { mode: "cors" });
        const data = await res.json();
        console.log("🔍 Debug: API Response →", data);
        setProducts(data);
        setFilteredProducts(data); // Initialize filtered products with all products
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      }
    }
    fetchProducts();
  }, []);

  // ✅ Filter products when the country changes
  useEffect(() => {
    if (!country) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.country === country));
    }
  }, [country, products]);

  return (
    <>
      <Navbar />

      {/* ✅ Hero Section */}
      <div className="bg-gray-100 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900">Discover Our Arab Heritage</h1>
        <p className="text-lg text-gray-700 mt-4">
          Explore handmade treasures from Arab artisans
        </p>
      </div>

      {/* ✅ Country Filter Dropdown */}
      <div className="container mx-auto px-6 py-4 text-center">
        <label htmlFor="country" className="text-lg font-semibold mr-2">Filter by Country:</label>
        <select
          id="country"
          className="border p-2 rounded-md"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">All Countries</option>
          <option value="Algeria">Algeria</option>
          <option value="Bahrain">Bahrain</option>
          <option value="Comoros">Comoros</option>
          <option value="Djibouti">Djibouti</option>
          <option value="Egypt">Egypt</option>
          <option value="Iraq">Iraq</option>
          <option value="Jordan">Jordan</option>
          <option value="Kuwait">Kuwait</option>
          <option value="Lebanon">Lebanon</option>
          <option value="Libya">Libya</option>
          <option value="Mauritania">Mauritania</option>
          <option value="Morocco">Morocco</option>
          <option value="Oman">Oman</option>
          <option value="Palestine">Palestine</option>
          <option value="Qatar">Qatar</option>
          <option value="Saudi Arabia">Saudi Arabia</option>
          <option value="Somalia">Somalia</option>
          <option value="Sudan">Sudan</option>
          <option value="Syria">Syria</option>
          <option value="Tunisia">Tunisia</option>
          <option value="United Arab Emirates">United Arab Emirates</option>
          <option value="Yemen">Yemen</option>
        </select>
      </div>

      {/* ✅ Marketplace Section */}
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Marketplace</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="text-center text-gray-500 col-span-full">No products available.</p>
          )}
        </div>
      </div>
    </>
  );
}

