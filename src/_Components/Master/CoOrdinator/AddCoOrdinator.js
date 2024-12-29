import { useState } from "react";
import styles from "../../Styles/Dist.module.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
export default function AddCoOrdinator() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [mob, setMob] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  
  const SubmitData = async () => {
    console.log('clicked');
  
    if (
      fname === "" ||
      lname === "" ||
      mob === "" ||
      address === "" ||
      email === ""
    ) {
      toast.error("Please fill all the fields");
    } else {
        console.log(fname, lname, mob, address, email);
  
        try {
          const trimmedFname = fname.trim();
          const trimmedLname = lname.trim();
          const trimmedMob = mob.trim();
          const trimmedAddress = address.trim();
          const trimmedEmail = email.trim();
  
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_HOST}/api/master/coordinator`,
            {
              fname: trimmedFname,
              lname: trimmedLname,
              mob: trimmedMob,
              address: trimmedAddress,
              email: trimmedEmail,
            }
          );
  
          if (data?.success) {
            toast.success("Co-Ordinator added successfully!");
            console.log(data);
          } else {
            toast.error(data?.message || "Co-Ordinator already exists");
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
      <div className="mt-12 max-w-md mx-auto p-10 rounded-2xl  border  ">
        <div className={styles.container}>
          <label htmlFor="name" className={styles.label}>
            Enter Co-Ordinator First Name
          </label>
          <div className={styles.relative}>
            <input
              id="name"
              name="name"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              type="text"
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Fisrt Name"
            />
          </div>
        </div>
        <div className={styles.container}>
          <label htmlFor="name" className={styles.label}>
            Enter Co-Ordinator Last Name
          </label>
          <div className={styles.relative}>
            <input
              id="name"
              name="name"
              type="text"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Last Name"
            />
          </div>
        </div>
        <div className={styles.container}>
          <label htmlFor="mobile" className={styles.label}>
            Co-Ordinator Mobile Number
          </label>
          <div className={styles.relative}>
            <input
              id="mobile"
              name="mobile"
              type="number"
              value={mob}
              onChange={(e) => setMob(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Mobile"
            />
          </div>
        </div>

        <div className={styles.container}>
          <label htmlFor="mobile2" className={styles.label}>
            Co-Ordinator Address
          </label>
          <div className={styles.relative}>
            <input
              id="mobile2"
              name="mobile2"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Address"
            />
          </div>
        </div>

        <div className={styles.container}>
          <label htmlFor="email" className={styles.label}>
            Co-Ordinator email
          </label>
          <div className={styles.relative}>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder=" email"
            />
          </div>
        </div>

        <div className="btnwrapper ">
          <button
            className={styles.button}
            onClick={() => SubmitData()}
          >
            Add Co-Ordinator
          </button>
        </div>
      </div>
    </div>
  );
}
