import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";
// import HomestayList from "./pages/HomestayList";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StateHomestayList from "./pages/StateHomestayList";
import CityHomestayList from "./pages/CityHomestayList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchBar />} />
        <Route path="/state/:stateName" element={<StateHomestayList />} />
        <Route path="/city/:cityName" element={<CityHomestayList />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/:ownerId" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
