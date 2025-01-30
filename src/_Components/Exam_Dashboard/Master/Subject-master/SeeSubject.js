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
import EditSubject from "./EditSubject";


export default function SeeSubject() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [subjects, setSubjects] = useState([]);
  const [cls, setClss] = useState([]);
  const [cl, setcl] = useState("");

  const SearchSubject = (cl) => {
    if (cl === "Select") {
      toast.error("Please select a class");
    } else {
      axios
        .get(`${process.env.NEXT_PUBLIC_HOST}/api/master/subject?class=${cl}`)
        .then((response) => {
          setSubjects(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  };

  const handleDelete = async (SubjectName, ClassId) => {
    if (window.confirm(`Are you sure you want to delete ${SubjectName}?`)) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_HOST}/api/master/subject`, {
          params: {
            id: ClassId,
          },
        });

        toast.success("Subject Deleted Successfully");

        setSubjects((prevSub) =>
          prevSub.filter((tal) => tal._id !== ClassId)
        );
      } catch (error) {
        toast.error("Failed to delete the subject");
      }
    }
  };

  const fetchClass = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/master/sortingdata/class`);
      setClss(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/master/subject`);
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    fetchClass();
  }, []);

  const filteredTalukas = subjects
    .filter((sub) => {
      return (
        typeof sub.SubjectName === "string" &&
        sub.SubjectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOrder === "ascending") {
        return a.SubjectName.localeCompare(b.SubjectName);
      } else if (sortOrder === "descending") {
        return b.SubjectName.localeCompare(a.SubjectName);
      }
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTalukas = filteredTalukas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTalukas.length / itemsPerPage);

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
      <div className={styles.containers}>
        <div className={styles.container}>
          <label htmlFor="cl" className={styles.label}>
            Select Class
          </label>
          <div className={styles.relative}>
            <select
              id="cl"
              name="cl"
              autoComplete="cl-name"
              required
              value={cl}
              onChange={(e) => setcl(e.target.value)}
              className="w-full block rounded-2xl border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option>Select</option>
              {cls.map((cl) => (
                <option key={cl._id} value={cl.ClassName}>
                  {cl.ClassName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="btnwrapper">
          <button
            className={styles.button}
            onClick={() => SearchSubject(cl)}
          >
            See Subject
          </button>
        </div>
      </div>
      
        <div
          className={`${styles.containers} bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8 rounded-lg shadow-2xl`}
        >
          <div
            className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="">
                <input
                  type="text"
                  placeholder="Search Subject"
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
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Subject Code
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Subject Name
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Action
                    </th>
                  </tr>
              </thead>
              {subjects.length > 0 && (
                <tbody className={styles.tbodys}>
                  {currentTalukas.map((sub, index) => (
                    <tr
                      key={sub._id}
                      className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform"
                    >
                      <td className="px-6 py-2">{index + 1}</td>
                      <td className="px-6 py-2">{sub.ClassName}</td>
                      <td className="px-6 py-2">{sub.SubjectId}</td>
                      <td className="px-6 py-2">{sub.SubjectName}</td>
                      <td
                        className="px-6 py-2 "
                        style={{
                          justifyContent: "center",
                          display: "flex",
                          borderTop: "none",
                          borderLeft: "none",
                        }}
                      >
                        <EditSubject props={sub} fetchData1={fetchData} />
                        <button
                          className={styles.delete}
                          aria-label={`Delete ${sub.SubjectName}`}
                          onClick={() =>
                            handleDelete(sub.SubjectName, sub._id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
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
