import { useEffect, useState } from "react";
import styles from "../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function HallTicket() {

  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const GetPdf = async (event) => {
    event.preventDefault();
    setIsLoading(true);

  const requestData = {
      exam,
      district,
      taluka,
      center: selectedCenter
  };

  try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/beforeexam/hallticket`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob); // No need to wrap blob in another Blob
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedCenter}_${exam}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
  } catch (error) {
      console.error('Error:', error);
    }
    finally {
      setIsLoading(false); // Set loading to false when processing is complete
    }
};


 

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

  return (
    <>
      <ToastContainer />
    <div className="px-6 py-12 lg:px-8 rounded-3xl shadow-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className={styles.heading2}>Hall Ticket</div>
      <div className={styles.containers}>
        <div className="mt-12 mb-20 max-w-lg mx-auto p-10 rounded-2xl  border-indigo-600 shadow-2xl bg-white">
          <div className="p-6">
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
           
          </div>
        </div>
      </div>

      <button
          type="submit"
          className={styles.button}
          onClick={GetPdf}
          disabled={isLoading} 
        >
          {isLoading ? "Processing..." : "Download PDF"}
        </button>
    </div></>
  );
}
