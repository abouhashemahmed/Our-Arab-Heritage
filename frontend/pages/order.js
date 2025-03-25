import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        setError("Unable to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Orders</h1>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">Loading orders...</div>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">You haven’t placed any orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border border-gray-200 dark:border-gray-700 p-4 rounded-md"
            >
              <p className="font-semibold text-gray-800 dark:text-white">
                🧾 Order ID: {order.id}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Total: ${order.total?.toFixed(2) ?? "0.00"}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Placed on: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
