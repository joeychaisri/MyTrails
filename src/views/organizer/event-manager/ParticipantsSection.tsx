import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Search,
  Pencil,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Participant } from "@/data/mockData";

export function useParticipantsSectionState() {
  const [participantFilter, setParticipantFilter] = useState("all");
  const [participantSearch, setParticipantSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof Participant | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editForm, setEditForm] = useState<Participant | null>(null);
  return {
    participantFilter, setParticipantFilter,
    participantSearch, setParticipantSearch,
    genderFilter, setGenderFilter,
    ageFilter, setAgeFilter,
    nationalityFilter, setNationalityFilter,
    sortKey, setSortKey,
    sortDir, setSortDir,
    editingParticipant, setEditingParticipant,
    editForm, setEditForm,
  };
}

export type ParticipantsSectionState = ReturnType<typeof useParticipantsSectionState>;

interface ParticipantsSectionProps {
  eventId: string;
  participants: Participant[];
  setParticipants: Dispatch<SetStateAction<Participant[]>>;
  state: ParticipantsSectionState;
}

const ParticipantsSection = ({ eventId, participants, setParticipants, state }: ParticipantsSectionProps) => {
  const {
    participantFilter, setParticipantFilter,
    participantSearch, setParticipantSearch,
    genderFilter, setGenderFilter,
    ageFilter, setAgeFilter,
    nationalityFilter, setNationalityFilter,
    sortKey, setSortKey,
    sortDir, setSortDir,
    editingParticipant, setEditingParticipant,
    editForm, setEditForm,
  } = state;

  const handleSort = (key: keyof Participant) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: keyof Participant }) => {
    if (sortKey !== col) return <ChevronsUpDown className="inline ml-1 h-3 w-3 text-muted-foreground" />;
    return sortDir === "asc"
      ? <ChevronUp className="inline ml-1 h-3 w-3" />
      : <ChevronDown className="inline ml-1 h-3 w-3" />;
  };

  const filteredParticipants = useMemo(() => participants
    .filter((p) => participantFilter === "all" || p.distance === participantFilter)
    .filter((p) => genderFilter === "all" || p.gender === genderFilter)
    .filter((p) => {
      if (ageFilter === "all") return true;
      if (ageFilter === "u30") return p.age < 30;
      if (ageFilter === "30-39") return p.age >= 30 && p.age < 40;
      if (ageFilter === "40-49") return p.age >= 40 && p.age < 50;
      if (ageFilter === "50+") return p.age >= 50;
      return true;
    })
    .filter((p) => nationalityFilter === "all" || p.nationality === nationalityFilter)
    .filter((p) => {
      if (!participantSearch) return true;
      const q = participantSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    }), [participants, participantFilter, genderFilter, ageFilter, nationalityFilter, participantSearch, sortKey, sortDir]);

  const hasActiveFilters = participantFilter !== "all" || genderFilter !== "all" || ageFilter !== "all" || nationalityFilter !== "all" || !!participantSearch;

  const clearAllFilters = () => {
    setParticipantFilter("all");
    setGenderFilter("all");
    setAgeFilter("all");
    setNationalityFilter("all");
    setParticipantSearch("");
  };

  const openEditModal = (p: Participant) => {
    setEditingParticipant(p);
    setEditForm({ ...p });
  };

  const saveEdit = () => {
    if (!editForm) return;
    setParticipants((prev) => prev.map((p) => (p.id === editForm.id ? editForm : p)));
    setEditingParticipant(null);
    setEditForm(null);
  };

        const uniqueNationalities = useMemo(() => [...new Set(participants.map((p) => p.nationality))].sort(), [participants]);

        // CSV of all currently displayed participants. Rows derived from store
        // registrations carry the full RunnerInfo detail; legacy mock rows fill
        // in what they have (blank where unavailable).
        const exportCSV = () => {
          const headers = [
            "name", "email", "phone", "gender", "dob", "nationality", "idNumber",
            "emergencyName", "emergencyPhone", "bloodGroup", "shirtSize",
            "category", "ticket", "registrationCode",
          ];
          const rows = filteredParticipants.map((p) => [
            p.name,
            p.email,
            p.phone,
            p.genderDetail ?? (p.gender === "M" ? "male" : "female"),
            p.dob ?? "",
            p.nationality,
            p.idNumber ?? "",
            p.emergencyName ?? p.emergencyContact,
            p.emergencyPhone ?? "",
            p.bloodType,
            p.shirtSize,
            p.category ?? p.distance,
            p.ticket ?? "",
            p.registrationCode ?? "",
          ]);
          const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
          const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `participants-${eventId}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        };

        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">Registered Participants</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {filteredParticipants.length} / {participants.length}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {/* Distance */}
              <Select value={participantFilter} onValueChange={setParticipantFilter}>
                <SelectTrigger className="w-[110px] bg-card">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Races</SelectItem>
                  <SelectItem value="100K">100K</SelectItem>
                  <SelectItem value="50K">50K</SelectItem>
                  <SelectItem value="25K">25K</SelectItem>
                </SelectContent>
              </Select>
              {/* Gender */}
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[110px] bg-card">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
              {/* Age */}
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-[120px] bg-card">
                  <SelectValue placeholder="Age" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="u30">Under 30</SelectItem>
                  <SelectItem value="30-39">30 – 39</SelectItem>
                  <SelectItem value="40-49">40 – 49</SelectItem>
                  <SelectItem value="50+">50+</SelectItem>
                </SelectContent>
              </Select>
              {/* Nationality */}
              <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                <SelectTrigger className="w-[130px] bg-card">
                  <SelectValue placeholder="Nationality" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueNationalities.map((nat) => (
                    <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Clear */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("bibNo")}
                    >
                      BIB No.<SortIcon col="bibNo" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("name")}
                    >
                      Name<SortIcon col="name" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("distance")}
                    >
                      Distance<SortIcon col="distance" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("gender")}
                    >
                      Gender<SortIcon col="gender" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("shirtSize")}
                    >
                      Shirt<SortIcon col="shirtSize" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("nationality")}
                    >
                      Nationality<SortIcon col="nationality" />
                    </TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No participants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          {participant.bibNo || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-muted-foreground">{participant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{participant.distance}</TableCell>
                        <TableCell>{participant.gender === "M" ? "Male" : "Female"}</TableCell>
                        <TableCell>{participant.shirtSize}</TableCell>
                        <TableCell>{participant.nationality}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEditModal(participant)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Edit Participant Modal */}
            <Dialog open={!!editingParticipant} onOpenChange={(open) => { if (!open) { setEditingParticipant(null); setEditForm(null); } }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Participant</DialogTitle>
                </DialogHeader>
                {editForm && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                    <div className="space-y-1.5">
                      <Label>BIB No.</Label>
                      <Input value={editForm.bibNo} onChange={(e) => setEditForm({ ...editForm, bibNo: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Distance</Label>
                      <Select value={editForm.distance} onValueChange={(v) => setEditForm({ ...editForm, distance: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="100K">100K</SelectItem>
                          <SelectItem value="50K">50K</SelectItem>
                          <SelectItem value="25K">25K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Age</Label>
                      <Input type="number" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <Select value={editForm.gender} onValueChange={(v) => setEditForm({ ...editForm, gender: v as "M" | "F" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nationality</Label>
                      <Input value={editForm.nationality} onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Shirt Size</Label>
                      <Select value={editForm.shirtSize} onValueChange={(v) => setEditForm({ ...editForm, shirtSize: v as Participant["shirtSize"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          {["XS","S","M","L","XL","XXL"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Blood Type</Label>
                      <Select value={editForm.bloodType} onValueChange={(v) => setEditForm({ ...editForm, bloodType: v as Participant["bloodType"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Emergency Contact</Label>
                      <Input value={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Club / Team</Label>
                      <Input value={editForm.club} onChange={(e) => setEditForm({ ...editForm, club: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>ITRA ID</Label>
                      <Input value={editForm.itraId} onChange={(e) => setEditForm({ ...editForm, itraId: e.target.value })} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Medical Conditions / Allergies</Label>
                      <Textarea
                        value={editForm.medicalConditions}
                        onChange={(e) => setEditForm({ ...editForm, medicalConditions: e.target.value })}
                        placeholder="e.g. Asthma, allergic to penicillin..."
                        rows={2}
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => { setEditingParticipant(null); setEditForm(null); }}>Cancel</Button>
                      <Button onClick={saveEdit}>Save Changes</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
};

export default ParticipantsSection;
