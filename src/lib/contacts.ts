import type { Contact } from "./types";

interface ContactInput {
  id: string;
  businessName: string;
  industry: string;
}

function hash(id: string, salt: number): number {
  return id.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + salt), salt);
}

const firstNames = [
  "Thomas", "Anna", "Michael", "Sarah", "Stefan", "Laura",
  "Markus", "Julia", "Andreas", "Katharina", "Felix", "Sophie",
  "Daniel", "Elena", "Christian", "Maria",
];

const lastNames = [
  "Müller", "Schmidt", "Weber", "Fischer", "Wagner", "Becker",
  "Hoffmann", "Richter", "Klein", "Wolf", "Schäfer", "Braun",
  "Koch", "Huber", "Krause", "Lehmann",
];

const rolesByIndustry: Record<string, string[]> = {
  "Construction Companies": ["Managing Director", "Project Director", "Fleet Manager"],
  Electricians: ["Owner", "Operations Manager", "Fleet Coordinator"],
  Plumbers: ["Managing Director", "Service Manager", "Owner"],
  "Delivery Services": ["Operations Director", "Fleet Manager", "Regional Manager"],
  "Landscaping Businesses": ["Owner", "Operations Manager", "Crew Lead"],
  "Logistics Companies": ["Fleet Director", "Operations Manager", "Managing Director"],
};

function emailDomain(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .slice(0, 20);
}

export function generateContact(lead: ContactInput): Contact {
  const h = hash(lead.id, 11);
  const firstName = firstNames[h % firstNames.length];
  const lastName = lastNames[(h + 3) % lastNames.length];
  const roles = rolesByIndustry[lead.industry] ?? ["Business Owner"];
  const role = roles[h % roles.length];
  const domain = emailDomain(lead.businessName);

  const emailFormats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}.de`,
    `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@${domain}.de`,
    `info@${domain}.de`,
  ];

  return {
    name: `${firstName} ${lastName}`,
    email: emailFormats[h % emailFormats.length],
    role,
    linkedIn: `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    confidence: h % 5 === 0 ? "medium" : "high",
  };
}
