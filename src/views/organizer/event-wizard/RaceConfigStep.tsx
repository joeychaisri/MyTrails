import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Upload } from "lucide-react";
import { Category } from "@/data/mockData";

export interface RaceConfigStepProps {
  categories: Category[];
  activeCategory: number;
  setActiveCategory: React.Dispatch<React.SetStateAction<number>>;
  addCategory: () => void;
  removeCategory: (index: number) => void;
  updateCategory: (index: number, updates: Partial<Category>) => void;
}

const RaceConfigStep = ({
  categories,
  activeCategory,
  setActiveCategory,
  addCategory,
  removeCategory,
  updateCategory,
}: RaceConfigStepProps) => {
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
};

export default RaceConfigStep;
