import { useEffect, useState } from "react";
import { Camera, MapPin, Phone } from "lucide-react";
import { Card, Field, Input, Select, SectionEyebrow, Badge } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { getFarmerProfile, updateFarmerProfile, FarmerProfile } from "../lib/api";
import { useI18n, LangCode } from "../lib/i18n";

export default function Profile() {
  const { t, setLang } = useI18n();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getFarmerProfile()
      .then((p) => {
        setProfile(p);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-ink-soft">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center text-alert">
        <p>Could not load profile. Please make sure the backend server is running.</p>
      </div>
    );
  }

  const handleChange = (field: keyof FarmerProfile, value: string | number) => {
    setProfile((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    if (field === "language") {
      setLang(value as LangCode);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateFarmerProfile(profile);
      setProfile(updated);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <SectionEyebrow>{t("profile")}</SectionEyebrow>
      <h1 className="font-display text-3xl font-semibold text-forest-dark mb-8">{t("profile")}</h1>

      <Card className="mb-6 flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full bg-canopy text-husk flex items-center justify-center font-display text-2xl">
            {profile.name[0]}
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-husk border border-forest/15 flex items-center justify-center">
            <Camera size={12} className="text-forest" />
          </button>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-forest-dark text-lg">{profile.name}</p>
          <p className="text-sm text-ink-soft flex items-center gap-1"><MapPin size={12} />{profile.village}, {profile.state}</p>
          <p className="text-sm text-ink-soft flex items-center gap-1"><Phone size={12} />{profile.phone}</p>
        </div>
        <Badge tone="canopy" className="ml-auto shrink-0">{t("verifiedFarmer")}</Badge>
      </Card>

      <Card className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t("fullName")}><Input value={profile.name} onChange={(e) => handleChange("name", e.target.value)} /></Field>
          <Field label={t("mobileNumber")}><Input value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="State">
            <Select value={profile.state} onChange={(e) => handleChange("state", e.target.value)}>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
            </Select>
          </Field>
          <Field label="Aadhaar (optional)" hint="Used only for scheme verification"><Input placeholder="XXXX-XXXX-XXXX" /></Field>
        </div>
        <Field label={t("farmLocation")}><Input value={profile.village} onChange={(e) => handleChange("village", e.target.value)} /></Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label={t("farmSize")}><Input type="number" value={profile.landSizeAcres} onChange={(e) => handleChange("landSizeAcres", Number(e.target.value) || 0)} /></Field>
          <Field label={t("primaryCrop")}>
            <Select value={profile.primaryCrop} onChange={(e) => handleChange("primaryCrop", e.target.value)}>
              <option value="Rice">Rice</option>
              <option value="Cotton">Cotton</option>
              <option value="Red Gram">Red Gram</option>
              <option value="Maize">Maize</option>
            </Select>
          </Field>
        </div>
        <Field label={t("preferredLanguage")}>
          <Select value={profile.language} onChange={(e) => handleChange("language", e.target.value)}>
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </Select>
        </Field>
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : t("saveChanges")}</Button>
        </div>
      </Card>
    </div>
  );
}
