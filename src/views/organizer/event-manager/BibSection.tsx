import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Download,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { Participant } from "@/data/mockData";

export function useBibSectionState() {
  const [bibSearch, setBibSearch] = useState("");
  const [bibFilter, setBibFilter] = useState<"all" | "tba" | "assigned">("all");
  const [bibCategoryFilter, setBibCategoryFilter] = useState("all");
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4>(1);
  const [importFileReady, setImportFileReady] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importColBib, setImportColBib] = useState("A");
  const [importColId, setImportColId] = useState("D");
  const [importConflictChoice, setImportConflictChoice] = useState<Record<string, string>>({});
  const [editingBibId, setEditingBibId] = useState<string | null>(null);
  const [editingBibValue, setEditingBibValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  return {
    bibSearch, setBibSearch,
    bibFilter, setBibFilter,
    bibCategoryFilter, setBibCategoryFilter,
    importOpen, setImportOpen,
    importStep, setImportStep,
    importFileReady, setImportFileReady,
    importFileName, setImportFileName,
    importColBib, setImportColBib,
    importColId, setImportColId,
    importConflictChoice, setImportConflictChoice,
    editingBibId, setEditingBibId,
    editingBibValue, setEditingBibValue,
    fileInputRef,
  };
}

export type BibSectionState = ReturnType<typeof useBibSectionState>;

interface BibSectionProps {
  participants: Participant[];
  setParticipants: Dispatch<SetStateAction<Participant[]>>;
  state: BibSectionState;
}

