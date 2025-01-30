import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function AddStudent() {
  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [studName, setStudName] = useState("");
  const [gender, setGender] = useState("");
  const [school, setSchool] = useState("");
  const [mobNo, setMobNo] = useState("");
  const [classes, setClasses] = useState([]);
  const [medium, setMedium] = useState("");
  const [center] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [classid, setClassid] = useState();



  const handleClassChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedClassId = parseInt(selectedOption.getAttribute("data-classid"), 10);
    setSelectedClass(e.target.value);
    setClassid(selectedClassId);
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

  const Submit = async () => {

  
    if (
      exam === "" ||
      district === "" ||
      taluka === "" ||
      selectedCenter === "" ||
      studName === "" ||
      gender === "" ||
      school === "" ||
      mobNo === "" ||
      selectedClass === "" ||
      classid === "" ||
      medium === ""
    ) {
      toast.error("Please fill all the fields");
    } else {

      try {
        const data = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/registration/student`,
          {
            exam: exam,
            district: district,
            taluka: taluka,
            classid: classid,
            center: selectedCenter,
            studname: studName,
            gender: gender,
            schoolname: school,
            mob: mobNo,
            class: selectedClass,
            medium: medium
          }
        );

        if (data.data.success) {
          toast.success("Student Register successfully!");
        } else {
          toast.error("Student Already exists");
        }
      } catch (error) {
        console.error(
          "Error posting data:",
          error.response ? error.response.data : error.message
        );
      }
    }
  };

  return (
    <>
      <ToastContainer />
      <div className={styles.containers}>
        <div className={styles.heading2}>Exam Information</div>

        <div
          className="mt-12 mb-20 max-w-lg mx-auto p-10 rounded-2xl border-indigo-600 shadow-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
          style={{ marginBottom: "5rem !important" }}
        >
          <div className="p-6 bg-white">
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
                      <option key={item} data-centerid={center._id} value={item}>
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

      <div className="mt-12">
        <div className={styles.containers}>
          <div className="p-6 bg-white ">
            <div className={styles.heading2}> Student Information</div>

            <div className={styles.container}>
              <label htmlFor="Co-Ordinator" className={styles.label}>
                Gender
              </label>
              <div className={styles.relative}>
                <select
                  id="Co-Ordinator"
                  name="Co-Ordinator"
                  autoComplete="Co-Ordinator-name"
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
              <label htmlFor="email" className={styles.label}>
                Enter Student Name
              </label>
              <div className={styles.relative}>
                <input
                  id="name"
                  name="name"
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
              <label htmlFor="email" className={styles.label}>
                Enter School Name
              </label>
              <div className={styles.relative}>
                <input
                  id="name"
                  name="name"
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
              <label htmlFor="email" className={styles.label}>
                Enter Mobile Number
              </label>
              <div className={styles.relative}>
                <input
                  id="name"
                  name="name"
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
                  autoComplete="classs"
                  required
                  value={selectedClass}
                  onChange={handleClassChange}
                  className="w-full block rounded-2xl border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="">Select</option>
                  {classes.map((cls) => (
                    <option key={cls._id} data-classid={cls.ClassId} value={cls.ClassName}>
                      {cls.ClassName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.container}>
              <label htmlFor="Co-Ordinator" className={styles.label}>
                Select Medium
              </label>
              <div className={styles.relative}>
                <select
                  id="Co-Ordinator"
                  name="Co-Ordinator"
                  autoComplete="Co-Ordinator-name"
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

      <div className={styles.buttonbase}>
        <button type="submit" className={styles.button} onClick={Submit}>
          Save
        </button>
      </div>
    </>
  );
}
