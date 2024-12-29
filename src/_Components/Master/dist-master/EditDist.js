import PropTypes from "prop-types";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import styles from "../../Styles/Edit.module.css";
import { toast } from "react-toastify";
import axios from "axios";

export default function EditDist({ props, fetchData1 }) {
  const [open, setOpen] = useState(false);
  const [district, setDistrict] = useState(props.distName);
  const [error, setError] = useState(null);

  const toggleModal = () => setOpen(!open);


  const Submit = async (e) => {
    e.preventDefault();

    if (!district) {
      setError("Please Enter District Name");
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/district`,
        { id: props._id, distName: district }
      );

      if (response.data.success) {
        toast.success("District updated successfully!");
      } else {
        toast.error("Failed to update district");
      }
      fetchData1();
      setOpen(false);
    } catch (error) {
      console.log(error);
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
                      Edit District Name
                    </DialogTitle>
                  </div>
                </div>
                <div className={styles.container}>
                  <label htmlFor="name" className={styles.label}>
                    Enter District Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setError(null);
                      }}
                      required
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
                      placeholder="Enter District Name"
                    />
                    {error && (
                      <label
                        htmlFor="name"
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

EditDist.propTypes = {
  props: PropTypes.shape({
    distName: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
  }).isRequired,
  fetchData1: PropTypes.func.isRequired,
};
