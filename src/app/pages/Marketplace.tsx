import { useEffect, useState, useMemo, FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";
import { Leaf, MapPin, Search, ShoppingCart } from "lucide-react";
import { Card, Badge, Input, Field } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { useI18n } from "../lib/i18n";
import { getMarketplaceProducts, createMarketplaceProduct, getCart, addToCart, MarketplaceListing } from "../lib/api";

export default function Marketplace() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [productsList, setProductsList] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState<string | null>(null);

  const [newListing, setNewListing] = useState({
    title: "",
    crop: "",
    quantityKg: 100,
    pricePerKg: 50,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
    description: "Freshly harvested, high quality crop.",
    organic: true
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getMarketplaceProducts();
      setProductsList(data);
      
      const token = localStorage.getItem("token");
      if (token) {
        const cartItems = await getCart();
        const count = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
        setCartCount(count);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateListing = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createMarketplaceProduct(newListing);
      setProductsList((prev) => [created, ...prev]);
      setShowListModal(false);
      setNewListing({
        title: "",
        crop: "",
        quantityKg: 100,
        pricePerKg: 50,
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
        description: "Freshly harvested, high quality crop.",
        organic: true
      });
      alert("Harvest listed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to list harvest.");
    } finally {
      setCreating(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in or register to add crops to your cart.");
      navigate("/login");
      return;
    }
    
    setAddingId(productId);
    try {
      const items = await addToCart(productId, 1);
      const count = items.reduce((acc, curr) => acc + curr.quantity, 0);
      setCartCount(count);
      
      // Flash a quick checkoff state
      alert("Item added to cart successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to add to cart.");
    } finally {
      setAddingId(null);
    }
  };

  const filtered = useMemo(
    () =>
      productsList.filter(
        (p) =>
          (!organicOnly || p.description.toLowerCase().includes("organic") || p.title.toLowerCase().includes("organic") || p.organic) &&
          (p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.crop.toLowerCase().includes(query.toLowerCase()) ||
            p.farmerName.toLowerCase().includes(query.toLowerCase()) ||
            p.location.toLowerCase().includes(query.toLowerCase()))
      ),
    [productsList, query, organicOnly]
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-ink-soft">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-mono-data text-xs tracking-wider uppercase text-canopy font-semibold mb-2">Farm-to-Consumer Marketplace</p>
          <h1 className="font-display text-3xl font-semibold text-forest-dark">{t("marketplace")}, straight from the farm</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="clay" onClick={() => setShowListModal(true)}>{t("listNewHarvest")}</Button>
          <Button variant="outline" onClick={() => navigate("/checkout")}>
            <ShoppingCart size={16} /> Cart ({cartCount})
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by crop, farmer or location..."
            className="pl-10"
          />
        </div>
        <button
          onClick={() => setOrganicOnly((v) => !v)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            organicOnly ? "bg-sprout-light border-sprout text-forest" : "border-forest/15 text-ink-soft hover:bg-husk-dim"
          }`}
        >
          <Leaf size={14} /> {t("organicOnly")}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((p) => {
          const isOrganic = p.organic || p.description.toLowerCase().includes("organic") || p.title.toLowerCase().includes("organic");
          return (
            <NavLink to={`/marketplace/${p.id}`} key={p.id}>
              <Card className="p-0 overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
                <div className="relative h-40 bg-husk-dim">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  {isOrganic && (
                    <Badge tone="canopy" className="absolute top-2.5 left-2.5">
                      <Leaf size={11} className="mr-1" /> Organic
                    </Badge>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-forest-dark text-[15px] mb-1 leading-snug">{p.title}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-amber-dark font-semibold">★ {p.rating || 4.8}</span>
                    <Badge tone="amber">{p.quantityKg} kg available</Badge>
                  </div>
                  <p className="text-xs text-ink-soft flex items-center gap-1 mb-3">
                    <MapPin size={11} /> {p.farmerName} · {p.location}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-forest/5">
                    <p className="font-mono-data font-semibold text-forest-dark">
                      ₹{p.pricePerKg}<span className="text-xs text-ink-soft font-normal">/kg</span>
                    </p>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(p.id);
                      }}
                      disabled={addingId === p.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-canopy text-husk hover:bg-forest transition-colors disabled:opacity-50"
                    >
                      {addingId === p.id ? "Adding..." : "Add +"}
                    </button>
                  </div>
                </div>
              </Card>
            </NavLink>
          );
        })}
      </div>

      {showListModal && (
        <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 relative">
            <h2 className="font-display text-2xl font-semibold text-forest-dark mb-4">List your harvest</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <Field label="Listing Title"><Input required value={newListing.title} onChange={e => setNewListing(p => ({...p, title: e.target.value}))} placeholder="e.g. Premium Basmati Rice" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Crop Name"><Input required value={newListing.crop} onChange={e => setNewListing(p => ({...p, crop: e.target.value}))} placeholder="e.g. Rice" /></Field>
                <Field label="Price per Kg (₹)"><Input type="number" required value={newListing.pricePerKg} onChange={e => setNewListing(p => ({...p, pricePerKg: Number(e.target.value)}))} placeholder="e.g. 50" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Quantity (Kg)"><Input type="number" required value={newListing.quantityKg} onChange={e => setNewListing(p => ({...p, quantityKg: Number(e.target.value)}))} placeholder="e.g. 200" /></Field>
                <Field label="Image URL"><Input value={newListing.image} onChange={e => setNewListing(p => ({...p, image: e.target.value}))} placeholder="URL to photo" /></Field>
              </div>
              <Field label="Description"><Input value={newListing.description} onChange={e => setNewListing(p => ({...p, description: e.target.value}))} placeholder="Describe quality, harvest date, organic state..." /></Field>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowListModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? "Listing..." : "Submit Listing"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
