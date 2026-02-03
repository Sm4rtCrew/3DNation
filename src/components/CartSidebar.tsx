import { X, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

const CartSidebar = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return "";

    let message = "🖨️ *PEDIDO PRINTFORGE 3D*\n\n";
    message += "━━━━━━━━━━━━━━━━━━━━\n\n";

    items.forEach((item, index) => {
      message += `*${index + 1}. ${item.name}*\n`;
      message += `   📦 Cantidad: ${item.quantity}\n`;
      message += `   💰 Precio unit.: $${item.price.toFixed(2)}\n`;
      message += `   📐 Material: ${item.material || 'Estándar'}\n`;
      message += `   🔹 Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += "━━━━━━━━━━━━━━━━━━━━\n";
    message += `\n💵 *TOTAL: $${totalPrice.toFixed(2)}*\n\n`;
    message += "━━━━━━━━━━━━━━━━━━━━\n\n";
    message += "📍 Por favor, indícame:\n";
    message += "• Tu nombre\n";
    message += "• Dirección de entrega\n";
    message += "• Método de pago preferido\n\n";
    message += "¡Gracias por tu preferencia! 🙏";

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage();
    // Replace with your WhatsApp Business number
    const phoneNumber = "1234567890"; // Cambiar por tu número
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-primary/20 z-50 transform transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary/10">
            <h2 className="font-display text-xl font-bold text-gradient">
              Tu Carrito
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <span className="font-display text-3xl text-muted-foreground">🛒</span>
                </div>
                <p className="text-muted-foreground">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground mt-2">
                  ¡Agrega algunos productos increíbles!
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-4 animate-scale-in"
                >
                  <div className="flex gap-4">
                    {/* Product Image Placeholder */}
                    <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-sm text-primary">3D</span>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.material}</p>
                      <p className="font-display text-primary font-semibold">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-display font-bold text-gradient">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-primary/10 space-y-4 bg-card">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-gradient">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* WhatsApp Order Button */}
              <Button
                variant="whatsapp"
                size="xl"
                className="w-full gap-3"
                onClick={handleWhatsAppOrder}
              >
                <MessageCircle className="h-5 w-5" />
                Pedir por WhatsApp
              </Button>

              {/* Clear Cart */}
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                Vaciar carrito
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
