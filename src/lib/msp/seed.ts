import type {
  Activity,
  Board,
  Company,
  Configuration,
  ConfigurationType,
  Contact,
  DiscussionMessage,
  Engineer,
  InternalNote,
  KBArticle,
  MspData,
  Ticket,
  TicketPriority,
  TicketStatus,
  TimeEntry,
} from "./types";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260715);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const pickN = <T,>(arr: T[], n: number): T[] => {
  const s = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && s.length; i++) out.push(s.splice(Math.floor(rand() * s.length), 1)[0]);
  return out;
};
const chance = (p: number) => rand() < p;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const FIRST = [
  "Sarah","Michael","Emily","David","Jessica","Chris","Ashley","Matt","Amanda","Ryan",
  "Laura","Kevin","Nicole","Brian","Megan","Jason","Rachel","Aaron","Kaitlyn","Trevor",
  "Priya","Miguel","Yuki","Jamal","Fatima","Olga","Wei","Andre","Sofia","Ibrahim",
];
const LAST = [
  "Chen","Smith","Johnson","Brown","Garcia","Miller","Davis","Rodriguez","Martinez","Wilson",
  "Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White",
  "Harris","Patel","Nguyen","Kim","Cohen","Nakamura","Okafor","Rossi","Andersen","Silva",
];
const INDUSTRIES = [
  "Healthcare","Legal","Manufacturing","Construction","Finance","Real Estate",
  "Non-Profit","Education","Retail","Logistics","Professional Services","Hospitality",
];
const CITIES: [string, string][] = [
  ["Austin","TX"],["Denver","CO"],["Chicago","IL"],["Portland","OR"],["Boston","MA"],
  ["Atlanta","GA"],["Seattle","WA"],["Miami","FL"],["Phoenix","AZ"],["Nashville","TN"],
  ["Charlotte","NC"],["Minneapolis","MN"],["Salt Lake City","UT"],["Kansas City","MO"],
];
const COMPANY_SUFFIX = ["Group","LLC","Inc","Solutions","Partners","Holdings","Systems","Co"];
const COMPANY_ROOT = [
  "Blue Ridge","Summit","Cascade","Ironwood","Northgate","Sterling","Meridian","Harbor Point",
  "Copper Valley","Beacon","Pioneer","Redwood","Alpine","Riverstone","Silverline","Vantage",
  "Keystone","Ashford","Brightwave","Cornerstone","Delmar","Evergreen","Forge","Granite",
  "Halcyon","Ivory","Juniper","Kestrel","Lakeside","Monarch","Newport","Oakhaven","Prairie",
  "Quarry","Riverbend","Sandpiper","Timber","Union","Vessel","Windmere",
];

const ROLES: Engineer["role"][] = [
  "Technician","Technician","Technician","Senior Technician","Senior Technician","Team Lead","Manager",
];

const TICKET_SCENARIOS: { summary: string; type: string; subtype: string; item: string; board: Board }[] = [
  { summary: "Outlook prompting for password repeatedly", type: "Application", subtype: "Email", item: "Outlook", board: "Service Desk" },
  { summary: "Cannot connect to VPN from home", type: "Network", subtype: "VPN", item: "SonicWall Client", board: "Network" },
  { summary: "Printer offline in accounting area", type: "Hardware", subtype: "Printer", item: "HP LaserJet", board: "Service Desk" },
  { summary: "Password reset request", type: "Account", subtype: "Password", item: "AD Password", board: "Service Desk" },
  { summary: "Microsoft Teams call quality issues", type: "Application", subtype: "Collaboration", item: "Microsoft Teams", board: "Service Desk" },
  { summary: "OneDrive not syncing on laptop", type: "Application", subtype: "File Sync", item: "OneDrive", board: "Service Desk" },
  { summary: "MFA prompt loop when signing into portal", type: "Account", subtype: "MFA", item: "Microsoft Authenticator", board: "Service Desk" },
  { summary: "BitLocker recovery key needed", type: "Security", subtype: "Encryption", item: "BitLocker", board: "Service Desk" },
  { summary: "Access to shared drive missing", type: "Account", subtype: "Permissions", item: "File Share", board: "Server" },
  { summary: "New hire onboarding - user setup", type: "Account", subtype: "Onboarding", item: "New User", board: "Service Desk" },
  { summary: "Slow computer performance", type: "Hardware", subtype: "Workstation", item: "Performance", board: "Service Desk" },
  { summary: "Email not being delivered externally", type: "Application", subtype: "Email", item: "Exchange Online", board: "Service Desk" },
  { summary: "Wi-Fi dropping in conference room", type: "Network", subtype: "Wireless", item: "Access Point", board: "Network" },
  { summary: "Backup job failed last night", type: "Server", subtype: "Backup", item: "Veeam", board: "Server" },
  { summary: "Server disk space low alert", type: "Server", subtype: "Monitoring", item: "Disk Space", board: "Server" },
  { summary: "Firewall showing high CPU", type: "Network", subtype: "Firewall", item: "Fortigate", board: "Network" },
  { summary: "New workstation deployment request", type: "Project", subtype: "Deployment", item: "Workstation", board: "Projects" },
  { summary: "Phishing email reported by user", type: "Security", subtype: "Phishing", item: "Email Report", board: "Service Desk" },
];

