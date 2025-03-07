import { useCart } from "@/context/CartContext";

export default function Checkout() {
  const { cart } = useCart();

  console.log("🛒 Debug: Cart before checkout →", JSON.stringify(cart, null, 2)); // ✅ Debugging

  const handleCheckout = async () => {
    try {
        console.log("⏳ Starting checkout process...");
        const response = await fetch("http://localhost:4000/checkout", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart }),
        });

        const data = await response.json();
        console.log("🛠 Debug: Stripe API Response →", data);

        if (!data.url) {
            throw new Error("Failed to create a checkout session.");
        }

        window.location.href = data.url; // ✅ Redirect user to Stripe checkout
    } catch (error) {
        console.error("❌ Error during checkout:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p>You&apos;re almost there!</p>



      <button
        onClick={handleCheckout}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Pay with Stripe
      </button>
    </div>
  );
}
