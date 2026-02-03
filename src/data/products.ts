import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "Engranaje Industrial",
    description: "Engranaje de precisión para maquinaria industrial. Alta resistencia y durabilidad.",
    price: 45.00,
    image: "/products/gear.png",
    category: "Industrial",
    inStock: true,
    material: "PLA+",
    dimensions: "50mm x 50mm x 15mm"
  },
  {
    id: "2",
    name: "Soporte Modular",
    description: "Sistema de soporte modular personalizable. Perfecto para organización.",
    price: 28.00,
    image: "/products/bracket.png",
    category: "Hogar",
    inStock: true,
    material: "PETG",
    dimensions: "80mm x 40mm x 30mm"
  },
  {
    id: "3",
    name: "Prototipo Mecánico",
    description: "Pieza prototipo para desarrollo de productos. Acabado profesional.",
    price: 120.00,
    image: "/products/prototype.png",
    category: "Prototipado",
    inStock: true,
    material: "ABS",
    dimensions: "100mm x 60mm x 40mm"
  },
  {
    id: "4",
    name: "Carcasa Electrónica",
    description: "Carcasa protectora para componentes electrónicos. Diseño ventilado.",
    price: 35.00,
    image: "/products/case.png",
    category: "Electrónica",
    inStock: true,
    material: "PETG",
    dimensions: "120mm x 80mm x 40mm"
  },
  {
    id: "5",
    name: "Conector Especial",
    description: "Conector personalizado para aplicaciones específicas.",
    price: 18.00,
    image: "/products/connector.png",
    category: "Industrial",
    inStock: true,
    material: "Nylon",
    dimensions: "30mm x 20mm x 10mm"
  },
  {
    id: "6",
    name: "Figura Decorativa",
    description: "Escultura artística impresa en 3D. Diseño exclusivo.",
    price: 85.00,
    image: "/products/figure.png",
    category: "Arte",
    inStock: true,
    material: "Resina",
    dimensions: "150mm x 100mm x 200mm"
  },
  {
    id: "7",
    name: "Herramienta Custom",
    description: "Herramienta personalizada según especificaciones del cliente.",
    price: 55.00,
    image: "/products/tool.png",
    category: "Herramientas",
    inStock: true,
    material: "PLA+",
    dimensions: "Variable"
  },
  {
    id: "8",
    name: "Pieza de Repuesto",
    description: "Repuesto exacto para equipos descontinuados.",
    price: 40.00,
    image: "/products/spare.png",
    category: "Repuestos",
    inStock: true,
    material: "ABS",
    dimensions: "Variable"
  }
];

export const categories = [
  "Todos",
  "Industrial",
  "Hogar",
  "Prototipado",
  "Electrónica",
  "Arte",
  "Herramientas",
  "Repuestos"
];
