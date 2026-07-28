// Flat kid-friendly lab scene. Coordinates are the same 800x500 space the
// .hotspot-* CSS percentages use, so labels sit on the part they name.
export function LabScene() {
  return (
    <svg
      className="lab-scene"
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {/* room */}
      <rect x="0" y="0" width="800" height="450" fill="#dff1f7" />
      <rect x="0" y="355" width="800" height="95" fill="#c4a574" />
      <rect x="0" y="355" width="800" height="10" fill="#a98753" />

      {/* wifi router */}
      <g>
        <rect x="38" y="52" width="96" height="30" rx="12" fill="#5a6b7d" />
        <circle cx="58" cy="67" r="5" fill="#8ce0a8" />
        <circle cx="74" cy="67" r="5" fill="#f0c43a" />
        <rect x="116" y="24" width="7" height="30" rx="3.5" fill="#5a6b7d" />
        <g fill="none" stroke="#3a8fb7" strokeWidth="6" strokeLinecap="round" opacity="0.85">
          <path d="M136 40a26 26 0 0 1 24 -22" />
          <path d="M140 58a44 44 0 0 1 40 -38" />
        </g>
      </g>

      {/* wall socket + cable */}
      <g>
        <rect x="52" y="238" width="76" height="66" rx="14" fill="#fffdf8" stroke="#b7c3ce" strokeWidth="5" />
        <rect x="70" y="256" width="9" height="26" rx="4.5" fill="#5a6b7d" />
        <rect x="101" y="256" width="9" height="26" rx="4.5" fill="#5a6b7d" />
        <path
          d="M90 304c0 40 30 30 30 60"
          fill="none"
          stroke="#5a6b7d"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      {/* speaker */}
      <g>
        <rect x="152" y="248" width="42" height="107" rx="10" fill="#6b7d90" />
        <circle cx="173" cy="278" r="13" fill="#3f4d5c" />
        <circle cx="173" cy="278" r="5" fill="#9fb0c0" />
        <circle cx="173" cy="318" r="8" fill="#3f4d5c" />
        <rect x="200" y="264" width="34" height="91" rx="9" fill="#7c8ea1" />
        <circle cx="217" cy="290" r="11" fill="#3f4d5c" />
        <circle cx="217" cy="290" r="4" fill="#9fb0c0" />
        <circle cx="217" cy="324" r="7" fill="#3f4d5c" />
      </g>

      {/* monitor */}
      <g>
        <rect x="352" y="298" width="46" height="34" fill="#5a6b7d" />
        <rect x="310" y="330" width="130" height="16" rx="8" fill="#5a6b7d" />
        <rect x="235" y="92" width="280" height="212" rx="18" fill="#5a6b7d" />
        <rect x="250" y="107" width="250" height="168" rx="10" fill="#bfe6f5" />
        {/* picture on the screen */}
        <circle cx="450" cy="145" r="20" fill="#f0c43a" />
        <path d="M250 240q46 -58 96 -14 t62 -6 t92 20v35H250z" fill="#8ccf9a" />
        <rect x="250" y="255" width="250" height="20" fill="#8ccf9a" />
        <circle cx="375" cy="291" r="5" fill="#8ce0a8" />
      </g>

      {/* tower with a window on the parts inside */}
      <g>
        <rect x="628" y="128" width="140" height="227" rx="16" fill="#6b7d90" />
        <rect x="642" y="142" width="112" height="199" rx="10" fill="#2f3b48" />

        {/* cpu chip */}
        <g>
          <rect x="666" y="158" width="64" height="52" rx="8" fill="#7fd6b0" />
          <rect x="678" y="170" width="40" height="28" rx="5" fill="#3f8f74" />
          <g stroke="#7fd6b0" strokeWidth="4" strokeLinecap="round">
            <path d="M666 168h-12M666 184h-12M666 200h-12" />
            <path d="M730 168h12M730 184h12M730 200h12" />
          </g>
        </g>

        {/* ram sticks */}
        <g>
          <rect x="660" y="228" width="76" height="20" rx="4" fill="#f0c43a" />
          <rect x="660" y="254" width="76" height="20" rx="4" fill="#f0c43a" />
          <g fill="#c99a1f">
            <rect x="666" y="234" width="10" height="8" rx="2" />
            <rect x="682" y="234" width="10" height="8" rx="2" />
            <rect x="698" y="234" width="10" height="8" rx="2" />
            <rect x="666" y="260" width="10" height="8" rx="2" />
            <rect x="682" y="260" width="10" height="8" rx="2" />
            <rect x="698" y="260" width="10" height="8" rx="2" />
          </g>
        </g>

        {/* storage drive */}
        <g>
          <rect x="660" y="288" width="76" height="42" rx="7" fill="#cfd9e2" />
          <circle cx="698" cy="309" r="14" fill="#8fa1b3" />
          <circle cx="698" cy="309" r="4" fill="#fffdf8" />
          <path d="M712 297l-8 12" stroke="#fffdf8" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>

      {/* keyboard */}
      <g>
        <rect x="248" y="372" width="286" height="50" rx="10" fill="#e8eef3" stroke="#b7c3ce" strokeWidth="4" />
        <g fill="#c3cfda">
          {[0, 1, 2].map((row) =>
            Array.from({ length: 11 }, (_, col) => (
              <rect
                key={`${row}-${col}`}
                x={260 + col * 24}
                y={380 + row * 13}
                width="18"
                height="9"
                rx="2.5"
              />
            )),
          )}
        </g>
      </g>

      {/* mouse */}
      <g>
        <ellipse cx="580" cy="397" rx="22" ry="26" fill="#e8eef3" stroke="#b7c3ce" strokeWidth="4" />
        <path d="M580 373v18" stroke="#b7c3ce" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
