import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import styles from "../../Styles/Edit.module.css";
import { toast } from "react-toastify";
import axios from "axios";

export default function EditExam({ props, fetchData1 }) {
  const [open, setOpen] = useState(false);
  const [exam, setExam] = useState(props.name);
  const [error, setError] = useState(null);
  const [error2, setError2] = useState(null);
  const [selectedStandards, setSelectedStandards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [date, setDate] = useState(props.date);

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

  const handleCheckboxChange = (standard) => {
    setSelectedStandards((prev) =>
      prev.includes(standard)
        ? prev.filter((s) => s !== standard)
        : [...prev, standard]
    );
  };

  useEffect(() => {
    fetchClass();
  }, []);

  useEffect(() => {
    if (props.standards) {
      setSelectedStandards(props.standards);
    }
  }, [props.standards]);

  const toggleModal = () => setOpen(!open);

  const submit = async (e) => {
    e.preventDefault();

    if (!exam) {
      setError("Please Enter Exam Name");
      return;
    }
    if (!date) {
      setError2("Please Enter Exam Date");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/creation`,
        { id: props._id, name: exam,date:date, standards: selectedStandards }
      );

      if (response.data.success) {
        toast.success("Exam updated successfully!");
      } else {
        toast.error("Failed to update Exam");
      }
      fetchData1();
      setOpen(false);
    } catch (error) {
      toast.error("An error occurred while updating the Exam");
    }
  };

  return (
    <div>
      <div className="btnwrapper">
        <button type="button" onClick={toggleModal} className={styles.edit}>
          Edit
        </button>
      </div>
      {open && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          className={styles.dialog}
        >
          <DialogBackdrop className={styles.dialogBackdrop} />
          <div className={styles.dialogContainer}>
            <DialogPanel className={styles.dialogPanel}>
              <div className={styles.dialogContent}>
                <div className={styles.dialogHeader}>
                  <div className={styles.dialogTitleContainer}>
                    <DialogTitle as="h3" className={styles.heading2}>
                      Edit Exam Name
                    </DialogTitle>
                  </div>
                </div>
                {/* <div className={styles.container}> */}
                  <label htmlFor="examName" className={styles.label}>
                    Enter Exam Name
                  </label>
                  {/* <div className="relative"> */}
                    <input
                      id="examName"
                      name="examName"
                      type="text"
                      value={exam}
                      onChange={(e) => {
                        setExam(e.target.value);
                        setError(null);
                      }}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                      placeholder="Enter Exam Name"
                    />
                    {error && (
                      <label
                        htmlFor="examName"
                        className={styles.label}
                        style={{ color: "red" }}
                      >
                        {error}
                      </label>
                    )}
                  {/* </div> */}
                {/* </div> */}
                <div className={styles.container}>
                  <label htmlFor="exdate" className={styles.label}>
                    Edit Exam Date
                  </label>
                  <div className="relative">
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="block rounded-lg w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                      placeholder="Enter Exam date"
                    />
                    {error2 && (
                      <label
                        htmlFor="exdate"
                        className={styles.label}
                        style={{ color: "red" }}
                      >
                        {error2}
                      </label>
                    )}
                  </div>
                </div>
                
                <div className={styles.container}>
                  <div className={styles.label}>Standards</div>
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
                          <td key={cls._id} className="px-6 py-3">
                            <input
                              type="checkbox"
                              id={`${cls._id}-checkbox`}
                              checked={selectedStandards.includes(
                                cls.ClassName
                              )}
                              onChange={() =>
                                handleCheckboxChange(cls.ClassName)
                              }
                              className="w-6 m-6 h-6 text-blue-700 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
                <button
                  type="button"
                  onClick={submit}
                  className={styles.edit}
                >
                  Save
                </button>
              <div className={styles.dialogFooter}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={styles.button1}
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </div>
  );
}

EditExam.propTypes = {
  fetchData1: PropTypes.func.isRequired,
  _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(PropTypes.string),
  props: PropTypes.object,
};
