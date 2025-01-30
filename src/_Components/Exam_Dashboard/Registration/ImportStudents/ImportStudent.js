import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function ImportStudent() {

  const [exam, setExam] = useState("");
  const [exams, setExams] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const validMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'application/vnd.ms-excel',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.template.macroEnabled.12',
    'application/vnd.ms-excel.addin.macroEnabled.12',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.spreadsheet-template',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    'text/csv',
    'text/tab-separated-values',
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!validMimeTypes.includes(selectedFile.type)) {
        setError('Only specific file types are accepted. Please upload an Excel file or a CSV file.');
        event.target.value = ''; 
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (file && district && taluka && selectedCenter && exam) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('district', district);
        formData.append('taluka', taluka);
        formData.append('center', selectedCenter);
        formData.append('exam', exam);
  
        const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/registration/importstudent`, {
          method: 'POST',
          body: formData,
        });
  
        const result = await response.json();
  
        if (result.success) {
          toast.success('File uploaded and processed successfully');
        } else {
          toast.error(`${result.message}`);
        }
      } catch (error) {
        toast.error(`An error occurred during file upload: ${error.message}`);
      }
    } else {
      setError('All fields are required, and a file must be selected.');
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
      <div className={styles.heading2}>Import Student Excel List</div>
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
            <div className={styles.container}>
              <div className={styles.label}>
              <input
                type="file"
                accept=".xlsx, .xls, .xlsm, .xltm, .xlam, .ods, .ots, .xlsb, .csv, .tsv"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              
              </div>
                <p className={styles.relative}>
                  <span style={{ color: 'red' }}>{error}</span>
                </p>
            </div>

            <div className={styles.container}>
              <div className={styles.label}></div>
              <div className={styles.label}>
                <p className={styles.relative}>
                  <span style={{color:"red"}}>Only Excel, CSV, or TSV Files Accepted</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className={styles.button} onClick={handleUpload}>
        Upload File
      </button>
    </div></>
  );
}
