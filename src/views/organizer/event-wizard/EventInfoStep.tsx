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
import { Image as ImageIcon } from "lucide-react";

export interface BasicInfo {
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  province: string;
  date: string;
  endDate: string;
  latitude: string;
  longitude: string;
  facebook: string;
  instagram: string;
  website: string;
}

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

export interface EventInfoStepProps {
  basicInfo: BasicInfo;
  setBasicInfo: React.Dispatch<React.SetStateAction<BasicInfo>>;
}

const EventInfoStep = ({ basicInfo, setBasicInfo }: EventInfoStepProps) => {
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
};

export default EventInfoStep;
