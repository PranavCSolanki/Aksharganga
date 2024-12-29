import React, { useState } from 'react';
import AddClass from './AddClass';
import SeeClass from './SeeClass';
import styles from "../../Styles/Dist.module.css";

export default function ClassMaster() {
  const [activeTab, setActiveTab] = useState('tab1');

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="container mx-auto p-6">
       <div className="flex space-x-4 border-b-2 border-gray-300 mb-6">
        <button
          onClick={() => handleTabClick("tab1")}
          className={`${
            activeTab === "tab1" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          Add Class
        </button>
        <button
          onClick={() => handleTabClick("tab2")}
          className={`${
            activeTab === "tab2" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          See Class
        </button>
        <div className=" ml-20 text-center  ">
          {activeTab === "tab1" ? (
            <div className="text-2xl font-semibold text-transparent bg-clip-text ">
              Add Class
            </div>
          ) : (
            <div className="text-2xl font-semibold text-transparent bg-clip-text ">
              See All Class
            </div>
          )}
        </div>
      </div>

      <div  className={styles.scrollable}>
      {activeTab=='tab1'?<AddClass/>:<SeeClass/>}
    </div>
    </div>
  );
}


