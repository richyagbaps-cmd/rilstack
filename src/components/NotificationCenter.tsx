"use client";
import { useState } from "react";

const demoNotifications = [
  {
    id: 1,
    type: "Celebratory",
    title: "7-Day Login Streak!",
    desc: "Congrats on your streak!",
    read: false,
  },
  {
    id: 2,
    type: "Alert",
    title: "Budget Overspent",
    desc: "You exceeded your Food budget.",
    read: false,
  },
  {
    id: 3,
    type: "Nudge",
    title: "Try Safe Lock",
    desc: "Earn more by locking savings.",
    read: true,
  },
  {
    id: 4,
    type: "Milestone",
    title: "Goal Deadline Near",
    desc: "Your 'Vacation' goal is due in 3 days.",
    read: false,
  },
];

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(demoNotifications);

  const markRead = (id: number) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        aria-label="Open notifications"
        className="relative focus:outline-blue-500"
        onClick={() => setOpen(!open)}
      >
        <span role="img" aria-label="Notifications" className="text-2xl">
          🔔
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs px-1">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 border"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div className="p-4 border-b font-bold">Notifications</div>
          <ul className="max-h-72 overflow-auto">
            {notifs.length === 0 && (
              <li className="p-4 text-center text-gray-400">
                No notifications
              </li>
            )}
            {notifs.map((n) => (
              <li
                key={n.id}
                className={`p-4 border-b last:border-b-0 flex flex-col gap-1 ${n.read ? "bg-gray-50" : "bg-blue-50"}`}
                tabIndex={0}
                aria-label={n.title}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{n.title}</span>
                  {!n.read && (
                    <button
                      className="ml-auto text-xs text-blue-600 underline"
                      onClick={() => markRead(n.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500">{n.desc}</span>
                <span className="text-xs text-gray-400">{n.type}</span>
              </li>
            ))}
          </ul>
          <button
            className="w-full py-2 text-blue-600 font-semibold rounded-b-xl focus:outline-blue-500"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
