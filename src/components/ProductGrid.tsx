import { useState } from "react";
import { products, categories } from "@/data/products";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";

const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredProducts =
    selectedCategory === "Todos"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <section id="productos" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Nuestros </span>
            <span className="text-gradient">Productos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra colección de piezas impresas en 3D con la más alta calidad y precisión.
          </p>
        </div>

        {/* Category Filters */}
        <div id="categorias" className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "glow" : "glass"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="min-w-[100px]"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No hay productos en esta categoría.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
