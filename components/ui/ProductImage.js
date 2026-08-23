"use client";

export default function ProductImage({
  src,
  alt,
  className = "h-full w-full object-contain",
}) {
  return (
    <img
      src={src || "/placeholder-product.svg"}
      alt={alt || "Product image"}
      className={className}
      onError={(event) => {
        event.currentTarget.src = "/placeholder-product.svg";
      }}
    />
  );
}
