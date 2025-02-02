import axios from "axios";
import styles from "../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

export default function EditMarks() {
  const [rollno, setRollno] = useState("");
  const [isResultVisible, setIsResultVisible] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [studName, setStudName] = useState("");
  const [school, setSchool] = useState("");
  const [classes, setClasses] = useState([]);
  const [medium, setMedium] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [subjects, setSubjects] = useState([{}]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const fetchDistrict = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/district`
      );
      setDistricts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching district:", error);
    }
  };

  const fetchExam = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/sort/exam`
      );
      setExams(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching exams");
    }
  };

  const fetchCenter = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/centers?taluka=${taluka}`
      );
      setCenters(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching centers");
    }
  };

  const fetchTaluka = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/registration/sort/organised/taluka?district=${district}`
      );
      setTalukas(response.data.data || []);
    } catch (error) {
      toast.error("Error fetching talukas");
    }
  };

  const fetchClass = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/sortingdata/class`
      );
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleMarksChange = (index, newMarks) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index].marks = newMarks;
    setSubjects(updatedSubjects);
  };

  useEffect(() => {
    fetchClass();
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

      const { success, data } = response.data;

      if (success) {
        if (data) {
          setStudentData(data);
          setIsResultVisible(true);
          setStudName(data.studentName);
          setSchool(data.schoolName);
          setMedium(data.medium);
          setDistrict(data.district);
          setTaluka(data.taluka);
          setExam(data.exam);
          setSelectedClass(data.standard);
          setSelectedCenter(data.center);
          setSubjects(data.subjects);
          toast.success("Data fetched successfully");
          console.log("subjects", data.subjects);
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

  const EditData = async () => {
    try {
      if (!rollno) {
        toast.error("Please enter a roll number");
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/otherfolder/editstudent`, 
        {
          rollNo: rollno,
          exam: exam,
          center: selectedCenter,
          district: district,
          taluka: taluka,
          std: selectedClass,
          studentName: studName,
          subjects: subjects, 
          school: school,
          medium: medium,
        }
      );

      const sucess = response.data.success;

      if (sucess) {
        toast.success("Data Updated successfully");
      } else {
        toast.error("Enter valid roll number");
      }
    } catch (error) {
      toast.error("An error occurred while submitting data");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={styles.heading2}>Edit Student</div>
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
      </div>
      <div className="btnwrapper">
        <button
          type="submit"
          onClick={SubmitData}
          className={`${styles.button} bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out`}
        >
          Show Student
        </button>
      </div>

      {isResultVisible && studentData && (
        <div className="p-6 bg-white">
          <div className={styles.containers}>
            <div className={styles.heading2}> Student Information</div>
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
                  {Array.isArray(exams) &&
                    exams.map((exm) => (
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
                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
                >
                  <option value="">Select</option>
                  {Array.isArray(districts) &&
                    districts.map((dist) => (
                      <option key={dist._id} value={dist._id}>
                        {dist._id}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className={styles.container}>
              <label htmlFor="taluka" className={styles.label}>
                Select Taluka
              </label>
              <div className={styles.relative}>
                <select
                  id="taluka"
                  name="taluka"
                  autoComplete="taluka-name"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
                >
                  <option value="">Select</option>
                  {Array.isArray(talukas) &&
                    talukas.map((tal) => (
                      <option key={tal._id} value={tal.taluka}>
                        {tal.taluka}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className={styles.container}>
              <label htmlFor="center" className={styles.label}>
                Select Exam Center
              </label>
              <div className={styles.relative}>
                <select
                  id="center"
                  name="center"
                  autoComplete="center-name"
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
                >
                  <option value="">Select</option>
                  {Array.isArray(centers) &&
                    centers.map((centr) =>
                      centr.centers.map((item) => (
                        <option
                          key={item}
                          data-centerid={centr._id}
                          value={item}
                        >
                          {item}
                        </option>
                      ))
                    )}
                </select>
              </div>
            </div>

            <div className="p-6 bg-white ">
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
                   className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"

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
                   className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"

                    placeholder="Enter School Name"
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
                    autoComplete="classs"
                    required
                    value={selectedClass}
                    onChange={handleClassChange}
                   className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
                  >
                    <option value="">Select</option>
                    {Array.isArray(classes) &&
                      classes.map((cls) => (
                        <option key={cls._id} value={cls.ClassName}>
                          {cls.ClassName}
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
                    autoComplete="medium-name"
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

              {subjects.map((subject, index) => (
                <div key={subject._id} className={styles.container}>
                  <label htmlFor={`subject-${index}`} className={styles.label}>
                    {subject.subject}
                  </label>
                  <div className={styles.relative}>
                    <input
                      id={`subject-${index}`}
                      name={`subject-${index}`}
                     className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"

                      type="number"
                      required
                      value={subject.marks}
                      onChange={(e) => handleMarksChange(index, e.target.value)}
                      placeholder={`Enter marks for ${subject.subject}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="btnwrapper">
            <button
              type="submit"
              onClick={EditData}
              className={`${styles.button} bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out`}
            >
              Update Student
            </button>
          </div>
        </div>
      )}
    </>
  );
}