const BibSection = ({ participants, setParticipants, state }: BibSectionProps) => {
  const {
    bibSearch, setBibSearch,
    bibFilter, setBibFilter,
    bibCategoryFilter, setBibCategoryFilter,
    importOpen, setImportOpen,
    importStep, setImportStep,
    importFileReady, setImportFileReady,
    importFileName, setImportFileName,
    importColBib, setImportColBib,
    importColId, setImportColId,
    importConflictChoice, setImportConflictChoice,
    editingBibId, setEditingBibId,
    editingBibValue, setEditingBibValue,
    fileInputRef,
  } = state;

        const bibAssigned = participants.filter(p => p.bibNo !== "").length;
        const bibTba = participants.filter(p => p.bibNo === "").length;
        const bibCategories = useMemo(() => [...new Set(participants.map(p => p.distance))].sort(), [participants]);
        const filteredBib = useMemo(() => participants.filter(p => {
          if (bibFilter !== "all" && (p.bibNo !== "" ? "assigned" : "tba") !== bibFilter) return false;
          if (bibCategoryFilter !== "all" && p.distance !== bibCategoryFilter) return false;
          if (bibSearch) {
            const q = bibSearch.toLowerCase();
            if (!p.name.toLowerCase().includes(q) && !p.bibNo.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
          }
          return true;
        }), [participants, bibFilter, bibCategoryFilter, bibSearch]);

        const mockExcelPreview = [
          { A:"201", B:"Anuwat Polchaisri",  C:"25K", D:"anuwat.p@email.com"   },
          { A:"202", B:"Warunee Kaewsri",    C:"25K", D:"warunee.k@email.com"  },
          { A:"203", B:"Noppawan Srimuang",  C:"25K", D:"noppawan.s@email.com" },
          { A:"203", B:"John Unknown",       C:"25K", D:"john.u@nowhere.com"   },
          { A:"205", B:"Jutamas Boonsong",   C:"25K", D:"jutamas.b@email.com"  },
        ];
        const mockMatched = [
          { bib:"201", name:"Anuwat Polchaisri",     email:"anuwat.p@email.com",     category:"25K" },
          { bib:"202", name:"Warunee Kaewsri",       email:"warunee.k@email.com",    category:"25K" },
          { bib:"204", name:"Chatchai Mongkol",      email:"chatchai.m@email.com",   category:"25K" },
          { bib:"205", name:"Jutamas Boonsong",      email:"jutamas.b@email.com",    category:"25K" },
          { bib:"206", name:"Hayashi Akiko",         email:"akiko.h@email.jp",       category:"25K" },
          { bib:"207", name:"Inoue Emi",             email:"emi.i@email.jp",         category:"25K" },
          { bib:"208", name:"Amanda Clark",          email:"amanda.c@email.com",     category:"25K" },
          { bib:"209", name:"Priya Nair",            email:"priya.n@email.sg",       category:"25K" },
          { bib:"210", name:"Julia Hoffmann",        email:"julia.h@email.de",       category:"25K" },
          { bib:"211", name:"Emma Clarke",           email:"emma.c@email.au",        category:"25K" },
          { bib:"212", name:"Rachel Moore",          email:"rachel.m@email.au",      category:"25K" },
          { bib:"213", name:"Choi Jiyeon",           email:"jiyeon.c@email.kr",      category:"25K" },
          { bib:"214", name:"Sophie Martin",         email:"sophie.m@email.fr",      category:"25K" },
          { bib:"215", name:"Chloe Lam",             email:"chloe.l@email.hk",       category:"25K" },
          { bib:"216", name:"Nurul Aina",            email:"aina@email.my",          category:"25K" },
          { bib:"217", name:"Maria Santos",          email:"maria.s@email.ph",       category:"25K" },
          { bib:"218", name:"Nuttapong Apirak",      email:"nuttapong.a@email.com",  category:"25K" },
          { bib:"219", name:"Kanchanok Phakdeewong", email:"kanchanok@email.com",    category:"25K" },
        ];
        const mockConflicts = [{
          bib: "203",
          candidates: [
            { id:"p22",  name:"Noppawan Srimuang", email:"noppawan.s@email.com", row:3 },
            { id:"p_unk", name:"John Unknown",      email:"john.u@nowhere.com",   row:4 },
          ],
        }];
        const mockUnmatched = [
          { row:4,  bib:"203", identifier:"john.u@nowhere.com", name:"John Unknown" },
          { row:19, bib:"221", identifier:"ghost@email.com",    name:"Ghost Runner" },
          { row:22, bib:"224", identifier:"nobody@test.com",    name:"Test User"    },
        ];

        const handleImportApply = () => {
          const emailToBib: Record<string, string> = {};
          mockMatched.forEach(m => { emailToBib[m.email] = m.bib; });
          mockConflicts.forEach(c => {
            const winnerId = importConflictChoice[c.bib] ?? c.candidates[0].id;
            const winner = c.candidates.find(x => x.id === winnerId);
            if (winner) emailToBib[winner.email] = c.bib;
          });
          setParticipants(prev => prev.map(p =>
            emailToBib[p.email] ? { ...p, bibNo: emailToBib[p.email] } : p
          ));
          setImportStep(4);
        };

        const importStepLabels = ["Upload", "Map Columns", "Preview", "Done"];

        return (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Runners</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{participants.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Assigned</p>
                <p className="mt-1 text-3xl font-bold text-success">{bibAssigned}</p>
                <p className="mt-1 text-xs text-muted-foreground">{Math.round((bibAssigned / participants.length) * 100)}% complete</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">TBA</p>
                <p className="mt-1 text-3xl font-bold text-warning">{bibTba}</p>
                <p className="mt-1 text-xs text-muted-foreground">Awaiting assignment</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Conflicts</p>
                <p className="mt-1 text-3xl font-bold text-destructive">0</p>
                <p className="mt-1 text-xs text-muted-foreground">Duplicate BIBs</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Assignment Progress</span>
                <span className="text-muted-foreground">{bibAssigned} / {participants.length}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${(bibAssigned / participants.length) * 100}%` }} />
              </div>
            </div>

            {/* Action bar + filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => { setImportStep(1); setImportFileName(""); setImportFileReady(false); setImportConflictChoice({}); setImportOpen(true); }}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />Import Excel
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />Download Template
              </Button>
              <div className="flex-1" />
              <Select value={bibCategoryFilter} onValueChange={setBibCategoryFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {bibCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={bibFilter} onValueChange={(v) => setBibFilter(v as typeof bibFilter)}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="tba">TBA</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search name or BIB…" value={bibSearch} onChange={e => setBibSearch(e.target.value)} className="pl-9" />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="w-36">BIB No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBib.slice(0, 50).map((p, i) => {
                    const isEditing = editingBibId === p.id;
                    const isAssigned = p.bibNo !== "";
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={editingBibValue}
                              onChange={e => setEditingBibValue(e.target.value)}
                              onBlur={() => {
                                if (editingBibValue.trim()) setParticipants(prev => prev.map(x => x.id === p.id ? { ...x, bibNo: editingBibValue.trim() } : x));
                                setEditingBibId(null);
                              }}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  if (editingBibValue.trim()) setParticipants(prev => prev.map(x => x.id === p.id ? { ...x, bibNo: editingBibValue.trim() } : x));
                                  setEditingBibId(null);
                                }
                                if (e.key === "Escape") setEditingBibId(null);
                              }}
                              className="h-7 w-24 font-mono text-sm"
                            />
                          ) : (
                            <button
                              onClick={() => { setEditingBibId(p.id); setEditingBibValue(p.bibNo); }}
                              className="group flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-sm transition-colors hover:bg-muted"
                            >
                              <span className={isAssigned ? "text-foreground font-semibold" : "text-muted-foreground"}>
                                {isAssigned ? p.bibNo : "TBA"}
                              </span>
                              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">{p.distance}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.gender === "M" ? "Male" : "Female"}</TableCell>
                        <TableCell>
                          {isAssigned ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                              <span className="h-1.5 w-1.5 rounded-full bg-success" />Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                              <span className="h-1.5 w-1.5 rounded-full bg-warning" />TBA
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredBib.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No participants found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filteredBib.length > 50 && (
                <div className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
                  Showing 50 of {filteredBib.length} — use filters to narrow down
                </div>
              )}
            </div>

            {/* Import Dialog */}
            <Dialog open={importOpen} onOpenChange={open => { if (!open) setImportOpen(false); }}>
              <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 bg-card">
                {/* Step indicator header */}
                <div className="border-b border-border px-6 py-4">
                  <DialogTitle className="mb-3 text-base font-semibold text-card-foreground">Import BIB Numbers</DialogTitle>
                  <div className="flex items-center">
                    {importStepLabels.map((label, i) => {
                      const s = (i + 1) as 1 | 2 | 3 | 4;
                      const done = importStep > s;
                      const active = importStep === s;
                      return (
                        <div key={s} className="flex flex-1 items-center">
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${done || active ? "text-primary" : "text-muted-foreground"}`}>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all
                              ${done ? "bg-primary text-primary-foreground" : active ? "bg-primary/10 text-primary ring-1 ring-primary" : "bg-muted text-muted-foreground"}`}>
                              {done ? "✓" : s}
                            </span>
                            <span className="hidden sm:block">{label}</span>
                          </div>
                          {i < importStepLabels.length - 1 && (
                            <div className={`mx-2 h-px flex-1 transition-colors ${importStep > s ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step content */}
                <div className="min-h-[340px]">
                  {/* Step 1 — Upload */}
                  {importStep === 1 && (
                    <div className="space-y-4 p-6">
                      <div>
                        <p className="text-sm font-medium text-foreground">Upload your BIB assignment file</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">We'll match runners by email address (or name as fallback)</p>
                      </div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`group cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all
                          ${importFileReady ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"}`}
                      >
                        {importFileReady ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                              <FileSpreadsheet className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{importFileName}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">Ready to process · Click to change</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                              <Upload className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Drag & drop or click to browse</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">Supports .xlsx and .csv</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.csv"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { setImportFileName(file.name); setImportFileReady(true); }
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Download className="h-4 w-4" />Download Excel Template
                      </Button>
                    </div>
                  )}

                  {/* Step 2 — Map Columns */}
                  {importStep === 2 && (
                    <div className="space-y-4 p-6">
                      <div>
                        <p className="text-sm font-medium text-foreground">Map your columns</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Tell us which columns hold the BIB number and runner identifier</p>
                      </div>
                      {/* Mini Excel preview */}
                      <div className="overflow-auto rounded-lg border border-border text-xs">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/60">
                              {["A","B","C","D"].map(col => (
                                <th key={col} className="border-r border-border px-3 py-2 text-left font-semibold text-muted-foreground last:border-r-0">
                                  Col {col}
                                  {col === importColBib && <span className="ml-1 font-normal text-primary">(BIB)</span>}
                                  {col === importColId  && col !== importColBib && <span className="ml-1 font-normal text-[#3B82F6]">(ID)</span>}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {mockExcelPreview.map((row, i) => (
                              <tr key={i} className="border-t border-border hover:bg-muted/30">
                                <td className={`border-r border-border px-3 py-2 font-mono ${importColBib === "A" ? "text-primary font-semibold" : ""}`}>{row.A}</td>
                                <td className={`border-r border-border px-3 py-2 ${importColBib === "B" ? "text-primary font-semibold" : importColId === "B" ? "text-[#3B82F6]" : ""}`}>{row.B}</td>
                                <td className={`border-r border-border px-3 py-2 ${importColBib === "C" ? "text-primary font-semibold" : importColId === "C" ? "text-[#3B82F6]" : ""}`}>{row.C}</td>
                                <td className={`px-3 py-2 ${importColId === "D" ? "text-[#3B82F6]" : ""}`}>{row.D}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <span className="inline-block h-2 w-2 rounded-full bg-primary" />BIB Number column
                          </label>
                          <Select value={importColBib} onValueChange={setImportColBib}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-popover">
                              {["A","B","C","D"].map(c => <SelectItem key={c} value={c}>Column {c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#3B82F6]" />Runner identifier
                          </label>
                          <Select value={importColId} onValueChange={setImportColId}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-popover">
                              {["A","B","C","D"].map(c => (
                                <SelectItem key={c} value={c}>
                                  Column {c}{c === "D" ? " (Email — recommended)" : c === "B" ? " (Name)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Preview & Resolve */}
                  {importStep === 3 && (
                    <div className="space-y-3 p-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />{mockMatched.length} matched
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                          <AlertCircle className="h-3.5 w-3.5" />{mockConflicts.length} conflict
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />{mockUnmatched.length} unmatched — will be skipped
                        </span>
                      </div>
                      <Tabs defaultValue="matched">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="matched">Matched ({mockMatched.length})</TabsTrigger>
                          <TabsTrigger value="conflicts">⚠ Conflicts ({mockConflicts.length})</TabsTrigger>
                          <TabsTrigger value="unmatched">Unmatched ({mockUnmatched.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="matched" className="mt-2">
                          <div className="max-h-56 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                            {mockMatched.map(m => (
                              <div key={m.bib} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/30">
                                <div className="flex items-center gap-3">
                                  <span className="w-10 font-mono font-bold text-foreground">{m.bib}</span>
                                  <span className="text-foreground">{m.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{m.category}</span>
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="conflicts" className="mt-2 space-y-3">
                          {mockConflicts.map(c => (
                            <div key={c.bib} className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                              <p className="mb-3 text-xs font-semibold text-warning">
                                BIB #{c.bib} — assigned to multiple rows. Pick one to keep:
                              </p>
                              <div className="space-y-2">
                                {c.candidates.map(candidate => {
                                  const chosen = importConflictChoice[c.bib] ?? c.candidates[0].id;
                                  return (
                                    <label
                                      key={candidate.id}
                                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors
                                        ${chosen === candidate.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`conflict-${c.bib}`}
                                        checked={chosen === candidate.id}
                                        onChange={() => setImportConflictChoice(prev => ({ ...prev, [c.bib]: candidate.id }))}
                                        className="accent-primary"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                                        <p className="text-xs text-muted-foreground">{candidate.email} · Row {candidate.row}</p>
                                      </div>
                                      {chosen === candidate.id && (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="unmatched" className="mt-2">
                          <div className="max-h-56 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                            {mockUnmatched.map(u => (
                              <div key={u.row} className="flex items-start justify-between px-4 py-3 text-sm hover:bg-muted/30">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-foreground">{u.bib}</span>
                                    <span className="text-foreground">{u.name}</span>
                                  </div>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{u.identifier}</p>
                                </div>
                                <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Row {u.row} · Skipped</span>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {/* Step 4 — Done */}
                  {importStep === 4 && (
                    <div className="flex flex-col items-center justify-center gap-5 p-10 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">Import Complete!</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {mockMatched.length + 1} BIBs assigned · {mockUnmatched.length} rows skipped
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="rounded-xl bg-success/10 px-6 py-3 text-center">
                          <p className="text-2xl font-bold text-success">{mockMatched.length + 1}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Assigned</p>
                        </div>
                        <div className="rounded-xl bg-muted px-6 py-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{mockUnmatched.length}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Skipped</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-4">
                  <div>
                    {importStep > 1 && importStep < 4 && (
                      <Button variant="ghost" size="sm" onClick={() => setImportStep(prev => (prev - 1) as typeof importStep)}>
                        ← Back
                      </Button>
                    )}
                  </div>
                  <div>
                    {importStep === 1 && (
                      <Button disabled={!importFileReady} onClick={() => setImportStep(2)}>
                        Next →
                      </Button>
                    )}
                    {importStep === 2 && (
                      <Button onClick={() => setImportStep(3)}>
                        Preview results →
                      </Button>
                    )}
                    {importStep === 3 && (
                      <Button onClick={handleImportApply} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />Apply {mockMatched.length + 1} BIBs
                      </Button>
                    )}
                    {importStep === 4 && (
                      <Button onClick={() => setImportOpen(false)}>Done</Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
};

export default BibSection;
