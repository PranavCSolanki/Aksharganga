import axios from "axios";
import styles from "../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";

export default function StudResult() {
  const [rollno, setRollno] = useState("");
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [columns, setColumns] = useState([]);
  const [studentData, setStudentData] = useState(null);

  const SubmitData = async () => {
    try {
      if (!rollno) {
        toast.error("Please enter a roll number");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/studresult`,
        {
          rollNumber: rollno,
        }
      );

      const { success, data, columns } = response.data;
      console.log("data", data);
      console.log("columns", columns);
      console.log("success", success);

      if (success) {
        if (data) {
          setColumns(columns);
          setStudentData(data);
          setIsResultVisible(true);
          toast.success("Data fetched successfully");
        } else {
          toast.info("No result found for the given roll number");
          setIsResultVisible(false);
        }
      } else {
        toast.error("Enter valid roll number");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while submitting data");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={styles.heading2}>Students Result</div>
      <div className={styles.containers}>
        <div className={styles.container}>
          <label htmlFor="rollno" className={styles.label}>
            Enter Student's Roll Number
          </label>
          <div className={styles.relative}>
            <input
              id="rollno"
              name="rollno"
              type="number"
              required
              className="block rounded-lg w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Enter Student's Roll Number"
              onChange={(e) => setRollno(e.target.value)}
            />
          </div>
        </div>

        <div className="btnwrapper">
          <button
            type="submit"
            onClick={SubmitData}
            className={`${styles.button} bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out`}
          >
            See Result
          </button>
        </div>

        {isResultVisible && studentData && (
          <table className="w-full my-2 text-sm text-left rtl:text-right text-black border-collapse">
            <thead className="text-xs my-2 capitalize rounded-lg bg-gray-200">
              <tr className="bg-slate-200">
                {columns.map((col) => (
                  <th key={col.field} className="px-6 py-3 capitalize border-b">
                    {col.headerName}
                  </th>
                ))}
                {studentData.RankType == "staterank" ? (
                  <th className="px-6 py-2 capitalize border-b">State</th>
                ) : null}
                {studentData.RankType == "districtrank" ? (
                  <th className="px-6 py-2 capitalize border-b">District</th>
                ) : null}
                {studentData.RankType == "centerinnerrank" ? (
                  <th className="px-6 py-2 capitalize border-b">Center</th>
                ) : null}
              </tr>
            </thead>
            <tbody className={styles.tbodys}>
              <tr className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform">
                <td className="px-6 py-2">1</td>
                <td className="px-6 py-2">{studentData.rollNo}</td>
                <td className="px-6 py-2">{studentData.studentName}</td>
                <td className="px-6 py-2">{studentData.standard}</td>
                <td className="px-6 py-2">{studentData.medium}</td>
                <td className="px-6 py-2">{studentData.schoolName}</td>
                {studentData.rankType === "staterank" && (
                  <td className="px-6 py-2">{studentData.state}</td>
                )}
                {studentData.rankType === "districtrank" && (
                  <td className="px-6 py-2">{studentData.district}</td>
                )}
                {studentData.rankType === "centerinnerrank" && (
                  <td className="px-6 py-2">{studentData.center}</td>
                )}
                {studentData.subjects.map((item) => (
                  <td className="px-6 py-2" key={item.subject}>
                    {item.marks}
                  </td>
                ))}
                <td className="px-6 py-2">
                  {studentData.subjects.reduce(
                    (total, item) => total + item.marks,
                    0
                  )}
                </td>
                {studentData.Rank == 0 ? null : (
                  <td className="px-6 py-2">{studentData.Rank}</td>
                )}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
