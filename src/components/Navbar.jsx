import { NavLink } from "react-router-dom";

import { logo } from "../assets/images";

const Navbar = () => {
  return (
    <header className='header'>
      <NavLink to='/'>
        <img src={logo} alt='logo' className='w-20 h-20 object-contain' />
      </NavLink>
      <nav className='flex text-lg gap-7 font-medium'>
        <NavLink to='/about' className={({ isActive }) => isActive ? "text-blue-600" : "text-black" }>
          About
        </NavLink>
        <NavLink to='/projects' className={({ isActive }) => isActive ? "text-blue-600" : "text-black"}>
          Projects
        </NavLink>
        <NavLink to='/contact' className={({ isActive }) => isActive ? "text-blue-600" : "text-black" }>
          Contact
        </NavLink>
        <NavLink to="/photobooth" className={({ isActive }) => isActive ? "text-blue-600" : "text-black"}>
          Photobooth
        </NavLink>
        <NavLink to="/transcript" className={({ isActive }) => isActive ? "text-blue-600" : "text-black"}>
          Transcript
        </NavLink>
        <NavLink to="/blog" className={({ isActive }) => isActive ? "text-blue-600" : "text-black"}>
          Blog
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? "text-blue-600" : "text-black"}>
          Calendar
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
