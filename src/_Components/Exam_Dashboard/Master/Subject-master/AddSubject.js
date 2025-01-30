import { useEffect, useState } from "react";
import axios from "axios"; // Ensure axios is imported
import styles from "../../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify"; // Ensure toast is imported

export default function AddSubject() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subject, setSubject] = useState("");

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
    fetchClass();
  }, []);

  const Submit = async () => {

    if (selectedClass === "Select" || subject === "") {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const data = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/subject`,
        {
          ClassName: selectedClass,
          SubjectName: subject,
        }
      );

      if (data.data.success) {
        toast.success("Subject added successfully!");
      } else {
        toast.error("Subject already exists");
      }
    } catch (error) {
      console.error("Error posting data:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className={styles.containers}>
      <ToastContainer/>
      <div className="mt-12 max-w-md mx-auto p-10 rounded-2xl border">
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
              <option>Select</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls.ClassName}>
                  {cls.ClassName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.container}>
          <label htmlFor="name" className={styles.label}>
            Enter Subject Name
          </label>
          <div className={styles.relative}>
            <input
              id="name"
              name="name"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Enter Subject Name"
            />
          </div>
        </div>
        <div className="btnwrapper">
          <button className={styles.button} onClick={Submit}>
            Add Subject
          </button>
        </div>
      </div>
    </div>
  );
}
