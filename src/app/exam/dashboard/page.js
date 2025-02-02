"use client";

import Centerwise from "@/_Components/Exam_Dashboard/AfterExam/CenterRank/CenterWise";
import Certificate from "@/_Components/Exam_Dashboard/AfterExam/certificat/Certificate";
import AnswerSheet from "@/_Components/Exam_Dashboard/BeforeExam/AnswerSheet";
import AttendanceSheet from "@/_Components/Exam_Dashboard/BeforeExam/AttendanceSheet";
import BenchSticker from "@/_Components/Exam_Dashboard/BeforeExam/BenchSticker";
import HallTicket from "@/_Components/Exam_Dashboard/BeforeExam/HallTicket";
import AddExam from "@/_Components/Exam_Dashboard/Exam/ExamCreation/AddExam";
import OrganiseExam from "@/_Components/Exam_Dashboard/Exam/Organise-Exam/OrganiseExam";
import CenterMaster from "@/_Components/Exam_Dashboard/Master/center-master/CityMaster";
import ClassMaster from "@/_Components/Exam_Dashboard/Master/Class-master/ClassMaster";
import CoOrdinator from "@/_Components/Exam_Dashboard/Master/CoOrdinator/CoOrdinator";
import DistMaster from "@/_Components/Exam_Dashboard/Master/dist-master/DistMaster";
import SubjectMaster from "@/_Components/Exam_Dashboard/Master/Subject-master/SubjectMaster";
import TalukaMaster from "@/_Components/Exam_Dashboard/Master/taluka-master/TalukaMaster";
import EditMarks from "@/_Components/Exam_Dashboard/Other/EditMarks";
import Publish from "@/_Components/Exam_Dashboard/publish/page";
import Center from "@/_Components/Exam_Dashboard/Rank/Center/Center";
import CenterRank from "@/_Components/Exam_Dashboard/Rank/CenterRank/CenterRank";
import District from "@/_Components/Exam_Dashboard/Rank/DistrictLevel/District";
import State from "@/_Components/Exam_Dashboard/Rank/StateLevel/State";
import CenterList from "@/_Components/Exam_Dashboard/Registration/Appear_Students/CenterList";
import GenerateRoll from "@/_Components/Exam_Dashboard/Registration/Gen-Roll/GenerateRoll";
import ImportStudent from "@/_Components/Exam_Dashboard/Registration/ImportStudents/ImportStudent";
import AddStudent from "@/_Components/Exam_Dashboard/Registration/StudentRegistration/AddStudent";
import CenterWiseResult from "@/_Components/Exam_Dashboard/ResultProcess/CenterWiseResult";
import UploadResult from "@/_Components/Exam_Dashboard/ResultProcess/UploadResult/UploadResult";
import SeeMedium from "@/_Components/Exam_Dashboard/StatasticalData/center/SeeMediumData";
import SeeCoOrdinatorData from "@/_Components/Exam_Dashboard/StatasticalData/CoOrdinator/SeeCoOrdinatorData";
import DistCenter from "@/_Components/Exam_Dashboard/StatasticalData/Distcenter/DistCenter";
import SeeDistrictData from "@/_Components/Exam_Dashboard/StatasticalData/State/SeeDistrictData";
import StudResult from "@/_Components/Exam_Dashboard/Studentresult/StudResult";
import { useState } from "react";
import { FaChevronDown, FaChevronRight, FaBars } from "react-icons/fa";
import { ToastContainer } from "react-toastify";

