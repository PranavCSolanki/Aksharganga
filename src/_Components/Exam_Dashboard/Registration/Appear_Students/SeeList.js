import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaPrint,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import EditStudent from "./EditStudent";

export default function SeeList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedStandards, setSelectedStandards] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [isResultVisible, setIsResultVisible] = useState(false);
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
    try {
      // Check for missing fields
      if (!exam || !district || !taluka || !selectedCenter) {
        toast.error("Please Select All Fields");
        return;
      }

      // Send the POST request
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/student/allstudent`,
        {
          exam: exam,
          district: district,
          taluka: taluka,
          center: selectedCenter,
          schoolname: selectedSchools.length > 0 ? selectedSchools : undefined,
          standard:
            selectedStandards.length > 0 ? selectedStandards : undefined,
        }
      );

      setStudentData(data.data);

      // Notify success if data is returned
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
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
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/standard?center=${selectedCenter}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchschool = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/school?center=${selectedCenter}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setSchools(data.schools || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  useEffect(() => {
    if (selectedCenter) {
      fetchClasses();
      fetchschool();
    }
  }, [selectedCenter]);

  const handleSubmit = async () => {
    await SubmitData();
    fetchClasses();
    fetchschool();
  };

  const filteredDistricts = (studentData || [])
    .filter((district) =>
      district.Class.toLowerCase().includes(searchTerm.toLowerCase())
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

  const currentDistricts = filteredDistricts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDistricts.length / itemsPerPage);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleCheckboxstd = (standard) => {
    setSelectedStandards((prev) =>
      prev.includes(standard)
        ? prev.filter((s) => s !== standard)
        : [...prev, standard]
    );
  };
  const handleCheckboxschool = (school) => {
    setSelectedSchools((prev) =>
      prev.includes(school)
        ? prev.filter((s) => s !== school)
        : [...prev, school]
    );
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

  const TableCol = [
    "Sr. No",
    "Student Name",
    "Gender",
    "Std",
    "Medium",
    "School",
    "Mob. No.",
    "Action",
  ];

  const Deleteitem = async (Name, studId) => {
    if (window.confirm(`Are you sure you want to delete ${Name}?`)) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_HOST}/api/registration/student`,
          {
            params: {
              id: studId,
            },
          }
        );

        toast.success("Data Deleted Successfully");

        // Update student data after deletion
        setStudentData((prevData) =>
          prevData.filter((student) => student._id !== studId)
        );
      } catch (error) {
        toast.error("Failed to delete the student");
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/student/allstudent`,
        {
          exam: exam,
          district: district,
          taluka: taluka,
          center: selectedCenter,
          schoolname: selectedSchools.length > 0 ? selectedSchools : undefined,
          standard:
            selectedStandards.length > 0 ? selectedStandards : undefined,
        }
      );

      setStudentData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePdfDownload = async (exam, selectedCenter) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_HOST}/api/print/pdf/appear`,
            {
                exam: exam,
                center: selectedCenter,
                sortOrder: sortOrder, 
                schools: selectedSchools,
                standard: selectedStandards,
            },
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
        link.download = `${selectedCenter}_${exam}.pdf`; // File name with .pdf extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success("File Downloaded Successfully");
    } catch (error) {
        toast.error("Failed to download PDF file");
    }


    

};


  return (
    <>
      <ToastContainer />
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
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {selectedCenter ? (
            <div className="container">
              <div className={styles.relative}>
                <ul className="grid grid-rows-4 gap-1">
                  <li
                    style={{
                      marginLeft: "100px",
                      marginRight: "100px",
                      marginTop: "2px",
                      fontSize: "6px",
                    }}
                  >
                    <div className={styles.container}>
                      <input
                        type="checkbox"
                        id="selectAllSchools"
                        style={{ marginRight: "50px", marginTop: "7px" }}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setSelectedSchools(isChecked ? schools : []);
                        }}
                        checked={selectedSchools.length === schools.length}
                        className="w-6 m-6 h-6 text-blue-700 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor="selectAllSchools"
                        className={styles.label}
                      >
                        Select All Schools
                      </label>
                    </div>
                  </li>
                  <br />
                  {schools.map((tech) => (
                    <li key={tech} >
                      <input
                        type="checkbox"
                        id={`${tech}-checkbox`}
                        checked={selectedSchools.includes(tech)}
                        onChange={() => handleCheckboxschool(tech)}
                        className="w-6 m-6 h-6 text-blue-700 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                        style={{ marginRight: "50px"}}
                      />
                      <label
                        htmlFor={`${tech}-checkbox`}
                        className={styles.label}
                      >
                        <span className="transition-transform duration-300 ease-in-out group-hover:scale-105">
                          {tech}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          <br />
          {selectedCenter ? (
            <div className={styles.relative}>
              <ul className="grid grid-rows-4 gap-4">
                <li >
                  <div className={styles.container}>
                    <input
                      type="checkbox"
                      id="selectAllStandards"
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setSelectedStandards(isChecked ? classes : []);
                      }}
                      checked={selectedStandards.length === classes.length}
                    />
                    <label
                      htmlFor="selectAllStandards"
                      className={styles.label}
                    >
                      Select All Standards
                    </label>
                  </div>
                </li>
                <br />

                {classes.map((tech) => (
                  <li
                    key={tech}
                    
                  >
                    <input
                      type="checkbox"
                      id={`${tech}-checkbox`}
                      checked={selectedStandards.includes(tech)}
                      onChange={() => handleCheckboxstd(tech)}
                    />
                    <label
                      htmlFor={`${tech}-checkbox`}
                      className={styles.label}
                    >
                      <span>
                        {tech}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="btnwrapper">
            <button
              type="submit"
              className={styles.button}
              onClick={handleSubmit}
            >
              Get List
            </button>
          </div>
        </div>
      

           <div className={styles.containers}>
        <div
          className="flex justify-center items-center  bg-white rounded-xl "
          style={{ marginBottom: "20px" }}
        >
          <div className="text-xl font-bold m-8  bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text hover:from-red-400 hover:to-yellow-400 transition-colors duration-300 ease-in-out">
            Exam :- {exam}
          </div>
        </div>
        <div className="flex justify-between items-center  bg-white rounded-xl  ">
          <div className="text-xl font-bold  bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text hover:from-blue-400 hover:to-purple-400 transition-colors duration-300 ease-in-out">
            Distrtict :- {district}
          </div>
          <div className="text-xl font-bold  bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 bg-clip-text hover:from-green-400 hover:to-blue-400 transition-colors duration-300 ease-in-out">
            Taluka :- {taluka}
          </div>
          <div className="text-xl font-bold  bg-gradient-to-r from-pink-500 via-red-500 to-purple-500 bg-clip-text hover:from-pink-400 hover:to-purple-400 transition-colors duration-300 ease-in-out">
            Center :- {selectedCenter}
          </div>
        </div>
      </div>
          <div
            className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="">
                <input
                  type="text"
                  placeholder="Search"
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
                  <option value={15}>15 rows</option>
                  <option value={20}>20 rows</option>
                  <option value={50}>50 rows</option>
                </select>
              </div>
            </div>
            <div className={styles.tab}>
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
              <table className="w-full my-2 text-sm text-left rtl:text-right text-black border-collapse">
                <thead className="text-xs my-2 uppercase rounded-lg">
                  <tr className="bg-slate-200">
                    {TableCol.map((item) => (
                      <th
                        scope="col"
                        className="px-6 py-3 border-b"
                        style={{ justifyContent: "center" }}
                        key={item}
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
            </thead>
            
      {isResultVisible && (
                <tbody className={styles.tbodys}>
                  {currentDistricts.map((item, index) => (
                    <tr
                      key={item._id}
                      className="bg-white border-b hover:bg-gray-50  transition ease-in-out duration-300 transform "
                    >
                      <td className="px-6 py-2">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-2">{item.studName}</td>
                      <td className="px-6 py-2">{item.gender}</td>
                      <td className="px-6 py-2">{item.Class}</td>
                      <td className="px-6 py-2">{item.medium}</td>
                      <td className="px-6 py-2">{item.school}</td>
                      <td className="px-6 py-2">{item.mobNo}</td>
                      <td
                        className="px-6 py-3"
                        style={{
                          justifyContent: "center",
                          display: "flex",
                          borderTop: "none",
                          borderLeft: "none",
                        }}
                      >
                        <EditStudent props={item} fetchData1={fetchData} />
                        <button
                          className={styles.delete}
                          aria-label={`Delete ${item.studName}`}
                          onClick={() => Deleteitem(item.studName, item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            )}
              </table>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
