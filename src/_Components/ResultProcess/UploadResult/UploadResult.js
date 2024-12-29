import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export default function UploadResult() {
  const [file, setFile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [medium, setMedium] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");

  const validMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.template.macroEnabled.12",
    "application/vnd.ms-excel.addin.macroEnabled.12",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.spreadsheet-template",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    "text/csv",
    "text/tab-separated-values",
  ];

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
      console.error("Error fetching data:", error);
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
      console.error("Error fetching Center:", error);
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
      console.error("Error fetching data:", error);
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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!validMimeTypes.includes(selectedFile.type)) {
        
        toast.error("Only Excel File is Accepted")
        event.target.value = ""; // Reset the file input
      } else {
        setFile(selectedFile);
      }
    }
  };

  // const handleUpload = async () => {
  //   console.log(
  //     exam,
  //     district,
  //     taluka,
  //     selectedCenter,
  //     selectedClass,
  //     selectedSubject,
  //     medium,
  //     file,
  //   );
  //   // if (file && district && taluka && selectedCenter && selectedSubject && exam && selectedClass && medium) {
  //   //   try {
  //   // const response = await fetch(
  //   //   `${process.env.NEXT_PUBLIC_HOST}/api/result/uploadresult`,
  //   //   {
  //   //     method: "POST",
  //   //     body: formData,
  //   //   }
  //   // );

  //   // const result = await response.json();

  //   // if (result.success) {
  //   //   toast.success("File uploaded and processed successfully");
  //   // } else {
  //   //   toast.error(`${result.message}`);
  //   // }
  //   // console.log(file , district , taluka , selectedCenter , exam , selectedClass , medium);

  //   //   } catch (error) {
  //   //     toast.error(`An error occurred during file upload: ${error.message}`);
  //   //   }
  //   // } else {
  //   //   toast.error("All fields are required, and a file must be selected.");
  //   // }
  // };

  const handleUpload = async () => {
    console.log(
      exam,
      district,
      taluka,
      selectedCenter,
      selectedClass,
      selectedSubject,
      medium, 
      file
    );
  
    if (exam && district && taluka && selectedCenter && selectedClass && selectedSubject && medium) {
      try {
        // Prepare query parameters
        const queryParams = new URLSearchParams({
          exam,
          district,
          taluka,
          center: selectedCenter,
          class: selectedClass,
          subject: selectedSubject,
          medium
        });
  
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_HOST}/api/result/uploadresult?${queryParams}`,
          {
            method: "GET",
          }
        );
  
        const result = await response.json();
  
        if (result.success) {
          toast.success("Request processed successfully");
        } else {
          toast.error(`${result.message}`);
        }
  
        console.log(exam, district, taluka, selectedCenter, selectedClass, medium);
        
      } catch (error) {
        toast.error(`An error occurred: ${error.message}`);
      }
    } else {
      toast.error("All fields are required.");
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
    fetchDistrict();
    fetchExam();
    fetchClass();
  }, []);

  const fetchSubject = async (classes) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/subject?class=${selectedClass}`
      );
      setSubjects(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchSubject(selectedClass);
  }, [selectedClass]);

  return (
    <>
      <ToastContainer />
      <div className={styles.heading2}>Upload Result</div>
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
              <option value="">Select</option>
              {classes.map((cls) => (
                <option
                  key={cls._id}
                  data-classid={cls.ClassId}
                  value={cls.ClassName}
                >
                  {cls.ClassName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.container}>
          <label htmlFor="subject" className={styles.label}>
            Select Subject
          </label>
          <div className={styles.relative}>
            <select
              id="subject"
              name="subject"
              autoComplete="subject-name"
              required
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="block rounded-md w-full border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option value="">Select</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub.SubjectName}>
                  {sub.SubjectName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.container}>
          <label htmlFor="file_input" className={styles.label}>
            Choose Your Excel file
          </label>
          <div className={styles.relative}>
            <input
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              id="file_input"
              type="file"
              onChange={handleFileChange}
            />
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

        <div className={styles.container}>
          <div className={styles.label}></div>
          <div className={styles.label}>
            <div className={styles.relative}>
              <p style={{ color: "red" }}>Only Excel Sheet Accepted</p>
            </div>
          </div>
        </div>

        <button type="submit" className={styles.button} onClick={handleUpload}>
          Upload Result
        </button>
      </div>
    </>
  );
}
