import React from "react";

export function IphoneFrame({ children, className = "" }) {
  return (
    <div className={`magic-iphone ${className}`}>
      <svg
        className="magic-iphone-frame"
        viewBox="0 0 433 882"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2="433" y2="882" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E9E9E7"/>
            <stop offset=".18" stopColor="#9B9B99"/>
            <stop offset=".38" stopColor="#F4F4F1"/>
            <stop offset=".66" stopColor="#8B8B89"/>
            <stop offset=".84" stopColor="#ECECEA"/>
            <stop offset="1" stopColor="#A2A2A0"/>
          </linearGradient>
          <filter id="shadow" x="-25%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="16" stdDeviation="18" floodOpacity=".14"/>
          </filter>
        </defs>

        <rect x="4.5" y="4.5" width="424" height="873" rx="67" fill="url(#metal)" filter="url(#shadow)"/>
        <rect x="9.5" y="9.5" width="414" height="863" rx="62" fill="#080808"/>
        <rect x="18" y="18" width="397" height="846" rx="55" fill="#fff"/>

        <rect x="155" y="18" width="123" height="35" rx="18" fill="#000"/>
        <circle cx="179" cy="35.5" r="5" fill="#111"/>
        <circle cx="179" cy="35.5" r="2.1" fill="#1C2630"/>

        <rect x="1" y="153" width="5" height="40" rx="2.5" fill="#A4A4A2"/>
        <rect x="1" y="215" width="5" height="72" rx="2.5" fill="#A4A4A2"/>
        <rect x="1" y="302" width="5" height="72" rx="2.5" fill="#A4A4A2"/>
        <rect x="427" y="230" width="5" height="108" rx="2.5" fill="#A4A4A2"/>
      </svg>

      <div className="magic-iphone-screen">
        {children}
      </div>
    </div>
  );
}
