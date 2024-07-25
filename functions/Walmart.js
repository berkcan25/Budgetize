const walmart = require('walmart-api-wrapper');
const NodeRSA = require("node-rsa");
const axios = require('axios');

// //Express Setup
const express = require("express");

const walmartRouter = express.Router();


walmartRouter.get("/message", (req, res) => {
    res.json({ message: "Hello from server!" });
});

//Walmart API Requirements

const BASE_URL = 'https://developer.api.walmart.com/';
const MAX = 200;

const fetchBody = async (url, headerData) => {
    try {
        const response = await axios.get(url, {
            headers: generateHeaders(headerData)
        });
        // console.log(response)
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const generateHeaders = (headerData) => {
    const { privateKey, consumerId, keyVer } = headerData;
    const timestamp = Date.now().toString();

    const sortedHashString = `${consumerId}\n${timestamp}\n${keyVer}\n`;

    const signature_enc = (new NodeRSA(privateKey, "pkcs8", options={encryptionScheme: { hash: 'sha256'}})).sign(sortedHashString).toString("base64");

    return {
        "WM_SEC.AUTH_SIGNATURE": signature_enc,
        "WM_CONSUMER.INTIMESTAMP": timestamp,
        "WM_CONSUMER.ID": consumerId,
        "WM_SEC.KEY_VERSION": keyVer,
    };
};

const getNumToRetrieve = (numRetrieved, requiredAmount) => {
    if (!requiredAmount) return MAX;

    let amountRemaining = requiredAmount - numRetrieved;
    if (amountRemaining < MAX) return amountRemaining;
    else return MAX;
}


//Step 1: Find and send specific locations requested

walmartRouter.post("/location", async (req, res) => {
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    // console.log(longitude);
    // console.log(latitude);
    let url = BASE_URL + `api-proxy/service/affil/product/v2/stores?lon=${longitude}&lat=${latitude}`;
    // console.log(url);
    try {
        let response = await fetchBody(url, headerData);
        // console.log(response);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching location data' });
    }
})

//Step 2: Find item ID numbers
walmartRouter.post("/item", async (req, res) => {
    let query = req.body.query;
    let url = BASE_URL + `api-proxy/service/affil/product/v2/search?query=${query}`;
    // console.log(url);
    try {
        let response = await fetchBody(url, headerData);
        // console.log(response);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching itemID data' });
    }
})

//Step 3: Use locations to find specific prices of items
walmartRouter.post("/price", async (req, res) => {
    let itemID = req.body.itemID;
    let location = req.body.location;
    let url = BASE_URL + `api-proxy/service/affil/product/v2/items/${itemID}?storeId=${location}`;
    // console.log(url);
    try {
        let response = await fetchBody(url, headerData);
        // console.log(response);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching location data' });
    }
})

// const productsSpecific = async (headerData, numProducts) => {
//     // let url = BASE_URL + `/api-proxy/service/affil/product/v2/stores?lat=37.689560&lon=-122.130836`
//     let url = BASE_URL + `api-proxy/service/affil/product/v2/items/11979182?storeId=2941`

//     // 11979182
//     //2941

//     //5434

//         let res = await fetchBody(url, headerData);
//         console.log(res);


//     return res;    
// }

const headerData = {
    privateKey: `-----BEGIN PRIVATE KEY-----
    MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyxqrXt7xiAz0f
    1I96EJZTEjIDhdh/aHx2S0t0/iPPRZadHIbnRBHWK3LiWYKa9AnBAn1eCqrdS/j7
    TdA0ivcEzFeSE9Io4Y5xwXK5THkJKkspu6jwRCixB7UfO1NJw8GKsHJKrk3A8XjJ
    /QvDVvedhFdFQNdGXTUqk7fLlmK3jKN7HWA6QnE3wv2kcsZjgLgTEdI+ZRzR8+Ae
    RT6GxsG/pTZc8ottWNfGVdPzIHJH7muTQ/voav958QKIY3neFMbH2+UW/FOtzUvn
    2ADIxBFD9K+YV0oR3nFMZalGomWBO+CKNBLRwVBCNnNVRlTDz8+ANmeGBXLMIEDm
    44ULF2zZAgMBAAECggEAPteA5FUsvhM/YDn6uUCtZsQFmqFo6dhTr81l19khw1FF
    0TJe5VpTHsKlHpWySD+yUgtLAEylpSZ4ffXrUxzqGeCug6W+ASrQRIJojmQoQ6V/
    SEsz5kk/OINqEnFrJInQNa0yb7f3kvQOronpoZ+naNJFTw2s3ooTD0VfnQve5X/O
    edrGvgHpAisChpR4/VlospElLyF0/H7B5hc8Uxs4wrnEXgUS3IL3WlAyCgT4k5xw
    OgKB9L8rr97Uk5kvxd+8eR9sUZpDfqiLa6sDNR/wju1fAnKog7w6KkEhwbHhXtMk
    j8C/N5c299z0X+r+94QxTqYcLn1z/DUHlMlBkYnlZQKBgQDnHzB75Itm31guyV/S
    LzPM96bZdW/kN3KFv2vAdPAvAhpm5c/mEPBGuAWs+1R1qn8vNx+BhFD2DXO2OfDJ
    jaTGfOCIUbCGPiRk3aVVy1ITMOzxygc92J465Rf6nlJuiy2+3k2PgUVSKrAUh3sO
    KdBASyeDsvA3sQr3GXsJHxSpVwKBgQDGBQiREiHdgV3mDV6XPRYIbvPkdQGqdp1U
    fl/Zi2GamPneR+E9HmFM7s2K2znwXMrnsxFgQF+YuxrkMwCrdRTAh9XdG/1kJULB
    RumBFUIDELsQw17Zn7BzUTVYe0QeM+9yCeXsn9WWPoIzUmVlqqSjbxJ7LplSEW/y
    Z3adhHhNTwKBgQCMe0XCGKGvDtSP47ENlclbrbBJ/3raceV3bGm3WpzfRdz8bHWY
    tvUFVzeD9GRa/R4/ebb5x45acMTDn6Y/LIxaZW8pDNZKUp1Wfe7QHjyuE5ACS7Vp
    HzDWRYf0uqUKMijFGmR0dLPJBM9wOwVOD5ZYbhX/lBU1FLTAi0lguvaZEwKBgQCJ
    GnMT/rnz495fqmIT1PesXyX+yASfQgEsv1MeDKNHpyNaA+qvppk36x/lRGSZR6Y1
    RoaBXhDSbrnvxmBwVmBH7cTlkrue2y2dJLwH4/AQr0TWFm9VvnstXMzStoYzY0Im
    czP+4avAmwcLAcGy4rObdQwWvezqJaic7YXzCgVBgQKBgF543OQAcwCqu991MHeQ
    5vJOvTC+knwiAAqVuApMPCRGS9qtEESK0UxWJJSWNVmTwJcOTqt1ilGm8JlUcbzN
    ycYB9HjrQeD3g3bSoWybKFEjumnd4TzWFMma+3QVpg/s++R+fwmo+HkWtYAQtHs6
    XmtOadUxyJJv7X0tzD3+CQKa
    -----END PRIVATE KEY-----`,
    consumerId: '76d4c2ce-1714-4d9b-86a6-bee4987fa99d',
    keyVer: '1'
}

module.exports = walmartRouter; // Ensure this is correct

// async function saveProducts() {
//     try {
//             let url = BASE_URL + `api-proxy/service/affil/product/v2/items/11979182?storeId=2941`
//     // 11979182
//     //2941
//     //5434
//         let res = await fetchBody(url, headerData);
//         console.log(res);

//         // console.log("Products saved:", res);
//     } catch (error) {
//         console.error("Error saving products:", error);
//     }
// }

// saveProducts();
