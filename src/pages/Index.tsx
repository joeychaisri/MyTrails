import { useState } from "react";
import AuthView from "@/views/AuthView";
import DashboardView from "@/views/DashboardView";
import EventManagerHub from "@/views/EventManagerHub";
import EventWizard from "@/views/EventWizard";
import PublicEventPage from "@/views/PublicEventPage";
import { Event, mockEvents } from "@/data/mockData";

type ViewType = "auth" | "dashboard" | "hub" | "wizard" | "preview";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>("auth");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);

  const handleLogin = () => {
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setCurrentView("auth");
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setCurrentView("hub");
  };

  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setCurrentView("wizard");
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setCurrentView("wizard");
  };

  const handlePreviewEvent = (event: Event) => {
    setSelectedEvent(event);
    setCurrentView("preview");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedEvent(null);
  };

  const handleWizardComplete = () => {
    setCurrentView("dashboard");
    setEditingEvent(undefined);
  };

  const handleEditWizardFromHub = () => {
    if (selectedEvent) {
      setEditingEvent(selectedEvent);
      setCurrentView("wizard");
    }
  };

  switch (currentView) {
    case "auth":
      return <AuthView onLogin={handleLogin} />;
    case "dashboard":
      return (
        <DashboardView
          onLogout={handleLogout}
          onSelectEvent={handleSelectEvent}
          onCreateEvent={handleCreateEvent}
          onEditEvent={handleEditEvent}
          onPreviewEvent={handlePreviewEvent}
        />
      );
    case "hub":
      return selectedEvent ? (
        <EventManagerHub
          event={selectedEvent}
          onBack={handleBackToDashboard}
          onEditWizard={handleEditWizardFromHub}
        />
      ) : null;
    case "wizard":
      return (
        <EventWizard
          event={editingEvent}
          onBack={handleBackToDashboard}
          onComplete={handleWizardComplete}
        />
      );
    case "preview":
      return selectedEvent ? (
        <PublicEventPage event={selectedEvent} onBack={handleBackToDashboard} />
      ) : null;
    default:
      return <AuthView onLogin={handleLogin} />;
  }
};

export default Index;
