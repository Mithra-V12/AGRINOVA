import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-husk/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-sprout flex items-center justify-center">
              <Leaf size={14} className="text-forest-dark" />
            </span>
            <span className="font-display text-lg text-husk font-semibold">AGRINOVA</span>
          </div>
          <p className="text-sm leading-relaxed text-husk/60">
            Precision agriculture and farm-to-fork intelligence, from soil to harvest to your table.
          </p>
        </div>
        <div>
          <h4 className="text-husk font-semibold text-sm mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-husk/60">
            <li>AI Farm Advisor</li>
            <li>Crop Health Monitoring</li>
            <li>Weather Intelligence</li>
            <li>Government Schemes</li>
          </ul>
        </div>
        <div>
          <h4 className="text-husk font-semibold text-sm mb-3">Marketplace</h4>
          <ul className="space-y-2 text-sm text-husk/60">
            <li>Browse produce</li>
            <li>Sell your harvest</li>
            <li>Subscriptions</li>
            <li>Farmer verification</li>
          </ul>
        </div>
        <div>
          <h4 className="text-husk font-semibold text-sm mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-husk/60">
            <li>Voice assistant, 13 languages</li>
            <li>Help center</li>
            <li>Contact a field officer</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-husk/10 py-5 text-center text-xs text-husk/50">
        © 2026 AGRINOVA. Built for the IBM Innovation Showcase.
      </div>
    </footer>
  );
}
