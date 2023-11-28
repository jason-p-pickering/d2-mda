const dhisDevConfig = DHIS_CONFIG; // eslint-disable-line
const isDev = dhisDevConfig.hasOwnProperty("baseUrl") ? true : false; // eslint-disable-line
const baseUrl = isDev ? dhisDevConfig.baseUrl : "../../..";

import $ from "jquery";

//GET from API async
export const d2Get = async (endpoint) => {
    return new Promise(function (resolve, reject) {
        $.ajax({
            "type": "GET",
            "url": baseUrl + endpoint,
            "dataType": "json",
            ...isDev && { "headers": { "Authorization": "Basic " + btoa(dhisDevConfig.username + ":" + dhisDevConfig.password) } },
            "success": function (data) {
                resolve(data);
            },
            "error": function (err) {
                console.log("ERROR in GET:");
                console.log(err);
                reject(err);
            }
        });
    });
};

//POST to API async
export const d2PostJson = async (endpoint, body) => {
    return new Promise(function (resolve, reject) {
        $.ajax({
            "type": "POST",
            "url": baseUrl + endpoint,
            "dataType": "json",
            "data": body,
            ...isDev && { "headers": { "Authorization": "Basic " + btoa(dhisDevConfig.username + ":" + dhisDevConfig.password) } },
            "success": function (data) {
                resolve(data);
            },
            "error": function (err) {
                console.log("ERROR in POST:");
                console.log(err);
                reject(false);
            }
        });
    });
};