import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export default function DistCenter() {
  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [medium, setMedium] = useState("");
  const [see, setSee] = useState(false);
  const [studentData, setStudentData] = useState({
    tableData: [],
    totalRow: null,
    standards: [],
  });


  const fetchDistrict = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/district`
      );
      setDistricts(response.data.data);
    } catch (error) {
      console.error("Error fetching district:", error);
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
      console.error("Error fetching exams:", error);
      toast.error("Error fetching exams");
    }
  };

  useEffect(() => {
    fetchDistrict();
    fetchExam();
  }, []);

  const handleSubmit = async () => {
    if (!exam || !district || !medium) {
      toast.error("Please Select All Fields");
      return;
    }

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/stat/distcenter`,
        {
          params: {
            exam,
            district,
            medium,
          },
        }
      );

      if (data.success) {
        setStudentData(data.data || {});
        toast.success("Data fetched successfully");
        setSee(true);
      } else {
        setSee(false);
        setStudentData({ tableData: [], totalRow: null, standards: [] });
        toast.info(data.message || "No data found for the selected criteria");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error submitting data");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="m-auto">
        <div className={styles.heading2}>District-Students (Center Wise)</div>
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
          <label htmlFor="medium" className={styles.label}>
            Select Medium
          </label>
          <div className={styles.relative}>
            <select
              id="medium"
              name="medium"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              autoComplete="medium-name"
              className="block rounded-md border-0 w-full text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option value="">Select</option>
              <option value="All">All</option>
              <option value="Marathi">Marathi</option>
              <option value="English">English</option>
              <option value="Semi English">Semi English</option>
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

      {see ? (
        <>
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
                Medium :- {medium}
              </div>
              
            </div>
          </div>
        <div
          className={`${styles.containers} bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8 rounded-lg shadow-2xl`}
        >
          <div
            className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}
          >
            <div className={styles.tab}>
              <table className="w-full my-2 text-sm text-left rtl:text-right text-black border-collapse">
                <thead className="text-xs my-2 uppercase rounded-lg">
                  <tr className="bg-slate-200">
                    <th scope="col" className="px-6 py-3 border-b">
                      Sr. No.
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Center
                    </th>
                    {studentData.standards.map((standard, index) => (
                      <th
                        scope="col"
                        key={index}
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
                  {studentData.tableData.map((row, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform"
                    >
                      <td className="px-6 py-2">{row.srNo}</td>
                      <td className="px-6 py-2">{row.center}</td>
                      {row.standardCounts.map((count, i) => (
                        <td key={i} className="px-6 py-2">
                          {count}
                        </td>
                      ))}
                      <td className="px-6 py-2">{row.totalForCenter}</td>
                    </tr>
                  ))}

                  {studentData.totalRow && (
                    <tr className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform">
                      <td className="px-6 py-2">{studentData.totalRow.srNo}</td>
                      <td className="px-6 py-2">
                        {studentData.totalRow.center}
                      </td>
                      {studentData.totalRow.standardCounts.map((total, i) => (
                        <td key={i} className="px-6 py-2">
                          {total}
                        </td>
                      ))}
                      <td className="px-6 py-2">
                        {studentData.totalRow.totalForCenter}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
          </>
      ) : null}
    </>
  );
}
