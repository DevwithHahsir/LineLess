import React, { useState } from "react";
import "./ServiceDashboard.css";
import Navbar from "../../componenets/navbar/Navbar";
import BusinessForm from "../../componenets/businessform/BusinessForm";

function ServiceDashboard() {
  const [openBusinessForm, setOpenBusinessForm] = useState(false);

  const AddBusiness = () => {
    // console.log("hello")
    setOpenBusinessForm((prev) => !prev);
  };

  return (
    <>
      <div className="navbar">
        <Navbar isProvider={true} />
      </div>
      

      <div className="heading-container">
        <h1>Service Provider</h1>
        <h4>List Your Business and Connect with Nearby Clients</h4>
      </div>

      <div className="btn-addbusiness">
        <button className="addService" onClick={AddBusiness}>
          + Add Your Business
        </button>
      </div>

      {openBusinessForm ? <BusinessForm /> : ""}
    </>
  );
}

export default ServiceDashboard;
