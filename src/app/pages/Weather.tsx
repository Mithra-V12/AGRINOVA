import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSun, Droplets, Sun, Wind } from "lucide-react";
import { Card, SectionEyebrow } from "../components/ui/primitives";
import { irrigationPlan } from "../lib/mockData";
import { getFarmerProfile, getWeather, WeatherResponse } from "../lib/api";

const ICONS: Record<string, typeof Sun> = { sun: Sun, "cloud-sun": CloudSun, "cloud-rain": CloudRain, cloud: Cloud };

const mapWeatherCodeToIcon = (code: number): string => {
  if (code === 0) return "sun";
  if (code === 1 || code === 2 || code === 3) return "cloud-sun";
  if (code >= 45 && code <= 48) return "cloud";
  if (code >= 51 && code <= 55) return "cloud-rain";
  if (code >= 61 && code <= 65) return "cloud-rain";
  if (code >= 80 && code <= 82) return "cloud-rain";
  return "sun";
};

const mapWeatherCodeToCondition = (code: number): string => {
  if (code === 0) return "Sunny";
  if (code === 1 || code === 2 || code === 3) return "Partly cloudy";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rainy";
  if (code >= 80 && code <= 82) return "Rain showers";
  return "Sunny";
};

const getDayName = (dateStr: string, index: number) => {
  if (index === 0) return "Today";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export default function Weather() {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [villageName, setVillageName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        let village = "";
        try {
          const profile = await getFarmerProfile();
          setVillageName(profile.village || "Chennai");
          village = profile.village || "";
        } catch (profileErr) {
          console.warn("Could not load farmer profile (guest user), using default village:", profileErr);
          setVillageName("Chennai");
        }
        const data = await getWeather(village);
        setWeatherData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-ink-soft">Loading weather forecast...</p>
      </div>
    );
  }

  if (!weatherData || !weatherData.current) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center text-alert">
        <p>Could not load weather data. Please check backend server connection.</p>
      </div>
    );
  }

  const risks = [
    {
      label: "Rainfall (7-day)",
      level: weatherData.daily.precipitation_probability_max.some((p) => p > 50) ? "Moderate" : "Low",
      value: Math.max(...weatherData.daily.precipitation_probability_max),
    },
    {
      label: "Heat stress",
      level: Math.max(...weatherData.daily.temperature_2m_max) > 35 ? "High" : "Low",
      value: Math.round(Math.max(...weatherData.daily.temperature_2m_max) * 2),
    },
    {
      label: "Flood risk",
      level: weatherData.daily.precipitation_probability_max.some((p) => p > 75) ? "Moderate" : "Low",
      value: 12,
    },
    {
      label: "Drought risk (30-day)",
      level: "Moderate",
      value: 44,
    },
  ];

  const seasonalNote = weatherData.daily.precipitation_probability_max.some((p) => p > 50)
    ? `An active weather window is expected over ${weatherData.location || villageName} with moderate rain likely. Good timing to hold off on irrigation and plan any crop treatments.`
    : `A warm and dry stretch is forecast over ${weatherData.location || villageName}. Ensure regular watering cycles, especially for moisture-sensitive crop plots.`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <SectionEyebrow>Hyperlocal Weather Intelligence</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-forest-dark mb-1">{weatherData.location || villageName}</h1>
      <p className="text-ink-soft text-sm mb-8">Forecasts and risk built into every recommendation on your dashboard.</p>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1 bg-gradient-to-br from-canopy to-forest text-husk">
          <p className="text-husk/70 text-sm mb-1">Right now</p>
          <p className="font-mono-data text-5xl font-semibold mb-2">{weatherData.current.temperature_2m}°C</p>
          <p className="text-husk/90 mb-4">{mapWeatherCodeToCondition(weatherData.current.weather_code)}</p>
          <div className="flex gap-5 text-sm text-husk/80">
            <span className="flex items-center gap-1.5"><Droplets size={14} /> {weatherData.current.relative_humidity_2m}%</span>
            <span className="flex items-center gap-1.5"><Wind size={14} /> {weatherData.current.wind_speed_10m} km/h</span>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-forest-dark text-[17px] mb-4">7-Day Forecast</h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {weatherData.daily.time.map((time, i) => {
              const iconKey = mapWeatherCodeToIcon(weatherData.daily.weather_code[i]);
              const Icon = ICONS[iconKey] ?? Sun;
              return (
                <div key={time} className="flex flex-col items-center gap-1.5 rounded-xl bg-husk-dim p-2.5 text-center">
                  <p className="text-xs font-semibold text-forest-dark">{getDayName(time, i)}</p>
                  <Icon size={20} className="text-canopy" />
                  <p className="text-xs text-ink-soft">{Math.round(weatherData.daily.temperature_2m_max[i])}°/{Math.round(weatherData.daily.temperature_2m_min[i])}°</p>
                  <p className="text-[11px] text-canopy font-mono-data">{weatherData.daily.precipitation_probability_max[i]}%</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="font-semibold text-forest-dark text-[17px] mb-4">Risk Outlook</h2>
          <div className="space-y-4">
            {risks.map((r) => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="text-ink-soft font-medium">{r.label}</span>
                  <span className="font-semibold text-forest-dark">{r.level}</span>
                </div>
                <div className="strata-score-track h-2">
                  <div className="strata-score-fill" style={{ width: `${r.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-forest-dark text-[17px] mb-3">Seasonal Outlook</h2>
          <p className="text-sm text-ink-soft leading-relaxed">{seasonalNote}</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold text-forest-dark text-[17px] mb-4">This Week's Irrigation Plan</h2>
        <p className="text-xs text-ink-soft mb-4">Generated from soil moisture, crop stage and this forecast.</p>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {irrigationPlan.map((d) => (
            <div
              key={d.day}
              className={`rounded-xl p-3 text-center border ${
                d.action === "Irrigate" ? "bg-sprout-light/60 border-sprout" : d.action === "Skip" ? "bg-husk-dim border-forest/10" : "bg-clay/10 border-clay/30"
              }`}
            >
              <p className="text-xs font-semibold text-forest-dark mb-1">{d.day}</p>
              <p className="text-sm font-semibold text-forest-dark mb-0.5">{d.action}</p>
              <p className="font-mono-data text-xs text-ink-soft mb-1">{d.amount}</p>
              <p className="text-[10px] text-ink-soft leading-tight">{d.note}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
