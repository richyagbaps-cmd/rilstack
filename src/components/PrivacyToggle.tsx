import React from 'react';
import { usePrivacy } from './PrivacyContext';

export default function PrivacyToggle() {
  const { privacyMode, setPrivacyMode } = usePrivacy();
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="font-medium text-slate-700">Privacy Mode</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={privacyMode}
          onChange={e => setPrivacyMode(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
        <span className="ml-3 text-sm text-gray-600">{privacyMode ? 'On' : 'Off'}</span>
      </label>
    </div>
  );
}
