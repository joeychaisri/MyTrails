import { Category } from "@/data/mockData";
import { BasicInfo } from "./EventInfoStep";

export interface ReviewStepProps {
  basicInfo: BasicInfo;
  categories: Category[];
}

const ReviewStep = ({ basicInfo, categories }: ReviewStepProps) => {
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
};

export default ReviewStep;
