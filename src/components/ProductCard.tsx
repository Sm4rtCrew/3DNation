import { ShoppingCart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="group relative glass-card overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:glow-box"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-xl bg-primary/20 flex items-center justify-center floating">
            <span className="font-display text-2xl text-primary font-bold">3D</span>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        {/* Quick Info Button */}
        <button
          className={`absolute top-3 right-3 p-2 rounded-lg bg-card/80 backdrop-blur-sm transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
          onClick={() => setShowDetails(!showDetails)}
        >
          <Info className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Material & Dimensions */}
        {showDetails && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg animate-fade-in">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Material:</span>
              <span className="text-foreground">{product.material}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Dimensiones:</span>
              <span className="text-foreground">{product.dimensions}</span>
            </div>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-gradient">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <Button
            variant="glow"
            size="sm"
            onClick={() => addToCart(product)}
            className="gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Gradient Border Effect on Hover */}
      <div
        className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(135deg, transparent 40%, hsl(var(--primary) / 0.1) 50%, transparent 60%)",
        }}
      />
    </div>
  );
};

export default ProductCard;
