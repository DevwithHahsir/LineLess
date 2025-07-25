import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/homePage/Home";
import UserSignup from "./pages/user/userSignup";
import ProviderSignup from "./pages/serviceProvider/providerSignup";
import UserLogin from "./pages/user/userLogin";
import ProviderLogin from "./pages/serviceProvider/providerLogin";
import RouteTest from "./pages/RouteTest";
import MapTest from "./pages/MapTest";
import FirebaseDebug from "./pages/FirebaseDebug";
import Navbar from "./componenets/navbar/Navbar";
import "leaflet/dist/leaflet.css";
import "./componenets/navbar/Main.css";

import ClientDashboard from "./Dashboard/client/ClientDashboard";
import ServiceDashboard from "./Dashboard/service/ServiceDashboard";

function App() {
  return (
    <Router>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/route-test" element={<RouteTest />} />
          <Route path="/map-test" element={<MapTest />} />
          <Route path="/firebase-debug" element={<FirebaseDebug />} />
          <Route path="/user/signup" element={<UserSignup />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/provider/signup" element={<ProviderSignup />} />
          <Route path="/provider/login" element={<ProviderLogin />} />
          <Route path="/client/clientdashboard" element={<ClientDashboard />} />
          <Route
            path="/service/Servicedashboard"
            element={<ServiceDashboard />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
