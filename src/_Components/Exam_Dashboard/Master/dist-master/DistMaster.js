import React, { useState } from "react";
import styles from "../../Styles/Dist.module.css";
import AddDistrict from "./AddDistrict";
import SeeDistricts from "./SeeDistrict";

export default function DistMaster() {
  const [activeTab, setActiveTab] = useState("tab1");

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className=" mx-auto p-6">
      <div className="flex space-x-4  border-gray-300 mb-6">
        <button
          onClick={() => handleTabClick("tab1")}
          className={`${
            activeTab === "tab1" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          Add District
        </button>
        <button
          onClick={() => handleTabClick("tab2")}
          className={`${
            activeTab === "tab2" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          See District
        </button>
        <div className=" ml-20 text-center  ">
          {activeTab === "tab1" ? (
            <div className="text-2xl font-semibold  bg-clip-text ">
              Add District
            </div>
          ) : (
            <div className="text-2xl font-semibold  bg-clip-text ">
              See All Districts
            </div>
          )}
        </div>
      </div>

      <div  className={styles.scrollable}>
        {activeTab === "tab1" ? <AddDistrict /> : <SeeDistricts />}
      </div>
    </div>
  );
}
