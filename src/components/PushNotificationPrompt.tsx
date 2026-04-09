import React, { useEffect, useState } from "react";

export default function PushNotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "default") {
        setShow(true);
      }
    }
  }, []);

  const handleEnable = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShow(false);
    }
  };

  if (!show || permission !== "default") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-lg rounded-lg p-4 flex flex-col items-start border border-blue-100">
      <h4 className="font-bold mb-1">Enable Notifications?</h4>
      <p className="text-sm mb-2 text-gray-700">Get important updates, reminders, and alerts from Rilstack.</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleEnable}
      >
        Enable Notifications
      </button>
    </div>
  );
}
