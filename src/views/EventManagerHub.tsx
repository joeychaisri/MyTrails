import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  Users,
  Shirt,
  Tag,
  Megaphone,
  Settings,
  Download,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import Logo from "@/components/Logo";
import StatusBadge from "@/components/StatusBadge";
import {
  Event,
  mockOrders,
  mockParticipants,
  mockDiscountCodes,
  revenueData,
  ticketSalesData,
  shirtSizeBreakdown,
  shuttleBusSeats,
} from "@/data/mockData";

interface EventManagerHubProps {
  event: Event;
  onBack: () => void;
  onEditWizard: () => void;
}

type HubSection = "overview" | "orders" | "participants" | "merchandise" | "promotions" | "broadcast" | "settings";

const sidebarItems: { id: HubSection; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "orders", label: "Orders (Finance)", icon: DollarSign },
  { id: "participants", label: "Participants", icon: Users },
  { id: "merchandise", label: "Merchandise Report", icon: Shirt },
  { id: "promotions", label: "Promotions", icon: Tag },
  { id: "broadcast", label: "Broadcast", icon: Megaphone },
  { id: "settings", label: "Settings", icon: Settings },
];

const COLORS = ["#E85D04", "#F97316", "#FB923C", "#34D399", "#6EE7B7"];

const EventManagerHub = ({ event, onBack, onEditWizard }: EventManagerHubProps) => {
  const [activeSection, setActiveSection] = useState<HubSection>("overview");
  const [participantFilter, setParticipantFilter] = useState("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const shirtData = Object.entries(shirtSizeBreakdown).map(([size, count]) => ({
    size,
    count,
  }));

  const filteredParticipants = mockParticipants.filter((p) =>
    participantFilter === "all" ? true : p.distance === participantFilter
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(event.revenue)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
                <p className="text-2xl font-bold text-card-foreground">{event.sold}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-2xl font-bold text-card-foreground">{event.capacity}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Chart */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">Revenue Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Ticket Sales Pie Chart */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">Ticket Sales Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={ticketSalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ticketSalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {ticketSalesData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.buyerName}</p>
                          <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.category}</TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-success/10 text-success"
                              : order.status === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.timestamp}</TableCell>
                      <TableCell className="text-right">
                        {order.status === "completed" && (
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Refund
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "participants":
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-foreground">Registered Participants</h3>
              <div className="flex gap-3">
                <Tabs value={participantFilter} onValueChange={setParticipantFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="100K">100K</TabsTrigger>
                    <TabsTrigger value="50K">50K</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>BIB No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Shirt Size</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        {participant.bibNo || (
                          <span className="text-muted-foreground">Not assigned</span>
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
                        {!participant.bibNo && (
                          <Button variant="outline" size="sm">
                            Assign BIB
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "merchandise":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Merchandise Summary</h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shirt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Shirts</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {Object.values(shirtSizeBreakdown).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shuttle Bus (Departure)</p>
                    <p className="text-2xl font-bold text-card-foreground">{shuttleBusSeats.departure}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shuttle Bus (Return)</p>
                    <p className="text-2xl font-bold text-card-foreground">{shuttleBusSeats.return}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h4 className="mb-4 font-semibold text-card-foreground">T-Shirt Size Breakdown</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shirtData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="size" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "promotions":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Discount Codes</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Discount Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input placeholder="SUMMER2025" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Discount</Label>
                        <Input type="number" placeholder="20" />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select defaultValue="percentage">
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed (THB)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Usage Limit</Label>
                        <Input type="number" placeholder="100" />
                      </div>
                      <div className="space-y-2">
                        <Label>Valid Until</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <Button className="w-full">Create Code</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDiscountCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>
                        {code.type === "percentage" ? `${code.discount}%` : formatCurrency(code.discount)}
                      </TableCell>
                      <TableCell>
                        {code.used} / {code.usageLimit}
                      </TableCell>
                      <TableCell>{code.validUntil}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            new Date(code.validUntil) > new Date()
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {new Date(code.validUntil) > new Date() ? "Active" : "Expired"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "broadcast":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Send Broadcast Message</h3>
            <div className="max-w-2xl rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient Group</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">All Participants</SelectItem>
                      <SelectItem value="100k">100K Ultra Runners</SelectItem>
                      <SelectItem value="50k">50K Trail Runners</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="Important Race Day Information" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Write your message here..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Send SMS
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Event Settings</h3>
            <div className="max-w-md">
              <Button onClick={onEditWizard} className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Open Event Wizard
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Edit event details, race categories, checkpoints, and tickets in the full wizard.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="hidden sm:block">
              <Logo size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">{event.title}</h1>
            <StatusBadge status={event.status} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-card lg:block">
          <nav className="p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden sticky top-16 z-30 w-full border-b border-border bg-card overflow-x-auto">
          <div className="flex p-2 gap-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default EventManagerHub;
