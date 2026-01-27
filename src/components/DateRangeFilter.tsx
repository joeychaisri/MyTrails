import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DateFilterOption = "7days" | "14days" | "month" | "custom";

interface DateRangeFilterProps {
  selectedOption: DateFilterOption;
  customRange?: DateRange;
  onOptionChange: (option: DateFilterOption) => void;
  onCustomRangeChange: (range: DateRange | undefined) => void;
}

const DateRangeFilter = ({
  selectedOption,
  customRange,
  onOptionChange,
  onCustomRangeChange,
}: DateRangeFilterProps) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const getDisplayLabel = () => {
    switch (selectedOption) {
      case "7days":
        return "Last 7 Days";
      case "14days":
        return "Last 14 Days";
      case "month":
        return "This Month";
      case "custom":
        if (customRange?.from && customRange?.to) {
          return `${format(customRange.from, "MMM d")} - ${format(customRange.to, "MMM d")}`;
        }
        return "Custom Range";
      default:
        return "Last 7 Days";
    }
  };

  const handleOptionSelect = (option: DateFilterOption) => {
    if (option === "custom") {
      setShowCustomPicker(true);
    } else {
      onOptionChange(option);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{getDisplayLabel()}</span>
            <span className="sm:hidden">
              {selectedOption === "custom" ? "Custom" : getDisplayLabel().split(" ")[1]}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-popover">
          <DropdownMenuItem
            onClick={() => handleOptionSelect("7days")}
            className={cn(selectedOption === "7days" && "bg-accent")}
          >
            Last 7 Days
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOptionSelect("14days")}
            className={cn(selectedOption === "14days" && "bg-accent")}
          >
            Last 14 Days
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOptionSelect("month")}
            className={cn(selectedOption === "month" && "bg-accent")}
          >
            This Month
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Popover open={showCustomPicker} onOpenChange={setShowCustomPicker}>
            <PopoverTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setShowCustomPicker(true);
                }}
                className={cn(selectedOption === "custom" && "bg-accent")}
              >
                Custom Range...
              </DropdownMenuItem>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="end" side="left">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={customRange?.from}
                selected={customRange}
                onSelect={(range) => {
                  onCustomRangeChange(range);
                  if (range?.from && range?.to) {
                    onOptionChange("custom");
                    setShowCustomPicker(false);
                  }
                }}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DateRangeFilter;
