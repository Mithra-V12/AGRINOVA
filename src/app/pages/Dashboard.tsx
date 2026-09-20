import { useEffect, useState, ChangeEvent } from "react";
import { NavLink } from "react-router";
import { AlertTriangle, ArrowUpRight, Bell, CloudRain, Droplets, IndianRupee, Sprout, TestTube2 } from "lucide-react";
import { Card, SectionEyebrow, StrataScore, Badge } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { getFarmerProfile, getSoilReport, getCropRecommendations, getWeather, analyzeSoilReport, fileToBase64, FarmerProfile, SoilReport, CropRecommendation, WeatherResponse, getOrders, getNotifications, getMarketplaceProducts, Order, Notification, MarketplaceListing } from "../lib/api";
import { useI18n } from "../lib/i18n";

function buildMarketPrices(listings: MarketplaceListing[]) {
  const grouped = new Map<string, number[]>();
  listings.forEach((listing) => {
    const prices = grouped.get(listing.crop) ?? [];
    prices.push(listing.pricePerKg);
    grouped.set(listing.crop, prices);
  });

  return Array.from(grouped.entries())
    .map(([crop, prices]) => ({
      crop,
      price: Math.round(prices.reduce((sum, item) => sum + item, 0) / prices.length),
      change: Math.round(((prices[0] - prices[prices.length - 1]) / Math.max(prices[prices.length - 1], 1)) * 100),
    }))
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);
}

const mapWeatherCode = (code: number): string => {
  if (code === 0) return "Clear sky";
  if (code === 1 || code === 2 || code === 3) return "Partly cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rainy";
  if (code >= 80 && code <= 82) return "Rain showers";
  return "Clear";
};

