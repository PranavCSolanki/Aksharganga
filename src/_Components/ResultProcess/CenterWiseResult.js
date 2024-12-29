import React, { useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import styles from "../Styles/Dist.module.css";

export default function CenterWiseResult() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Search By");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const districts = [
    { id: 1, name: "District A" },
    { id: 2, name: "District B" },
    { id: 3, name: "District C" },
    { id: 4, name: "District D" },
    { id: 5, name: "District E" },
    { id: 6, name: "District F" },
    { id: 7, name: "District G" },
    { id: 8, name: "District H" },
    { id: 1, name: "District A" },
    { id: 2, name: "District B" },
    { id: 3, name: "District C" },
    { id: 4, name: "District D" },
    { id: 5, name: "District E" },
    { id: 6, name: "District F" },
    { id: 7, name: "District G" },
    { id: 8, name: "District H" },
  ];

  const filteredDistricts = districts
    .filter((district) =>
      district.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "ascending") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "descending") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDistricts = filteredDistricts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDistricts.length / itemsPerPage);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage > 3) {
      pageNumbers.push(
        <button
          key="first"
          onClick={() => setCurrentPage(1)}
          className="m-3 px-4 py-2 rounded-full bg-blue-200 text-blue-700 shadow-lg hover:bg-pink-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out duration-300 transform hover:scale-110"
        >
          <FaAngleDoubleLeft />
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={
            currentPage === i ? styles.activebutton : styles.notactivebutton
          }
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 2) {
      pageNumbers.push(
        <button
          key="last"
          onClick={() => setCurrentPage(totalPages)}
          className="mx-3 px-4 py-2 rounded-full bg-black text-blue-700 shadow-lg hover:bg-pink-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out duration-300 transform hover:scale-110"
        >
          <FaAngleDoubleRight />
        </button>
      );
    }

    return pageNumbers;
  };

  const TableColumn = [
    "Sr. No",
    "Roll No.",
    "Student Name",
    "Standard",
    "Medium",
    "Paper 1",
    "Paper 2",
    "Total",
  ];

  return (
    <>
      <div className="w-32 m-auto">
        <div className={styles.heading2}> Center Wise Result</div>
      </div>

      <div className={styles.containers}>
        <div className="mt-12 max-w-md mx-auto p-10 rounded-2xl  border  transition-transform transform ">
          <div className={styles.container}>
            <label htmlFor="district" className={styles.label}>
              Select Exam
            </label>
            <div className={styles.relative}>
              <select
                id="district"
                name="district"
                autoComplete="district-name"
                className="block rounded w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option>Select</option>
                <option>Canada</option>
                <option>Mexico</option>
              </select>
            </div>
          </div>
          <div className={styles.container}>
            <label htmlFor="district" className={styles.label}>
              Select District
            </label>
            <div className={styles.relative}>
              <select
                id="district"
                name="district"
                autoComplete="district-name"
                className="block rounded w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option>Select</option>
                <option>Canada</option>
                <option>Mexico</option>
              </select>
            </div>
          </div>
          <div className={styles.container}>
            <label htmlFor="Taluka" className={styles.label}>
              Select Taluka
            </label>
            <div className={styles.relative}>
              <select
                id="Taluka"
                name="Taluka"
                autoComplete="Taluka-name"
                className="block rounded-md w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option>Select</option>
                <option>Canada</option>
                <option>Mexico</option>
              </select>
            </div>
          </div>
          <div className={styles.container}>
            <label htmlFor="Co-Ordinator" className={styles.label}>
              Select Center
            </label>
            <div className={styles.relative}>
              <select
                id="Co-Ordinator"
                name="Co-Ordinator"
                autoComplete="Co-Ordinator-name"
                className="block rounded-md w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option>Select</option>
                <option>Canada</option>
                <option>Mexico</option>
              </select>
            </div>
          </div>
          <div className={styles.container}>
            <label htmlFor="email" className={styles.label}>
              Enter Class
            </label>
            <div className={styles.relative}>
              <select
                id="Co-Ordinator"
                name="Co-Ordinator"
                autoComplete="Co-Ordinator-name"
                className="block rounded-md w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option>Select</option>
                <option>Canada</option>
                <option>Mexico</option>
              </select>
            </div>
          </div>

          <div className="btnwrapper">
            <button type="submit" className={styles.button}>
              Search
            </button>
          </div>
        </div>
      </div>
      <div
        className={`${styles.containers}  bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8 rounded-lg shadow-2xl`}
      >
        <div
          className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="">
              <input
                type="text"
                placeholder="Search District"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border pl-10   rounded-full w-full focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
              />
            </div>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border pl-10  rounded-full bg-white focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
              >
                <option value="default">Default</option>
                <option value="ascending">Ascending</option>
                <option value="descending">Descending</option>
              </select>
            </div>
            <div className="relative ml-4">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border pl-10 rounded-full bg-white focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>
          </div>
          <div className={styles.tab}>
            <table className="w-full my-2 text-sm text-left rtl:text-right text-black border-collapse">
              <thead className="text-xs my-2 uppercase rounded-lg">
                <tr className="bg-slate-200">
                  {TableColumn.map((name) => (
                    <th scope="col" key={name} className="px-6 py-3 border-b">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={styles.tbodys}>
                {currentDistricts.map((district, index) => (
                  <tr
                    key={district.id}
                    className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform "
                  >
                    <td className="px-6 py-2">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-2">{district.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.nextpreviousbutton}
            >
              <FaArrowLeft className="mr-2" />
              Previous
            </button>
            <div>{renderPageNumbers()}</div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={styles.nextpreviousbutton}
            >
              Next
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
