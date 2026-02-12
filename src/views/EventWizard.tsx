import { useState } from "react";
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
import { Event, Category, Ticket, Checkpoint, mockProfile, mockPaymentInfo, PaymentInfo } from "@/data/mockData";

interface EventWizardProps {
  event?: Event;
  onBack: () => void;
  onComplete: () => void;
  onLogout?: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

const steps = [
  { number: 1, title: "Event Information" },
  { number: 2, title: "Race Configuration" },
  { number: 3, title: "Tickets" },
  { number: 4, title: "Review & Submit" },
];

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

const defaultGear = [
  "Headlamp",
  "Emergency Blanket",
  "Whistle",
  "First Aid Kit",
  "Water 1L",
  "Water 1.5L",
  "Mobile Phone",
  "Reflective Vest",
  "Rain Jacket",
  "Trail Running Shoes",
];

const EventWizard = ({ event, onBack, onComplete, onLogout }: EventWizardProps) => {
  const profile = mockProfile;
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(mockPaymentInfo);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [showSuccess, setShowSuccess] = useState(false);

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
        distance: 50,
        elevation: 2000,
        elevationLoss: 1800,
        terrainType: "",
        itra: 4,
        cutoff: "12:00:00",
        checkpoints: [],
        mandatoryGear: ["Headlamp", "Water 1L"],
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
      distance: 0,
      elevation: 0,
      elevationLoss: 0,
      terrainType: "",
      itra: 0,
      cutoff: "",
      checkpoints: [],
      mandatoryGear: [],
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

  const addCheckpoint = (catIndex: number) => {
    const newCp: Checkpoint = {
      id: `cp-${Date.now()}`,
      name: "",
      distance: 0,
      cutoffTime: "",
      services: [],
    };
    const updated = [...categories];
    updated[catIndex].checkpoints.push(newCp);
    setCategories(updated);
  };

  const updateCheckpoint = (catIndex: number, cpIndex: number, updates: Partial<Checkpoint>) => {
    const updated = [...categories];
    updated[catIndex].checkpoints[cpIndex] = {
      ...updated[catIndex].checkpoints[cpIndex],
      ...updates,
    };
    setCategories(updated);
  };

  const removeCheckpoint = (catIndex: number, cpIndex: number) => {
    const updated = [...categories];
    updated[catIndex].checkpoints = updated[catIndex].checkpoints.filter((_, i) => i !== cpIndex);
    setCategories(updated);
  };

  const toggleGear = (catIndex: number, gear: string) => {
    const updated = [...categories];
    const gearList = updated[catIndex].mandatoryGear;
    if (gearList.includes(gear)) {
      updated[catIndex].mandatoryGear = gearList.filter((g) => g !== gear);
    } else {
      updated[catIndex].mandatoryGear = [...gearList, gear];
    }
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

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleSaveDraft = () => {
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
                <div className="grid gap-4 sm:grid-cols-3">
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
                  <div className="space-y-2">
                    <Label>Cut-off Time</Label>
                    <Input
                      placeholder="24:00:00"
                      value={categories[activeCategory].cutoff}
                      onChange={(e) => updateCategory(activeCategory, { cutoff: e.target.value })}
                    />
                  </div>
                </div>

                {/* Distance & Elevation */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={categories[activeCategory].distance || ""}
                      onChange={(e) => updateCategory(activeCategory, { distance: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accumulative Elevation Gain (m)</Label>
                    <Input
                      type="number"
                      placeholder="5200"
                      value={categories[activeCategory].elevation || ""}
                      onChange={(e) => updateCategory(activeCategory, { elevation: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Elevation Loss (m)</Label>
                    <Input
                      type="number"
                      placeholder="5100"
                      value={categories[activeCategory].elevationLoss || ""}
                      onChange={(e) => updateCategory(activeCategory, { elevationLoss: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Terrain Type</Label>
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
                    <Label>ITRA Points</Label>
                    <Input
                      type="number"
                      placeholder="8"
                      value={categories[activeCategory].itra || ""}
                      onChange={(e) => updateCategory(activeCategory, { itra: Number(e.target.value) })}
                    />
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
                        <div className="flex-1 grid gap-4 sm:grid-cols-3">
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
                          <span>{cat.checkpoints.length} checkpoints</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                {currentStep < 4 ? (
                  <Button size="sm" onClick={() => setCurrentStep((currentStep + 1) as WizardStep)} className="gap-1 sm:gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSubmit}>
                    <span className="hidden sm:inline">Submit for Review</span>
                    <span className="sm:hidden">Submit</span>
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
