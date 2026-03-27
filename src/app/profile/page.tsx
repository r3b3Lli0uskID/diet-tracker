"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Stethoscope, Phone, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useProfile } from "@/hooks/useProfile";

interface FormData {
  readonly name: string;
  readonly ic: string;
  readonly dob: string;
  readonly cno: string;
  readonly address: string;
  readonly sex: "M" | "F";
  readonly height: number | null;
  readonly targetWeight: number | null;
  readonly activityLevel: string;
  readonly allergy: string;
  readonly co: string;
  readonly tel: string;
}

function createInitialForm(profile: FormData | undefined): FormData {
  if (profile) {
    return {
      name: profile.name,
      ic: profile.ic,
      dob: profile.dob,
      cno: profile.cno,
      address: profile.address,
      sex: profile.sex,
      height: profile.height,
      targetWeight: profile.targetWeight,
      activityLevel: profile.activityLevel,
      allergy: profile.allergy,
      co: profile.co,
      tel: profile.tel,
    };
  }
  return {
    name: "",
    ic: "",
    dob: "",
    cno: "",
    address: "",
    sex: "M",
    height: null,
    targetWeight: null,
    activityLevel: "Sedentary",
    allergy: "",
    co: "",
    tel: "",
  };
}

interface NumericProfileFieldProps {
  readonly label: string;
  readonly id: string;
  readonly placeholder: string;
  readonly value: number | null;
  readonly onChange: (value: number | null) => void;
  readonly hint?: string;
}

function NumericProfileField({ label, id, placeholder, value, onChange, hint }: NumericProfileFieldProps) {
  const [text, setText] = useState(value !== null ? String(value) : "");
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setText(value !== null ? String(value) : "");
      prevValue.current = value;
    }
  }, [value]);

  const handleBlur = () => {
    const trimmed = text.trim();
    if (trimmed === "") {
      onChange(null);
      prevValue.current = null;
    } else {
      const num = parseFloat(trimmed);
      if (!isNaN(num)) {
        onChange(num);
        prevValue.current = num;
        setText(String(num));
      } else {
        setText(value !== null ? String(value) : "");
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        className="h-11 rounded-xl"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, saveProfile, isLoading } = useProfile();
  const isNewUser = !profile;
  const [form, setForm] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);

  const formData = form ?? createInitialForm(profile ?? undefined);

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setForm((prev) => ({
        ...(prev ?? createInitialForm(profile ?? undefined)),
        [field]: value,
      }));
    },
    [profile]
  );

  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setSaving(true);
    try {
      await saveProfile(formData);
      toast.success("Profile saved successfully");
      router.push("/");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [formData, saveProfile, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col pb-20">
      <PageHeader
        title={isNewUser ? "Welcome to DietTracker" : "Edit Profile"}
        subtitle={isNewUser ? "Let's set up your profile" : "Update your information"}
        showBack={!isNewUser}
      />

      <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-teal-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ic">IC Number</Label>
                <Input
                  id="ic"
                  placeholder="IC number"
                  value={formData.ic}
                  onChange={(e) => updateField("ic", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cno">C/No</Label>
                <Input
                  id="cno"
                  placeholder="C/No"
                  value={formData.cno}
                  onChange={(e) => updateField("cno", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sex</Label>
                <Select
                  value={formData.sex}
                  onValueChange={(val) => updateField("sex", val as "M" | "F")}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="min-h-20 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ruler className="size-4 text-teal-600" />
              Physical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumericProfileField
                label="Height (cm)"
                id="height"
                placeholder="170"
                value={formData.height}
                onChange={(v) => updateField("height", v)}
                hint="Your height in centimeters"
              />
              <NumericProfileField
                label="Target Weight (kg)"
                id="targetWeight"
                placeholder="65"
                value={formData.targetWeight}
                onChange={(v) => updateField("targetWeight", v)}
                hint="Your goal weight"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Activity Level</Label>
              <Select
                value={formData.activityLevel}
                onValueChange={(val) => updateField("activityLevel", val ?? "Sedentary")}
              >
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedentary">Sedentary</SelectItem>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Very Active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="size-4 text-teal-600" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="allergy">Allergies</Label>
              <Textarea
                id="allergy"
                placeholder="List any allergies"
                value={formData.allergy}
                onChange={(e) => updateField("allergy", e.target.value)}
                className="min-h-16 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="co">C/O (Complaints)</Label>
              <Textarea
                id="co"
                placeholder="Chief complaints"
                value={formData.co}
                onChange={(e) => updateField("co", e.target.value)}
                className="min-h-16 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="size-4 text-teal-600" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="tel">Phone Number</Label>
              <Input
                id="tel"
                type="tel"
                placeholder="Phone number"
                value={formData.tel}
                onChange={(e) => updateField("tel", e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-12 w-full rounded-xl bg-teal-600 text-base font-semibold text-white hover:bg-teal-700"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </span>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>

      <BottomNav />
    </main>
  );
}
