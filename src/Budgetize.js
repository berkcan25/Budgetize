import React, { useRef, useState } from 'react';
import { Map, Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import logo from './logo.svg';
import './App.css';

function Budgetize() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({
    longitude: -84.3964,
    latitude: 33.7749,
    zoom: 3
  });
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);

  const fly = (longitude, latitude) => {
    if (mapRef.current) {
      console.log(mapRef.current)
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        essential: true
      });
    }
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleGeocode = async (event) => {
    event.preventDefault();
    const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const query = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const [longitude, latitude] = data.features[0].center;
      setLocation({ longitude, latitude, zoom: 12 });
      setMarker({ longitude, latitude });
      fly(longitude, latitude);
    } catch (error) {
      console.error('Failed to geocode the address:', error);
    }
  };

  return (
    <div className="budgetize h-screen flex flex-col">
      <nav className="bg-gray-800 p-4">
        {/* NAV BAR */}
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} className="h-8 w-8 mr-2" alt="logo" />
            <span className="text-white font-semibold text-xl select-none">Budgetize</span>
          </div>
          {/* Address input and geocoding */}
          <form className="flex" onSubmit={handleGeocode}>
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="Enter an address..."
              className="p-2 bg-blue focus:outline-none rounded-l focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-r flex items-center justify-center"
            >
              {/* Pin icon */}
              <svg className='w-4 h-4' viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
              </svg>
            </button>
          </form>
          {/* Centered search input field */}
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
          <div>
            {/* Button for item list */}
            <button className="text-white bg-blue-500 hover:bg-blue-700 font-medium py-2 px-4 rounded items-center justify-center">
              <svg className='w-5 h-5' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: location.longitude,
              latitude: location.latitude,
              zoom: location.zoom
            }}
            style={{ width: '95%', height: '95%' }}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
            onLoad={({ target }) => { mapRef.current = target; }}
          >
            {marker && (
              <Marker longitude={marker.longitude} latitude={marker.latitude}>
                <svg display="block" height="41px" width="27px" viewBox="0 0 27 41">
                  <defs>
                    <radialGradient id="shadowGradient">
                      <stop offset="10%" stop-opacity="0.4"></stop>
                      <stop offset="100%" stop-opacity="0.05"></stop>
                    </radialGradient>
                  </defs>
                  <ellipse cx="13.5" cy="34.8" rx="10.5" ry="5.25" fill="url(#shadowGradient)">
                  </ellipse>
                  <path fill="red" d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z">
                  </path>
                  <path opacity="0.25" d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"></path>
                  <path d="M7 11 L13.5 6 L20 11 L20 20 L7 20 Z" fill="white"/>
                                  </svg>
              </Marker>

            )}
            <NavigationControl position="top-right" />
          </Map>
        </div>
      </div>
    </div>
  );
}

export default Budgetize;
