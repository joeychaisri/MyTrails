import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Event, RunnerInfo } from "@/data/mockData";
import { ticketWindowState } from "@/lib/eventPhase";
import { CreateFailure, fmtTHB } from "./RegisterFlow";

// Distances at/above this require an adult runner (age at event date ≥ 18).
const ADULT_DISTANCE_KM = 50;
const ADULT_AGE = 18;

const CREATE_ERROR_COPY: Record<CreateFailure, { title: string; detail: string }> = {
  sold_out: {
    title: "This ticket just sold out",
    detail: "All remaining seats were taken while you were filling the form. Pick another ticket or category.",
  },
  window_closed: {
    title: "Registration window closed",
    detail: "Sales for this ticket have ended (or haven't opened yet). Check the event page for other tickets.",
  },
  duplicate: {
    title: "Already registered",
    detail: "This email already has an active registration for this event. Use the lookup page to find your code.",
  },
};

// Age in whole years at the event date (not today) — race rules care about race day.
const ageAtDate = (dob: string, at: string): number => {
  const birth = new Date(dob);
  const ref = new Date(at);
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
};

interface FormState {
  firstName: string;
  lastName: string;
  firstNameTh: string;
  lastNameTh: string;
  dob: string;
  gender: "" | RunnerInfo["gender"];
  nationality: string;
  idNumber: string;
  phone: string;
  email: string;
  confirmEmail: string;
  emergencyName: string;
  emergencyPhone: string;
  bloodGroup: "" | RunnerInfo["bloodGroup"];
  medicalConditions: string;
  shirtSize: "" | RunnerInfo["shirtSize"];
  pdpaConsent: boolean;
}

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  firstNameTh: "",
  lastNameTh: "",
  dob: "",
  gender: "",
  nationality: "",
  idNumber: "",
  phone: "",
  email: "",
  confirmEmail: "",
  emergencyName: "",
  emergencyPhone: "",
  bloodGroup: "",
  medicalConditions: "",
  shirtSize: "",
  pdpaConsent: false,
};

interface Props {
  event: Event;
  categoryId: string;
  ticketId: string;
  onSelectCategory: (id: string) => void;
  onSelectTicket: (id: string) => void;
  /** True when the flow was opened without router state — pick category/ticket inline. */
  showPickers: boolean;
  createError: CreateFailure | null;
  onSubmit: (runner: RunnerInfo) => void;
}

