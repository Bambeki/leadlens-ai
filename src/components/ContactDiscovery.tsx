import type { Contact } from "@/lib/types";

export default function ContactDiscovery({ contact }: { contact: Contact }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100">
          <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Contact Discovery
          </h2>
          <p className="text-sm text-slate-500">AI-identified decision maker</p>
        </div>
        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            contact.confidence === "high"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10"
          }`}
        >
          {contact.confidence} confidence
        </span>
      </div>

      <div className="mt-5 flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white">
          {contact.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-slate-900">{contact.name}</p>
          <p className="text-sm text-slate-500">{contact.role}</p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            {contact.email}
          </a>
          {contact.linkedIn && (
            <p className="mt-1 text-xs text-slate-400">
              Source: {contact.linkedIn} · Web Crawl AI
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
