import { Calendar, MapPin, MoreVertical, Pencil, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "./StatusBadge";
import { Event } from "@/data/mockData";
import { format } from "date-fns";
import heroImage from "@/assets/hero-trail.jpg";

interface EventCardProps {
  event: Event;
  onSelect: (event: Event) => void;
  onEdit: (event: Event) => void;
  onPreview: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

const EventCard = ({ event, onSelect, onEdit, onPreview, onDelete }: EventCardProps) => {
  const progressPercent = event.capacity > 0 ? (event.sold / event.capacity) * 100 : 0;

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-elevated">
      {/* Thumbnail */}
      <div
        className="relative h-40 cursor-pointer overflow-hidden bg-muted"
        onClick={() => onSelect(event)}
      >
        <img
          src={event.coverImage || heroImage}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <h3
            className="cursor-pointer text-lg font-semibold text-card-foreground hover:text-primary"
            onClick={() => onSelect(event)}
          >
            {event.title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 bg-popover">
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Wizard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreview(event)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Page
              </DropdownMenuItem>
              {event.status === "draft" && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(event)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details */}
        <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(event.date), "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {event.province}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Registration</span>
            <span className="font-medium text-card-foreground">
              {event.sold} / {event.capacity}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
