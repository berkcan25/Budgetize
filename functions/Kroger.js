const express = require('express');
const axios = require('axios');
require('dotenv').config()

const krogerRouter = express.Router();


krogerRouter.get("/message", (req, res) => {
    res.json({ message: "Hello from server!" });
});
const URL = "https://api.kroger.com/v1"
const AUTH_URL = "https://api.kroger.com/v1/connect/oauth2/token"
const LOC_URL = "https://api.kroger.com/v1/locations"

const CLIENTID = process.env.KROGER_API_CLIENT_ID
const CLIENTSECRET = process.env.KROGER_API_CLIENT_SECRET

// const CLIENTID = "budgetize-ffa07e567c5d53923ee3d9d6cf9f617d4740238017845917698"
// const CLIENTSECRET = "14A80ucnF8a8Vecb6IClTNz1S8GX8nz5cEbNSBxk"

const scopes = {
    "Cart":"cart.basic:write",
    "Products":"product.compact",
    "Profile":"profile.compact"
}

function generateAuthPayloadHeaders(scope) {
    // console.log(`${CLIENTID}:${CLIENTSECRET}`)
    const key = btoa(`${CLIENTID}:${CLIENTSECRET}`)
    // console.log(key)
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${key}`
    }
    let payload;
    if (scope !== "Location") {
        payload = new URLSearchParams({
            grant_type: "client_credentials",
            scope: scope
        })
    } else {
        payload = new URLSearchParams({
            grant_type: "client_credentials",
        })
    }
    return {payload, headers}
}

krogerRouter.post("/getKrogerToken", async (req, res) => {
    let scope = req.body.scope;
    parameters = generateAuthPayloadHeaders(scope);
    // console.log(parameters)
    try {
        const response = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
            method: 'POST',
            headers: parameters.headers,
            body: parameters.payload
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        res.json({ accessToken: data.access_token });
    } catch (error) {
        console.error('Failed to get access token:', error);
        res.status(500).json({ error: error.message });
    }
});

krogerRouter.post("/getKrogerLocs", async (req, res) => {
    console.log(req.body.locKey);
    const headers = {
        "Accept":"application/json",
        "Authorization":`Bearer ${req.body.locKey}`
    }
    console.log(headers)
    // const payload = new URLSearchParams({"filter.latLong.near":req.body.latLong})
    try {
        const response = await fetch(`https://api.kroger.com/v1/locations?filter.latLong.near=${req.body.latLong}`, {
            method: 'GET',
            headers: headers,
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json()
        console.log(data[0].geolocation);
        res.json(response);
    } catch (error) {
        console.error('Failed to get access token:', error);
        res.status(500).json({ error: error.message });
    }
})

module.exports = krogerRouter;
// getKrogerLocs(latitude, longitude, token);