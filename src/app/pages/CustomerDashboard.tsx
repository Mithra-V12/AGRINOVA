import { useEffect, useState } from "react";
import { User, ShoppingBag, MapPin, Edit3, Heart, Eye, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, SectionEyebrow, Badge, Field, Input } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { getFarmerProfile, updateFarmerProfile, getOrders, getMarketplaceProducts, Order, UserProfile, MarketplaceListing } from "../lib/api";

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<MarketplaceListing[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<MarketplaceListing[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    state: "Tamil Nadu",
    district: "",
    pinCode: "",
    address: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [profData, ordData, allProducts] = await Promise.all([
        getFarmerProfile(),
        getOrders(),
        getMarketplaceProducts()
      ]);

      setProfile(profData);
      setOrders(ordData);
      setEditForm({
        name: profData.name,
        phone: profData.phone,
        state: profData.state,
        district: profData.district || "",
        pinCode: profData.pinCode || "",
        address: profData.address || ""
      });

      // Load Wishlist from localStorage
      const wishIds = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const wishListItems = allProducts.filter(p => wishIds.includes(p.id));
      setWishlist(wishListItems);

      // Load Recently Viewed from localStorage
      const recentIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const recentItems = allProducts.filter(p => recentIds.includes(p.id));
      setRecentlyViewed(recentItems);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateFarmerProfile(editForm);
      setProfile(updated);
      setIsEditing(false);
      localStorage.setItem("user", JSON.stringify(updated));
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-ink-soft">Loading your dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-alert">
        <p>Please login to access your customer dashboard.</p>
      </div>
    );
  }

  // Get distinct list of purchased products
  const purchasedProducts: string[] = [];
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!purchasedProducts.includes(item.title)) {
        purchasedProducts.push(item.title);
      }
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 border-b border-forest/10 pb-6">
        <div>
          <SectionEyebrow>Customer Dashboard</SectionEyebrow>
          <h1 className="font-display text-3xl font-semibold text-forest-dark">Hello, {profile.name}</h1>
          <p className="text-ink-soft text-sm mt-1">{profile.email} · Registered {new Date(profile.registeredAt).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" className="flex gap-2" onClick={() => setIsEditing(v => !v)}>
          <Edit3 size={16} /> {isEditing ? "Close Editor" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Info card and editor */}
        <div className="space-y-6">
          {isEditing ? (
            <Card>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-2">Edit Details</h3>
                <Field label="Full Name">
                  <Input value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} required />
                </Field>
                <Field label="Mobile Number">
                  <Input value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} required />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="District">
                    <Input value={editForm.district} onChange={(e) => setEditForm(prev => ({ ...prev, district: e.target.value }))} required />
                  </Field>
                  <Field label="PIN Code">
                    <Input value={editForm.pinCode} onChange={(e) => setEditForm(prev => ({ ...prev, pinCode: e.target.value }))} required />
                  </Field>
                </div>
                <Field label="Delivery Address">
                  <Input value={editForm.address} onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))} required />
                </Field>
                <Button type="submit" variant="primary" className="w-full justify-center" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="space-y-4">
              <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-1 flex items-center gap-1.5">
                <User size={18} className="text-canopy" /> Personal Information
              </h3>
              <div className="space-y-2 text-sm text-ink-soft">
                <p><strong>Mobile:</strong> {profile.phone}</p>
                <p><strong>Language:</strong> {profile.preferredLanguage.toUpperCase()}</p>
                <p className="flex items-start gap-1.5">
                  <MapPin size={16} className="text-ink-soft shrink-0 mt-0.5" />
                  <span><strong>Saved Address:</strong><br />{profile.address || "No address saved. Click edit profile."}<br />{profile.district} {profile.pinCode}</span>
                </p>
              </div>
            </Card>
          )}

          {/* Purchased Products */}
          <Card className="space-y-3">
            <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-1 flex items-center gap-1.5">
              <ShieldCheck size={18} className="text-canopy" /> Purchased Crops ({purchasedProducts.length})
            </h3>
            {purchasedProducts.length === 0 ? (
              <p className="text-xs text-ink-soft">You haven't purchased any crops yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {purchasedProducts.map((p, idx) => (
                  <Badge key={idx} tone="canopy">{p}</Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Center/Right: Orders list & Wishlist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order list */}
          <Card>
            <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-3 flex items-center gap-1.5">
              <ShoppingBag size={18} className="text-canopy" /> Order History ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <div className="py-10 text-center text-ink-soft">
                <p>No orders placed yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-forest/8">
                {orders.map((order) => (
                  <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-forest-dark">Order #{order.id}</p>
                        <p className="text-xs text-ink-soft">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge tone={order.status === "Delivered" ? "canopy" : "amber"}>{order.status}</Badge>
                    </div>

                    {/* Order items */}
                    <div className="space-y-1 my-2.5">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-xs text-ink-soft">
                          {item.title} — {item.quantity}kg x ₹{item.pricePerKg}
                        </p>
                      ))}
                    </div>

                    {/* Tracker visualization */}
                    <div className="flex justify-between items-center text-xs font-semibold text-ink-soft/80 border-t border-forest/5 pt-3 mt-3">
                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${["Confirmed", "Packed", "Shipped", "Delivered"].includes(order.status) ? "bg-canopy animate-pulse" : "bg-forest/20"}`} />
                        <span>Confirmed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${["Packed", "Shipped", "Delivered"].includes(order.status) ? "bg-canopy" : "bg-forest/20"}`} />
                        <span>Packed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${["Shipped", "Delivered"].includes(order.status) ? "bg-canopy" : "bg-forest/20"}`} />
                        <span>Shipped</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${order.status === "Delivered" ? "bg-canopy" : "bg-forest/20"}`} />
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Wishlist & Recently viewed */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-2 flex items-center gap-1.5">
                <Heart size={16} className="text-clay-dark" /> Wishlist ({wishlist.length})
              </h3>
              {wishlist.length === 0 ? (
                <p className="text-xs text-ink-soft py-4">Your wishlist is empty.</p>
              ) : (
                <div className="space-y-3 pt-2">
                  {wishlist.map(w => (
                    <div key={w.id} className="flex gap-2 items-center text-sm border-b border-forest/5 pb-2">
                      <img src={w.image} alt={w.title} className="w-8 h-8 rounded object-cover" />
                      <span className="truncate flex-1 text-forest-dark font-medium">{w.title}</span>
                      <span className="font-mono-data text-xs">₹{w.pricePerKg}/kg</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-forest-dark text-base border-b border-forest/10 pb-2 flex items-center gap-1.5">
                <Eye size={16} className="text-canopy" /> Recently Viewed ({recentlyViewed.length})
              </h3>
              {recentlyViewed.length === 0 ? (
                <p className="text-xs text-ink-soft py-4">No recently viewed products.</p>
              ) : (
                <div className="space-y-3 pt-2">
                  {recentlyViewed.slice(0, 4).map(r => (
                    <div key={r.id} className="flex gap-2 items-center text-sm border-b border-forest/5 pb-2">
                      <img src={r.image} alt={r.title} className="w-8 h-8 rounded object-cover" />
                      <span className="truncate flex-1 text-forest-dark font-medium">{r.title}</span>
                      <span className="font-mono-data text-xs">₹{r.pricePerKg}/kg</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
