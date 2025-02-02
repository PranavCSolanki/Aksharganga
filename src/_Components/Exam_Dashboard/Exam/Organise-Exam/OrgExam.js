import styles from "@/_Components/Exam_Dashboard/Styles/Dist.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function OrgExam() {
  const [exam, setExam] = useState('');
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);

  const fetchDistrict = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/sortingdata/district`
      );
      setDistricts(response.data.data);
    } catch (error) {
    }
  };

  const fetchExam = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/sort/exam`
      );
      setExams(response.data.data);
    } catch (error) {
      console.log("fetching ");
      
    }
  };

  const fetchCenter = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/exam/sort/center?taluka=${taluka}`
      );
      setCenters(response.data.data);
    } catch (error) {
      console.error("fetching" );
    }
  };

  const fetchTaluka = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/sortingdata/taluka?district=${district}`
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

  const handleCheckboxChange = (centerName, centerId) => {
    setSelectedCenters((prevSelectedCenters) => {
      const isSelected = prevSelectedCenters.some(center => center.centerId === centerId);
      if (isSelected) {
        return prevSelectedCenters.filter(center => center.centerId !== centerId);
      } else {
        return [...prevSelectedCenters, { centerName, centerId }];
      }
    });
  };

  const handleSubmit = async () => {
    if (
      district === "" ||
      taluka === "" ||
      exam === "" ||
      selectedCenters.length === 0
    ) {
      toast.error("Please fill all the fields");
    } else {
      // Prepare the data payload
      const data = { exam: exam, district: district, taluka: taluka, centers: selectedCenters };

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/exam/organize`,
          {
            data
          }
        );

        setSelectedCenters([]);

        if (response.data.success) {
          toast.success("Exam Organized");
        } else if (response.data.error === "already organised exists") {
          toast.error("already organised exists");
        } else {
          toast.error("already organised exists");
        }
      } catch (error) {
        toast.error("already organised exists");
      }
    }
  };

  return (
    <div className={styles.containers}>
      <ToastContainer />

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
            <option>Select</option>
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
           className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
          >
            <option>Select</option>
            {districts.map((dist) => (
              <option key={dist._id} value={dist.distName}>
                {dist.distName}
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
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
            >
            <option>Select</option>
            {talukas.map((tal) => (
              <option key={tal._id} value={tal.TalukaName}>
                {tal.TalukaName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.container}>
        <label htmlFor="options" className={styles.label}>
          Choose Center
        </label>
      </div>

      <div className="container m-auto">
        <ul className="grid grid-rows-4 gap-4">
          {centers.map((tech) => (
            <li
              key={tech._id}
              className="relative flex ml-52 rounded-2xl hover:border-blue-500"
            >
              <input
                type="checkbox"
                id={`${tech.CenterName}-checkbox`}
                data-centerid={tech._id}
                className="w-6 m-6 h-6 text-blue-700 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                onChange={() => handleCheckboxChange(tech.CenterName, tech.CenterId)}
              />
              <label htmlFor={`${tech.CenterName}-checkbox`} className={styles.label} style={{ marginLeft: "50px", marginTop: "18px" }}>
                <span className="transition-transform duration-300 ease-in-out group-hover:scale-105">
                  {tech.CenterName}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

        <div className="btnwrapper">
          <button type="submit" className={styles.button} onClick={handleSubmit}>
            Save
          </button>
      </div>
    </div>
  );
}
