import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export default function UploadResult() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [file, setFile] = useState([]);
  const [subjects, setSubjects] = useState([]);
   
  const handleFileChange = (e, subjectName) => {
    const validMimeTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "text/tab-separated-values"];
    
    // Check if the file type is valid
    const fileType = e.target.files[0]?.type;
    if (validMimeTypes.includes(fileType)) {
      const newFiles = [...file];
      const index = subjects.findIndex(sub => sub.SubjectName === subjectName);
      
      // If subject is found, update the file array
      if (index !== -1) {
        newFiles[index] = e.target.files[0];
        setFile(newFiles);
      } else {
        console.error("Subject not found.");
      }
    } else {
      console.error("Invalid file type.");
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
    fetchClass();
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


  const handleUpload = async () => {
    try {

      
      // Ensure both subjects and files are provided
      if (!subjects || !file || subjects.length === 0 || file.length === 0) {
        toast.error('Subjects or files are missing.');
        return;
      }
  
      const formData = new FormData();
  
      subjects.forEach((subject, index) => {
        if (file[index]) {
          formData.append('files', file[index]); // Append each file
          formData.append('subjects', subject.SubjectName); // Append each subject
        } else {
          console.warn(`File missing for subject: ${subject.SubjectName}`);
        }
      });
  
      // Append other required fields
      formData.append('district', district);
      formData.append('taluka', taluka);
      formData.append('center', selectedCenter);
      formData.append('exam', exam);
      formData.append('cls', selectedClass);
  
      // Check the constructed formData
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]); // Logs each key-value pair
      }
  
      // Send the formData to the backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/result/uploadresult`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      // Handle response from the server
      const result = response.data;
  
      if (result.success) {
        toast.success('File uploaded and processed successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error(`An error occurred: ${error.message}`);
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


        {subjects.map((sub) => (
          <div key={sub._id} className={styles.container}>
            <label htmlFor={`file_input_${sub._id}`} className={styles.label}>
              Upload Excel file for {sub.SubjectName}
            </label>
            <div className={styles.relative}>
              <input
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                id={`file_input_${sub._id}`}
                type="file"
                onChange={(e) => handleFileChange(e, sub.SubjectName)}
              />
            </div>
          </div>
        ))}

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
