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
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} className="h-8 w-8 mr-2" alt="logo" />
            <span className="text-white font-semibold text-xl">Budgetize</span>
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
