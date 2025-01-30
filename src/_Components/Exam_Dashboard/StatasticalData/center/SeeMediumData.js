import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaPrint } from "react-icons/fa";

export default function SeeMedium() {
  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centers, setCenters] = useState([]);
  const [see, setSee] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [studentData, setStudentData] = useState({
    counts: {
      Marathi: [],
      "Semi-English": [],
      English: [],
    },
    totalCounts: {
      Marathi: 0,
      "Semi-English": 0,
      English: 0,
    },
    standards: [],
    overallTotal: 0,
  });

  const fetchDistrict = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/district`
      );
      setDistricts(response.data.data);
    } catch (error) {
      toast.error("Error fetching districts");
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

  const handleSubmit = async () => {
    try {
      if (!exam || !district || !taluka || !selectedCenter) {
        toast.error("Please Select All Fields");
        return;
      }

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/stat/center`,
        {
          params: {
            exam,
            district,
            taluka,
            center: selectedCenter,
          },
        }
      );

      if (data.success) {
        setStudentData(data.data || {});
        toast.success("Data fetched successfully");
        setSee(true);
      } else {
        setSee(false);
        toast.info("No data found for the selected criteria");
      }
    } catch (error) {
      setSee(false);
      toast.error("Error submitting data");
    }
  };

  const handlePdfDownload = async (exam, SelectedCenter) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_HOST}/api/print/pdf/statastical/centermedium?exam=${exam}&center=${SelectedCenter}`,
            null, // No body needed for this POST request
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
        link.download = `${exam}_${selectedCenter}.pdf`; // File name with .pdf extension
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
      <ToastContainer />
      <div className="m-auto">
        <div className={styles.heading2}>Center Students (Medium Wise)</div>
      </div>
      <div className={styles.containers}>
        <div className="mt-12 max-w-md mx-auto p-10 rounded-2xl border">
          <div className={styles.container}>
            <label htmlFor="exam" className={styles.label}>
              Select Exam
            </label>
            <div className={styles.relative}>
              <select
                id="exam"
                name="exam"
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
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="">Select</option>
                {centers.flatMap((centr) =>
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
              type="button"
              className={styles.button}
              onClick={handleSubmit}
            >
              Get Numbers
            </button>
          </div>
        </div>
      </div>
      
        <div className={styles.containers}>
            <div
              className="flex justify-center items-center m-6 p-6 bg-white rounded-xl border border-gray-200  transition-shadow duration-300 ease-in-out"
              style={{ marginBottom: "20px" }}
            >
              <div className="text-3xl font-bold m-8 text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text hover:from-red-400 hover:to-yellow-400 transition-colors duration-300 ease-in-out">
                Exam :- {exam}
              </div>
            </div>
            <div className="flex justify-between items-center mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 ease-in-out">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text hover:from-blue-400 hover:to-purple-400 transition-colors duration-300 ease-in-out">
                District :- {district}
              </div>
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text hover:from-blue-400 hover:to-purple-400 transition-colors duration-300 ease-in-out">
                Taluka :- {taluka}
              </div>
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text hover:from-blue-400 hover:to-purple-400 transition-colors duration-300 ease-in-out">
                Center :- {selectedCenter}
              </div>
              
            </div>
          </div>
        <div
          className={`${styles.containers} w-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8 rounded-lg shadow-2xl`}
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
          <div
            className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}
          >
            <table className="w-full my-2 text-sm text-left rtl:text-right text-black border-collapse">
              <thead className="text-xs my-2 uppercase rounded-lg">
                <tr className="bg-slate-200">
                  <th scope="col" className="px-6 py-3 border-b">
                    Sr. No.
                  </th>
                  <th scope="col" className="px-6 py-3 border-b">
                    Medium
                  </th>
                  {studentData.standards.map((standard, index) => (
                    <th key={index} scope="col" className="px-6 py-3 border-b">
                      {standard}
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-3 border-b">
                    Total
                  </th>
                </tr>
            </thead>
            {see ? (
              <tbody className={styles.tbodys}>
                {["Marathi", "Semi-English", "English"].map((medium, index) => (
                  <tr
                    key={medium}
                    className="bg-white border-b hover:bg-gray-50 transition ease-in-out duration-300 transform"
                  >
                    <td className="px-6 py-2">{index + 1}</td>
                    <td className="px-6 py-2">{medium}</td>
                    {studentData.counts[medium].map((count, i) => (
                      <td key={i} className="px-6 py-2">
                        {count}
                      </td>
                    ))}
                    <td className="px-6 py-2">
                      {studentData.totalCounts[medium]}
                    </td>
                  </tr>
                ))}
                <tr className="bg-white border-b hover:bg-gray-50 transition ease-in-out duration-300 transform">
                  <td className="px-6 py-2"></td>
                  <td className="px-6 py-2">Total</td>
                  {studentData.standards.map((_, index) => (
                    <td key={index} className="px-6 py-2">
                      {["Marathi", "Semi-English", "English"].reduce(
                        (sum, medium) =>
                          sum + (studentData.counts[medium][index] || 0),
                        0
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-2">{studentData.overallTotal}</td>
                </tr>
              </tbody>
      ) : null}
            </table>
          </div>
          </div>
        
    </>
  );
}
