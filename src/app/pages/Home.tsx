import { NavLink } from "react-router";
import { CloudRain, Leaf, LineChart, Mic, Sprout, Stethoscope, Store, TestTube2 } from "lucide-react";
import Button from "../components/ui/Button";
import { Card, SectionEyebrow } from "../components/ui/primitives";
import { useI18n } from "../lib/i18n";

const PIPELINE = [
  { icon: TestTube2, title: "Soil Intelligence", copy: "Upload a soil report, get a plain-language health score in seconds." },
  { icon: CloudRain, title: "Weather Intelligence", copy: "Hyperlocal forecasts built into every recommendation." },
  { icon: Sprout, title: "Crop Planning", copy: "Personalized crop, rotation and irrigation plans." },
  { icon: Stethoscope, title: "Crop Health", copy: "Photograph a leaf, catch disease before it spreads." },
  { icon: LineChart, title: "Market Intelligence", copy: "Know the best time and price to sell." },
  { icon: Store, title: "Farm-to-Fork", copy: "Sell direct to consumers with zero middlemen." },
];

export default function Home() {
  const { t } = useI18n();
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest via-canopy to-forest-dark" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-2xl">
            <SectionEyebrow>
              <span className="text-sprout-light">AI-Powered Precision Agriculture</span>
            </SectionEyebrow>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-husk leading-[1.05] mb-6">
              From your soil to your customer's table.
            </h1>
            <p className="text-lg text-husk/80 leading-relaxed mb-8 max-w-xl">
              AGRINOVA reads your soil, watches the weather, tells you what to plant and when to water — then
              helps you sell the harvest straight to nearby customers, in your own language.
            </p>
            <div className="flex flex-wrap gap-3">
              <NavLink to="/dashboard">
                <Button size="lg" variant="clay">{t("getStarted")}</Button>
              </NavLink>
              <NavLink to="/advisor">
                <Button size="lg" variant="outline" className="!border-husk/40 !text-husk hover:!bg-husk hover:!text-forest-dark">
                  <Mic size={16} /> Talk to the AI Advisor
                </Button>
              </NavLink>
            </div>
            <div className="flex items-center gap-6 mt-10 text-husk/70 text-sm">
              <div>
                <p className="font-mono-data text-2xl text-husk font-semibold">13+</p>
                <p>Indian languages</p>
              </div>
              <div className="w-px h-8 bg-husk/20" />
              <div>
                <p className="font-mono-data text-2xl text-husk font-semibold">68</p>
                <p>Avg. soil health score</p>
              </div>
              <div className="w-px h-8 bg-husk/20" />
              <div>
                <p className="font-mono-data text-2xl text-husk font-semibold">0%</p>
                <p>Middlemen on marketplace</p>
              </div>
            </div>
          </div>
        </div>
        <div className="strata-divider mx-4 sm:mx-6 max-w-7xl lg:mx-auto -mb-1" />
      </section>

      {/* Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-2xl mb-12">
          <SectionEyebrow>The Farm-to-Fork Pipeline</SectionEyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-forest-dark mb-3">
            One platform, every stage of the season.
          </h2>
          <p className="text-ink-soft leading-relaxed">
            Each stage feeds the next — your soil data shapes crop advice, weather shapes irrigation, and harvest
            data shapes what you list on the marketplace.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PIPELINE.map((step, i) => (
            <Card key={step.title} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-lg bg-sprout-light flex items-center justify-center text-forest">
                  <step.icon size={19} />
                </span>
                <span className="font-mono-data text-xs text-ink-soft">STAGE {String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-semibold text-forest-dark text-[17px] mb-1.5">{step.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{step.copy}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Voice-first */}
      <section className="bg-husk-dim py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionEyebrow>Built for every farmer</SectionEyebrow>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-forest-dark mb-4">
              No reading required. Just speak.
            </h2>
            <p className="text-ink-soft leading-relaxed mb-6">
              Every screen can be read aloud, and every question can be asked by voice — in Telugu, Tamil, Hindi,
              Kannada, and nine more languages. Large buttons and simple icons mean anyone can use it, regardless
              of digital experience.
            </p>
            <ul className="space-y-3">
              {["Voice navigation across the whole app", "Speech-to-text for every input field", "Instructions read aloud automatically"].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-forest-dark font-medium">
                  <span className="w-5 h-5 rounded-full bg-sprout flex items-center justify-center shrink-0">
                    <Leaf size={11} className="text-forest-dark" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Card className="p-8 flex flex-col items-center text-center">
            <button className="w-20 h-20 rounded-full bg-canopy text-husk flex items-center justify-center mb-5 shadow-lg shadow-canopy/30 hover:scale-105 transition-transform">
              <Mic size={30} />
            </button>
            <p className="font-display text-lg text-forest-dark mb-1">"When should I water my cotton?"</p>
            <p className="text-sm text-ink-soft">Tap to ask AGRINOVA anything, in your language.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
