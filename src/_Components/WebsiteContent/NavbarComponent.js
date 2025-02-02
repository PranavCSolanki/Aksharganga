"use client"
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from 'next/link'

export default function NavbarComponent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpen1, setDropdownOpen1] = useState(false);

  const loginuser = [
    { name: "admin", link: "/admin/login" },
    { name: "Co-Ordinator", link: "/co-ordinator/login" },
    { name: "User", link: "/user/login" },
  ];

  const menu = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Contact", link: "/contact" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-3xl font-extrabold tracking-wide">
          My Logo
        </h1>

        {/* Mobile Menu Button */}
        <button
          className="text-white md:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Menu */}
        <ul
          className={`${
            menuOpen ? "block" : "hidden"
          } md:flex md:space-x-8 absolute md:static top-16 left-0 w-full md:w-auto md:bg-transparent transition-all duration-300 ease-in-out shadow-lg md:shadow-none`}
        >
          {menu.map((item) => (
              <Link href={item.link} key={item.name}>
            <li
              
              className="text-white p-4 md:p-0 hover:text-yellow-300 transition duration-200 cursor-pointer"
            >
                {item.name}
            </li>
              </Link>
          ))}

          {/* Dropdown Menu */}
          <li className="relative text-white p-4 md:p-0 hover:text-yellow-300 transition duration-200 cursor-pointer">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
              Login <ChevronDown className="inline" size={18} />
            </button>
            <ul
              className={`absolute right-0 md:left-auto bg-white text-black shadow-lg mt-2 rounded-lg w-44 overflow-hidden transition-opacity duration-200 ${
                dropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              {loginuser.map((role) => (
                  <Link href={role.link} key={role.name}>
                <li
                  className="p-3 hover:bg-gray-200 cursor-pointer transition duration-200"
                >
                   {role.name}
                </li>
                  </Link>
              ))}
            </ul>
          </li>

          <li className="relative text-white p-4 md:p-0 hover:text-yellow-300 transition duration-200 cursor-pointer">
            <button onClick={() => setDropdownOpen1(!dropdownOpen1)}>
              Sign up <ChevronDown className="inline" size={18} />
            </button>
            <ul
              className={`absolute right-0 md:left-auto bg-white text-black shadow-lg mt-2 rounded-lg w-44 overflow-hidden transition-opacity duration-200 ${
                dropdownOpen1 ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
              onMouseLeave={() => setDropdownOpen1(false)}
            >
                <Link href="/user/register">
              <li className="p-3 hover:bg-gray-200 cursor-pointer transition duration-200">
                 User
              </li>
                </Link>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}
