import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SearchBar from "./components/SearchBar";
import StateHomestayList from "./pages/StateHomestayList";
import CityHomestayList from "./pages/CityHomestayList";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchBar />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/:ownerId" element={<DashboardPage />} />
        <Route path="/state/:stateName" element={<StateHomestayList />} />
        <Route path="/city/:cityName" element={<CityHomestayList />} />
      </Routes>
    </Router>
  );
}

export default App;