const STATUSES: TicketStatus[] = [
  "New","New","Assigned","In Progress","In Progress","Waiting on Customer","Waiting on Vendor","Resolved","Closed",
];
const PRIORITIES: TicketPriority[] = ["Low","Low","Medium","Medium","Medium","High","High","Critical"];
const SLAS = ["4h Response / 8h Resolution","1h Response / 4h Resolution","8h Response / 24h Resolution","30m Response / 2h Resolution"];

const OS_LIST = ["Windows 11 Pro","Windows 10 Pro","Windows Server 2022","Windows Server 2019","macOS Sonoma","Ubuntu 22.04"];

function pad(n: number, w = 4) { return String(n).padStart(w, "0"); }
function isoOffset(daysAgo: number, hourOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9 + hourOffset, Math.floor(rand() * 60), 0, 0);
  return d.toISOString();
}

export function generateSeed(): MspData {
  const engineers: Engineer[] = [];
  const currentUser: Engineer = {
    id: "eng-sarah",
    name: "Sarah Chen",
    initials: "SC",
    email: "sarah.chen@msp.example",
    role: "Technician",
  };
  engineers.push(currentUser);
  for (let i = 1; i < 15; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    engineers.push({
      id: `eng-${pad(i, 3)}`,
      name: `${first} ${last}`,
      initials: (first[0] + last[0]).toUpperCase(),
      email: `${first.toLowerCase()}.${last.toLowerCase()}@msp.example`,
      role: pick(ROLES),
    });
  }

  const companies: Company[] = range(40).map((i) => {
    const root = pick(COMPANY_ROOT);
    const suffix = pick(COMPANY_SUFFIX);
    const [city, state] = pick(CITIES);
    return {
      id: `co-${pad(i + 1)}`,
      name: `${root} ${suffix}`,
      industry: pick(INDUSTRIES),
      city,
      state,
      phone: `(${200 + Math.floor(rand() * 700)}) ${100 + Math.floor(rand() * 900)}-${1000 + Math.floor(rand() * 9000)}`,
      website: `https://${root.toLowerCase().replace(/\s+/g, "")}.example`,
      size: 10 + Math.floor(rand() * 500),
      tier: pick(["Standard","Standard","Premium","Enterprise"] as Company["tier"][]),
      notes: "Managed services agreement in effect.",
    };
  });

  const contacts: Contact[] = [];
  let contactCounter = 0;
  companies.forEach((c) => {
    const n = 2 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      const first = pick(FIRST);
      const last = pick(LAST);
      contactCounter++;
      contacts.push({
        id: `ct-${pad(contactCounter)}`,
        companyId: c.id,
        firstName: first,
        lastName: last,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@${c.name.toLowerCase().replace(/[^a-z]/g, "")}.example`,
        phone: c.phone,
        title: pick(["Office Manager","IT Coordinator","CFO","Operations","Owner","Controller","HR Manager","Analyst"]),
      });
    }
  });

  const configurations: Configuration[] = [];
  const configTypes: ConfigurationType[] = ["Workstation","Workstation","Workstation","Server","Printer","Firewall","Switch","Network Device"];
  let confCounter = 0;
  companies.forEach((c) => {
    const n = 4 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      confCounter++;
      const type = pick(configTypes);
      const hostname = `${c.name.split(" ")[0].toUpperCase()}-${type.slice(0, 2).toUpperCase()}-${pad(i + 1, 2)}`;
      configurations.push({
        id: `cf-${pad(confCounter)}`,
        companyId: c.id,
        contactId: type === "Workstation" ? pick(contacts.filter((x) => x.companyId === c.id)).id : undefined,
        type,
        name: hostname,
        hostname,
        serial: `SN${Math.floor(rand() * 1e9).toString(36).toUpperCase()}`,
        os: type === "Printer" || type === "Firewall" || type === "Switch" || type === "Network Device" ? "Embedded" : pick(OS_LIST),
        ip: `10.${Math.floor(rand() * 254)}.${Math.floor(rand() * 254)}.${Math.floor(rand() * 254)}`,
      });
    }
  });

  const tickets: Ticket[] = [];
  for (let i = 0; i < 80; i++) {
    const scenario = pick(TICKET_SCENARIOS);
    const company = pick(companies);
    const companyContacts = contacts.filter((x) => x.companyId === company.id);
    const contact = pick(companyContacts);
    const companyConfigs = configurations.filter((x) => x.companyId === company.id);
    const config = chance(0.7) ? pick(companyConfigs) : undefined;
    const status = pick(STATUSES);
    const priority = pick(PRIORITIES);
    const daysAgo = Math.floor(rand() * 14);
    const createdAt = isoOffset(daysAgo);
    const assigned = status === "New" ? undefined : pick(engineers);
    const owner = engineers[0];
    const ticket: Ticket = {
      id: `tk-${pad(i + 1)}`,
      number: `T-${pad(1000 + i + 1)}`,
      summary: scenario.summary,
      description: `${contact.firstName} ${contact.lastName} at ${company.name} reports: ${scenario.summary.toLowerCase()}. Issue began earlier today. Requesting assistance.`,
      companyId: company.id,
      contactId: contact.id,
      configurationId: config?.id,
      board: scenario.board,
      type: scenario.type,
      subtype: scenario.subtype,
      item: scenario.item,
      status,
      priority,
      assignedResourceId: assigned?.id,
      ownerId: owner.id,
      sla: pick(SLAS),
      slaDue: isoOffset(daysAgo - 1, 6),
      createdAt,
      updatedAt: createdAt,
      discussion: [],
      internalNotes: [],
      timeEntries: [],
      audit: [
        {
          id: `au-${i}-0`,
          at: createdAt,
          userId: contact.id,
          userName: `${contact.firstName} ${contact.lastName}`,
          action: "Ticket created",
        },
      ],
      attachments: [],
    };
    // Initial discussion
    const disc: DiscussionMessage = {
      id: `dm-${i}-0`,
      authorId: contact.id,
      authorName: `${contact.firstName} ${contact.lastName}`,
      authorKind: "contact",
      body: ticket.description,
      createdAt,
    };
    ticket.discussion.push(disc);

    if (assigned) {
      ticket.audit.push({
        id: `au-${i}-1`,
        at: createdAt,
        userId: owner.id,
        userName: owner.name,
        action: "Assigned",
        field: "assignedResourceId",
        next: assigned.name,
      });
      if (chance(0.6)) {
        const note: InternalNote = {
          id: `in-${i}-0`,
          authorId: assigned.id,
          authorName: assigned.name,
          body: "Reviewing details, will reach out shortly.",
          createdAt,
        };
        ticket.internalNotes.push(note);
      }
      if (chance(0.5)) {
        const te: TimeEntry = {
          id: `te-${i}-0`,
          engineerId: assigned.id,
          engineerName: assigned.name,
          start: createdAt,
          end: new Date(new Date(createdAt).getTime() + 30 * 60000).toISOString(),
          minutes: 30,
          workRole: "Tier 1 Support",
          workType: "Remote Support",
          notes: "Initial triage and diagnostics.",
        };
        ticket.timeEntries.push(te);
      }
    }
    tickets.push(ticket);
  }

  // Ensure Sarah has some open tickets
  for (let i = 0; i < 6; i++) {
    const t = tickets[i];
    t.assignedResourceId = currentUser.id;
    if (t.status === "New") t.status = "Assigned";
  }
  // Ensure some unassigned
  for (let i = 20; i < 28; i++) {
    tickets[i].assignedResourceId = undefined;
    tickets[i].status = "New";
  }

  const activities: Activity[] = range(100).map((i) => {
    const eng = pick(engineers);
    const co = pick(companies);
    const ct = pick(contacts.filter((x) => x.companyId === co.id));
    return {
      id: `ac-${pad(i + 1)}`,
      type: pick(["Call","Email","Task","Meeting","Follow-up"] as Activity["type"][]),
      subject: pick([
        "Follow up on ticket",
        "Quarterly review call",
        "Onsite site survey",
        "Renewal discussion",
        "License audit",
        "Backup verification",
        "Patch cycle check-in",
      ]),
      notes: "",
      companyId: co.id,
      contactId: ct?.id,
      engineerId: eng.id,
      dueAt: isoOffset(Math.floor(rand() * 7) - 3),
      done: chance(0.4),
    };
  });

  const kb: KBArticle[] = [
    { id: "kb-001", title: "Outlook Password Prompt Troubleshooting", category: "Email", body: "Steps: 1) Clear Credential Manager. 2) Recreate profile. 3) Verify MFA state.", updatedAt: isoOffset(30) },
    { id: "kb-002", title: "VPN Connection Failing", category: "Network", body: "Check client version, verify user is enabled, review firewall logs.", updatedAt: isoOffset(15) },
    { id: "kb-003", title: "Printer Offline Resolution", category: "Hardware", body: "Check power, network cable, print spooler service, and IP conflicts.", updatedAt: isoOffset(45) },
    { id: "kb-004", title: "MFA Reset Procedure", category: "Security", body: "Verify identity, revoke sessions, reissue MFA token, document in ticket.", updatedAt: isoOffset(10) },
    { id: "kb-005", title: "BitLocker Recovery", category: "Security", body: "Retrieve key from Azure AD or on-prem AD. Never share via unencrypted channels.", updatedAt: isoOffset(5) },
    { id: "kb-006", title: "Shared Drive Access Requests", category: "Permissions", body: "Confirm approver, add to appropriate security group, verify with user.", updatedAt: isoOffset(20) },
  ];

  return {
    engineers,
    companies,
    contacts,
    configurations,
    tickets,
    activities,
    kb,
    currentUserId: currentUser.id,
    recentlyViewed: [],
  };
}
