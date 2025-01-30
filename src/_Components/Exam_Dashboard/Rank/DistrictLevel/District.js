import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaPrint,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

export default function District() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Search By");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [column, setColumn] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [see, setSee] = useState(false);

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

  const filteredDistricts = data
    .filter((district) =>
      district.StudentName.toLowerCase().includes(searchTerm.toLowerCase())
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
      // Fetch data from the API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/rank/displayrank/district`,
        {
          exam: exam,
          district: district,
          standard: selectedClass,
        }
      );

      // Validate the response structure
      if (response.Success && Array.isArray(response.data)) {
        setSee(true);
        const fetchedData = response.data.data;
        const fetchedColumns = response.data.columns;

        toast.success(response.message || "Data fetched successfully!");

        setData(fetchedData);
        setColumn(fetchedColumns);
      } else {
        // Handle case where API returns no data or error in response
        toast.error(response.data.message || "No data found!");
        setData([]);
        setSee(false);
        setColumn([]);
      }
    } catch (error) {
      // Handle API errors
      toast.error("Error fetching data!");
      console.error("Error fetching data:", error);

      setData([]);
      setColumn([]);
      setSee(false);
    }
  };

  const handlePdfDownload = async (exam, district, selectedClass) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/print/pdf/rank/district?exam=${exam}&standard=${selectedClass}&district=${district}`,
        null,
        {
          headers: {
            Accept: "application/pdf",
          },
          responseType: "blob", // Important for handling binary data
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to download PDF file");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${exam}_${selectedClass}.pdf`; // File name with .pdf extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("File Downloaded Successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error(`Failed to download PDF file: ${error.message}`);
    }
  };

  return (
    <>
      <div className={styles.heading2}>District Level Rank</div>
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
                  key={cls.ClassId}
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
          <button
            type="submit"
            onClick={handleSearch}
            className={styles.button}
          >
            Search
          </button>
        </div>
      </div>
      {see ? (
        <div
          className={`${styles.containers}  bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8 rounded-lg shadow-2xl`}
        >
          <div className="mb-7" style={{ marginBottom: "10px" }}>
            <div className="relative m-10 mb-6 p-8 transition-all duration-500 hover:shadow-3xl hover:scale-102">
              <button
                className="relative bg-opacity-30  p-2 rounded-full  text-center flex items-center justify-center transition-transform duration-300 transform hover:scale-105"
                style={{ backgroundColor: "pink", border: "1px solid red" }}
                onClick={() => handlePdfDownload(exam, district, selectedClass)}
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
                    {column.map((name) => (
                      <th
                        scope="col"
                        key={name.field}
                        className="px-6 py-3 border-b"
                      >
                        {name.headerName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={styles.tbodys}>
                  {currentDistricts.map((dat, index) => (
                    <tr
                      key={dat.id}
                      className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform "
                    >
                      <td className="px-6 py-2">
                        {indexOfFirstItem + index + 1}
                      </td>

                      <td className="px-6 py-2">{dat.RollNo}</td>
                      <td className="px-6 py-2">{dat.StudentName}</td>
                      <td className="px-6 py-2">{dat.Standard}</td>
                      <td className="px-6 py-2">{dat.medium}</td>
                      <td className="px-6 py-2">{dat.school}</td>
                      <td className="px-6 py-2">{dat.center}</td>
                      <td className="px-6 py-2">{dat.taluka}</td>
                      {dat.subjects.map((sub) => (
                        <td key={sub.subject} className="px-6 py-2">
                          {sub.marks}
                        </td>
                      ))}
                      <td className="px-6 py-2">{dat.totalMarks}</td>
                      <td className="px-6 py-2">{dat.rank}</td>
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
      ) : null}
    </>
  );
}
