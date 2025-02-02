import React, { useState } from "react";
import SeeCenter from "./SeeList";
import GetList from "./GetList";
import styles from "../../Styles/Dist.module.css";


export default function CenterList() {
  const [activeTab, setActiveTab] = useState("tab1");

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="container mx-auto p-6">
     <div className="flex space-x-4  mb-6">
        <button
          onClick={() => handleTabClick("tab1")}
          className={`${
            activeTab === "tab1" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          SchoolWise Student List
        </button>
        <button
          onClick={() => handleTabClick("tab2")}
          className={`${
            activeTab === "tab2" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          Appear Student
        </button>
       
      </div>

      <div  className={styles.scrollable}>
      {activeTab == "tab1" ? <SeeCenter /> :<GetList /> }
    </div>
    </div>
  );
}
