import styles from "../Styles/Dist.module.css";
export default function StudResult() {
  return (
    <div className={styles.containers}>
      <div className="mt-12 max-w-md mx-auto p-10 rounded-2xl  border ">
        <div className="w-32 m-auto">
          <div className={styles.heading2}> Student`s Result</div>
        </div>

        <div className={styles.container}>
          <label htmlFor="email" className={styles.label}>
            Enter Student`s Roll Number
          </label>
          <div className={styles.relative}>
            <input
              id="name"
              name="name"
              type="number"
              required
              className="block  rounded-lg w-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 m-10"
              placeholder="Enter Student`s Roll Number"
            />
          </div>
        </div>

        <div className="btnwrapper">
          <button type="submit" className={styles.button}>
            See Result
          </button>
        </div>
      </div>
    </div>
  );
}
