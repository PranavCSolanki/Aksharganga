import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function AddTaluka() {
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");

  const fetchDistrict = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/sortingdata/district`
      );

      setDistricts(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDistrict();
  }, []);


  const Submit = async () => {

    if (district === "Select" || taluka === "") {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      const data = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/taluka`,
        {
          distName: district,
          TalukaName: taluka,
        }
      );

      if (data.data.success) {
        toast.success("Taluka added successfully!");
      } else {
        toast.error("Taluka already exists");
      }
    } catch (error) {
      console.error("Error posting data:", error.response ? error.response.data : error.message);
    }
};


  return (
    <div className={styles.containers}>
      <ToastContainer />
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
              className=" block w-max border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            >
              <option>Select</option>
              {districts.map((district) => (
                <option key={district.distId} value={district.distName}>
                  {district.distName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.container}>
          <label htmlFor="name" className={styles.label}>
            Enter Taluka Name
          </label>
          <div className={styles.relative}>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              className=" block w-max border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
           placeholder="Enter Taluka Name"
            />
          </div>
        </div>

        <div className="btnwrapper">
          <button type="submit" className={styles.button} onClick={Submit}>
            Add Taluka
          </button>
        </div>
    </div>
  );
}
