import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../../Styles/Edit.module.css";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

export default function EditCoOrdinator({ props, fetchData1 }) {
  const [open, setOpen] = useState(false);
  const [fname, setFname] = useState(props.FirstName);
  const [lname, setLname] = useState(props.LastName);
  const [password, setPassword] = useState(props.Password);
  const [address, setAddress] = useState(props.Address);
  const [mob, setMob] = useState(props.Mobile1);
  const [error, setError] = useState(null);

  const toggleModal = () => setOpen(!open);

  const Submit = async (e) => {
    e.preventDefault();

    if (!fname || !lname || !password || !address || !mob) {
      setError("Please Enter Valid Value");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/coordinator`,
        {
          id: props._id,
          FirstName: fname,
          LastName: lname,
          Address: address,
          Mobile1: mob,
          Password: password,
        }
      );

      if (response.data.success) {
        toast.success("District updated successfully!");
      } else {
        toast.error("Failed to update district");
      }
      fetchData1();
      setOpen(false);
    } catch (error) {
      toast.error("An error occurred while updating the district");
    }
  };

  return (
    <div>
      <button type="button" onClick={toggleModal} className={styles.edit}>
        Edit
      </button>
      {open && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          className={styles.dialog}
        >
          <DialogBackdrop className={styles.dialogBackdrop} />

          <div className={styles.dialogContainer}>
            <DialogPanel className={styles.dialogPanel}>
              <div className={styles.dialogContent}>
                <div className={styles.dialogHeader}>
                  <div className={styles.dialogTitleContainer}>
                    <DialogTitle as="h3" className={styles.heading2}>
                      Edit Co-Ordinator
                    </DialogTitle>
                  </div>
                </div>
                <div className={styles.container}>
                  <label htmlFor="fname" className={styles.label}>
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      id="fname"
                      name="fname"
                      type="text"
                      value={fname}
                      onChange={(e) => {
                        setFname(e.target.value);
                        setError(null);
                      }}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                      placeholder="First Name"
                    />
                    {error && (
                      <label
                        htmlFor="fname"
                        className={styles.label}
                        style={{ color: "red" }}
                      >
                        {error}
                      </label>
                    )}
                  </div>
                </div>
                <div className={styles.container}>
                  <label htmlFor="lname" className={styles.label}>
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      id="lname"
                      name="lname"
                      type="text"
                      value={lname}
                      onChange={(e) => {
                        setLname(e.target.value);
                        setError(null);
                      }}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                      placeholder="Last Name"
                    />
                    {error && (
                      <label
                        htmlFor="lname"
                        className={styles.label}
                        style={{ color: "red" }}
                      >
                        {error}
                      </label>
                    )}
                  </div>
                </div>
                <div className={styles.container}>
                  <label htmlFor="address" className={styles.label}>
                    Address
                  </label>
                  <div className="relative">
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setError(null);
                      }}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                      placeholder="Address"
                    />
                    {error && (
                      <label
                        htmlFor="address"
                        className={styles.label}
                        style={{ color: "red" }}
                      >
                        {error}
                      </label>
                    )}
                  </div>
                </div>
                <div className={styles.container}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="text"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                      }}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                      placeholder="Password"
                    />
                    {error && (
                      <label
                        htmlFor="password"
                        className={styles.label}
                        style={{ color: "red" }}
                      >
                        {error}
                      </label>
                    )}
                  </div>
                </div>
                <div className={styles.container}>
                  <label htmlFor="mob" className={styles.label}>
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      id="mob"
                      name="mob"
                      type="text"
                      value={mob}
                      onChange={(e) => {
                        setMob(e.target.value);
                        setError(null);
                      }}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                      placeholder="Mobile Number"
                    />
                    {error && (
                      <label
                        htmlFor="mob"
                        className={styles.label}
                        style={{ color: "red" }}
                      >
                        {error}
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.dialogFooter}>
                <button
                  type="button"
                  onClick={Submit}
                  className={styles.saveButton}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </div>
  );
}

EditCoOrdinator.propTypes = {
  FirstName: PropTypes.string.isRequired,
  LastName: PropTypes.string.isRequired,
  Password: PropTypes.string.isRequired,
  Address: PropTypes.string.isRequired,
  Mobile1: PropTypes.string.isRequired,
  _id: PropTypes.string.isRequired,
  fetchData1: PropTypes.func.isRequired,
};
