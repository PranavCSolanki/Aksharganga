import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaPrint,
} from "react-icons/fa";
import styles from "../../Exam_Dashboard/Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";


export default function AttendanceSheet() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Search By");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [center] = useState("");
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");

  const fetchDistrict = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/district`
      );
      setDistricts(response.data.data);
    } catch (error) {
      console.error("Error fetching district:", error);
    }
  };

  const fetchExam = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/sort/exam`
      );
      setExams(response.data.data);
    } catch (error) {
      toast.error("Error fetching exams");
    }
  };

  const fetchCenter = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/centers?taluka=${taluka}`
      );
      setCenters(response.data.data);
    } catch (error) {
      toast.error("Error fetching centers");
    }
  };

  const fetchTaluka = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/taluka?district=${district}`
      );
      setTalukas(response.data.data);
    } catch (error) {
      toast.error("Error fetching talukas");
    }
  };


  useEffect(() => {
    fetchDistrict();
    fetchExam();
  }, []);

  useEffect(() => {
    if (district) {
      fetchTaluka();
    }
  }, [district]);

  useEffect(() => {
    if (taluka) {
      fetchCenter();
    }
  }, [taluka]);


  const SubmitData = async () => {
    if (!exam || !district || !taluka || !selectedCenter) {
      toast.error("Please Select All Fields");
    } else {
      try {
        // Adjust the URL to match the GET function structure
        let { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/registration/generate`,
          {
            params: {
              exam,
              taluka,
              center: selectedCenter, 
            },
          }
        );

        setStudents(data.data);

        if (data.success && data.data.length > 0) {
          toast.success("Data fetched successfully");
          setIsResultVisible(true);
        } else if (data.success && data.data.length === 0) {
          toast.info("No data found for the selected criteria");
          setIsResultVisible(false);
        } else {
          toast.error("Error: " + data.error);
        }
      } catch (error) {
        toast.error("Error submitting data");
      }
    }
  };

  const filteredStudenst = (students || [])
    .filter((stud) =>
      stud.studName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "ascending") {
        const classComparison = a.Class.localeCompare(b.Class);
        if (classComparison !== 0) return classComparison;

        return a.studName.localeCompare(b.studName);
      } else if (sortOrder === "descending") {
        const classComparison = b.Class.localeCompare(a.Class);
        if (classComparison !== 0) return classComparison;

        return b.studName.localeCompare(a.studName);
      }
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDistricts = filteredStudenst.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredStudenst.length / itemsPerPage);

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
    " Student Name",
    "Gender",
    "Class",
    "Medium",
    "School",
    "Paper 1",
    "Paper 2",
    "Remark"
  ];

const handlePdfDownload = async (exam, center) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/beforeexam/attendancesheet`, {
            exam,
          center,
          sortOrder,
        }, {
            responseType: 'blob', // Important for handling binary data
            headers: {
                'Accept': 'application/pdf',
            }
        });

        if (response.status !== 200) {
            throw new Error('Failed to download PDF file');
        }

        const blob = response.data; // Retrieve the blob containing the PDF data
      
        if (!(blob instanceof Blob)) {
            throw new Error('Response is not a valid Blob');
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${center}_${exam}.pdf`; // File name with .pdf extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success("File Downloaded Successfully");
    } catch (error) {
        console.error('Error downloading PDF file:', error);
    }
};


  return (
    <>
      <ToastContainer />
      <div className="m-auto">
        <div className={styles.heading2}>Attendance Sheet</div>
      </div>
      <div className={styles.containers}>
        <div className={styles.container}>
          <label htmlFor="exam" className={styles.label}>
            Select Exam
          </label>
          <div className={styles.relative}>
            <select
              id="exam"
              name="exam"
              autoComplete="exam-name"
              required
              value={exam}
              onChange={(e) => setExam(e.target.value)}
             className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
            >
              <option value="">Select</option>
              {exams.map((exm) => (
                <option key={exm._id} value={exm.name}>
                  {exm.name}
                </option>
              ))}
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
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
             className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
            >
              <option value="">Select</option>
              {districts.map((dist) => (
                <option key={dist._id} value={dist._id}>
                  {dist._id}
                </option>
              ))}
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
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
            >
              <option value="">Select</option>
              {talukas.map((tal) => (
                <option key={tal._id} value={tal.taluka}>
                  {tal.taluka}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.container}>
          <label htmlFor="Co-Ordinator" className={styles.label}>
            Select Exam Center
          </label>
          <div className={styles.relative}>
            <select
              id="Co-Ordinator"
              name="Co-Ordinator"
              autoComplete="Co-Ordinator-name"
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
             className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
            >
              <option value="">Select</option>
              {centers.map((centr) =>
                centr.centers.map((item) => (
                  <option key={item} data-centerid={center._id} value={item}>
                    {item}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="btnwrapper">
          <button
            type="submit"
            className={styles.button}
            onClick={() => SubmitData()}
          >
            Search
          </button>
        </div>
      </div>

          <div
            className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}
          >
            <div className="mb-7" style={{ marginBottom: "10px" }}>
              <div className="relative m-10 mb-6 p-8 transition-all duration-500 hover:shadow-3xl hover:scale-102">
                <button
                  className="relative bg-opacity-30  p-2 rounded-full  text-center flex items-center justify-center transition-transform duration-300 transform hover:scale-105"
                  style={{ backgroundColor: "pink", border: "1px solid red" }}
                  onClick={() => handlePdfDownload(exam, selectedCenter)}
                >
                  <FaPrint className="text-black text-lg m-2" />
                </button>
              </div>
            </div>


            <div className="flex justify-between items-center mb-4">
              <div>
                <input
                  type="text"
                  placeholder="Search Student"
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
                <thead className="text-xs my-2 rounded-lg">
                  <tr className="bg-slate-200">
                    {TableColumn.map((column) => (
                      <th
                        scope="col"
                        key={column}
                        className="px-6 py-3 border-b"
                        style={{ justifyContent: "center" }}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
            </thead>
            
      {isResultVisible && (
                <tbody className={styles.tbodys} >
                  {currentDistricts.map((stud, index) => (
                    <tr
                      key={stud.id}
                      className="bg-white border-b hover:bg-gray-50 transition ease-in-out duration-300 transform "
                    >
                      <td className="px-6 py-2">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-2">{stud.rollNo}</td>
                      <td className="px-6 py-2">{stud.studName}</td>
                      <td className="px-6 py-2">{stud.gender}</td>
                      <td className="px-6 py-2">{stud.Class}</td>
                      <td className="px-6 py-2">{stud.medium}</td>
                      <td className="px-6 py-2">{stud.school}</td>
                      <td className="px-6 py-2"></td>
                      <td className="px-6 py-2"></td>
                      <td className="px-6 py-2"></td>
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

        </>
  );
}
