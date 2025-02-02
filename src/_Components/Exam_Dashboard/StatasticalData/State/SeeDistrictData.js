import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaPrint } from "react-icons/fa";

export default function SeeDistrictData() {
  const [exam, setExam] = useState("");
  const [medium, setMedium] = useState("All");
  const [exams, setExams] = useState([]);
  const [districtData, setDistrictData] = useState(null);
  const [isResultVisible, setIsResultVisible] = useState(false);

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

  const handlePdfDownload = async (exam, medium) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/print/pdf/statastical/statedist?exam=${exam}&medium=${medium}`,
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
      link.download = `${exam}_${medium}.pdf`; // File name with .pdf extension
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

  useEffect(() => {
    fetchExam();
  }, []);

  const handleSubmit = async () => {
    if (!exam) {
      toast.error("Please select an exam");
      return;
    }

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/stat/state`,
        {
          params: {
            exam: exam,
            medium: medium,
          },
        }
      );

      if (data.success && data.data) {
        setDistrictData(data.data);
        toast.success("Data fetched successfully");
        setIsResultVisible(true);
      } else if (data.success && data.data.length === 0) {
        setIsResultVisible(false);
        toast.info("No data found for the selected criteria");
      } else {
        setIsResultVisible(false);
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching district data");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="m-auto">
        <div className={styles.heading2}>State-Students (District Wise)</div>
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
          <label htmlFor="Medium" className={styles.label}>
            Select Medium
          </label>
          <div className={styles.relative}>
            <select
              id="Medium"
              name="Medium"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              autoComplete="Medium-name"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
            >
              <option value="All">All</option>
              <option value="Marathi">Marathi</option>
              <option value="English">English</option>
              <option value="Semi English">Semi English</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.button} onClick={handleSubmit}>
          See
        </button>
      </div>
      {isResultVisible && (
        <>
          {districtData && (
            <>
              <div className={styles.containers}>
                <div className="flex justify-center items-center bg-white rounded-xl  ">
                  <div className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text hover:from-red-400 hover:to-yellow-400 transition-colors duration-300 ease-in-out">
                    Exam :- {exam}
                  </div>
                </div>
                <div className="flex justify-center items-center p-6 bg-white rounded-xl ">
                  <div className="text-xl font-bold  bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text hover:from-blue-400 hover:to-purple-400 transition-colors duration-300 ease-in-out">
                    Medium :- {medium}
                  </div>
                </div>
              </div>
              <div className={`${styles.containers} p-8 rounded-lg shadow-2xl`}>
                <div className="mb-7" style={{ marginBottom: "10px" }}>
                  <div className="relative m-10 mb-6 p-8 transition-all duration-500 hover:shadow-3xl hover:scale-102">
                    <button
                      className="relative bg-opacity-30  p-2 rounded-full  text-center flex items-center justify-center transition-transform duration-300 transform hover:scale-105"
                      style={{
                        backgroundColor: "pink",
                        border: "1px solid red",
                      }}
                      onClick={() => handlePdfDownload(exam, medium)}
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
                          District
                        </th>
                        {districtData.standards.map((standard, index) => (
                          <th
                            key={index}
                            scope="col"
                            className="px-6 py-3 border-b"
                          >
                            {standard}
                          </th>
                        ))}
                        <th scope="col" className="px-6 py-3 border-b">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className={styles.tbodys}>
                      {districtData.tableData.map((district, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b hover:bg-gray-50  transition ease-in-out duration-300 transform"
                        >
                          <td className="px-6 py-2">{district.srNo}</td>
                          <td className="px-6 py-2">{district.district}</td>
                          {district.standardCounts.map((count, idx) => (
                            <td key={idx} className="px-6 py-2">
                              {count}
                            </td>
                          ))}
                          <td className="px-6 py-2">
                            {district.totalForDistrict}
                          </td>
                        </tr>
                      ))}

                      {/* Total row */}
                      <tr className="bg-white border-b hover:bg-gray-50  transition ease-in-out duration-300 transform">
                        <td className="px-6 py-2">Total</td>
                        <td className="px-6 py-2">All Districts</td>
                        {districtData.totalRow.standardCounts.map(
                          (total, idx) => (
                            <td key={idx} className="px-6 py-2">
                              {total}
                            </td>
                          )
                        )}
                        <td className="px-6 py-2">
                          {districtData.totalRow.totalForDistrict}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
