"use client";

import React from "react";

export default function SplashScreen() {
	return (
		<div className="fixed inset-0 z-[120] flex items-center justify-center bg-gradient-to-b from-[#F8F9FA] to-white">
			<div className="flex flex-col items-center gap-4">
				<div className="stack-loader" aria-hidden="true">
					<span />
					<span />
					<span />
				</div>
				<p className="text-sm font-semibold tracking-wide text-[#1A5F7A]">Loading rilstack...</p>
			</div>

			<style jsx>{`
				.stack-loader {
					position: relative;
					width: 44px;
					height: 36px;
				}

				.stack-loader span {
					position: absolute;
					width: 28px;
					height: 12px;
					border-radius: 6px;
					left: 8px;
					background: #1a5f7a;
					animation: stackPulse 1100ms ease-in-out infinite;
				}

				.stack-loader span:nth-child(1) {
					top: 0;
					animation-delay: 0ms;
				}

				.stack-loader span:nth-child(2) {
					top: 10px;
					left: 11px;
					opacity: 0.9;
					animation-delay: 120ms;
				}

				.stack-loader span:nth-child(3) {
					top: 20px;
					left: 14px;
					background: #f4a261;
					animation-delay: 240ms;
				}

				@keyframes stackPulse {
					0%,
					100% {
						transform: scale(1);
						opacity: 0.8;
					}
					50% {
						transform: scale(1.08);
						opacity: 1;
					}
				}
			`}</style>
		</div>
	);
}
