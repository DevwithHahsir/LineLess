import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/homePage/Home";
import UserSignup from "./pages/user/userSignup";
import ProviderSignup from "./pages/serviceProvider/providerSignup";
import UserLogin from "./pages/user/userLogin";
import ProviderLogin from "./pages/serviceProvider/proviedrLogin";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/provider/signup" element={<ProviderSignup />} />
        <Route path="/provider/login" element={<ProviderLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
