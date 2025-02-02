import { useState } from "react";
import styles from "../../Styles/Dist.module.css";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

export default function AddDistrict() {
  const [District, SetDistrict] = useState("");
  const [Error, SetError] = useState(false);


  const Submit = async () => {
    if (District === "") {
      SetError(true);
  
      setTimeout(() => {
        SetError(false);
      }, 3000);
    } else {
      try {
        const data = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/master/district`,
          {
            distName: District,
          }
        );
  
        if (data.data.success ) {
          toast.success("District Added successfully!");
        } else {
          toast.error("District Already exist");
        }
      } catch (error) {
        toast.error("Error posting data: " + error.message);
      }
    }
  };
  
  return (
    <>
      <ToastContainer />
    <div className={styles.containers}>
        <div className=" mx-auto p-10 rounded-2xl">
          <h1 className={styles.heading2}>Add District</h1>
        <div className={styles.container}>
          <label htmlFor="name" className={styles.label}>
            Enter District Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              value={District}
              onChange={(e) => SetDistrict(e.target.value)}
              required
             className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-5"

              placeholder="Enter District Name"
            />
            {Error ? (
              <label
                htmlFor="name"
                className={`${styles.label} `}
                style={{ color: "red" }}
              >
                Please Enter District Name
              </label>
            ) : null}
          </div>
        </div>

        <div className="btnwrapper">
          <button type="submit" className={styles.button} onClick={Submit}>
            Add District
          </button>
        </div>
      </div>
      </div>
      </>
  );
}
