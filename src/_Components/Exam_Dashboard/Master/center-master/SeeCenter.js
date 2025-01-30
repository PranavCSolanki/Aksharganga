import { useEffect, useState } from "react";
import styles from "../../Styles/Dist.module.css";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import EditCenter from "./EditCenter";

export default function SeeCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Search By");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [data, setData] = useState([]);

  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const [coordinators, setCoordinators] = useState([]);
  const [coordinator, setCoordinator] = useState("");
  const [talukas, setTalukas] = useState([]);
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

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/master/center`);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDistricts = data.filter((d) => 
    d.District.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.Taluka.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.CoOrdinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.CenterName.toLowerCase().includes(searchTerm.toLowerCase())
  )    .sort((a, b) => {
      if (sortOrder === "ascending") {
        return a.CenterName.localeCompare(b.CenterName);
      } else if (sortOrder === "descending") {
        return b.CenterName.localeCompare(a.CenterName);
      }
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDistricts = filteredDistricts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDistricts.length / itemsPerPage);

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage > 3) {
      pageNumbers.push(
        <button
          key="first"
          onClick={() => setCurrentPage(1)}
          className="m-3 px-4 py-2 rounded-full bg-blue-200 text-blue-700 shadow-lg hover:bg-pink-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out duration-300 transform hover:scale-110"
        >
          <FaAngleDoubleLeft />
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={
            currentPage === i ? styles.activebutton : styles.notactivebutton
          }
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 2) {
      pageNumbers.push(
        <button
          key="last"
          onClick={() => setCurrentPage(totalPages)}
          className="mx-3 px-4 py-2 rounded-full bg-black text-blue-700 shadow-lg hover:bg-pink-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out duration-300 transform hover:scale-110"
        >
          <FaAngleDoubleRight />
        </button>
      );
    }

    return pageNumbers;
  };

  const Search = () => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_HOST}/api/master/center?distName=${district}&taluka=${taluka}&coordinator=${coordinator}`
      )
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleDelete = async (CenterName, CenterId) => {
    if (window.confirm(`Are you sure you want to delete ${CenterName}?`)) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_HOST}/api/master/center`,
          {
            params: {
              id: CenterId,
            },
          }
        );

        toast.success("Center Deleted Successfully");

        setData((prevCenters) =>
          prevCenters.filter((cent) => cent._id !== CenterId)
        );
      } catch (error) {
        toast.error("Failed to delete the Center");
      }
    }
  };

  const TableColumn = [
    "Sr No",
    "Center id",
    "Center Name",
    "Taluka",
    "District",
    "Co-Ordinator",
    "Action",
  ];
  return (
    <>
      <ToastContainer />
      <div className={styles.containers}>
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
              className="block rounded-md w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
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
                className="block rounded-md w-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
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
        <div className="btnwrapper">
          <button
            type="submit"
            className={styles.button}
            onClick={Search}
          >
            Search Center
          </button>
        </div>
      </div>
      <div
        className={`${styles.containers} bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-8 rounded-lg shadow-2xl`}
      >
        <div
          className={`${styles.tab} bg-white p-6 overflow-y-auto rounded-lg shadow-lg`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border pl-10 rounded-full w-full focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
              />
            </div>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border pl-10 rounded-full bg-white focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
              >
                <option value="default">Default</option>
                <option value="ascending">Ascending</option>
                <option value="descending">Descending</option>
              </select>
            </div>
            <div className="relative ml-4">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border pl-10 rounded-full bg-white focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-md hover:shadow-lg transition ease-in-out duration-300 transform hover:scale-105"
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>
          </div>
          <div className={styles.tab}>
            <table className="w-full my-2 text-sm text-left rtl:text-right text-black border-collapse">
              <thead className="text-xs my-2 uppercase rounded-lg">
                <tr className="bg-slate-200">
                  {TableColumn.map((name) => (
                    <th scope="col" key={name} className="px-6 py-3 border-b">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={styles.tbodys}>
                {currentDistricts.map((centr, index) => (
                  <tr
                    key={centr._id}
                    className="bg-white border-b hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600 transition ease-in-out duration-300 transform "
                  >
                    <td className="px-6 py-2">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-2">{centr.CenterId}</td>
                    <td className="px-6 py-2">{centr.CenterName}</td>
                    <td className="px-6 py-2">{centr.Taluka}</td>
                    <td className="px-6 py-2">{centr.District}</td>
                    <td className="px-6 py-2">{centr.CoOrdinator}</td>
                    <td
                      className="px-6 py-2 "
                      style={{
                        justifyContent: "center",
                        display: "flex",
                        borderTop: "none",
                        borderLeft: "none",
                      }}
                    >
                      <EditCenter props={centr} fetchData1={fetchData} />
                      <button
                        className={styles.delete}
                        aria-label={`Delete ${centr.CenterName}`}
                        onClick={() =>
                          handleDelete(centr.CenterName, centr._id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.nextpreviousbutton}
            >
              <FaArrowLeft className="mr-2" />
              Previous
            </button>
            <div>{renderPageNumbers()}</div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={styles.nextpreviousbutton}
            >
              Next
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
