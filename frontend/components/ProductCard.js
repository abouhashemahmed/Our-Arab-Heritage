import Link from "next/link";

const ProductCard = ({ product }) => {
  return (
    <div className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition">
      <img
        src={product.images?.[0] || "/no-image.png"} // ✅ Updated to use local placeholder image
        alt={product.title || "No Image Available"}
        className="w-full h-40 object-cover rounded-lg"
      />
      <h2 className="text-lg font-semibold mt-2">{product.title}</h2>
      <p className="text-gray-600">{product.description}</p>
      <p className="text-green-500 font-bold mt-2">${product.price}</p>

      {/* ✅ Correct Link usage */}
      <Link href={`/products/${product.id}`} legacyBehavior>
        <a className="bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600 transition block text-center">
          View Details
        </a>
      </Link>
    </div>
  );
};

export default ProductCard;

