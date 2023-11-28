'use strict';

//Fetch async from API
async function d2Fetch(endpoint) {
    return new Promise(function (resolve, reject) {
        'use strict';
        $.ajax({
            "type": "GET",
            "url": baseUrl + endpoint,
            "dataType": "json",
            "success": function (data) {
                resolve(data);
            },
            "error": function (err) {
                console.log(err)
                reject(false);
            }
        });
    });
}

async function d2Post(endpoint, body) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            "type": "POST",
            "url": baseUrl + endpoint,
            "dataType": "json",
            "data": body,
            "success": function (data) {
                resolve(data);
            },
            "error": function (err) {
                console.log(err)
                reject(false);
            }
        });
    });
}

export async function fetchUpdatedCachedResults() {
    console.log("Fetching updated cached results");
    const endpoint = "dataIntegrity/summary";
    var cached_data = await d2Fetch(endpoint);
    Promise.all([cached_data])
        .then(console.log("Executed summary results")).
        catch((err) => {
            console.log(err);
            return false;
        });
    renderSummariesTable(cached_data);
}

export function fetchAllSummaries() {
    const path = "dataIntegrity/summary";
    return new Promise((resolve, reject) => {
        fetch(baseUrl + path, {
            method: 'POST',
            credentials: 'same-origin',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                let tries = 0;

                function checkForResponse() {
                    fetch(baseUrl + path, {
                        method: 'GET',
                        credentials: 'same-origin',
                        redirect: 'follow',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(response => response.json())
                        //Not super clear how to know when everything has
                        //been processed. For now, we just wait for 5 seconds
                        //and try 5 times. New results can be fetched manually.
                        .then(getData => {
                            if (tries >= 5) {
                                resolve(getData);
                            } else {
                                renderSummariesTable(getData);
                                tries++;
                                console.log("Tries is: " + tries);
                                setTimeout(checkForResponse, 2000);
                            }
                        })
                        .catch(error => {
                            console.error('Error checking for response:', error);
                            reject(error);
                        });
                }

                checkForResponse();
            })
            .catch(error => {
                console.error('Error making POST request:', error);
                reject(error);
            });
    });
}

export async function runIntegrityChecks() {

    dataIntegritySummaryResults = await fetchAllSummaries();
    Promise.all([dataIntegritySummaryResults])
        .then(console.log("Executed summary results")).
        catch((err) => {
            console.log(err);
            return false;
        });
    renderSummariesTable(dataIntegritySummaryResults);
}


function performPostAndGet(baseUrl, path) {
    return new Promise((resolve, reject) => {
        fetch(baseUrl + path, {
            method: 'POST',
            credentials: 'same-origin',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                let tries = 0;

                function checkForResponse() {
                    fetch(baseUrl + path, {
                        method: 'GET',
                        credentials : 'same-origin',
                        redirect: 'follow',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(response => response.json())
                        .then(getData => {
                            if (Object.keys(getData).length > 0 || tries >= 10) {
                                resolve(getData);
                            } else {
                                tries++;
                                setTimeout(checkForResponse, 1000);
                            }
                        })
                        .catch(error => {
                            console.error('Error checking for response:', error);
                            reject(error);
                        });
                }

                checkForResponse();
            })
            .catch(error => {
                console.error('Error making POST request:', error);
                reject(error);
            });
    });
}

export function runDetails(code) {
    var path = "dataIntegrity/details?checks=" + code;
    performPostAndGet(baseUrl, path)
        .then(data => {
            const name = Object.keys(data)[0];
            var this_check = data[name];
            //Put this in a global variable so we can access it later
            currentDetails = this_check;
            var this_html = renderDetailsTable(this_check);
            $("#detailsReport").html(this_html);
            $("#details").DataTable({ "paging": true, "searching": true, order: [[1, 'asc']] });
        })
        .catch(error => {
            console.error("Error in runDetails:", error);
        });
}