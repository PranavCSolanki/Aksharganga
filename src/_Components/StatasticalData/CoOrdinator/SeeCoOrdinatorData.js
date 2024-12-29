import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function SeeCoOrdinator() {
  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [coordinator, setCoordinator] = useState("");
  const [tableData, setTableData] = useState(null);  // Store table data
  const [loading, setLoading] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);

  const fetchCoordinators = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/sortingdata/coordinator`
      );
      setCoordinators(response.data.data);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
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
    fetchExam();
    fetchCoordinators();
  }, []);

  const handleSubmit = async () => {
    if (!exam || !coordinator) {
      toast.error("Please select both exam and coordinator.");
      return;
    }

    setLoading(true);  // Start loading
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/stat/coordinator`, {
          params: { exam, coordinator }  // Pass exam and coordinator as query parameters
        }
      );

      if (response.data.success) {
        setTableData(response.data.data);
        setIsResultVisible(true);  
      } else {
        setIsResultVisible(false);
        toast.error(response.data.message || "No data found");
      }
    } catch (error) {
      setIsResultVisible(false);
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
    }
    setLoading(false);  // Stop loading
  };

  return (
    <>
      <ToastContainer />
      <div className="m-auto">
        <div className={styles.heading2}>Co-Ordinator-Students (Center Wise)</div>
      </div>
      <div className={styles.containers}>
        <div className={styles.container}>
          <label htmlFor="exam" className={styles.label}>Select Exam</label>
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
                <option key={exm._id} value={exm.name}>{exm.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.container}>
          <label htmlFor="Co-Ordinator" className={styles.label}>Select Co-Ordinator</label>
          <div className={styles.relative}>
            {coordinators && Array.isArray(coordinators) && (
              <select
                id="Co-Ordinator"
                name="Co-Ordinator"
                value={coordinator}
                onChange={(e) => setCoordinator(e.target.value)}
                className="block rounded-md w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
              >
                <option value="">Select</option>
                {coordinators.map((co) => (
                  <option key={co._id} value={`${co.FirstName} ${co.LastName}`}>
                    {`${co.FirstName} ${co.LastName}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="btnwrapper">
          <button className={styles.button} onClick={handleSubmit}>
            {loading ? "Loading..." : "See"}
          </button>
        </div>
      </div>

      {isResultVisible && (
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
            <div className="flex justify-center items-center mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 ease-in-out">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text hover:from-blue-400 hover:to-purple-400 transition-colors duration-300 ease-in-out">
                Co-Ordinator :- {coordinator}
              </div>
              
            </div>
          </div>
      {tableData && (
        <div className={styles.containers}>
          <div className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}>
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
                  {tableData.Class.map((std, idx) => (
                    <th key={idx} scope="col" className="px-6 py-3 border-b">{std}</th>
                  ))}
                  <th className="px-6 py-3 border-b" scope="col" >Total</th>
                </tr>
              </thead>
              <tbody className={styles.tbodys}>
                {tableData.centers.map((center, idx) => (
                  <tr key={idx} className="bg-white border-b">
                    <td className="px-6 py-2">{idx + 1}</td>
                    <td className="px-6 py-2">{center}</td>
                    {tableData.table[center].standards.map((count, stdIdx) => (
                      <td key={stdIdx} className="px-6 py-2">{count}</td>
                    ))}
                    <td className="px-6 py-2">{tableData.table[center].rowTotal}</td>
                  </tr>
                ))}
                <tr className="bg-white border-b font-semibold">
                  <td></td>
                  <td>Total</td>
                  {tableData.columnTotals.map((total, idx) => (
                    <td key={idx} className="px-6 py-2">{total}</td>
                  ))}
                  <td className="px-6 py-2">{tableData.grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
          )}
          </>
      )}
    </>
  );
}
