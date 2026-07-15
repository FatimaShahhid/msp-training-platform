export type ID = string;

export type Role = "Technician" | "Senior Technician" | "Team Lead" | "Manager";

export interface Engineer {
  id: ID;
  name: string;
  initials: string;
  email: string;
  role: Role;
}

export type CompanyTier = "Standard" | "Premium" | "Enterprise";

export interface Company {
  id: ID;
  name: string;
  industry: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  size: number;
  tier: CompanyTier;
  notes: string;
}

export interface Contact {
  id: ID;
  companyId: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
}

export type ConfigurationType =
  | "Workstation"
  | "Server"
  | "Printer"
  | "Firewall"
  | "Switch"
  | "Network Device";

export interface Configuration {
  id: ID;
  companyId: ID;
  contactId?: ID;
  type: ConfigurationType;
  name: string;
  hostname: string;
  serial: string;
  os: string;
  ip: string;
}

export type TicketStatus =
  | "New"
  | "Assigned"
  | "In Progress"
  | "Waiting on Customer"
  | "Waiting on Vendor"
  | "Resolved"
  | "Closed";

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";

export type Board = "Service Desk" | "Network" | "Server" | "Projects";

export interface DiscussionMessage {
  id: ID;
  authorId: ID;
  authorName: string;
  authorKind: "engineer" | "contact";
  body: string;
  createdAt: string;
}

export interface InternalNote {
  id: ID;
  authorId: ID;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface TimeEntry {
  id: ID;
  engineerId: ID;
  engineerName: string;
  start: string;
  end: string;
  minutes: number;
  workRole: string;
  workType: string;
  notes: string;
}

export interface AuditEntry {
  id: ID;
  at: string;
  userId: ID;
  userName: string;
  action: string;
  field?: string;
  previous?: string;
  next?: string;
}

export interface Ticket {
  id: ID;
  number: string;
  summary: string;
  description: string;
  companyId: ID;
  contactId: ID;
  configurationId?: ID;
  board: Board;
  type: string;
  subtype: string;
  item: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedResourceId?: ID;
  ownerId?: ID;
  sla: string;
  slaDue: string;
  createdAt: string;
  updatedAt: string;
  discussion: DiscussionMessage[];
  internalNotes: InternalNote[];
  timeEntries: TimeEntry[];
  audit: AuditEntry[];
  attachments: { id: ID; name: string; size: number; addedAt: string }[];
}

export type ActivityType = "Call" | "Email" | "Task" | "Meeting" | "Follow-up";

export interface Activity {
  id: ID;
  type: ActivityType;
  subject: string;
  notes: string;
  ticketId?: ID;
  companyId?: ID;
  contactId?: ID;
  engineerId: ID;
  dueAt: string;
  done: boolean;
}

export interface KBArticle {
  id: ID;
  title: string;
  category: string;
  body: string;
  updatedAt: string;
}

export interface MspData {
  engineers: Engineer[];
  companies: Company[];
  contacts: Contact[];
  configurations: Configuration[];
  tickets: Ticket[];
  activities: Activity[];
  kb: KBArticle[];
  currentUserId: ID;
  recentlyViewed: ID[];
}
