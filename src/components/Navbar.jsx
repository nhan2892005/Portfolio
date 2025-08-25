import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { logo } from "../assets/images";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
  { to: "/photobooth", label: "Photobooth" },
  { to: "/transcript", label: "Transcript" },
  { to: "/blog", label: "Blog" },
  { to: "/calendar", label: "Calendar" },
  { to: "/form", label: "Form" },
  { to: "/games", label: "Games" },
  { to: "/exams", label: "Exams" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <NavLink to="/" className="flex-shrink-0">
          <img src={logo} alt="logo" className="w-20 h-20 object-contain" />
        </NavLink>

        {/* Hamburger button for small screens */}
        <button
          className="md:hidden p-2 rounded hover:bg-white/10 transition"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} className="text-black" /> : <Menu size={24} className="text-black" />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-7 font-medium text-lg">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${isActive ? 'text-blue-600' : 'text-black'} hover:text-blue-400 transition`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden bg-black/70 backdrop-blur-sm px-4 py-2">
          <ul className="flex flex-col gap-3 text-white font-medium text-lg">
            {links.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `${isActive ? 'text-blue-600' : 'text-white'} hover:text-blue-400 transition`
                  }
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}