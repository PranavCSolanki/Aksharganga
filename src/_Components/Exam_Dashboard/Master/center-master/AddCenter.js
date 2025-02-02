import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function AddCenter() {
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [coordinators, setCoordinators] = useState([]);
  const [coordinator, setCoordinator] = useState("");
  const [talukas, setTalukas] = useState([]);
  const [taluka, setTaluka] = useState("");
  const [centerName, setCenterName] = useState("");

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

  const fetchCoordinators = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/sortingdata/coordinator`
      );
      setCoordinators(response.data.data);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
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
    fetchCoordinators();
  }, []);

  useEffect(() => {
    if (district) {
      fetchTaluka();
    }
  }, [district]);

  const handleSubmit = async () => {
    if (
      district === "" ||
      taluka === "" ||
      coordinator === "" ||
      centerName === ""
    ) {
      toast.error("Please fill all the fields");
    } else {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/master/center`,
          {
            district: district,
            taluka: taluka,
            coordinator: coordinator,
            center: centerName,
          }
        );

        if (response.data.success) {
          toast.success("Center added successfully!");
        } else {
          console.error("Error:", response.data.error);
        }
      } catch (error) {
        console.error("Error making request:", error);
      }
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
        <label htmlFor="Co-Ordinator" className={styles.label}>
          Select Co-Ordinator
        </label>
        <div className={styles.relative}>
          {coordinators && Array.isArray(coordinators) && (
            <select
              id="Co-Ordinator"
              name="Co-Ordinator"
              autoComplete="Co-Ordinator-name"
              value={coordinator}
              onChange={(e) => setCoordinator(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
            >
              <option>Select</option>
              {coordinators.map((co) => (
                <option key={co._id} value={`${co.FirstName} ${co.LastName}`}>
                  {`${co.FirstName} ${co.LastName}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className={styles.container}>
        <label htmlFor="name" className={styles.label}>
          Enter Center Name
        </label>
        <div className={styles.relative}>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={centerName}
            onChange={(e) => setCenterName(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"
            placeholder="Enter Center Name"
          />
        </div>
      </div>
      <div className="btnwrapper">
        <button className={styles.button} onClick={handleSubmit}>
          Add Center
        </button>
      </div>
    </div>
  );
}
