import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Image as ImageIcon,
  LogOut,
  Plus,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import PaymentModal from "@/components/PaymentModal";
import { Event, Category, Ticket, PaymentInfo } from "@/data/mockData";
import { useEvent } from "@/hooks/data/useEvents";
import { useEventsStore, eventCommissionAmount } from "@/contexts/EventsContext";
import { useOrganizerProfile } from "@/hooks/data/useOrganizerProfile";
import { useToast } from "@/hooks/use-toast";

type WizardStep = 1 | 2 | 3 | 4 | 5;

const steps = [
  { number: 1, title: "Event Information" },
  { number: 2, title: "Race Configuration" },
  { number: 3, title: "Tickets" },
  { number: 4, title: "Publishing" },
  { number: 5, title: "Review & Submit" },
];

const LAST_STEP = 5;

const provinces = [
  "Bangkok",
  "Chiang Mai",
  "Chiang Rai",
  "Chonburi",
  "Kanchanaburi",
  "Krabi",
  "Nakhon Ratchasima",
  "Nan",
  "Phetchabun",
  "Phuket",
  "Prachuap Khiri Khan",
  "Tak",
];

const EventWizard = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { logout, organizerId, organizerName } = useAuth();
  const { data: event } = useEvent(id);
  const { data: organizerAccount } = useOrganizerProfile();
  const store = useEventsStore();
  const { toast } = useToast();
  const onBack = () => navigate("/organizer/dashboard");
  const onComplete = () => navigate("/organizer/dashboard");
  const onLogout = () => { logout(); navigate("/organizer/login"); };
  const profile = organizerAccount.profile;
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(organizerAccount.paymentInfo);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Publishing timing — when should this event go live once approved?
  const [publishMode, setPublishMode] = useState<"asap" | "scheduled">(event?.publishMode ?? "asap");
  const [publishAt, setPublishAt] = useState(event?.publishAt ?? "");

  // Form state
  const [basicInfo, setBasicInfo] = useState({
    title: event?.title || "",
    titleTh: event?.titleTh || "",
    description: event?.description || "",
    descriptionTh: event?.descriptionTh || "",
    province: event?.province || "",
    date: event?.date || "",
    endDate: event?.endDate || "",
    latitude: event?.latitude || "",
    longitude: event?.longitude || "",
    facebook: event?.socialLinks.facebook || "",
    instagram: event?.socialLinks.instagram || "",
    website: event?.socialLinks.website || "",
  });

  const [categories, setCategories] = useState<Category[]>(
    event?.categories || [
      {
        id: "new-1",
        name: "50K Trail",
        nameTh: "50K เทรล",
        raceDate: "",
        startTime: "",
        startLocationName: "",
        startLat: 0,
        startLng: 0,
        distance: 50,
        elevation: 2000,
        elevationLoss: 1800,
        terrainType: "",
        itra: 4,
        utmbIndex: 0,
        cutoffTime: "",
        cutoffHours: 0,
        tickets: [],
      },
    ]
  );

  const [activeCategory, setActiveCategory] = useState(0);
  const [langTab, setLangTab] = useState("en");

  const addCategory = () => {
    const newCat: Category = {
      id: `new-${Date.now()}`,
      name: "",
      nameTh: "",
      raceDate: "",
      startTime: "",
      startLocationName: "",
      startLat: 0,
      startLng: 0,
      distance: 0,
      elevation: 0,
      elevationLoss: 0,
      terrainType: "",
      itra: 0,
      utmbIndex: 0,
      cutoffTime: "",
      cutoffHours: 0,
      tickets: [],
    };
    setCategories([...categories, newCat]);
    setActiveCategory(categories.length);
  };

  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      const updated = categories.filter((_, i) => i !== index);
      setCategories(updated);
      setActiveCategory(Math.min(activeCategory, updated.length - 1));
    }
  };

  const updateCategory = (index: number, updates: Partial<Category>) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], ...updates };
    setCategories(updated);
  };

  const addTicket = (catIndex: number) => {
    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      name: "",
      price: 0,
      quantity: 0,
      sold: 0,
    };
    const updated = [...categories];
    updated[catIndex].tickets.push(newTicket);
    setCategories(updated);
  };

  const updateTicket = (catIndex: number, ticketIndex: number, updates: Partial<Ticket>) => {
    const updated = [...categories];
    updated[catIndex].tickets[ticketIndex] = {
      ...updated[catIndex].tickets[ticketIndex],
      ...updates,
    };
    setCategories(updated);
  };

  const removeTicket = (catIndex: number, ticketIndex: number) => {
    const updated = [...categories];
    updated[catIndex].tickets = updated[catIndex].tickets.filter((_, i) => i !== ticketIndex);
    setCategories(updated);
  };

  // Assemble the event payload from the wizard's form state.
  // Commission estimate shown to the organizer on the Review step (2 parts).
  const estCapacity = categories.reduce((sum, c) => sum + c.tickets.reduce((s, t) => s + t.quantity, 0), 0);
  const estGross = categories.reduce((sum, c) => sum + c.tickets.reduce((s, t) => s + t.price * t.quantity, 0), 0);
  const myOrg = store.organizers.find((o) => o.id === (organizerId ?? "org1"));
  const myTier = store.settings.tiers.find((t) => t.id === myOrg?.tierId);
  const estEventCommission = eventCommissionAmount(estCapacity, estGross);
  const estTierRate = myTier?.commissionRate ?? 0;
  const estTierCommission = Math.round((estGross * estTierRate) / 100);
  const fmtBaht = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(n);

  const buildDraft = (): Omit<Event, "id" | "status"> => ({
    title: basicInfo.title,
    titleTh: basicInfo.titleTh,
    coverImage: event?.coverImage ?? "",
    date: basicInfo.date,
    endDate: basicInfo.endDate || basicInfo.date,
    province: basicInfo.province,
    organizerId: organizerId ?? "org1",
    organizerName: organizerName ?? "Trail Events Co.",
    publishMode,
    publishAt: publishMode === "scheduled" ? publishAt : undefined,
    sold: event?.sold ?? 0,
    capacity: categories.reduce(
      (sum, c) => sum + c.tickets.reduce((s, t) => s + t.quantity, 0),
      0
    ),
    revenue: event?.revenue ?? 0,
    categories,
    description: basicInfo.description,
    descriptionTh: basicInfo.descriptionTh,
    latitude: basicInfo.latitude,
    longitude: basicInfo.longitude,
    socialLinks: {
      facebook: basicInfo.facebook,
      instagram: basicInfo.instagram,
      website: basicInfo.website,
    },
  });

  const handleSubmit = () => {
    if (id && event) {
      // Editing an existing event: update in place, re-enter review, and clear
      // any prior rejection reason so a resubmitted event starts clean.
      store.updateEvent(id, { ...buildDraft(), status: "pending_review", submittedDate: event.submittedDate, rejectionReason: undefined });
    } else {
      store.submitEvent(buildDraft());
    }
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleSaveDraft = () => {
    if (id && event) {
      store.updateEvent(id, { ...buildDraft(), status: "draft" });
    } else {
      store.saveDraftEvent(buildDraft());
    }
    toast({ title: "Draft saved", description: "Your event has been saved as a draft." });
    onBack();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Cover Photo */}
            <div className="space-y-2">
              <Label>Cover Photo</Label>
              <div className="flex h-48 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/50">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1920x1080px
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Event Title</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">English</span>
                  <Input
                    placeholder="Doi Inthanon Trail Challenge"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">ภาษาไทย</span>
                  <Input
                    placeholder="ดอยอินทนนท์เทรลชาเลนจ์"
                    value={basicInfo.titleTh}
                    onChange={(e) => setBasicInfo({ ...basicInfo, titleTh: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Province & Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Province</Label>
                <Select value={basicInfo.province} onValueChange={(v) => setBasicInfo({ ...basicInfo, province: v })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {provinces.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    placeholder="18.5881"
                    value={basicInfo.latitude}
                    onChange={(e) => setBasicInfo({ ...basicInfo, latitude: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    placeholder="98.4864"
                    value={basicInfo.longitude}
                    onChange={(e) => setBasicInfo({ ...basicInfo, longitude: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={basicInfo.date}
                  onChange={(e) => setBasicInfo({ ...basicInfo, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={basicInfo.endDate}
                  onChange={(e) => setBasicInfo({ ...basicInfo, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">English</span>
                  <Textarea
                    rows={4}
                    placeholder="Describe your event..."
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">ภาษาไทย</span>
                  <Textarea
                    rows={4}
                    placeholder="อธิบายกิจกรรมของคุณ..."
                    value={basicInfo.descriptionTh}
                    onChange={(e) => setBasicInfo({ ...basicInfo, descriptionTh: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <Label>Social Links</Label>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  placeholder="Facebook URL"
                  value={basicInfo.facebook}
                  onChange={(e) => setBasicInfo({ ...basicInfo, facebook: e.target.value })}
                />
                <Input
                  placeholder="Instagram URL"
                  value={basicInfo.instagram}
                  onChange={(e) => setBasicInfo({ ...basicInfo, instagram: e.target.value })}
                />
                <Input
                  placeholder="Website URL"
                  value={basicInfo.website}
                  onChange={(e) => setBasicInfo({ ...basicInfo, website: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Tabs value={String(activeCategory)} onValueChange={(v) => setActiveCategory(Number(v))}>
                <TabsList>
                  {categories.map((cat, index) => (
                    <TabsTrigger key={cat.id} value={String(index)}>
                      {cat.name || `Race ${index + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={addCategory}>
                <Plus className="mr-2 h-4 w-4" />
                Add Race
              </Button>
            </div>

            {categories[activeCategory] && (
              <div className="space-y-6 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Race Details</h4>
                  {categories.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory(activeCategory)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Race Name */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Race Name (EN)</Label>
                    <Input
                      placeholder="100K Ultra"
                      value={categories[activeCategory].name}
                      onChange={(e) => updateCategory(activeCategory, { name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Race Name (TH)</Label>
                    <Input
                      placeholder="100K อัลตร้า"
                      value={categories[activeCategory].nameTh}
                      onChange={(e) => updateCategory(activeCategory, { nameTh: e.target.value })}
                    />
                  </div>
                </div>

                {/* Race Date & Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Race Date</Label>
                    <Input
                      type="date"
                      value={categories[activeCategory].raceDate}
                      onChange={(e) => updateCategory(activeCategory, { raceDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={categories[activeCategory].startTime}
                      onChange={(e) => updateCategory(activeCategory, { startTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Start Location */}
                <div className="space-y-3">
                  <Label>Start Location</Label>
                  <Input
                    placeholder="e.g. Doi Inthanon National Park HQ"
                    value={categories[activeCategory].startLocationName}
                    onChange={(e) => updateCategory(activeCategory, { startLocationName: e.target.value })}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Latitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="18.5881"
                        value={categories[activeCategory].startLat || ""}
                        onChange={(e) => updateCategory(activeCategory, { startLat: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Longitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="98.4864"
                        value={categories[activeCategory].startLng || ""}
                        onChange={(e) => updateCategory(activeCategory, { startLng: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Cutoff */}
                <div className="space-y-2">
                  <Label>Cut-off</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Clock time (HH:MM)</span>
                      <Input
                        type="time"
                        value={categories[activeCategory].cutoffTime}
                        onChange={(e) => updateCategory(activeCategory, { cutoffTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Hours limit from start</span>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="24"
                          value={categories[activeCategory].cutoffHours || ""}
                          onChange={(e) => updateCategory(activeCategory, { cutoffHours: Number(e.target.value) })}
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">hrs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Metrics */}
                <div className="space-y-3">
                  <Label>Course Metrics</Label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Distance (km)</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={categories[activeCategory].distance || ""}
                        onChange={(e) => updateCategory(activeCategory, { distance: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Elevation Gain (m)</Label>
                      <Input
                        type="number"
                        placeholder="5200"
                        value={categories[activeCategory].elevation || ""}
                        onChange={(e) => updateCategory(activeCategory, { elevation: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Elevation Loss (m)</Label>
                      <Input
                        type="number"
                        placeholder="5100"
                        value={categories[activeCategory].elevationLoss || ""}
                        onChange={(e) => updateCategory(activeCategory, { elevationLoss: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Terrain Type</Label>
                      <Select
                        value={categories[activeCategory].terrainType}
                        onValueChange={(v) => updateCategory(activeCategory, { terrainType: v })}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select terrain" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="Mountain Trail">Mountain Trail</SelectItem>
                          <SelectItem value="Forest Trail">Forest Trail</SelectItem>
                          <SelectItem value="Desert Trail">Desert Trail</SelectItem>
                          <SelectItem value="Coastal Trail">Coastal Trail</SelectItem>
                          <SelectItem value="Mixed Terrain">Mixed Terrain</SelectItem>
                          <SelectItem value="Road & Trail">Road & Trail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">ITRA Points</Label>
                      <Input
                        type="number"
                        placeholder="8"
                        value={categories[activeCategory].itra || ""}
                        onChange={(e) => updateCategory(activeCategory, { itra: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">UTMB Index</Label>
                      <Input
                        type="number"
                        placeholder="6"
                        value={categories[activeCategory].utmbIndex || ""}
                        onChange={(e) => updateCategory(activeCategory, { utmbIndex: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* GPX Upload */}
                <div className="space-y-2">
                  <Label>GPX Route File</Label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload GPX
                    </Button>
                    <span className="text-sm text-muted-foreground">No file selected</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {categories.map((cat, catIndex) => (
              <div key={cat.id} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold">{cat.name || `Race ${catIndex + 1}`}</h4>
                  <Button variant="outline" size="sm" onClick={() => addTicket(catIndex)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Price Tier
                  </Button>
                </div>

                {cat.tickets.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No tickets added yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cat.tickets.map((ticket, ticketIndex) => (
                      <div key={ticket.id} className="flex items-start gap-4 rounded-lg border border-border p-4">
                        <div className="flex-1 space-y-3">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <Input
                              placeholder="Tier name (e.g., Early Bird)"
                              value={ticket.name}
                              onChange={(e) => updateTicket(catIndex, ticketIndex, { name: e.target.value })}
                            />
                            <Input
                              type="number"
                              placeholder="Price (THB)"
                              value={ticket.price || ""}
                              onChange={(e) =>
                                updateTicket(catIndex, ticketIndex, { price: Number(e.target.value) })
                              }
                            />
                            <Input
                              type="number"
                              placeholder="Quantity"
                              value={ticket.quantity || ""}
                              onChange={(e) =>
                                updateTicket(catIndex, ticketIndex, { quantity: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Sales start</span>
                              <Input
                                type="datetime-local"
                                value={ticket.salesStart ?? ""}
                                onChange={(e) => updateTicket(catIndex, ticketIndex, { salesStart: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Sales end</span>
                              <Input
                                type="datetime-local"
                                value={ticket.salesEnd ?? ""}
                                onChange={(e) => updateTicket(catIndex, ticketIndex, { salesEnd: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTicket(catIndex, ticketIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              <div>
                <h4 className="text-lg font-semibold">When should this event go live?</h4>
                <p className="text-sm text-muted-foreground">
                  After an admin approves your event, this decides when it becomes visible to runners.
                </p>
              </div>
              <div className="space-y-3">
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${publishMode === "asap" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <input type="radio" name="publishMode" className="mt-1" checked={publishMode === "asap"} onChange={() => setPublishMode("asap")} />
                  <div>
                    <p className="font-medium">Publish as soon as approved</p>
                    <p className="text-sm text-muted-foreground">Goes live immediately once the admin approves it.</p>
                  </div>
                </label>
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${publishMode === "scheduled" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <input type="radio" name="publishMode" className="mt-1" checked={publishMode === "scheduled"} onChange={() => setPublishMode("scheduled")} />
                  <div className="flex-1">
                    <p className="font-medium">Schedule a go-live date &amp; time</p>
                    <p className="text-sm text-muted-foreground">Stays scheduled after approval, then goes live automatically at the chosen time.</p>
                    {publishMode === "scheduled" && (
                      <Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="mt-3 max-w-xs" />
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h4 className="mb-4 text-lg font-semibold">Event Summary</h4>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Event Title</p>
                    <p className="font-medium">{basicInfo.title || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Province</p>
                    <p className="font-medium">{basicInfo.province || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dates</p>
                    <p className="font-medium">
                      {basicInfo.date && basicInfo.endDate
                        ? `${basicInfo.date} - ${basicInfo.endDate}`
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Races</p>
                    <p className="font-medium">{categories.length}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-sm text-muted-foreground">Races</p>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                        <span className="font-medium">{cat.name || "Unnamed"}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{cat.distance}K</span>
                          <span>{cat.tickets.length} ticket tiers</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Commission notification — two parts */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h4 className="text-lg font-semibold">Platform commission</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                The platform keeps a commission on your registrations, deducted from your payout after the event. It has two parts:
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Event commission (based on {estCapacity.toLocaleString()} registrations)
                  </span>
                  <span className="font-medium">{fmtBaht(estEventCommission)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Your tier commission ({myTier?.name ?? "—"} · {estTierRate}%)
                  </span>
                  <span className="font-medium">{fmtBaht(estTierCommission)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="font-medium">Estimated total commission</span>
                  <span className="font-semibold">{fmtBaht(estEventCommission + estTierCommission)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                This is an estimate based on your planned capacity and prices. The final amount is calculated on actual registrations at payout.
              </p>
            </div>

            <div className="rounded-xl border border-warning/50 bg-warning/10 p-4">
              <p className="text-sm text-warning-foreground">
                <strong>Note:</strong> Once submitted, your event will be reviewed by our team. You'll
                receive an email notification within 24-48 hours.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur shrink-0">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 sm:gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <Logo size="sm" className="hidden sm:flex" />
          </div>
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{profile.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPaymentModalOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Payment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Stepper - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border bg-card overflow-y-auto">
          <nav className="p-6 space-y-1">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => setCurrentStep(step.number as WizardStep)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  currentStep === step.number
                    ? "bg-primary/10 text-primary"
                    : currentStep > step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                    currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.number
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span className="font-medium">{step.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile Stepper */}
        <div className="lg:hidden border-b border-border bg-card p-3 sm:p-4 shrink-0">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.number as WizardStep)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.number
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-1 sm:mx-2 h-px w-4 sm:w-8 ${
                      currentStep > step.number ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-medium text-foreground mt-2">
            {steps[currentStep - 1].title}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 sm:mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {event ? "Edit Event" : "Create New Event"}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {steps[currentStep - 1].title}
                </h2>
              </div>
              {event?.status === "rejected" && event.rejectionReason && (
                <div className="mb-4 sm:mb-6 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Changes requested by the reviewer</p>
                    <p className="mt-0.5 text-sm text-destructive">{event.rejectionReason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Make the changes below, then resubmit for review.</p>
                  </div>
                </div>
              )}
              {event && (event.status === "live" || event.status === "scheduled") && (
                <div className="mb-4 sm:mb-6 flex items-start gap-2 rounded-xl border border-warning/50 bg-warning/10 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-warning-foreground">Editing an approved event</p>
                    <p className="mt-0.5 text-sm text-warning-foreground">
                      Saving changes sends this event back for review and takes it offline until an admin re-approves it.
                    </p>
                  </div>
                </div>
              )}
              {renderStep()}
            </div>
          </main>

          {/* Sticky Footer */}
          <footer className="shrink-0 border-t border-border bg-card p-3 sm:p-4">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentStep > 1 && setCurrentStep((currentStep - 1) as WizardStep)}
                disabled={currentStep === 1}
                className="gap-1 sm:gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <div className="flex gap-2 sm:gap-3">
                <Button variant="outline" size="sm" onClick={handleSaveDraft}>
                  <span className="hidden sm:inline">Save as Draft</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                {currentStep < LAST_STEP ? (
                  <Button size="sm" onClick={() => setCurrentStep((currentStep + 1) as WizardStep)} className="gap-1 sm:gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSubmit}>
                    <span className="hidden sm:inline">{event?.status === "rejected" ? "Resubmit for Review" : "Submit for Review"}</span>
                    <span className="sm:hidden">{event?.status === "rejected" ? "Resubmit" : "Submit"}</span>
                  </Button>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              Event Submitted!
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground">
            Your event has been submitted for review. We'll notify you via email within 24-48 hours.
          </p>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        paymentInfo={paymentInfo}
        onSave={setPaymentInfo}
      />
    </div>
  );
};

export default EventWizard;
