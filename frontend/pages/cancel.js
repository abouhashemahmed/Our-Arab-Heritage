// pages/cancel.js
import Link from "next/link";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import Head from "next/head";

export default function CancelPage() {
  return (
    <>
      <Head>
        <title>Payment Canceled - Our Arab Heritage</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="Your payment was canceled. Return to your cart or contact support." />
      </Head>

      <div
        className="min-h-screen bg-red-50 dark:bg-red-900 flex flex-col items-center justify-center p-4"
        role="alert"
        aria-live="polite"
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="animate-bounce">
            <svg
              className="mx-auto h-16 w-16 text-red-600 dark:text-red-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-red-700 dark:text-red-200">
            Payment Canceled
          </h1>

          <p className="text-red-600 dark:text-red-300">
            Your transaction was not completed. You may:
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowUturnLeftIcon className="h-5 w-5" />
              Return to Cart
            </Link>

            <a
              href="mailto:support@ourarabheritage.com"
              className="px-6 py-3 text-red-600 dark:text-red-200 underline hover:text-red-700"
            >
              Contact Support
            </a>
          </div>

          <p className="text-sm text-red-500 dark:text-red-300 mt-4">
            Need immediate help? Call us at +966 123 456 789
          </p>
        </div>
      </div>
    </>
  );
}

