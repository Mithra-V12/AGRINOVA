import { useEffect, useState } from "react";
import { useParams, NavLink, useNavigate } from "react-router";
import { Leaf, MapPin, ShieldCheck, Star } from "lucide-react";
import { Card, Badge, StrataScore } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { getMarketplaceProduct, addToCart, MarketplaceListing } from "../lib/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMarketplaceProduct(id)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product details", err);
        setLoading(false);
      });
  }, [id]);

  async function handleAddToCart() {
    if (!product) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in or register to add crops to your cart.");
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      alert(`Added ${quantity} kg of ${product.title} to your cart.`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add to cart.");
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-ink-soft">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center text-alert">
        <p>Product not found.</p>
        <NavLink to="/marketplace" className="text-sm text-canopy font-semibold mt-4 inline-block">Back to marketplace</NavLink>
      </div>
    );
  }

  const isOrganic = product.organic || product.description.toLowerCase().includes("organic") || product.title.toLowerCase().includes("organic");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <NavLink to="/marketplace" className="text-sm text-canopy font-semibold mb-6 inline-block">← Back to marketplace</NavLink>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden aspect-square bg-husk-dim">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            {isOrganic && <Badge tone="canopy"><Leaf size={11} className="mr-1" />Organic</Badge>}
            <Badge tone="amber">{product.quantityKg} kg available</Badge>
          </div>
          <h1 className="font-display text-3xl font-semibold text-forest-dark mb-2">{product.title}</h1>
          <p className="text-sm text-ink-soft flex items-center gap-1.5 mb-4">
            <MapPin size={13} /> {product.farmerName} · {product.location}
          </p>
          <p className="font-mono-data text-3xl font-semibold text-forest-dark mb-6">
            ₹{product.pricePerKg}<span className="text-sm text-ink-soft font-normal">/kg</span>
          </p>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-forest/15 rounded-full">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-forest-dark"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.quantityKg, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-forest-dark"
              >
                +
              </button>
            </div>
            <Button
              variant="primary"
              className="flex-1 justify-center"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? "Adding..." : "Add to cart"}
            </Button>
          </div>
          <Button variant="outline" className="w-full justify-center mb-8" onClick={() => alert("Weekly subscriptions are coming soon!")}>
            Subscribe weekly
          </Button>

          <Card>
            <h2 className="font-semibold text-forest-dark text-sm mb-3 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-canopy" /> Farm Transparency
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StrataScore label="Freshness" value={96} size="sm" />
              <StrataScore label="Soil Health" value={72} size="sm" />
            </div>
            <div className="text-xs text-ink-soft space-y-1.5">
              <p><span className="font-medium text-forest-dark">Description:</span> {product.description}</p>
              <p><span className="font-medium text-forest-dark">Fertilizers used:</span> Organic compost, minimal chemical use</p>
              <p><span className="font-medium text-forest-dark">Estimated shelf life:</span> 6–8 days, refrigerated</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-semibold text-forest-dark text-lg mb-4">Customer reviews</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "Priya S.", text: "Very fresh, arrived the same day it was picked. Will order again.", rating: 5 },
            { name: "Arjun K.", text: "Good quality, packaging could be a bit sturdier.", rating: 4 },
          ].map((r) => (
            <Card key={r.name}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-forest-dark text-sm">{r.name}</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className={i < r.rating ? "fill-amber text-amber" : "text-ink-soft/30"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-ink-soft">{r.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
