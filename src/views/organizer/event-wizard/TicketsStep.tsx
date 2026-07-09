import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { Category, Ticket } from "@/data/mockData";

export interface TicketsStepProps {
  categories: Category[];
  addTicket: (catIndex: number) => void;
  updateTicket: (catIndex: number, ticketIndex: number, updates: Partial<Ticket>) => void;
  removeTicket: (catIndex: number, ticketIndex: number) => void;
}

const TicketsStep = ({ categories, addTicket, updateTicket, removeTicket }: TicketsStepProps) => {
  return (
          <div className="space-y-6">
            {categories.map((cat, catIndex) => (
              <div key={cat.id} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold">{cat.name || `Race ${catIndex + 1}`}</h4>
                  <Button variant="outline" size="sm" onClick={() => addTicket(catIndex)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Price Tier
                  </Button>
                </div>

                {cat.tickets.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No tickets added yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cat.tickets.map((ticket, ticketIndex) => (
                      <div key={ticket.id} className="flex items-start gap-4 rounded-lg border border-border p-4">
                        <div className="flex-1 grid gap-4 sm:grid-cols-3">
                          <Input
                            placeholder="Tier name (e.g., Early Bird)"
                            value={ticket.name}
                            onChange={(e) => updateTicket(catIndex, ticketIndex, { name: e.target.value })}
                          />
                          <Input
                            type="number"
                            placeholder="Price (THB)"
                            value={ticket.price || ""}
                            onChange={(e) =>
                              updateTicket(catIndex, ticketIndex, { price: Number(e.target.value) })
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Quantity"
                            value={ticket.quantity || ""}
                            onChange={(e) =>
                              updateTicket(catIndex, ticketIndex, { quantity: Number(e.target.value) })
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTicket(catIndex, ticketIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
  );
};

export default TicketsStep;
