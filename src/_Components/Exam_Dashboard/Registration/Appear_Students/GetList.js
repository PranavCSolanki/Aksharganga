import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaPrint,
} from "react-icons/fa";
import edits from "../../Styles/Edit.module.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function GetList() {
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
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [open, setOpen] = useState(false);

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
      if (!exam || !district || !taluka || !selectedCenter) {
        toast.error("Please Select All Fields");
        return;
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/student/allstudent`,
        {
          exam: exam,
          district: district,
          taluka: taluka,
          center: selectedCenter,
        }
      );

      setStudentData(data.data);

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

  const handleSubmit = async () => {
    await SubmitData();
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
  ];

  const handleOpenModal = () => {
    setOpen(true);
  };

  const DeleteCenterStudent = async (
    exam,
    district,
    taluka,
    selectedCenter
  ) => {
    if (
      window.confirm(
        `Are you sure you want to delete student from center ${selectedCenter}? This action cannot be undone.`
      )
    ) {
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_HOST}/api/registration/importstudent`,
          {
            data: {
              exam: exam,
              district: district,
              taluka: taluka,
              center: selectedCenter,
            },
          }
        );

        if (response.data.success) {
          toast.success(response.data.message || "Data Deleted Successfully");
          setStudentData([]); // Clear the student data
        } else {
          toast.warning(response.data.message || "No records were deleted.");
        }
      } catch (error) {
        toast.error("Failed to delete the student. Please try again.");
      }
    }
  };

  const GenerateRollNumber = async (exam, district, taluka, selectedCenter) => {
    if (!exam || !district || !taluka || !selectedCenter) {
      toast.error("Please Select All Fields");
    } else {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/registration/generate`,
          {
            exam: exam,
            taluka: taluka,
            center: selectedCenter,
          }
        );

        if (data.success) {
          toast.success("Roll numbers generated successfully.");
        } else {
          toast.error(data.message || "Failed to generate roll numbers.");
        }
      } catch (error) {
        toast.error(error.message || "An error occurred.");
      }
    }
  };

  const DownloadExcel = (exam, center) => {
    fetch(
      `http://localhost:3000/api/print/excel/appear?exam=${exam}&center=${selectedCenter}&sortOrder=${sortOrder}`,
      {
        method: "GET",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to download Excel file");
        }
        return response.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${center}_${exam}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success("File Downloaded Successfully");
      })
      .catch((error) => {
        console.error("Error downloading Excel file:", error);
      });
  };

  const DownloadPDF = async (exam, center) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/print/pdf/appear1`,
        {
          exam: exam,
          center: center,
          sortOrder: sortOrder,
        },
        {
          headers: {
            Accept: "application/pdf", // Ensure we're fetching the PDF data
            "Content-Type": "application/json", // Set content type for JSON payload
          },
          responseType: "blob", // Important for handling binary data
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to download PDF file");
      }

      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${center}_${exam}.pdf`; // File name with .pdf extension
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
        <div className="mb-7" style={{ marginBottom: "10px" }}>
          <div className="relative m-10 mb-6 p-8 transition-all duration-500 hover:shadow-3xl hover:scale-102">
            <button
              className="relative bg-opacity-30  p-2 rounded-full  text-center flex items-center justify-center transition-transform duration-300 transform hover:scale-105"
              style={{ backgroundColor: "pink", border: "1px solid red" }}
              onClick={handleOpenModal}
            >
              <FaPrint className="text-black text-lg m-2" />
            </button>
          </div>
        </div>

        {open && (
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            className={edits.dialog}
          >
            <DialogBackdrop className={edits.dialogBackdrop} />

            <div className={edits.dialogContainer}>
              <DialogPanel className={edits.dialogPanel}>
                <div className={edits.dialogContent}>
                  <div className={edits.dialogHeader}>
                    <div className={edits.dialogTitleContainer}>
                      <DialogTitle as="h3" className={edits.heading2}>
                        Edit Center Name
                      </DialogTitle>
                    </div>
                  </div>
                </div>
                <div className={edits.dialogFooter}>
                  <button
                    type="button"
                    // onClick={Submit}
                    className={edits.saveButton}
                    onClick={() => DownloadPDF(exam, selectedCenter)}
                  >
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => DownloadExcel(exam, selectedCenter)}
                    className={edits.saveButton}
                  >
                    Excel
                  </button>
                </div>
                <div className={edits.dialogFooter}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className={edits.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}

        <div className="flex justify-between items-center mb-4">
          <div className="">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border pl-10 rounded-full w-full focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
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
                  </tr>
                ))}
              </tbody>
            )}
          </table>
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

      <div className="flex justify-between">
        <button
          type="submit"
          className={styles.button}
          onClick={() =>
            GenerateRollNumber(exam, district, taluka, selectedCenter)
          }
        >
          Generate Roll Number
        </button>
      </div>
      <button
        type="submit"
        className={styles.button1}
        onClick={() =>
          DeleteCenterStudent(exam, district, taluka, selectedCenter)
        }
      >
        Clear List
      </button>
    </>
  );
}