const RunnerFormStep = ({
  event,
  categoryId,
  ticketId,
  onSelectCategory,
  onSelectTicket,
  showPickers,
  createError,
  onSubmit,
}: Props) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const category = event.categories.find((c) => c.id === categoryId);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (showPickers && !categoryId) e.category = "Select a category";
    if (showPickers && !ticketId) e.ticket = "Select a ticket";
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.dob) e.dob = "Date of birth is required";
    else if (category && category.distance >= ADULT_DISTANCE_KM && ageAtDate(form.dob, event.date) < ADULT_AGE)
      e.dob = `Runners must be at least ${ADULT_AGE} on race day for distances of ${ADULT_DISTANCE_KM} km or more`;
    if (!form.gender) e.gender = "Select a gender";
    if (!form.nationality.trim()) e.nationality = "Nationality is required";
    if (!form.idNumber.trim()) e.idNumber = "ID / passport number is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (form.confirmEmail.trim() !== form.email.trim() || !form.confirmEmail.trim())
      e.confirmEmail = "Emails must match";
    if (!form.emergencyName.trim()) e.emergencyName = "Emergency contact name is required";
    if (!form.emergencyPhone.trim()) e.emergencyPhone = "Emergency contact phone is required";
    if (!form.bloodGroup) e.bloodGroup = "Select a blood group";
    if (!form.shirtSize) e.shirtSize = "Select a shirt size";
    if (!form.pdpaConsent) e.pdpaConsent = "You must accept the PDPA consent to register";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      firstNameTh: form.firstNameTh.trim() || undefined,
      lastNameTh: form.lastNameTh.trim() || undefined,
      dob: form.dob,
      gender: form.gender as RunnerInfo["gender"],
      nationality: form.nationality.trim(),
      idNumber: form.idNumber.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      emergencyName: form.emergencyName.trim(),
      emergencyPhone: form.emergencyPhone.trim(),
      bloodGroup: form.bloodGroup as RunnerInfo["bloodGroup"],
      medicalConditions: form.medicalConditions.trim() || undefined,
      shirtSize: form.shirtSize as RunnerInfo["shirtSize"],
      pdpaConsentAt: new Date().toISOString(),
    });
  };

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-xs text-destructive">{errors[key]}</p> : null;

  return (
    <div className="space-y-4">
      {/* Store rejection (sold out / window closed / duplicate) */}
      {createError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">{CREATE_ERROR_COPY[createError].title}</p>
            <p className="mt-0.5 text-sm text-destructive">{CREATE_ERROR_COPY[createError].detail}</p>
          </div>
        </div>
      )}

      {/* Inline category/ticket pickers (direct URL visit without a selection) */}
      {showPickers && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category & ticket</p>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Select Category</Label>
            <Select value={categoryId} onValueChange={onSelectCategory}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {event.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.distance}K)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("category")}
          </div>
          {category && category.tickets.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Select Ticket</Label>
              <div className="space-y-2">
                {category.tickets.map((ticket) => {
                  const windowState = ticketWindowState(ticket);
                  const soldOut = ticket.sold >= ticket.quantity || windowState !== "on_sale";
                  return (
                    <label
                      key={ticket.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        ticketId === ticket.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      } ${soldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="ticket"
                          value={ticket.id}
                          checked={ticketId === ticket.id}
                          onChange={(e) => onSelectTicket(e.target.value)}
                          disabled={soldOut}
                          className="h-4 w-4 text-primary"
                        />
                        <div>
                          <p className="font-medium">{ticket.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {windowState === "ended"
                              ? "Sales ended"
                              : windowState === "not_yet"
                                ? "Not on sale yet"
                                : `${ticket.quantity - ticket.sold} spots left`}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">{fmtTHB(ticket.price)}</p>
                    </label>
                  );
                })}
              </div>
              {fieldError("ticket")}
            </div>
          )}
        </div>
      )}

      {/* Personal */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personal information</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-firstName">First name (EN) *</Label>
            <Input id="reg-firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="bg-background" />
            {fieldError("firstName")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-lastName">Last name (EN) *</Label>
            <Input id="reg-lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="bg-background" />
            {fieldError("lastName")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-firstNameTh">ชื่อ (TH)</Label>
            <Input id="reg-firstNameTh" value={form.firstNameTh} onChange={(e) => set("firstNameTh", e.target.value)} className="bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-lastNameTh">นามสกุล (TH)</Label>
            <Input id="reg-lastNameTh" value={form.lastNameTh} onChange={(e) => set("lastNameTh", e.target.value)} className="bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-dob">Date of birth *</Label>
            <Input id="reg-dob" type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className="bg-background" />
            {fieldError("dob")}
          </div>
          <div className="space-y-1.5">
            <Label>Gender *</Label>
            <Select value={form.gender} onValueChange={(v) => set("gender", v as FormState["gender"])}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {fieldError("gender")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-nationality">Nationality *</Label>
            <Input id="reg-nationality" placeholder="e.g. Thai" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} className="bg-background" />
            {fieldError("nationality")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-idNumber">ID / Passport number *</Label>
            <Input id="reg-idNumber" value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} className="bg-background" />
            {fieldError("idNumber")}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="reg-phone">Phone *</Label>
            <Input id="reg-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="bg-background" />
            {fieldError("phone")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-email">Email *</Label>
            <Input id="reg-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="bg-background" />
            {fieldError("email")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-confirmEmail">Confirm email *</Label>
            <Input id="reg-confirmEmail" type="email" value={form.confirmEmail} onChange={(e) => set("confirmEmail", e.target.value)} className="bg-background" />
            {fieldError("confirmEmail")}
          </div>
        </div>
      </div>

      {/* Emergency contact */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Emergency contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reg-emergencyName">Contact name *</Label>
            <Input id="reg-emergencyName" value={form.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} className="bg-background" />
            {fieldError("emergencyName")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-emergencyPhone">Contact phone *</Label>
            <Input id="reg-emergencyPhone" type="tel" value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} className="bg-background" />
            {fieldError("emergencyPhone")}
          </div>
        </div>
      </div>

      {/* Race kit & medical */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Race kit & medical</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Blood group *</Label>
            <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v as FormState["bloodGroup"])}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {(["A", "B", "AB", "O", "unknown"] as const).map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg === "unknown" ? "Don't know" : bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("bloodGroup")}
          </div>
          <div className="space-y-1.5">
            <Label>Shirt size *</Label>
            <Select value={form.shirtSize} onValueChange={(v) => set("shirtSize", v as FormState["shirtSize"])}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {(["XS", "S", "M", "L", "XL", "2XL"] as const).map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("shirtSize")}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="reg-medical">Medical conditions (optional)</Label>
            <Textarea
              id="reg-medical"
              rows={2}
              placeholder="Allergies, medication, conditions the medical team should know about..."
              value={form.medicalConditions}
              onChange={(e) => set("medicalConditions", e.target.value)}
              className="bg-background text-sm"
            />
          </div>
        </div>
      </div>

      {/* PDPA consent */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="reg-pdpa"
            checked={form.pdpaConsent}
            onCheckedChange={(checked) => set("pdpaConsent", checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="reg-pdpa" className="text-sm font-normal leading-relaxed text-foreground">
            I consent to the collection and use of my personal data for race registration as described in the{" "}
            <a
              href="/pdpa"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
              onClick={(e) => e.stopPropagation()}
            >
              PDPA consent notice
            </a>
            . *
          </Label>
        </div>
        {fieldError("pdpaConsent")}
      </div>

      <Button className="w-full" size="lg" onClick={handleSubmit}>
        Continue to payment
      </Button>
    </div>
  );
};

export default RunnerFormStep;
