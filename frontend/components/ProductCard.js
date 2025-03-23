import Link from "next/link";
import Image from "next/image";
import PropTypes from "prop-types";

const ProductCard = ({ product }) => {
  if (!product) return null;

  return (
    <article className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition duration-300">
      <div className="relative aspect-[4/3]">
        <Image
          src={product.images?.[0] || "/no-image.png"}
          alt={product.title ? `${product.title} image` : "Product image"}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, 300px"
          priority={false}
        />
      </div>

      <h2 className="text-lg font-semibold mt-2">
        {product.title || "Untitled Product"}
      </h2>

      {product.description && (
        <p className="text-gray-600 line-clamp-2">{product.description}</p>
      )}

      <p className="text-green-500 font-bold mt-2">
        ${product.price?.toFixed(2) ?? "0.00"}
      </p>

      <Link
        href={`/products/${product.id}`}
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600 transition-colors block text-center"
        aria-label={`View details for ${product.title || "product"}`}
      >
        View Details
      </Link>
    </article>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default ProductCard;

