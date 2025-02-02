import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import EditClass from "./EditClass";


export default function SeeClass() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [classes, setClasses] = useState([]);

  const handleDelete = async (className, classId) => {
    if (window.confirm(`Are you sure you want to delete ${className}?`)) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_HOST}/api/master/classes`,
          {
            params: {
              id: classId,
            },
          }
        );

        toast.success("Data Deleted Successfully");

        setClasses((prevClasses) =>
          prevClasses.filter((cls) => cls._id !== classId)
        );
      } catch (error) {
        toast.error("Failed to delete the class");
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/classes`
      );
      setClasses(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClasses = classes
    .filter((cls) => {
      return (
        typeof cls.ClassName === "string" &&
        cls.ClassName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOrder === "ascending") {
        return a.ClassName.localeCompare(b.ClassName);
      } else if (sortOrder === "descending") {
        return b.ClassName.localeCompare(a.ClassName);
      }
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClasses = filteredClasses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

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
      <ToastContainer />
      <div
        className={`${styles.containers} p-8 rounded-lg shadow-2xl`}
      >
        <div
          className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="">
              <input
                type="text"
                placeholder="Search Class"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border pl-10 rounded-full w-full focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
              />
            </div>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border pl-10 rounded-full bg-white focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
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
            <table className="w-full my-2 text-sm text-left rtl:text-right text-black">
              <thead className="text-xs my-2 uppercase rounded-lg">
                <tr className="bg-slate-200">
                  <th scope="col" className="px-6 py-3 border-b">
                    Sr. No.
                  </th>
                  <th scope="col" className="px-6 py-3 border-b">
                    Class ID
                  </th>
                  <th scope="col" className="px-6 py-3 border-b">
                    Class Name
                  </th>
                  <th scope="col" className="px-6 py-3 border-b">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbodys}>
                {currentClasses.map((cls, index) => (
                  <tr
                    key={cls._id} // Assuming _id is unique
                    className="bg-white hover:bg-gray-50  transition ease-in-out duration-300 transform"
                  >
                    <td className="px-6 py-2">{index + 1}</td>
                    <td className="px-6 py-2">{cls.ClassId}</td>
                    <td className="px-6 py-2">{cls.ClassName}</td>
                    <td
                      className="px-6 py-2 "
                      style={{
                        justifyContent: "center",
                        display: "flex",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <EditClass props={cls} fetchData1={fetchData} />
                      <button
                        className={styles.delete}
                        aria-label={`Delete ${cls.ClassName}`}
                        onClick={() =>
                          handleDelete(cls.ClassName, cls._id)
                        }
                      >
                        Delete
                      </button>
                    </td>
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
