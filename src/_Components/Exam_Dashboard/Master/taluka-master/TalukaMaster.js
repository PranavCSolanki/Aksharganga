import React, { useState } from 'react';
import AddTaluka from './AddTaluka';
import SeeTaluka from './SeeTaluka';
import styles from "../../Styles/Dist.module.css";


export default function TalukaMaster() {
  const [activeTab, setActiveTab] = useState('tab1');

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
          Add Taluka
        </button>
        <button
          onClick={() => handleTabClick("tab2")}
          className={`${
            activeTab === "tab2" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          See Taluka 
        </button>

        <div className=" ml-20 text-center">
          {activeTab === "tab1" ? (
            <div className="text-2xl font-semibold bg-clip-text text-black ">
              Add Taluka
            </div>
          ) : (
            <div className="text-2xl font-semibold  bg-clip-text ">
              See Taluka
            </div>
          )}
        </div>
      </div>

      <div  className={styles.scrollable}>
      {activeTab=='tab1'?<AddTaluka/>:<SeeTaluka/>}
    </div>
    </div>
  );
}


