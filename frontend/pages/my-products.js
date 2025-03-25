// pages/my-products.js
import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import useSWR from "swr";
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary } from "@sentry/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import ListingSkeleton from "@/components/ListingSkeleton";
import ProductActions from "@/components/ProductActions";

// Constants
const PAGE_SIZES = [5, 10, 20, 50];
const MAX_BULK_DELETE = 50;
const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

// Analytics tracking
const trackEvent = (eventName, payload) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props: payload });
  }
};

const fetcher = (url, token, csrfToken) => 
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-CSRF-Token": csrfToken,
      "X-RateLimit-Bypass": process.env.NODE_ENV === "development"
    },
  }).then(res => res.json());

function MyProductsCore() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  // Add optimistic updates
  const optimisticDelete = (productId) => {
    mutate(
      (prevData) => ({
        ...prevData,
        products: prevData.products.filter(p => p.id !== productId)
      }),
      false
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setUserId(localStorage.getItem("userId"));
    }
  }, []);

  useEffect(() => {
    fetch("/api/csrf-token")
      .then(res => res.json())
      .then(data => setCsrfToken(data.token));
  }, []);

  const { data, error, isValidating, mutate } = useSWR(
    token && csrfToken && userId 
      ? [`${process.env.NEXT_PUBLIC_API_URL}/products?sellerId=${userId}&page=${page}&limit=${pageSize}`, token, csrfToken]
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      onSuccess: (data) => setTotalPages(data.totalPages),
      onError: (err) => Sentry.captureException(err),
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );

  // ... [previous useEffect hooks remain unchanged] ...

  const handleBulkDelete = async () => {
    if (!navigator.onLine) {
      toast.error("You appear to be offline");
      return;
    }

    if (selectedProducts.length > MAX_BULK_DELETE) {
      toast.error(`Maximum ${MAX_BULK_DELETE} products per operation`);
      return;
    }

    if (!window.confirm(`Delete ${selectedProducts.length} products?`)) return;
    
    // Optimistic update
    const originalProducts = data.products;
    mutate(
      (prevData) => ({
        ...prevData,
        products: prevData.products.filter(p => !selectedProducts.includes(p.id))
      }),
      false
    );

    setIsDeleting(true);

    try {
      await Promise.all(
        selectedProducts.map(id =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRF-Token": csrfToken,
            },
          })
        )
      );

      setSelectedProducts([]);
      toast.success("Products deleted successfully");
      trackEvent('BulkDelete', { count: selectedProducts.length });
      mutate();
    } catch (err) {
      // Rollback on error
      mutate(prevData => ({ ...prevData, products: originalProducts }), false);
      Sentry.captureException(err);
      toast.error("Deletion failed. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ... [rest of the component remains similar with these additions] ...

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Toaster position="bottom-right" />
      
      {/* Product List */}
      <div className="space-y-4">
        {data.products.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border rounded-lg p-4 dark:border-gray-700 group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start gap-4">
              {product.images?.[0] && (
                <Image
                  src={product.images[0]}
                  alt="Product preview"
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover rounded-lg blur-up"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                  onLoadingComplete={(img) => 
                    img.classList.remove('blur-up')
                  }
                  onError={(e) => (e.currentTarget.src = "/fallback.png")}
                />
              )}
              {/* ... rest of product card ... */}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ... rest of the component ... */}
    </div>
  );
}

MyProductsCore.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      price: PropTypes.number,
      status: PropTypes.oneOf(['draft', 'published']),
      images: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  error: PropTypes.object,
};

export default function MyProducts() {
  return (
    <>
      <Head>
        <title>{`My Listings | Our Arab Heritage`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:image" content="/og-products.jpg" />
      </Head>
      
      <ErrorBoundary fallback={
        <div className="p-6 text-red-600 text-center">
          Failed to load products. Please refresh the page.
        </div>
      }>
        <MyProductsCore />
      </ErrorBoundary>
    </>
  );
}
