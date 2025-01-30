import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from "../../Styles/Edit.module.css";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export default function EditStudent({ props, fetchData1 }) {

  
  const [open, setOpen] = useState(false);
  const [studName, setStudName] = useState(props.studName || '');
  const [gender, setGender] = useState(props.gender || '');
  const [school, setSchool] = useState(props.school || '');
  const [mobNo, setMobNo] = useState( '');
  const [medium, setMedium] = useState(props.medium || '');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(props.Class || '');

  
  const toggleModal = () => setOpen(!open);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const fetchClass = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/standard?center=${props.center}`
      );
      setClasses(response.data.classes);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchClass();
  }, []);

  const Submit = async (e) => {
    e.preventDefault();

    if (studName === "" || gender === "Select" || school === "" || mobNo === "" || classes === "Select" || !selectedClass) {
      toast.error("Please Fill All Fields");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/student`,
        {
          id: props._id,
          studName: studName,
          gender: gender,
          school: school,
          mobNo: mobNo,
          Class: selectedClass,
          medium: medium
        }
      );

      if (response.data.success) {
        toast.success("Student updated successfully!");
      } else {
        toast.error("Failed to update Student");
      }
      fetchData1();
      setOpen(false);
    } catch (error) {
      toast.error("An error occurred while updating the student");
    }
  };

  return (
    <div>
      <button type="button" onClick={toggleModal} className={styles.edit}>
        Edit
      </button>
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
                      Edit Student Information
                    </DialogTitle>
                  </div>
                </div>
                <div className="mt-12">
                  <div className={styles.containers}>
                    <div className="p-6 bg-white ">
                      <div className={styles.container}>
                        <label htmlFor="gender" className={styles.label}>
                          Gender
                        </label>
                        <div className={styles.relative}>
                          <select
                            id="gender"
                            name="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          >
                            <option value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.container}>
                        <label htmlFor="studName" className={styles.label}>
                          Enter Student Name
                        </label>
                        <div className={styles.relative}>
                          <input
                            id="studName"
                            name="studName"
                            type="text"
                            required
                            value={studName}
                            onChange={(e) => setStudName(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                            placeholder="Enter Student Name"
                          />
                        </div>
                      </div>

                      <div className={styles.container}>
                        <label htmlFor="school" className={styles.label}>
                          Enter School Name
                        </label>
                        <div className={styles.relative}>
                          <input
                            id="school"
                            name="school"
                            type="text"
                            required
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                            placeholder="Enter School Name"
                          />
                        </div>
                      </div>

                      <div className={styles.container}>
                        <label htmlFor="mobNo" className={styles.label}>
                          Enter Mobile Number
                        </label>
                        <div className={styles.relative}>
                          <input
                            id="mobNo"
                            name="mobNo"
                            type="number"
                            required
                            value={mobNo}
                            onChange={(e) => setMobNo(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                            placeholder="Enter Mobile Number"
                          />
                        </div>
                      </div>

                      <div className={styles.container}>
                        <label htmlFor="classs" className={styles.label}>
                          Select Class
                        </label>
                        <div className={styles.relative}>
                          <select
                            id="classs"
                            name="classs"
                            value={selectedClass}
                            onChange={handleClassChange}
                            className="w-full block rounded-2xl border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          >
                            <option value="">Select</option>
                            {classes.map((cls, index) => (
                              <option key={cls} value={cls}>
                                {cls}
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
                            className="block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          >
                            <option value="">Select</option>
                            <option>Marathi</option>
                            <option>Semi English</option>
                            <option>English</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div className={styles.dialogFooter}>
                <button
                  type="button"
                  onClick={Submit}
                  className={styles.saveButton}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={styles.cancelButton}
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

EditStudent.propTypes = {
  props: PropTypes.shape({
  }).isRequired,
  studName: PropTypes.string.isRequired,
  gender: PropTypes.string.isRequired,
  school: PropTypes.string.isRequired,
  medium: PropTypes.string.isRequired,
  Class: PropTypes.string.isRequired,
  _id: PropTypes.string.isRequired,
  center: PropTypes.string.isRequired,
  fetchData1: PropTypes.func.isRequired,
};
