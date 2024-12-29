import { useState } from "react";
import styles from "../../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export default function AddClass() {
  const [clas, setClas] = useState("");
  const [error, setError] = useState(false);
  const [clasid, setClasid] = useState("");
  const [errorid, setErrorid] = useState(false);

  const Submit = async () => {
    if (clas === "") {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
    } else if (clasid === "") {
      setErrorid(true);
      setTimeout(() => {
        setErrorid(false);
      }, 3000);
    } else {
      try {
        const data = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/master/classes`,
          {
            className: clas,
            id: clasid,
          }
        );

        if (data.data.success) {
          toast.success("Class Added successfully!");
        } else {
          toast.error("Class Already exist");
        }
      } catch (error) {
        toast.error("Error posting data: " + error.message);
        console.error("Error posting data:", error);
      }
    }
  };

  return (
    <div className={styles.containers}>
      <ToastContainer />
      <div className="mt-12 max-w-md mx-auto p-10 rounded-2xl border">
        <div className={styles.container}>
          <label htmlFor="name" className={styles.label}>
            Enter Class Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              value={clas}
              onChange={(e) => setClas(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Enter Class Name"
            />
            {error ? (
              <label
                htmlFor="name"
                className={styles.label}
                style={{ color: "red" }}
              >
                Please Enter Class Name
              </label>
            ) : null}
          </div>
        </div>
        <div className={styles.container}>
          <label htmlFor="clsid" className={styles.label}>
            Enter Class Id
          </label>
          <div className="relative">
            <input
              id="clsid"
              name="clsid"
              type="number"
              value={clasid}
              onChange={(e) => setClasid(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Enter Class ID"
            />
            {errorid ? (
              <label
                htmlFor="clsid"
                className={styles.label}
                style={{ color: "red" }}
              >
                Please Enter Class ID
              </label>
            ) : null}
          </div>
        </div>

        <div className="btnwrapper">
          <button type="submit" className={styles.button} onClick={Submit}>
            Add Class
          </button>
        </div>
      </div>
    </div>
  );
}
