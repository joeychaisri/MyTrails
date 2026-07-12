import { useMemo } from "react";
import { Event, Participant, Registration, mockParticipants } from "@/data/mockData";
import { useEventsStore } from "@/contexts/EventsContext";
import { DataResult } from "./result";

const ageFromDob = (dob: string): number => {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

// Map a confirmed store registration onto the row shape ParticipantsSection
// renders. The extra optional fields (marked by registrationCode) carry the
// full RunnerInfo detail for the CSV export.
const registrationToParticipant = (reg: Registration, event?: Event): Participant => {
  const category = event?.categories.find((c) => c.id === reg.categoryId);
  const ticket = category?.tickets.find((t) => t.id === reg.ticketId);
  const r = reg.runner;
  return {
    id: reg.id,
    bibNo: "", // assigned later in the BIB section
    name: `${r.firstName} ${r.lastName}`,
    email: r.email,
    phone: r.phone,
    distance: category ? `${category.distance}K` : "",
    gender: r.gender === "male" ? "M" : "F", // table shape only has M/F; genderDetail keeps the real value
    shirtSize: r.shirtSize === "2XL" ? "XXL" : r.shirtSize,
    nationality: r.nationality,
    age: ageFromDob(r.dob),
    bloodType: r.bloodGroup,
    medicalConditions: r.medicalConditions ?? "",
    emergencyContact: `${r.emergencyName} (${r.emergencyPhone})`,
    club: "",
    itraId: "",
    // Derived-row extras — registrationCode marks the row as live store data.
    registrationCode: reg.code,
    dob: r.dob,
    idNumber: r.idNumber,
    emergencyName: r.emergencyName,
    emergencyPhone: r.emergencyPhone,
    genderDetail: r.gender,
    category: category?.name,
    ticket: ticket?.name,
  };
};

// Confirmed registrations of the event come first (live, from the store);
// legacy mock rows follow so existing screens/stories stay populated.
export function useParticipants(eventId?: string): DataResult<Participant[]> {
  const { registrations, events } = useEventsStore();
  const data = useMemo(() => {
    const event = events.find((e) => e.id === eventId);
    const derived = registrations
      .filter((r) => r.eventId === eventId && r.status === "confirmed")
      .map((r) => registrationToParticipant(r, event));
    return [...derived, ...mockParticipants];
  }, [registrations, events, eventId]);
  return { data, isLoading: false, error: null };
}
