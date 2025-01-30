import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaPrint,
} from "react-icons/fa";
import styles from "../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export default function CenterWiseResult() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Search By");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [classes, setClasses] = useState([]);
  const [column, setColumn] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  
  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [data, setData] = useState([]);
  
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

  const fetchClass = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/sortingdata/class`
      );
      setClasses(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDistrict();
    fetchExam();
    fetchClass();
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

 

  const filteredDistricts = data
    .filter((data) =>
      data.StudentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "ascending") {
        return a.StudentName.localeCompare(b.StudentName);
      } else if (sortOrder === "descending") {
        return b.StudentName.localeCompare(a.StudentName);
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


  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/result/uploadresult?district=${district}&taluka=${taluka}&center=${selectedCenter}&exam=${exam}&cls=${selectedClass}`
      );
  
      if (response.data.success && Array.isArray(response.data.data)) {
        toast.success(response.data.message || "Data fetched successfully!");
        setData(response.data.data);
        setColumn(response.data.columns);
        
      } else {
        toast.error(response.data.message || "No data found!");
        setData([]); // Ensure table clears when no data is found
      }
    } catch (error) {
      toast.error(`Error: ${error.message || "Failed to fetch data."}`);
      console.error("Error fetching data:", error);
    }
  };
  
  const DeleteResult = async (exam, district, taluka, selectedCenter, selectedClass) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the results for Center: ${selectedCenter}, Class: ${selectedClass}? This action cannot be undone.`
    );
  
    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_HOST}/api/result/uploadresult?district=${district}&taluka=${taluka}&center=${selectedCenter}&exam=${exam}&cls=${selectedClass}`
        );
  
        if (response.data.success) {
          toast.success(response.data.message || "Data deleted successfully!");
          setData([]); // Clear the table
        } else {
          toast.warning(response.data.message || "No records deleted.");
        }
      } catch (error) {
        toast.error(`Error: ${error.message || "Failed to delete data."}`);
        console.error("Error deleting data:", error);
      }
    }
  };

  const handlePdfDownload = async (exam, center,district,taluka,selectedClass) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/print/pdf/result?district=${district}&taluka=${taluka}&center=${center}&exam=${exam}&standard=${selectedClass}`, {}, 
          {
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
      <div className={styles.heading2}>Center Wise Result</div>
      <div className={styles.containers}>
        <div className="mt-12 max-w-md mx-auto p-10 rounded-2xl  border  transition-transform transform ">
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
              className="w-full block rounded-2xl border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
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
              className="w-full block rounded-2xl border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
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
              className="block rounded-md w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
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
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option value="">Select</option>
              {centers.map((centr) =>
                centr.centers.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className={styles.container}>
          <label htmlFor="classs" className={styles.label}>
            Select Class
          </label>
          <div className={styles.relative}>
            <select
              id="classs"
              name="classs"
              autoComplete="classs"
              required
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full block rounded-2xl border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option value="">Select</option>
              {classes.map((cls) => (
                <option
                  key={cls._id}
                  data-classid={cls.ClassId}
                  value={cls.ClassName}
                >
                  {cls.ClassName}
                </option>
              ))}
            </select>
          </div>
        </div>

          <div className="btnwrapper">
            <button type="submit" onClick={handleSearch} className={styles.button}>
              Search
            </button>
          </div>
        </div>
      </div>
      <div
        className={`${styles.containers}  bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8 rounded-lg shadow-2xl`}
      >
        <div className="mb-7" style={{ marginBottom: "10px" }}>
                      <div className="relative m-10 mb-6 p-8 transition-all duration-500 hover:shadow-3xl hover:scale-102">
                        <button
                          className="relative bg-opacity-30  p-2 rounded-full  text-center flex items-center justify-center transition-transform duration-300 transform hover:scale-105"
                          style={{ backgroundColor: "pink", border: "1px solid red" }}
                          onClick={() =>handlePdfDownload(exam,selectedCenter,district,taluka,selectedClass)}
                        >
                          <FaPrint className="text-black text-lg m-2" />
                        </button>
                      </div>
                    </div>
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
    <thead className="text-xs my-2 rounded-lg">
      <tr className="bg-slate-200">
        {/* Dynamically render column headers */}
        {column.map((name) => (
          <th scope="col" key={name} className="px-6 py-3 capitalize border-b">
            {name}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className={styles.tbodys}>
  {currentDistricts.map((dat, index) => (
    <tr
      key={dat.RollNo}
      className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform"
    >
      
          <td className="px-6 py-2">
            {dat.SrNo}
          </td>
          <td className="px-6 py-2">
            {dat.RollNo}
          </td>
          <td className="px-6 py-2">
            {dat.StudentName}
          </td>
          <td className="px-6 py-2">
            {dat.Standard}
          </td>
          <td className="px-6 py-2">
            {dat.Medium}
          </td>
          <td className="px-6 py-2">
            {dat.school}
          </td>
          <td className="px-6 py-2">
            {dat.Paper1}
      </td>
     
      {column.includes('Paper2') ? (
  <>
    <td className="px-6 py-2">{dat.Paper2}</td>
    <td className="px-6 py-2">{dat.total}</td>
  </>
) : (
  <td className="px-6 py-2">{dat.total}</td>
)}

          
        
      
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
      <div className="btnwrapper">
            <button
              type="submit"
              className={styles.button1}
              onClick={() => DeleteResult(exam,district, taluka, selectedCenter,selectedClass)}
            >
              Clear List
            </button>
          </div>
    </>
  );
}
