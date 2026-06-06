"use client";

import { useEffect, useState } from "react";
import {
  INITIAL_NOTIFICATIONS,
  getNotificationMeta,
  type AppNotification,
} from "@/lib/notifications";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleNew(e: Event) {
      const custom = e as CustomEvent<AppNotification>;
      setNotifications((prev) => [custom.detail, ...prev]);
    }
    window.addEventListener("leadlens-notification", handleNew);
    return () => window.removeEventListener("leadlens-notification", handleNew);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.031A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.031m-5.714.034a24.012 24.012 0 0 0 5.286 0m-5.286 0a24.012 24.012 0 0 1 5.286 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="saas-glass absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-saas-border shadow-xl sm:w-96">
            <div className="flex items-center justify-between border-b border-saas-border px-4 py-3">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  No notifications yet
                </p>
              ) : (
                notifications.map((n) => {
                  const meta = getNotificationMeta(n.type);
                  return (
                    <div
                      key={n.id}
                      className={`border-b border-saas-border px-4 py-3 transition-colors ${
                        n.read ? "bg-transparent" : "bg-violet-500/10"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.031A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.031" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-300">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {n.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
