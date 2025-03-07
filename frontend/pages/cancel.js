export default function Cancel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
      <h1 className="text-4xl font-bold text-red-700">Payment Canceled ❌</h1>
      <p className="text-lg mt-2">Your transaction was canceled. You can try again.</p>
      <a href="/cart" className="mt-4 px-6 py-2 bg-red-600 text-white rounded">Back to Cart</a>
    </div>
  );
}

