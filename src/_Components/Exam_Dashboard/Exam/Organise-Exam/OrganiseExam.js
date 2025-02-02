import React, { useState } from 'react';
import OrgExam from './OrgExam';
import SeeExam from './SeeExam';
import styles from "../../Styles/Dist.module.css";

export default function OrganiseExam() {
  const [activeTab, setActiveTab] = useState('tab1');

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="container mx-auto p-6">
  <div className="flex space-x-4  border-gray-300 mb-6">
        <button
          onClick={() => handleTabClick("tab1")}
          className={`${
            activeTab === "tab1" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          Organise Exam
        </button>
        <button
          onClick={() => handleTabClick("tab2")}
          className={`${
            activeTab === "tab2" ? styles.activetabs : styles.inactivetabs
          }`}
        >
          See Organised Exam
        </button>
        <div className=" ml-20 text-center  ">
          {activeTab === "tab1" ? (
            <div className="text-2xl font-semibold  bg-clip-text ">
              Organise Exam
            </div>
          ) : (
            <div className="text-2xl font-semibold  bg-clip-text ">
             Organised Exam Center List
            </div>
          )}
        </div>
      </div>

      <div  className={styles.scrollable}>
      {activeTab=='tab1'?<OrgExam/>:<SeeExam/>}
    </div>
    </div>
  );
}


