import { FormEvent, useState } from "react";
import { useNavigate, NavLink } from "react-router";
import { Leaf, Mail, Lock, User, Phone, MapPin, Sprout } from "lucide-react";
import { Card, Field, Input, Select, SectionEyebrow } from "../components/ui/primitives";
import Button from "../components/ui/Button";
import { registerUser } from "../lib/api";
import { useI18n, LangCode } from "../lib/i18n";

export default function Register() {
  const navigate = useNavigate();
  const { setLang } = useI18n();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    userType: "customer", // 'farmer' | 'customer'
    email: "",
    password: "",
    name: "",
    phone: "",
    state: "Tamil Nadu",
    district: "",
    village: "",
    pinCode: "",
    preferredLanguage: "en",
    landSizeAcres: 0,
    primaryCrop: "Rice",
    cropTypesInput: "",
    address: ""
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "preferredLanguage") {
      setLang(value as LangCode);
    }
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!formData.email || !formData.password) {
        setError("Please enter your email and password.");
        return;
      }
      setStep(2);
    } else {
      setLoading(true);
      
      // Parse crop types list
      const cropTypes = formData.cropTypesInput
        ? formData.cropTypesInput.split(",").map(c => c.trim()).filter(Boolean)
        : [formData.primaryCrop];

      const payload = {
        ...formData,
        cropTypes,
        landSizeAcres: Number(formData.landSizeAcres) || 0
      };

      try {
        const res = await registerUser(payload);
        
        // Save locally
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.profile));
        
        if (res.profile.preferredLanguage) {
          setLang(res.profile.preferredLanguage as LangCode);
          localStorage.setItem("language", res.profile.preferredLanguage);
        }

        if (res.profile.userType === "farmer") {
          navigate("/dashboard");
        } else {
          navigate("/marketplace");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to create account. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <span className="w-12 h-12 rounded-full bg-canopy text-husk inline-flex items-center justify-center mb-4 shadow-sm">
          <Leaf size={22} />
        </span>
        <SectionEyebrow>Registration Portal</SectionEyebrow>
        <h1 className="font-display text-3xl font-semibold text-forest-dark">Create your account</h1>
        <p className="text-ink-soft text-sm mt-1">Connect directly with the farm fresh revolution</p>
      </div>

      <div className="flex items-center gap-2 mb-6 justify-center">
        {[1, 2].map((s) => (
          <span
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              s === step ? "w-10 bg-canopy" : "w-6 bg-forest/15"
            }`}
          />
        ))}
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-alert/10 border border-alert text-alert text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {step === 1 ? (
            <>
              <Field label="Choose Account Type">
                <Select
                  value={formData.userType}
                  onChange={(e) => handleChange("userType", e.target.value)}
                >
                  <option value="customer">I want to buy fresh food (Customer)</option>
                  <option value="farmer">I want to sell harvests (Farmer)</option>
                </Select>
              </Field>

              <Field label="Email Address">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10"
                  />
                </div>
              </Field>

              <Field label="Password">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="pl-10"
                  />
                </div>
              </Field>
            </>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Full Name">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter full name"
                      className="pl-10"
                    />
                  </div>
                </Field>

                <Field label="Mobile Number">
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                    <Input
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+91"
                      className="pl-10"
                    />
                  </div>
                </Field>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="State">
                  <Select
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                  </Select>
                </Field>

                <Field label="District">
                  <Input
                    required
                    value={formData.district}
                    onChange={(e) => handleChange("district", e.target.value)}
                    placeholder="e.g. Erode"
                  />
                </Field>

                <Field label="PIN Code">
                  <Input
                    required
                    value={formData.pinCode}
                    onChange={(e) => handleChange("pinCode", e.target.value)}
                    placeholder="e.g. 638001"
                  />
                </Field>
              </div>

              <Field label="Preferred Language">
                <Select
                  value={formData.preferredLanguage}
                  onChange={(e) => handleChange("preferredLanguage", e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </Select>
              </Field>

              {formData.userType === "farmer" ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Village/Town">
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                        <Input
                          required
                          value={formData.village}
                          onChange={(e) => handleChange("village", e.target.value)}
                          placeholder="e.g. Thanjavur"
                          className="pl-10"
                        />
                      </div>
                    </Field>

                    <Field label="Farm Size (Acres)">
                      <Input
                        type="number"
                        step="any"
                        required
                        value={formData.landSizeAcres}
                        onChange={(e) => handleChange("landSizeAcres", Number(e.target.value) || 0)}
                        placeholder="e.g. 4.5"
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Primary Crop">
                      <Select
                        value={formData.primaryCrop}
                        onChange={(e) => handleChange("primaryCrop", e.target.value)}
                      >
                        <option value="Rice">Rice (Paddy)</option>
                        <option value="Cotton">Cotton</option>
                        <option value="Red Gram">Red Gram</option>
                        <option value="Maize">Maize</option>
                      </Select>
                    </Field>

                    <Field label="Crop Types Grown" hint="Comma-separated">
                      <div className="relative">
                        <Sprout className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" size={16} />
                        <Input
                          value={formData.cropTypesInput}
                          onChange={(e) => handleChange("cropTypesInput", e.target.value)}
                          placeholder="Rice, Turmeric, Black Gram"
                          className="pl-10"
                        />
                      </div>
                    </Field>
                  </div>
                </>
              ) : (
                <Field label="Complete Delivery Address">
                  <Input
                    required
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Door No, Street Name, Landmark..."
                  />
                </Field>
              )}
            </>
          )}

          <div className="flex justify-between pt-2">
            {step === 2 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Registering..." : step === 1 ? "Continue" : "Create Profile"}
            </Button>
          </div>

          <div className="text-center pt-2 border-t border-forest/10 mt-4 text-sm text-ink-soft">
            Already have an account?{" "}
            <NavLink to="/login" className="text-canopy hover:underline font-semibold">
              Sign in
            </NavLink>
          </div>
        </form>
      </Card>
    </div>
  );
}
