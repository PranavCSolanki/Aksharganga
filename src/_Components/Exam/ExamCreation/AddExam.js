import styles from "@/_Components/Styles/Dist.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import EditExam from "./EditExam";

export default function AddExam() {
  const [exams, setExams] = useState([]);
  const [name, setName] = useState("");
  const [selectedStandards, setSelectedStandards] = useState([]);
  const [seeclass, setSeeclass] = useState([]);
  const [classes, setClasses] = useState([]);
  const [date, setDate] = useState("");

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

  const FetchExam = async () => {
    try {
      let datas = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/creation`
      );
      setSeeclass(datas.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/creation`
      );
      setSeeclass(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    FetchExam();
  }, []);

  const handleDelete = async (name, ExamId) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_HOST}/api/exam/creation`,
          {
            params: {
              id: ExamId,
            },
          }
        );

        toast.success("Exam Deleted Successfully");

        setSeeclass((prevExams) => prevExams.filter((ex) => ex._id !== ExamId));
      } catch (error) {
        toast.error("Failed to delete the Exam");
        console.error("Error deleting Exam:", error);
      }
    }
  };

  const handleCheckboxChange = (standard) => {
    setSelectedStandards((prev) =>
      prev.includes(standard.ClassName)
        ? prev.filter((s) => s !== standard.ClassName)
        : [...prev, standard.ClassName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newExam = { name, standards: selectedStandards, date: date };
    console.log(newExam);
    

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/creation`,
        newExam
      );

      console.log(response);
      
      const data = response.data;

      if (data.success) {
        setExams([...exams, data.data]);
        setName("");
        toast.success("Exam added successfully");
        setSelectedStandards([]);
      } else {
        console.error("Error inserting data:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className={styles.heading2}>Create Exam</div>
      <ToastContainer />
      <div className={styles.containers}>
        <form onSubmit={handleSubmit}>
          <div className={styles.container}>
            <label htmlFor="name" className={styles.label}>
              Enter Exam Name
            </label>
            <div className={styles.relative}>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                placeholder="Enter Exam Name"
              />
            </div>
          </div>

          <div className={styles.container}>
        <label htmlFor="date" className={styles.label}>
          Exam Date
        </label>
        <div className={styles.relative}>
          <input
            id="date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="block rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
            placeholder="Enter Exam Name"
          />
        </div>
      </div>

          <div className={styles.container}>
            <label htmlFor="options" className={styles.label}>
              Select Standard
            </label>
          </div>

          <div className="container">
            <ul className="grid grid-rows-4 gap-4">
              {classes.map((tech) => (
                <li
                  key={tech._id}
                  className="relative p-6 mt-6 flex m-8 rounded-2xl border border-blue-300 hover:shadow-2xl hover:border-blue-500"
                  style={{marginLeft:"100px",marginRight:"100px",marginTop:"50px",marginBottom:"50px"}}
                >
                  <label
                    htmlFor={`${tech._id}-checkbox`}
                    className={styles.label}
                    style={{marginRight:"50px",marginTop:"-1px"}}
                  >
                    <span className="transition-transform duration-300 ease-in-out group-hover:scale-105">
                      {tech.ClassName}
                    </span>
                  </label>
                  <input
                    type="checkbox"
                    id={`${tech._id}-checkbox`}
                    checked={selectedStandards.includes(tech.ClassName)}
                    onChange={() => handleCheckboxChange(tech)}
                    className="w-6 m-6 h-6 text-blue-700 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                  />
                </li>
              ))}
            </ul>

            <div className="btnwrapper">
              <button type="submit" className={styles.button}>
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className={styles.containers}>
        <div className={styles.heading2}>See Exam Details</div>

        {seeclass.map((item) => {
          return (
            <div key={item._id}>
              <ul style={{display:"flex",justifyContent:"space-evenly"}}>
              <li >
                <div className="max-w-full overflow-x-auto">
                  <div className="m-10">
                    <div className="flex">
                      <label
                        htmlFor="-checkbox"
                        className="w-28 m-6 text-gray-800 font-semibold text-xl space-x-4 group"
                      >
                        <span>Exam Name :</span>
                      </label>
                      <label
                        htmlFor="-checkbox"
                        className="w-28 m-6 text-gray-800 font-semibold text-xl space-x-4 group"
                      >
                        <span className="ml-9 ">{item.name}</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <div className="m-10">
                    <div className="flex">
                      <label
                        htmlFor="-checkbox"
                        className="w-28 m-6 text-gray-800 font-semibold text-xl space-x-4 group"
                      >
                        <span>Exam Date :</span>
                      </label>
                      <label
                        htmlFor="-checkbox"
                        className="w-28 m-6 text-gray-800 font-semibold text-xl space-x-4 group"
                      >
                        <span className="ml-9 ">{item.date}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </li>
</ul>
              <div className={styles.tab}>
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Standard
                      </th>
                      {classes.map((cls) => (
                        <th key={cls._id} scope="col" className="px-6 py-3">
                          {cls.ClassName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={styles.tbodys}>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th scope="col" className="px-6 py-3">
                        Selected
                      </th>
                      {classes.map((cls) => (
                        <td key={cls._id} className="px-6 py-4">
                          <input
                            id="checked-checkbox"
                            type="checkbox"
                            value=""
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={item.standards.includes(cls.ClassName)}
                            disabled
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "2rem",
                  }}
                >
                  <EditExam props={item} fetchData1={fetchData} />
                </div>
                <button
                  className={styles.button1}
                  aria-label={`Delete ${item.name}`}
                  onClick={() => handleDelete(item.name, item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
