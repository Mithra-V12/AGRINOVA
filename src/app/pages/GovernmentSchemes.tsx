import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";
import { Card, Badge, SectionEyebrow, StrataScore } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { useI18n } from "../lib/i18n";
import { getFarmerProfile, getGovernmentSchemes, FarmerProfile, GovernmentScheme } from "../lib/api";

function getMatchScore(scheme: GovernmentScheme, profile: FarmerProfile) {
  let score = 60;
  if (scheme.eligibility.states && profile.state && scheme.eligibility.states.includes(profile.state)) {
    score += 25;
  }
  if (scheme.eligibility.maxLandSizeAcres != null && profile.landSizeAcres != null) {
    score += profile.landSizeAcres <= scheme.eligibility.maxLandSizeAcres ? 10 : -15;
  }
  if (profile.primaryCrop && scheme.description.toLowerCase().includes(profile.primaryCrop.toLowerCase())) {
    score += 5;
  }
  return Math.min(100, Math.max(0, score));
}

export default function GovernmentSchemes() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [schemes, setSchemes] = useState<{ all: GovernmentScheme[]; eligible: GovernmentScheme[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = getFarmerProfile().catch((profileErr) => {
      console.warn("Could not load farmer profile (guest user), using guest profile:", profileErr);
      const guestProfile: FarmerProfile = {
        id: "guest",
        email: "guest@agrinova.test",
        userType: "farmer",
        name: "Guest Farmer",
        phone: "",
        state: "Tamil Nadu",
        district: "Thanjavur",
        village: "Thanjavur",
        pinCode: "",
        preferredLanguage: "en",
        landSizeAcres: 5,
        primaryCrop: "Rice",
        cropTypes: ["Rice"],
        registeredAt: new Date().toISOString(),
      };
      return guestProfile;
    });

    Promise.all([fetchProfile, getGovernmentSchemes()])
      .then(([p, s]) => {
        setProfile(p);
        setSchemes(s);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-ink-soft">Loading schemes...</p>
      </div>
    );
  }

  if (!profile || !schemes) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center text-alert">
        <p>Could not load government schemes data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <SectionEyebrow>{t("schemes")}</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-forest-dark mb-1">{t("schemesMatched")}</h1>
      <p className="text-ink-soft text-sm mb-8 max-w-2xl">
        Based on your location ({profile.state}), land ownership ({profile.landSizeAcres} acres) and crops ({profile.primaryCrop}).
      </p>

      <div className="space-y-6">
        <div>
          <h2 className="text-forest-dark font-display text-lg font-semibold mb-3">Eligible Schemes ({schemes.eligible.length})</h2>
          {schemes.eligible.length === 0 ? (
            <p className="text-sm text-ink-soft">No matching schemes found for your current profile.</p>
          ) : (
            <div className="space-y-4">
              {schemes.eligible.map((s) => {
                const score = getMatchScore(s, profile);
                return (
                  <Card key={s.id} className="sm:flex items-center gap-6">
                    <span className="w-12 h-12 rounded-xl bg-sprout-light text-forest flex items-center justify-center shrink-0 mb-3 sm:mb-0">
                      <Landmark size={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="font-semibold text-forest-dark text-[16px]">{s.name}</h2>
                        <Badge tone="canopy">Matched</Badge>
                      </div>
                      <p className="text-sm text-ink-soft mb-2">{s.description}</p>
                      <p className="text-xs text-ink-soft/80">
                        States: {s.eligibility.states ? s.eligibility.states.join(", ") : "All"} · 
                        Max land: {s.eligibility.maxLandSizeAcres ? `${s.eligibility.maxLandSizeAcres} acres` : "No limit"}
                      </p>
                    </div>
                    <div className="w-36 shrink-0 mt-4 sm:mt-0">
                      <StrataScore label="Match Quality" value={score} size="sm" />
                      <a href={s.link} target="_blank" rel="noreferrer" className="block w-full mt-3">
                        <Button variant="outline" size="sm" className="w-full justify-center">Apply</Button>
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {schemes.all.some(s => !schemes.eligible.some(e => e.id === s.id)) && (
          <div className="pt-6 border-t border-forest/10">
            <h2 className="text-forest-dark font-display text-lg font-semibold mb-3">Other Schemes</h2>
            <div className="space-y-4">
              {schemes.all
                .filter((s) => !schemes.eligible.some((e) => e.id === s.id))
                .map((s) => {
                  const score = getMatchScore(s, profile);
                  return (
                    <Card key={s.id} className="sm:flex items-center gap-6 opacity-75">
                      <span className="w-12 h-12 rounded-xl bg-husk-dim text-forest flex items-center justify-center shrink-0 mb-3 sm:mb-0">
                        <Landmark size={20} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h2 className="font-semibold text-forest-dark text-[16px]">{s.name}</h2>
                          <Badge tone="clay">Not Matched</Badge>
                        </div>
                        <p className="text-sm text-ink-soft mb-2">{s.description}</p>
                        <p className="text-xs text-ink-soft/80">
                          States: {s.eligibility.states ? s.eligibility.states.join(", ") : "All"} · 
                          Max land: {s.eligibility.maxLandSizeAcres ? `${s.eligibility.maxLandSizeAcres} acres` : "No limit"}
                        </p>
                      </div>
                      <div className="w-36 shrink-0 mt-4 sm:mt-0">
                        <StrataScore label="Match Quality" value={score} size="sm" />
                        <Button variant="outline" size="sm" className="w-full justify-center mt-3" disabled>Ineligible</Button>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