export default function Dashboard() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [soil, setSoil] = useState<SoilReport | null>(null);
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [marketPrices, setMarketPrices] = useState<{ crop: string; price: number; change: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingSoil, setAnalyzingSoil] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const p = await getFarmerProfile();
        setProfile(p);

        const [s, c, w, o, n, listings] = await Promise.all([
          getSoilReport(),
          getCropRecommendations(),
          getWeather(p.village),
          getOrders(),
          getNotifications(),
          getMarketplaceProducts(),
        ]);

        setSoil(s);
        setCrops(c);
        setWeatherData(w);
        setOrders(o);
        setNotifications(n);
        setMarketPrices(buildMarketPrices(listings));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const onSoilReportUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzingSoil(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await analyzeSoilReport(base64, mimeType);
      setSoil(res);
      alert("Soil report analyzed and updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to analyze soil report.");
    } finally {
      setAnalyzingSoil(false);
    }
  };

  const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const activeOrders = orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length;
  const outForDelivery = orders.filter((order) => ["Packed", "Shipped"].includes(order.status)).length;
  const soilIssues = [
    soil?.nitrogen === "Low" ? "Nitrogen" : null,
    soil?.phosphorus === "Low" ? "Phosphorus" : null,
    soil?.organicMatter && soil.organicMatter < 2 ? "Organic matter" : null,
  ].filter(Boolean) as string[];
  const sustainabilityScore = soil ? Math.min(100, Math.round(soil.score * 0.7 + (soil.organicMatter || 0) * 10)) : 74;
  const alertItems = notifications.length > 0
    ? notifications.slice(0, 3).map((item) => ({ icon: Bell, text: item.text }))
    : [
        soil?.nitrogen === "Low"
          ? { icon: AlertTriangle, text: "Nitrogen levels are low — top-dress soon for best results." }
          : null,
        weatherData?.current && weatherData.current.temperature_2m > 32
          ? { icon: CloudRain, text: "High heat may stress crops this week — adjust irrigation timing." }
          : null,
        soil?.organicMatter && soil.organicMatter < 2
          ? { icon: TestTube2, text: "Organic matter is below target — add compost before the next sowing." }
          : null,
      ].filter(Boolean) as Array<{ icon: typeof AlertTriangle; text: string }>;
  const recentOrders = orders.slice(0, 3);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-ink-soft">Loading dashboard...</p>
      </div>
    );
  }

  if (!profile || !soil) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-alert">
        <p>Could not load dashboard data. Please make sure the backend server is running.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <SectionEyebrow>{t("dashboard")}</SectionEyebrow>
          <h1 className="font-display text-3xl font-semibold text-forest-dark">{t("welcomeBack")}, {profile.name.split(" ")[0]}</h1>
          <p className="text-ink-soft text-sm mt-1">{profile.village}, {profile.state} · {profile.landSizeAcres} acres · {profile.primaryCrop}</p>
        </div>
        <NavLink to="/marketplace"><Button variant="clay">{t("listNewHarvest")}</Button></NavLink>
      </div>

      {/* KPI row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-xs text-ink-soft font-medium mb-1">{t("revenue")}</p>
          <p className="font-mono-data text-2xl font-semibold text-forest-dark flex items-center gap-1">
            <IndianRupee size={18} />{revenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-canopy font-medium flex items-center gap-0.5 mt-1"><ArrowUpRight size={12} /> {orders.length} recent orders</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-soft font-medium mb-1">{t("activeOrders")}</p>
          <p className="font-mono-data text-2xl font-semibold text-forest-dark">{activeOrders}</p>
          <p className="text-xs text-ink-soft mt-1">{outForDelivery} out for delivery</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-soft font-medium mb-1">{t("soilHealthScore")}</p>
          <p className="font-mono-data text-2xl font-semibold text-forest-dark">{soil.score}/100</p>
          <p className="text-xs text-amber font-medium mt-1">{soilIssues.length > 0 ? `${soilIssues.length} issues flagged` : "Healthy"}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink-soft font-medium mb-1">{t("sustainabilityScore")}</p>
          <p className="font-mono-data text-2xl font-semibold text-forest-dark">{sustainabilityScore}/100</p>
          <p className="text-xs text-canopy font-medium mt-1">{sustainabilityScore >= 75 ? "Above district average" : "Needs a small boost"}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: main column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-forest-dark text-[17px]">{t("soilHealth")}</h2>
              {analyzingSoil ? (
                <span className="text-xs text-canopy font-semibold animate-pulse">Analyzing...</span>
              ) : (
                <label className="text-xs text-canopy font-semibold cursor-pointer hover:underline">
                  {t("uploadNewReport")}
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onSoilReportUpload} />
                </label>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-4">
              <StrataScore label="Nitrogen (N)" value={soil.nitrogen === 'Low' ? 30 : soil.nitrogen === 'Medium' ? 65 : 95} max={100} suffix={` (${soil.nitrogen})`} size="sm" />
              <StrataScore label="Phosphorus (P)" value={soil.phosphorus === 'Low' ? 30 : soil.phosphorus === 'Medium' ? 65 : 95} max={100} suffix={` (${soil.phosphorus})`} size="sm" />
              <StrataScore label="Potassium (K)" value={soil.potassium === 'Low' ? 30 : soil.potassium === 'Medium' ? 65 : 95} max={100} suffix={` (${soil.potassium})`} size="sm" />
              <StrataScore label="Organic Matter" value={Math.round(soil.organicMatter * 10)} max={50} suffix={` (${soil.organicMatter}%)`} size="sm" />
            </div>
            <p className="text-xs text-ink-soft leading-relaxed mt-2 border-t border-forest/10 pt-3">
              <span className="font-semibold text-forest-dark">Summary: </span>{soil.summary}
            </p>
          </Card>

          <Card>
            <h2 className="font-semibold text-forest-dark text-[17px] mb-4">{t("cropRecommendations")}</h2>
            <div className="space-y-3">
              {crops.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 border border-forest/10 rounded-xl p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-sprout-light text-forest flex items-center justify-center shrink-0">
                      <Sprout size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-forest-dark text-sm truncate">{c.name}</p>
                      <p className="text-xs text-ink-soft truncate">{c.season} · {c.reason}</p>
                    </div>
                  </div>
                  <Badge tone="canopy">{c.suitability}% match</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-forest-dark text-[17px]">{t("recentOrders")}</h2>
              <NavLink to="/marketplace" className="text-xs text-canopy font-semibold">View marketplace</NavLink>
            </div>
            <div className="divide-y divide-forest/8">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-ink-soft py-3">No recent orders yet.</p>
              ) : recentOrders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-forest-dark truncate">{o.items[0]?.title || "Order placed"}</p>
                    <p className="text-xs text-ink-soft">#{o.id} · {o.customerName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono-data text-sm font-semibold text-forest-dark">₹{o.totalPrice}</p>
                    <p className={`text-xs font-medium ${o.status === "Delivered" ? "text-canopy" : "text-amber"}`}>{o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={16} className="text-clay-dark" />
              <h2 className="font-semibold text-forest-dark text-[17px]">{t("alerts")}</h2>
            </div>
            <div className="space-y-3">
              {alertItems.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={`${a.text}-${i}`} className="flex items-start gap-2.5 text-sm">
                    <Icon size={15} className="text-clay-dark mt-0.5 shrink-0" />
                    <p className="text-ink-soft leading-snug">{a.text}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Droplets size={16} className="text-canopy" />
              <h2 className="font-semibold text-forest-dark text-[17px]">{t("todaysWeather")}</h2>
            </div>
            {weatherData && weatherData.current ? (
              <>
                <p className="font-mono-data text-3xl font-semibold text-forest-dark">
                  {weatherData.current.temperature_2m}°C
                </p>
                <p className="text-sm text-ink-soft mb-3">
                  {mapWeatherCode(weatherData.current.weather_code)} · {weatherData.location || profile.village}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-soft">No weather data available</p>
            )}
            <NavLink to="/weather"><Button variant="secondary" size="sm" className="w-full justify-center">Full forecast</Button></NavLink>
          </Card>

          <Card>
            <h2 className="font-semibold text-forest-dark text-[17px] mb-4">{t("marketPrices")}</h2>
            <div className="space-y-2.5">
              {marketPrices.length === 0 ? (
                <p className="text-sm text-ink-soft">Live market prices are not available yet.</p>
              ) : marketPrices.map((m) => (
                <div key={m.crop} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{m.crop}</span>
                  <span className="font-mono-data font-medium text-forest-dark">
                    ₹{m.price} <span className={m.change >= 0 ? "text-canopy" : "text-alert"}>{m.change >= 0 ? "▲" : "▼"}{Math.abs(m.change)}%</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
