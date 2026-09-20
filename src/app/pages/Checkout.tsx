import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShoppingBag, Trash2, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import { Card, Field, Input, SectionEyebrow } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { getCart, addToCart, removeFromCart, checkoutOrder, CartItem, Order } from "../lib/api";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);

  useEffect(() => {
    // Load active profile to prefill address
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setAddress(user.address || "");
    }

    loadCart();
  }, []);

  async function loadCart() {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // `delta` is the change to apply (+1 / -1), not the new absolute quantity —
  // this matches the backend's /cart/add contract, which adds `quantity` to
  // whatever is already in the cart and drops the item once it hits zero.
  async function updateQty(productId: string, currentQuantity: number, delta: number) {
    const nextQuantity = currentQuantity + delta;
    if (nextQuantity <= 0) {
      handleRemove(productId);
      return;
    }
    try {
      await addToCart(productId, delta);
      loadCart();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemove(productId: string) {
    try {
      await removeFromCart(productId);
      loadCart();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return alert("Please enter delivery address.");

    setSubmitting(true);
    try {
      const orderItems = cart.map(c => ({ productId: c.productId, quantity: c.quantity }));
      const order = await checkoutOrder(address, orderItems);
      setOrderConfirmed(order);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderConfirmed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-sprout-light text-forest rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle size={32} />
        </div>
        <SectionEyebrow>Order Confirmed</SectionEyebrow>
        <h1 className="font-display text-3xl font-semibold text-forest-dark mb-2">Thank you for your order!</h1>
        <p className="text-ink-soft text-sm mb-6 max-w-md mx-auto">
          Your order <strong>#{orderConfirmed.id}</strong> has been successfully placed. Est. delivery in 3 days.
        </p>

        <Card className="text-left mb-6 space-y-3">
          <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-2">Order Details</h3>
          <div className="text-sm space-y-1.5 text-ink-soft">
            {orderConfirmed.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.title} (x{item.quantity})</span>
                <span className="font-mono-data">₹{item.pricePerKg * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-forest/8 text-forest-dark font-medium">
              <span>Delivery Charges</span>
              <span className="font-mono-data">₹{orderConfirmed.deliveryCharges}</span>
            </div>
            <div className="flex justify-between text-forest-dark font-semibold text-base pt-1">
              <span>Total Paid</span>
              <span className="font-mono-data">₹{orderConfirmed.totalPrice}</span>
            </div>
          </div>
        </Card>

        <Button variant="primary" onClick={() => navigate("/marketplace")} className="inline-flex gap-2 mx-auto justify-center">
          Continue Shopping <ArrowRight size={16} />
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-soft">Loading cart details...</p>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.product.pricePerKg, 0);
  const delivery = subtotal >= 500 ? 0 : 50;
  const total = subtotal + delivery;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <SectionEyebrow>Shopping Cart</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-forest-dark mb-8">Checkout Harvest</h1>

      {cart.length === 0 ? (
        <Card className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto text-ink-soft/40 mb-4" />
          <p className="text-ink-soft font-medium text-lg">Your cart is empty</p>
          <p className="text-sm text-ink-soft/80 mt-1 mb-6">Browse our marketplace to find fresh organic farm produce.</p>
          <Button variant="primary" onClick={() => navigate("/marketplace")} className="mx-auto">
            Go to Marketplace
          </Button>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.productId} className="flex gap-4 items-center">
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-20 h-20 rounded-lg object-cover bg-forest/5"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-forest-dark text-base truncate">{item.product.title}</h3>
                  <p className="text-xs text-ink-soft mt-0.5">Farmer: {item.product.farmerName}</p>
                  <p className="text-sm font-semibold text-forest-dark mt-1">₹{item.product.pricePerKg}/kg</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQty(item.productId, item.quantity, -1)}
                    className="w-8 h-8 rounded-full border border-forest/15 flex items-center justify-center font-semibold text-forest hover:bg-husk-dim"
                  >
                    -
                  </button>
                  <span className="font-mono-data text-sm font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity, 1)}
                    className="w-8 h-8 rounded-full border border-forest/15 flex items-center justify-center font-semibold text-forest hover:bg-husk-dim"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="p-2 text-clay hover:bg-clay-dim rounded-full shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            ))}
          </div>

          {/* Pricing & Address details */}
          <div className="space-y-6">
            <Card className="space-y-4">
              <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-2">Order Summary</h3>
              <div className="text-sm space-y-2 text-ink-soft">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono-data">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-mono-data">{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
                </div>
                <div className="text-xs text-ink-soft/80 bg-husk-dim p-2 rounded-lg mt-1">
                  💡 Free delivery on orders above ₹500
                </div>
                <div className="flex justify-between text-forest-dark font-semibold text-base pt-2 border-t border-forest/10">
                  <span>Total</span>
                  <span className="font-mono-data">₹{total}</span>
                </div>
              </div>
            </Card>

            <Card>
              <form onSubmit={handleCheckout} className="space-y-4">
                <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-2">Shipping details</h3>
                <Field label="Delivery Address">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2 text-ink-soft" size={16} />
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter delivery address"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-forest/15 focus:outline-none focus:border-canopy bg-transparent"
                    />
                  </div>
                </Field>
                <div className="text-xs text-ink-soft flex flex-col gap-1 mt-1 border-t border-forest/8 pt-3">
                  <span>🚀 Estimated delivery: <strong>2-3 Days</strong></span>
                </div>
                <Button type="submit" variant="primary" className="w-full justify-center mt-3" disabled={submitting}>
                  {submitting ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
