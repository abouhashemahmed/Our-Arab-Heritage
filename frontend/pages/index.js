// pages/index.js
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import * as Sentry from "@sentry/nextjs";

const ProductCard = dynamic(() => import("@/components/ProductCard"), {
  loading: () => <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
});

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [country, setCountry] = useState(router.query.country || "");
  const [status, setStatus] = useState("idle");

  const countries = useMemo(() => {
    return [...new Set(products.map(p => p.country))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!country) return products;
    return products.filter(p => p.country.toLowerCase() === country.toLowerCase());
  }, [country, products]);

  useEffect(() => {
    const abortController = new AbortController();
    
    async function fetchProducts() {
      setStatus("loading");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
          }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data) || !data.length) throw new Error("No products found");

        setProducts(data);
        setStatus("success");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          Sentry.captureException(err);
          setStatus("error");
        }
      }
    }

    fetchProducts();
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    const query = country ? { country } : {};
    router.replace({ query }, undefined, { shallow: true });
  }, [country]);

  return (
    <>
      <Head>
        <title>Our Arab Heritage – Marketplace</title>
        <meta name="description" content="Explore authentic Arab crafts and heritage products from across 22 countries. Filter by region and support local artisans." />
        <meta property="og:image" content="/og-marketplace.jpg" />
        <link rel="canonical" href="https://ourarabheritage.com/marketplace" />
      </Head>

      <Navbar />

      <main className="bg-white dark:bg-gray-900">
        <section className="bg-gradient-to-r from-arabicBlue to-heritageGold py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white px-4">
            Preserving Arab Heritage Through Craftsmanship
          </h1>
          <p className="text-gray-200 mt-4 max-w-2xl mx-auto">
            Discover authentic handmade products from 22 Arab nations
          </p>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Country:
            </label>
            <select
              id="country-filter"
              className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Show All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="container mx-auto px-4 py-8" aria-labelledby="products-heading">
          <h2 id="products-heading" className="sr-only">Products List</h2>

          {status === 'error' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center" role="alert">
              Failed to load products. Please refresh or try again later.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {status === 'loading' ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} country={country} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No products found{country && ` in ${country}`}.
                </p>
                {country && (
                  <button
                    onClick={() => setCountry("")}
                    className="mt-4 text-heritageGold hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
