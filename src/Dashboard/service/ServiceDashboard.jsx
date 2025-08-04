
import "./ServiceDashboard.css";
import Navbar from "../../componenets/navbar/Navbar";
import { useState } from "react";
import BusinessForm from "../../componenets/businessform/BusinessForm";



function ServiceDashboard() {
  const [showform,setShowform]=useState(false);

  const showForm=()=>{
    // console.log("hello")
    setShowform((prev)=>!prev);
  }






 



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
        <button className="addService" onClick={showForm}>
          + Add Your Business
        </button>
      </div>

      
      {/* FORMMMMMMMMMMMMMMMMMMMM */}
       {showform ? (
         <div><BusinessForm/></div>
       ) : (
         <div className="erorr">No Business is registered</div>
       )}


      
     
    </>
  );
}

export default ServiceDashboard;
