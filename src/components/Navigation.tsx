"use client";
import { useRouter } from "next/navigation";
import React from "react";

const navItems = [
	{ label: "Home", icon: (
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4h-4v4a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="#2c3e5f" strokeWidth="2" strokeLinejoin="round"/></svg>
	), href: "/" },
	{ label: "Budgets", icon: (
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#2c3e5f" strokeWidth="2"/><path d="M16 3v4M8 3v4" stroke="#2c3e5f" strokeWidth="2" strokeLinecap="round"/></svg>
	), href: "/budgets" },
	{ label: "Invest", icon: (
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2c3e5f" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="#2c3e5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
	), href: "/investments" },
	{ label: "Account", icon: (
		<svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#2c3e5f" strokeWidth="2"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#2c3e5f" strokeWidth="2"/></svg>
	), href: "/account" },
];

export default function Navigation() {
	const router = useRouter();
	const [active, setActive] = React.useState(0);

	React.useEffect(() => {
		// Set active nav based on current path
		if (typeof window !== "undefined") {
			const idx = navItems.findIndex(item => item.href === window.location.pathname);
			setActive(idx === -1 ? 0 : idx);
		}
	}, []);

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E9EDF2] flex justify-around items-center h-16 shadow-lg">
			{navItems.map((item, idx) => (
				<button
					key={item.label}
					className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${active === idx ? "text-[#2c3e5f]" : "text-[#4A5B6E]"}`}
					onClick={() => { setActive(idx); router.push(item.href); }}
					aria-label={item.label}
				>
					<span className="mb-1">{item.icon}</span>
					<span className="text-xs font-medium">{item.label}</span>
				</button>
			))}
		</nav>
	);
}
