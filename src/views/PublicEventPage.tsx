import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, MapPin, Mountain, Clock, Award, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import { Event } from "@/data/mockData";
import { format } from "date-fns";
import heroImage from "@/assets/hero-trail.jpg";
import { useState } from "react";

interface PublicEventPageProps {
  event: Event;
  onBack: () => void;
}

const PublicEventPage = ({ event, onBack }: PublicEventPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState(event.categories[0]?.id || "");
  const [selectedTicket, setSelectedTicket] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const selectedCat = event.categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo size="sm" />
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={event.coverImage || heroImage}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                <Calendar className="mr-1.5 h-4 w-4" />
                {format(new Date(event.date), "MMMM d, yyyy")}
              </span>
              <span className="inline-flex items-center rounded-full bg-card/90 px-3 py-1 text-sm font-medium text-card-foreground">
                <MapPin className="mr-1.5 h-4 w-4" />
                {event.province}, Thailand
              </span>
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground md:text-5xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-foreground">About the Event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </section>

            {/* Race Categories */}
            {event.categories.length > 0 && (
              <section>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Race Categories</h2>
                <Tabs defaultValue={event.categories[0]?.id}>
                  <TabsList className="mb-4">
                    {event.categories.map((cat) => (
                      <TabsTrigger key={cat.id} value={cat.id}>
                        {cat.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {event.categories.map((cat) => (
                    <TabsContent key={cat.id} value={cat.id}>
                      <div className="rounded-xl border border-border bg-card p-6">
                        <div className="grid gap-6 sm:grid-cols-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Mountain className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Distance</p>
                              <p className="font-semibold">{cat.distance} km</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <ChevronDown className="h-5 w-5 text-primary rotate-180" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Elevation</p>
                              <p className="font-semibold">{cat.elevation.toLocaleString()} m</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Cut-off</p>
                              <p className="font-semibold">{cat.cutoffTime} ({cat.cutoffHours} hrs)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ITRA Points</p>
                              <p className="font-semibold">{cat.itra}</p>
                            </div>
                          </div>
                        </div>

                        {cat.mandatoryGear.length > 0 && (
                          <div className="mt-6 border-t border-border pt-6">
                            <h4 className="mb-3 font-semibold text-foreground">Mandatory Gear</h4>
                            <div className="flex flex-wrap gap-2">
                              {cat.mandatoryGear.map((gear) => (
                                <span
                                  key={gear}
                                  className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                                >
                                  {gear}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {cat.checkpoints.length > 0 && (
                          <div className="mt-6 border-t border-border pt-6">
                            <h4 className="mb-3 font-semibold text-foreground">Checkpoints</h4>
                            <div className="space-y-3">
                              {cat.checkpoints.map((cp, index) => (
                                <div
                                  key={cp.id}
                                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                      {index + 1}
                                    </div>
                                    <span className="font-medium">{cp.name}</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {cp.distance} km • Cutoff: {cp.cutoffTime}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </section>
            )}
          </div>

          {/* Right Column - Registration */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-elevated">
              <h3 className="mb-4 text-xl font-bold text-card-foreground">Register Now</h3>

              {event.categories.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                  </div>

                  {selectedCat && selectedCat.tickets.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Ticket</label>
                      <div className="space-y-2">
                        {selectedCat.tickets.map((ticket) => {
                          const soldOut = ticket.sold >= ticket.quantity;
                          return (
                            <label
                              key={ticket.id}
                              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                                selectedTicket === ticket.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              } ${soldOut ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="ticket"
                                  value={ticket.id}
                                  checked={selectedTicket === ticket.id}
                                  onChange={(e) => setSelectedTicket(e.target.value)}
                                  disabled={soldOut}
                                  className="h-4 w-4 text-primary"
                                />
                                <div>
                                  <p className="font-medium">{ticket.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {ticket.quantity - ticket.sold} spots left
                                  </p>
                                </div>
                              </div>
                              <p className="font-bold text-primary">{formatCurrency(ticket.price)}</p>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" size="lg" disabled={!selectedTicket}>
                    Register
                  </Button>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Registration coming soon
                </p>
              )}

              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Spots Filled</span>
                  <span className="font-medium">
                    {event.sold} / {event.capacity}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicEventPage;
