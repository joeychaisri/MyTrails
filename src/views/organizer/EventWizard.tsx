import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  LogOut,
  User,
} from "lucide-react";
import Logo from "@/components/Logo";
import PaymentModal from "@/components/PaymentModal";
import { Event, Category, Ticket, Checkpoint, PaymentInfo } from "@/data/mockData";
import { useEvent } from "@/hooks/data/useEvents";
import { useOrganizerProfile } from "@/hooks/data/useOrganizerProfile";
import EventInfoStep, { BasicInfo } from "./event-wizard/EventInfoStep";
import RaceConfigStep from "./event-wizard/RaceConfigStep";
import TicketsStep from "./event-wizard/TicketsStep";
import ReviewStep from "./event-wizard/ReviewStep";

type WizardStep = 1 | 2 | 3 | 4;

const steps = [
  { number: 1, title: "Event Information" },
  { number: 2, title: "Race Configuration" },
  { number: 3, title: "Tickets" },
  { number: 4, title: "Review & Submit" },
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

interface EventWizardProps {
  initialStep?: WizardStep;
  initialScenario?: Partial<{
    basicInfo: Partial<BasicInfo>;
    categories: Category[];
    activeCategory: number;
    langTab: string;
    paymentInfo: PaymentInfo;
  }>;
}

const EventWizard = ({ initialStep, initialScenario }: EventWizardProps = {}) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: event } = useEvent(id);
  const { data: organizerAccount } = useOrganizerProfile();
  const onBack = () => navigate("/organizer/dashboard");
  const onComplete = () => navigate("/organizer/dashboard");
  const onLogout = () => { logout(); navigate("/organizer/login"); };
  const profile = organizerAccount.profile;
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(initialScenario?.paymentInfo ?? organizerAccount.paymentInfo);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep ?? 1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
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
    ...initialScenario?.basicInfo,
  });

  const [categories, setCategories] = useState<Category[]>(
    initialScenario?.categories ?? (event?.categories || [
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
        checkpoints: [],
        mandatoryGear: ["Headlamp", "Water 1L"],
        tickets: [],
      },
    ])
  );

  const [activeCategory, setActiveCategory] = useState(initialScenario?.activeCategory ?? 0);
  const [langTab, setLangTab] = useState(initialScenario?.langTab ?? "en");

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
          <EventInfoStep basicInfo={basicInfo} setBasicInfo={setBasicInfo} />
        );

      case 2:
        return (
          <RaceConfigStep
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            addCategory={addCategory}
            removeCategory={removeCategory}
            updateCategory={updateCategory}
          />
        );

      case 3:
        return (
          <TicketsStep
            categories={categories}
            addTicket={addTicket}
            updateTicket={updateTicket}
            removeTicket={removeTicket}
          />
        );

      case 4:
        return (
          <ReviewStep basicInfo={basicInfo} categories={categories} />
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