export default function Dashboard() {
  const [sidebarToggle, setSidebarToggle] = useState(true);
  const [activeMenu, setActiveMenu] = useState("/");
  const [expandedMenus, setExpandedMenus] = useState({});

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const Menu = [
    { Dashboard: [{ name: "Home", path: "/" }] },
    {
      "Master Panel": [
        { name: "District Master", path: "/dist-master" },
        { name: "Taluka Master", path: "/taluka-master" },
        { name: "Co-ordinator Master", path: "/coordinator-master" },
        { name: "Center Master", path: "/center-master" },
        { name: "Class Master", path: "/class-master" },
        { name: "Subject Master", path: "/subject-master" },
      ],
    },
    {
      "Exam Panel": [
        { name: "Create Exam", path: "/create-exam" },
        { name: "Organise Exam", path: "/organise-exam" },
      ],
    },
    {
      "Student Registration": [
        { name: "Registration Form", path: "/registration" },
        { name: "Import Student", path: "/import-register" },
        { name: "Appear Student", path: "/appear-student" },
        { name: "Genarated Roll Number", path: "/generateroll" },
      ],
    },
    {
      "Print Before Exam": [
        { name: "Hall Ticket", path: "/hallticket" },
        { name: "Attendance Sheet", path: "/attendancesheet" },
        { name: "Answer Sheet", path: "/answersheet" },
        { name: "Bench Sticker", path: "/benchsticker" },
      ],
    },
    {
      "Statistical Data": [
        { name: "State District Wise", path: "/district" },
        { name: "District Center Wise", path: "/center" },
        { name: "Center Medium Wise", path: "/medium" },
        { name: "CoOrdinator Center Wise", path: "/co-ordinator" },
      ],
    },
    {
      "Result Process": [
        { name: "Upload Result Excel", path: "/uploadresult" },
        { name: "Class Wise Result", path: "/centerwiseresult" },
        { name: "Upload Answer Sheets", path: "/upload-answer-sheets" },
      ],
    },
    {
      "Publish result": [{ name: "Publish", path: "/publish" }],
    },

    {
      "Display Rank ": [
        { name: "State Level ", path: "/staterank" },
        { name: "District Level ", path: "/districtrank" },
        { name: "Center Level ", path: "/centerrank" },
        { name: "Center (Rank Wise)", path: "/centerrankwise" },
      ],
    },

    {
      "Print After Exam": [
        { name: "Center Wise Result", path: "/centerwise" },
        { name: "Certificate", path: "/certificate" },
      ],
    },

    {
      "Student Result": [{ name: "Roll Number Wise", path: "/result" }],
    },

    {
      Other: [
        { name: "Messages", path: "" },
        { name: "Shift Center", path: "" },
        { name: "Edit Student", path: "/editmark" },
        { name: "Change Exam Date", path: "" },
      ],
    },
  ];

  const handleSidebarToggle = () => {
    setSidebarToggle(!sidebarToggle);
  };

  const handleLinkClick = (path, e) => {
    e.preventDefault();
    setActiveMenu(path);
  };

  const handleMenuClick = (key) => {
    setExpandedMenus((prevExpandedMenus) => {
      const newExpandedMenus = {};

      // Collapse all other menus
      for (const menuKey in prevExpandedMenus) {
        newExpandedMenus[menuKey] = false;
      }

      // Expand the clicked menu
      newExpandedMenus[key] = !prevExpandedMenus[key];

      return newExpandedMenus;
    });
  };

  // Mapping paths to components
  const renderComponent = () => {
    switch (activeMenu) {
      case "/":
      case "/dist-master":
        return <DistMaster />;
      case "/taluka-master":
        return <TalukaMaster />;
      case "/center-master":
        return <CenterMaster />;
      case "/coordinator-master":
        return <CoOrdinator />;
      case "/class-master":
        return <ClassMaster />;
      case "/subject-master":
        return <SubjectMaster />;
      case "/create-exam":
        return <AddExam />;
      case "/organise-exam":
        return <OrganiseExam />;
      case "/registration":
        return <AddStudent />;
      case "/import-register":
        return <ImportStudent />;
      case "/appear-student":
        return <CenterList />;
      case "/hallticket":
        return <HallTicket />;
      case "/attendancesheet":
        return <AttendanceSheet />;
      case "/answersheet":
        return <AnswerSheet />;
      case "/benchsticker":
        return <BenchSticker />;
      case "/district":
        return <SeeDistrictData />;
      case "/center":
        return <DistCenter />;
      case "/medium":
        return <SeeMedium />;
      case "/co-ordinator":
        return <SeeCoOrdinatorData />;
      case "/staterank":
        return <State />;
      case "/districtrank":
        return <District />;
      case "/centerrank":
        return <Center />;
      case "/generateroll":
        return <GenerateRoll />;
      case "/uploadresult":
        return <UploadResult />;
      case "/centerwiseresult":
        return <CenterWiseResult />;
      case "/centerwise":
        return <Centerwise />;
      case "/centerrankwise":
        return <CenterRank />;
      case "/result":
        return <StudResult />;
      case "/publish":
        return <Publish />;
      case "/certificate":
        return <Certificate />;
      case "/editmark":
        return <EditMarks />;
      default:
        return <p>Please select a valid option from the sidebar.</p>;
    }
  };

  const buttonClasses = (isActive) =>
    `flex items-center py-2.5 px-4 rounded-lg transition duration-200 ${
      isActive
        ? "bg-indigo-700 shadow-md"
        : "hover:bg-indigo-700 hover:shadow-md"
    }`;

  return (
    <div className="flex h-screen ">
      <ToastContainer />
      <div
        className={`bg-indigo-900 text-white w-64 h-full py-7 overflow-y-auto max-h-full scrollbar-hide px-2 absolute inset-y-0 left-0 transform ${
          sidebarToggle ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out shadow-lg z-50`}
      >
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-bold tracking-wide">Dashboard</h2>
        </div>

        {/* Sidebar content wrapper */}
        <div className="overflow-y-auto max-h-full scrollbar-hide">
          <nav>
            <ul className="space-y-2">
              {Menu.map((item) => {
                if (typeof item === "string") {
                  return (
                    <li key={item}>
                      <button
                        className={buttonClasses(activeMenu === item)}
                        onClick={(e) => handleLinkClick(item, e)}
                      >
                        <span>{item}</span>
                      </button>
                    </li>
                  );
                } else {
                  const key = Object.keys(item)[0];
                  const value = item[key];
                  const isExpanded = expandedMenus[key] || false;
                  return (
                    <li key={key}>
                      <div>
                        <button
                          className={`flex items-center justify-between w-full py-2.5 px-4 rounded-lg transition-all duration-300 ease-out transform-gpu ${
                            activeMenu.startsWith(key)
                              ? "bg-purple-600 shadow-xl translate-x-1 scale-105"
                              : "bg-purple-500 hover:shadow-lg hover:translate-x-1 hover:scale-105"
                          }`}
                          onClick={() => handleMenuClick(key)}
                        >
                          <span className="flex items-center space-x-3">
                            <span
                              className={`transform transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : "rotate-0"
                              }`}
                            >
                              {isExpanded ? (
                                <FaChevronDown />
                              ) : (
                                <FaChevronRight />
                              )}
                            </span>
                            <span className="text-white font-semibold">
                              {key}
                            </span>
                          </span>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-500 ease-in-out transform-gpu ${
                            isExpanded
                              ? "max-h-screen opacity-100 scale-y-100"
                              : "max-h-0 opacity-0 scale-y-0"
                          }`}
                        >
                          <ul className="pl-4 mt-2 space-y-1">
                            {value.map((subItem) => (
                              <li key={subItem.name}>
                                <a
                                  href={subItem.path}
                                  className={`block py-2 px-4 rounded-lg transition-all duration-300 ease-out transform-gpu ${
                                    activeMenu === subItem.path
                                      ? " bg-cyan-500 shadow-md translate-x-1 scale-105"
                                      : " hover:shadow-md hover:translate-x-1 hover:scale-105"
                                  } text-white`}
                                  onClick={(e) =>
                                    handleLinkClick(subItem.path, e)
                                  }
                                >
                                  {subItem.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                }
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarToggle ? "ml-64" : "ml-0"
        }`}
      >
        {/* Navbar */}
        <header className="bg-white shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <button
              onClick={handleSidebarToggle}
              className="text-gray-900 hover:text-gray-700 focus:outline-none"
            >
              <FaBars className="h-6 w-6" />
            </button>

            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome, User!
            </h1>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <svg
                  id="avatarButton"
                  onClick={toggleDropdown}
                  className="w-10 h-10 rounded-full cursor-pointer text-gray-100 bg-slate-400 p-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  ></path>
                </svg>

                {isOpen && (
                  <div
                    id="userDropdown"
                    className="absolute right-0 z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-auto "
                  >
                    <div className="px-4 py-3 text-sm text-gray-900">
                      <div>AksharGanga</div>
                      <div className="font-medium truncate">
                        aksharganga@gmail.com
                      </div>
                    </div>
                    <ul
                      className="py-2 text-sm text-gray-700 "
                      aria-labelledby="avatarButton"
                    >
                      <li>
                        <button className="block px-4 py-2 hover:bg-gray-100">
                          Dashboard
                        </button>
                      </li>
                      <li>
                        <button className="block px-4 py-2 hover:bg-gray-100">
                          Settings
                        </button>
                      </li>
                      <li>
                        <button className="block px-4 py-2 hover:bg-gray-100 ">
                          Earnings
                        </button>
                      </li>
                    </ul>
                    <div className="py-1">
                      <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ">
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="pl-2 pt-1  text-black overflow-auto rounded-lg ">
            {renderComponent()}
          </div>
        </main>
      </div>
    </div>
  );
}
