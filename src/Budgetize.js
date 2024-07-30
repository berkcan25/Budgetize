import React, { useEffect, useRef, useState } from 'react';
import { Map, Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { SettingsApi_UpdateShippingTemplateRequestRateModelTypeEnum } from '@whitebox-co/walmart-marketplace-api';

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
  const [walmartItem, setWalmartItem] = useState(null);
  const [walmartItemID, setWalmartItemID] = useState(null);
  const [walmartImage, setWalmartImage] = useState([]);
  const [walmartName, setWalmartName] = useState([]);
  const [walmartMSRP, setWalmartMSRP] = useState(null);
  const [walmartSelectedLoc, setWalmartSelectedLoc] = useState(null);


  //Kroger API
  const [krogerLocs, setKrogerLocs] = useState(null);
  const [krogerSelectedLoc, setKrogerSelectedLoc] = useState(null);
  const [krogerItem, setKrogerItem] = useState(null);
  const [krogerItemID, setKrogerItemID] = useState(null);

  //Mapbox API
  const fly = (longitude, latitude) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        essential: true
      });
    }
  };

  //Handlers
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleItemChange = (event) => {
    setWalmartItem(event.target.value);
    setKrogerItem(event.target.value);
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

async function handleItem(event) {
  event.preventDefault();
  await handleKrogerItem();
  await handleWalmartItem();
}

 //Kroger API

 useEffect(() => {

    //Get Kroger Locations
    const postKrogerLocs = async () => {
      try {
        const response = await axios.post(BACKEND_API_URL + 'kroger/getKrogerToken', {
          scope: "Location"
        });
        const responseLocs = await axios.post(BACKEND_API_URL + 'kroger/getKrogerLocs', {
          locKey: response.data.accessToken,
          latLong: `${location.latitude},${location.longitude}`
        });
        setKrogerLocs(responseLocs.data)
        console.log('Location posted successfully:', responseLocs.data); 
      } catch (error) {
        console.error('Error posting location:', error); 
      }
    }
    if (location.latitude && location.longitude) {
      postKrogerLocs();
    }}, [location.latitude, location.longitude]);

    //Kroger Items
    const handleKrogerItem = async () => {
      try {
        const krogerToken = await axios.post(BACKEND_API_URL + 'kroger/getKrogerToken', {
          scope: "Products"
        });
        const response = await axios.post(BACKEND_API_URL +'kroger/getKrogerItem', {
          key: krogerToken.data.accessToken,
          item: walmartItem
        });
        setKrogerItemID(response.data[0].productId)
        getKrogerPrices(response.data[0].productId, krogerToken.data.accessToken) 
      } catch (error) {
        console.error('Error posting ItemID:', error);
      }
    };

    //Kroger Prices
    const getKrogerPrices = async (id, token) => {
      for (const loc of krogerLocs) {
        try {
          const response = await axios.post(BACKEND_API_URL + 'kroger/getKrogerPrice', {
            itemID: id,
            key: token,
            locationID: loc.locationId
          });
          setKrogerLocs((prevLocs) =>
            prevLocs.map((l) => {
              if (l.locationId === loc.locationId && typeof response.data[0].items[0].price !== 'undefined') {
                return { ...l, salePrice: response.data[0].items[0].price.regular};
              } else {
                return l;
              }
            })
          );
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
      }
    };

  //Walmart API

  //Get Walmart locations
  useEffect(() => {
    const postWalmartLocation = async () => {
      try {
        const response = await axios.post(BACKEND_API_URL +'walmart/location', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
        setWalmartLocs(response.data)
        console.log('Location posted successfully:', response.data);
      } catch (error) {
        console.error('Error posting location:', error);
      }
    };

    if (location.latitude && location.longitude) {
      postWalmartLocation();
    }
  }, [location.latitude, location.longitude]);

  //Walmart Items
  const handleWalmartItem = async () => {
    try {
      const response = await axios.post(BACKEND_API_URL +'walmart/item', {
        query: walmartItem
      });
      setWalmartItemID(response.data.items[0].itemId)
      setWalmartImage(prevItems => [...prevItems, response.data.items[0].largeImage])
      setWalmartName(prevItems => [...prevItems, response.data.items[0].name])
      console.log('ItemID posted successfully:', response.data.items[0].itemId);
      getWalmartPrices(response.data.items[0].itemId)
    } catch (error) {
      console.error('Error posting ItemID:', error);
    }
  };

  //Walmart Prices
  const getWalmartPrices = async (id) => {
    for (const loc of walmartLocs) {
      try {
        const response = await axios.post(BACKEND_API_URL + 'walmart/price', {
          itemID: id,
          location: loc.no
        });
        setWalmartLocs((prevLocs) =>
          prevLocs.map((l) => {
            if (l.no === loc.no) {
              return { ...l, salePrice: response.data.salePrice };
            } else {
              return l;
            }
          })
        );
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
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
          onClick={() => setWalmartSelectedLoc(loc)}
          style={{ zIndex: 1 }}
        >
            {loc != walmartSelectedLoc && loc.salePrice && 
            <div className="bg-white p-2 rounded shadow">
              ${loc.salePrice}
            </div>}
            {walmartSelectedLoc && (
          <Popup
            longitude={walmartSelectedLoc.coordinates[0]}
            latitude={walmartSelectedLoc.coordinates[1]}
            onClose={() => setWalmartSelectedLoc(null)}
            closeOnClick={false}
            anchor="top"
            style={{ zIndex: 50, backgroundColor: 'white', borderRadius: '15px', border: 'none', boxShadow: 'none', padding: '5px'}}
          >
            <div>
              <h2 className="font-bold">{walmartSelectedLoc.name}</h2>
              <p>{walmartSelectedLoc.streetAddress.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}</p>
              <p>{walmartSelectedLoc.city}, {walmartSelectedLoc.stateProvCode} {walmartSelectedLoc.zip}</p>
              <p>{walmartSelectedLoc.phoneNumber}</p>
              {walmartSelectedLoc.salePrice && <p className="italic">Price: {walmartSelectedLoc.salePrice}</p>}
            </div>
          </Popup>
        )}
        </Marker>
          ))}

          {/* kroger pins */}
          {krogerLocs && krogerLocs.map((loc) => (
          <Marker
            key={loc.locationId}
            color='red'
            latitude={loc.geolocation.latitude}
            longitude={loc.geolocation.longitude}
            onClick={() => setKrogerSelectedLoc(loc)}
            style={{ zIndex: 1 }}
          >
          {loc.salePrice && 
            <div className="bg-white p-2 rounded shadow">
              ${loc.salePrice}
            </div>}
            {krogerSelectedLoc && (
              <Popup
              longitude={krogerSelectedLoc.geolocation.longitude}
              latitude={krogerSelectedLoc.geolocation.latitude}
              onClose={() => setKrogerSelectedLoc(null)}
              closeOnClick={false}
              anchor="top"
              style={{ zIndex: 50, backgroundColor: 'white', borderRadius: '15px', border: 'none', boxShadow: 'none', padding: '5px'}}
            >
              <div>
                <h2 className="font-bold">{krogerSelectedLoc.name}</h2>
                <p>{krogerSelectedLoc.address.addressLine1}</p>
                <p>{krogerSelectedLoc.address.city}, {krogerSelectedLoc.address.state} {krogerSelectedLoc.address.zipCode}</p>
                <p>{krogerSelectedLoc.phone}</p>
              </div>
            </Popup> )}
          </Marker>
          ))}
            <NavigationControl position="top-right" />
          </Map>
        </div>
        {walmartImage.length > 0 && walmartName.length > 0 && (
        <div className="fixed bottom-0 left-0 m-4 p-4 rounded z-50 flex flex-wrap">
          {walmartImage.map((image, index) => (
            <div key={index} className="w-32 p-4 m-2 bg-white shadow flex flex-col items-center">
              <img src={image} alt={walmartName[index]} className="w-32 h-32 object-contain mb-2" />
              <p className="text-gray-800 font-semibold break-words text-center">
                {walmartName[index]}
              </p>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default Budgetize;
