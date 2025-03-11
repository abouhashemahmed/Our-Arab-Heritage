import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { mode: "cors" })


      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);
  

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

      {/* ✅ Marketplace Section */}
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Marketplace</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
          {products.length > 0 ? (
            products.map(product => <ProductCard key={product.id} product={product} />)
          ) : (
            <p className="text-center text-gray-500 col-span-full">No products available.</p>
          )}
        </div>
      </div>
    </>
  );
}
