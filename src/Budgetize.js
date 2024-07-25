import React, { useEffect, useRef, useState } from 'react';
import { Map, Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

function Budgetize() {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({
    longitude: -84.3964,
    latitude: 33.7749,
    zoom: 3
  });
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);
  const BACKEND_API_URL = "http://localhost:9000/"


  //Walmart API
  const [walmartLocs, setWalmartLocs] = useState(null);
  const [item, setItem] = useState(null);
  const [itemID, setItemID] = useState(null);
  const [walmartImage, setWalmartImage] = useState(null);
  const [walmartName, setWalmartName] = useState(null);
  const [walmartMSRP, setWalmartMSRP] = useState(null);
  const [selectedLoc, setSelectedLoc] = useState(null);



  //Mapbox API
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

  const handleItemChange = (event) => {
    setItem(event.target.value);
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

  //Walmart API

  //Get Walmart locations  
  useEffect(() => {
    const postLocation = async () => {
      try {
        const response = await axios.post(BACKEND_API_URL +'walmart/location', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
        setWalmartLocs(response.data)
        // walmartLocs.map((loc) => {
        //     console.log(loc.no);
        //     console.log(loc.coordinates[1]);
        //     console.log(loc.coordinates[0]);
        // });
        console.log('Location posted successfully:', response.data);
      } catch (error) {
        console.error('Error posting location:', error);
      }
    };

    if (location.latitude && location.longitude) {
      postLocation();
    }
  }, [location.latitude, location.longitude]);

  const handleItem = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(BACKEND_API_URL +'walmart/item', {
        query: item
      });
      setItemID(response.data.items[0].itemId)
      setWalmartImage(response.data.items[0].largeImage)
      setWalmartName(response.data.items[0].name)
      console.log('ItemID posted successfully:', response.data.items[0].itemId);
      getPrices(response.data.items[0].itemId)
    } catch (error) {
      console.error('Error posting ItemID:', error);
    }
  };

  const getPrices = async (id) => {

    try {
      for (const loc of walmartLocs) {
        const response = await axios.post(BACKEND_API_URL + 'walmart/price', {
          itemID: id,
          location: loc.no
        });
        console.log(loc.name)
        console.log(response.data.salePrice); // Handle the response data as needed
        setWalmartLocs((prevLocs) =>
          prevLocs.map((l) => {
            if (l.no === loc.no) {
              // console.log({ ...l, salePrice: response.data.salePrice });
              return { ...l, salePrice: response.data.salePrice };
            } else {
              return l;
            }
          })
        );
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
    // console.log(walmartLocs);
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
          <form className='flex' onSubmit={handleItem}>
            <input
              type="text"
              placeholder="Search for items..."
              onChange={handleItemChange}
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
          {walmartLocs && walmartLocs.map((loc) => (
        <Marker
          key={loc.no}
          longitude={loc.coordinates[0]}
          latitude={loc.coordinates[1]}
          onClick={() => setSelectedLoc(loc)}
          style={{ zIndex: 1 }}
        >
            {loc != selectedLoc && loc.salePrice && 
            <div className="bg-white p-2 rounded shadow">
              ${loc.salePrice}
            </div>}
            {selectedLoc && (
          <Popup
            longitude={selectedLoc.coordinates[0]}
            latitude={selectedLoc.coordinates[1]}
            onClose={() => setSelectedLoc(null)}
            closeOnClick={false}
            anchor="top"
            style={{ zIndex: 50, backgroundColor: 'white', borderRadius: '15px', border: 'none', boxShadow: 'none', padding: '5px'}}
          >
            <div>
              <h2 className="font-bold">{selectedLoc.name}</h2>
              <p>{selectedLoc.streetAddress.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}</p>
              <p>{selectedLoc.city}, {selectedLoc.stateProvCode} {selectedLoc.zip}</p>
              <p>{selectedLoc.phoneNumber}</p>
              {selectedLoc.salePrice && <p className="italic">Price: {selectedLoc.salePrice}</p>}
            </div>
          </Popup>
        )}
        </Marker>
          ))}
            <NavigationControl position="top-right" />
          </Map>
        </div>
        {walmartImage && walmartName && (
          <div className="fixed bottom-0 left-0 m-4 bg-white p-4 rounded shadow z-50">
          <img src={walmartImage} alt="Walmart" className="w-32 h-32 object-contain mb-2" />
          <p className="text-gray-800 font-semibold break-words w-32 text-center">
            {walmartName}
          </p>
        </div>
        )}
      </div>
    </div>
  );
}

export default Budgetize;
