import logo from './logo.svg';
import './App.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, {Marker, Popup} from 'react-map-gl';
import mapboxgl from "mapbox-gl"

// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// mapboxgl.workerClass = require('mapbox-gl/dist/mapbox-gl-csp-worker').default;

function Budgetize() {
  return (
    <div className="budgetize h-screen flex flex-col">
      <nav className="bg-gray-800 p-4">
        {/* NAV BAR */}
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} className="h-8 w-8 mr-2" alt="logo" />
            <span className="text-white font-semibold text-xl select-none">Budgetize</span>
          </div>
            {/* Centered search input field */}
            <div className="flex-1 flex justify-center">
            <form className='flex'>
            <input
              type="text"
              placeholder="Search for items..."
              className="p-2 bg-blue focus:outline-none rounded-l focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
            />
            <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          </div>
          <div>
            {/* Button for item list */}
            <button className="text-white bg-blue-500 hover:bg-blue-700 font-medium py-2 px-4 rounded items-center justify-center">
              <svg  className='w-5 h-5' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6h15l-1.5 9H6z" /> {/* Cart body */}
              <circle cx="9" cy="18" r="2" /> {/* Left wheel */}
              <circle cx="18" cy="18" r="2" /> {/* Right wheel */}
              <path d="M6 6V4C6 3.447 6.447 3 7 3h4c.553 0 1 .447 1 1v2" /> {/* Handle */}
              </svg>
           <span className="italic">List</span>
            </button>
          </div>
        </div>
      </nav>
      <div className="flex-grow">
        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
      <>
        <Map
          initialViewState={{
            longitude: -84.3964,
            latitude: 33.7749,
            zoom: 3
          }}
          style={{width: '95%', height: '95%'}}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          mapboxAccessToken= {process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        >
        </Map>
      </>
        </div>
      </div>
    </div>
  );
}

export default Budgetize;
