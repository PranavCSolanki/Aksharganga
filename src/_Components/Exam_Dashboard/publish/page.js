import React, { useEffect, useState } from "react";
import styles from "../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function Publish() {
  const [exam, setExam] = useState(""); // Store selected exam
  const [exams, setExams] = useState([]); // List of all exams
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [hasData, setHasData] = useState(false); // Check if data exists

  const fetchExam = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/sort/exam`
      );
      setExams(response.data.data); // Fetch exams from API
    } catch (error) {
      toast.error("Error fetching exams");
    }
  };

  // Check if there's already data in the publish collection
  const checkDataExistence = async (exam) => {
    if (!exam) return; // Only check if an exam is selected
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/publish`
      );

      // Check if data exists for the selected exam
      setHasData(response.data.hasData); // If data exists, set hasData to true
      setIsResultVisible(response.data.hasData); // Show result if data exists
    } catch (error) {
      toast.error("Error checking data existence");
    }
  };

  const DeleteResult = async () => {
    if (window.confirm("Are you sure you want to delete all results?")) {
      setLoading1(true);
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_HOST}/api/publish`
        );

        if (response.data.Success) {
          toast.success(response.data.message || "All data deleted successfully");
          setIsResultVisible(false); // Hide the results after deleting
          setHasData(false); // No data available after deletion
        } else {
          toast.warning(response.data.message || "No records were deleted.");
        }
      } catch (error) {
        toast.error("Failed to delete data. Please try again.");
      } finally {
        setLoading1(false);
      }
    }
  };

  useEffect(() => {
    fetchExam();
  }, []);

  useEffect(() => {
    checkDataExistence(exam);  // Check for data when exam is selected
  }, [exam]); // Only trigger when exam changes

  const PublishResult = async () => {
    setLoading(true);
    try {
      let response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/publish`,
        { exam: exam }
      );

      const data = response.data;

      if (data.Success) {
        toast.success(data.message || "Data published successfully");
        setIsResultVisible(true);  // Show results after publishing
        setHasData(true);  // Data now exists
      } else {
        toast.error(data.message || "Error publishing data");
        setIsResultVisible(false); // Hide if publishing fails
        setHasData(false); // No data available
      }
    } catch (error) {
      toast.error("Error submitting data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="m-auto">
        <div className={styles.heading2}>Publish Result</div>
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

        {/* Show Publish button only if no data exists */}
        {!hasData && exam && (
          <div className="btnwrapper">
            <button
              type="submit"
              className={styles.button}
              onClick={() => PublishResult()}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        )}

        {/* Show Delete button only if data exists and exam is selected */}
        {exam && hasData && (
          <div className="btnwrapper">
            <button
              type="submit"
              className={styles.button1}
              onClick={() => DeleteResult()}
              disabled={loading1}
            >
              {loading1 ? "Deleting..." : "Delete Published Result"}
            </button>
          </div>
        )}

        {/* Show message if data already exists for the selected exam */}
        {exam && hasData && !isResultVisible && (
          <div className="text-center mt-4 text-green-500">
            <h3>Data has already been published for this exam.</h3>
          </div>
        )}
      </div>
    </>
  );
}
