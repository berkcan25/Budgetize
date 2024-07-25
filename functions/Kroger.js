const express = require('express');
const axios = require('axios');

const krogerRouter = express.Router();


krogerRouter.get("/message", (req, res) => {
    res.json({ message: "Hello from server!" });
});
const URL = "https://api.kroger.com/v1"
const AUTH_URL = "https://api.kroger.com/v1/connect/oauth2/token"
const LOC_URL = "https://api.kroger.com/v1/locations"

const CLIENTID = process.env.KROGER_API_CLIENT_ID
const CLIENTSECRET = process.env.KROGER_API_CLIENT_SECRET

const scopes = {
    "Cart":"cart.basic:write",
    "Products":"product.compact",
    "Profile":"profile.compact"
}

function generateAuthPayloadHeaders(scope) {
    const key = btoa(`${CLIENTID}:${CLIENTSECRET}`)
    console.log(key)
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
    console.log(parameters)
    try {
        const response = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
            method: 'POST',
            headers: parameters.headers,
            body: parameters.payload
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        console.log(response.json());
        const data = await response.json();
        res.json({ accessToken: data.access_token });
    } catch (error) {
        console.error('Failed to get access token:', error);
        res.status(500).json({ error: error.message });
    }
});

krogerRouter.get("/getKrogerLocs", async (req, res) => {
    const headers = {
        "Accept":"application/json",
        "Authorization":`Bearer ${req.body.locKey}`
    }
    const payload = new URLSearchParams({"filter.latLong.near":req.body.latLong})
    try {
        const response = await fetch('https://api.kroger.com/v1/locations', {
            method: 'GET',
            headers: headers,
            body: payload
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        console.log(response.json());
        res.json(response);
    } catch (error) {
        console.error('Failed to get access token:', error);
        res.status(500).json({ error: error.message });
    }
})

module.exports = krogerRouter;
// getKrogerLocs(latitude, longitude, token);