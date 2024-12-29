import { useState } from "react";
import styles from "../../Styles/Dist.module.css";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

export default function CenterRank() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Search By");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const districts = [
    {
      id: 1,
      name: "District A",
      rollNo: "001",
      studentName: "John Doe",
      standard: "10",
      medium: "English",
      paper1: 85,
      paper2: 90,
      total: 175,
      state: "State A",
      district: "District A",
      center: "Center A",
    },
    // Add more districts as needed
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

  return (
    <>
      <div className={styles.heading2}>Center (Rank Wise)</div>
      <div className={styles.containers}>
        <div className={styles.container}>
          <label htmlFor="District" className={styles.label}>
            Select Exam
          </label>
          <div className={styles.relative}>
            <select
              id="District"
              name="District"
              autoComplete="District-name"
              className="block rounded-md border-0 w-full text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option>Sangli</option>
              <option>Satara</option>
              <option>Kolhapur</option>
            </select>
          </div>
        </div>
        <div className={styles.container}>
          <label htmlFor="District" className={styles.label}>
            Select District
          </label>
          <div className={styles.relative}>
            <select
              id="District"
              name="District"
              autoComplete="District-name"
              className="block rounded-md border-0 w-full text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option>Sangli</option>
              <option>Satara</option>
              <option>Kolhapur</option>
            </select>
          </div>
        </div>
        <div className={styles.container}>
          <label htmlFor="District" className={styles.label}>
            Select Taluka
          </label>
          <div className={styles.relative}>
            <select
              id="District"
              name="District"
              autoComplete="District-name"
              className="block rounded-md border-0 w-full text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option>Sangli</option>
              <option>Satara</option>
              <option>Kolhapur</option>
            </select>
          </div>
        </div>
        <div className={styles.container}>
          <label htmlFor="District" className={styles.label}>
            Select Exam Center
          </label>
          <div className={styles.relative}>
            <select
              id="District"
              name="District"
              autoComplete="District-name"
              className="block rounded-md border-0 w-full text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option>Sangli</option>
              <option>Satara</option>
              <option>Kolhapur</option>
            </select>
          </div>
        </div>

        <div className={styles.container}>
          <label htmlFor="District" className={styles.label}>
            Select className
          </label>
          <div className={styles.relative}>
            <select
              id="District"
              name="District"
              autoComplete="District-name"
              className="block rounded-md border-0 w-full text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option>All</option>
              <option>Marathi</option>
              <option>English</option>
              <option>Semi English</option>
            </select>
          </div>
        </div>
        <div className="btnwrapper">
          <button type="submit" className={styles.button}>
            Search
          </button>
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
              <thead className="text-xs my-2 uppercase rounded-lg shadow-lg">
                <tr className="bg-gradient-to-r from-slate-200 via-gray-900 to-slate-200 text-gray-700">
                  <th
                    scope="col"
                    className="px-6 py-3 border-b border-gray-900"
                  >
                    Sr. No.
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 border-b border-gray-900"
                  >
                    Roll No.
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 border-b border-gray-900"
                  >
                    Student Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 border-b border-gray-900"
                  >
                    Standard
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 border-b border-gray-900"
                  >
                    Medium
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 border-b border-gray-900"
                  >
                    Paper 1
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 border-b border-gray-900"
                  >
                    Paper 2
                  </th>
                  <th scope="col" className="px-6 py-3 ">
                    Total
                  </th>

                  <th scope="col" className=" py-3 border-b ">
                    State
                  </th>
                  <th scope="col" className=" py-3 border-b ">
                    District
                  </th>
                  <th scope="col" className=" py-3 border-b ">
                    Center
                  </th>
                </tr>
              </thead>
              <tbody>
                {districts.map((district, index) => (
                  <tr
                    key={district.id}
                    className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform"
                  >
                    <td className="px-6 py-2">{index + 1}</td>
                    <td className="px-6 py-2">{district.rollNo}</td>
                    <td className="px-6 py-2">{district.studentName}</td>
                    <td className="px-6 py-2">{district.standard}</td>
                    <td className="px-6 py-2">{district.medium}</td>
                    <td className="px-6 py-2">{district.paper1}</td>
                    <td className="px-6 py-2">{district.paper2}</td>
                    <td className="px-6 py-2">{district.total}</td>
                    <td className="px-6 py-2">{district.state}</td>
                    <td className="px-6 py-2">{district.district}</td>
                    <td className="px-6 py-2">{district.center}</td>
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
