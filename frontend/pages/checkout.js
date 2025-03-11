import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext"; // ✅ Ensure user authentication

export default function Checkout() {
  const { cart } = useCart();
  const { user } = useAuth(); // ✅ Get user details

  console.log("🛒 Debug: Cart before checkout →", JSON.stringify(cart, null, 2)); 

  // ✅ Function to save order after successful payment
  const handlePaymentSuccess = async (sessionId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: user?.id, // Ensure user exists
          total: cart.reduce((sum, item) => sum + item.price, 0), // ✅ Calculate total price
          products: cart, // Store cart items
        }),
      });

      if (!response.ok) throw new Error("Failed to save order");

      console.log("✅ Order saved successfully!");
    } catch (error) {
      console.error("❌ Error saving order:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      console.log("⏳ Starting checkout process...");

      if (!cart || cart.length === 0) {
        throw new Error("Your cart is empty. Add items before checking out.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      if (!response.ok) throw new Error("Failed to create a checkout session.");

      const data = await response.json();
      console.log("🛠 Debug: Stripe API Response →", data);

      if (!data.url) {
        throw new Error("Failed to get Stripe checkout URL.");
      }

      // ✅ Redirect to Stripe checkout
      window.location.href = data.url;

    } catch (error) {
      console.error("❌ Checkout Error:", error.message);
      alert(error.message);
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


