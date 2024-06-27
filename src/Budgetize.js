import logo from './logo.svg';
import './App.css';

function Budgetize() {
  return (
    <div className="budgetize h-screen flex flex-col">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} className="h-8 w-8 mr-2" alt="logo" />
            <span className="text-white font-semibold text-xl">Budgetize</span>
          </div>
          <div>
            {/* Add any additional navbar items here */}
          </div>
        </div>
      </nav>
      <div className="flex-grow">
        {/* Placeholder for Google Maps/Mapbox integration */}
        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
          <p className="text-gray-600">Map will be integrated here</p>
        </div>
      </div>
    </div>
  );
}

export default Budgetize;
