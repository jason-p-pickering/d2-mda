"use strict";

//Fetch async from API
/* global $ baseUrl */
async function d2Fetch(endpoint) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            "type": "GET",
            "url": baseUrl + endpoint,
            "dataType": "json",
            "success": function (data) {
                resolve(data);
            },
            "error": function (err) {
                console.log(err);
                reject(false);
            }
        });
    });
}

/* global renderSummariesTable */
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

export async function fetchSummaryMetadata() {

    const path = "dataIntegrity";
    return new Promise((resolve, reject) => {
        fetch(baseUrl + path, {
            method: "GET",
            credentials: "same-origin",
            redirect: "follow",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                console.log(Object.keys(data).length + " checks found");
                resolve(data);
            }).catch(error => {
                console.error("Error fetching summary metadata:", error);
                reject(error);
            })});

}

export async function fetchAllSummaries() {
    const checks = await fetchSummaryMetadata();
    const check_names = checks.map(check => check.name);
    //Exclude certain slow running checks
    const excluded_checks = [
    "INDICATORS_WITH_INVALID_NUMERATOR",
    "INDICATORS_WITH_INVALID_DENOMINATOR",
    "PROGRAM_INDICATORS_WITH_INVALID_EXPRESSIONS",
    "PROGRAM_INDICATORS_WITH_INVALID_FILTERS",
    "VALIDATION_RULES_WITH_INVALID_LEFT_SIDE_EXPRESSION",
    "VALIDATION_RULES_WITH_INVALID_RIGHT_SIDE_EXPRESSION"].map(check => check.toLowerCase());

    const checks_to_run = check_names.filter(check => !excluded_checks.includes(check));
    const path = "dataIntegrity/summary";
    const summaries_to_run = path + "?checks=" + checks_to_run.join(",");

    return new Promise((resolve, reject) => {
        var message_html = "Starting data integrity summary run...";
        $("#messages").html(message_html);
        fetch(baseUrl + summaries_to_run, {
            method: "POST",
            credentials: "same-origin",
            redirect: "follow",
            body: JSON.stringify(check_names),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(() => {
                const total_tries = 60;
                let tries = 0;

                function checkForResponse() {
                    fetch(baseUrl + path, {
                        method: "GET",
                        credentials: "same-origin",
                        redirect: "follow",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then(response => response.json())
                        .then(getData => {
                            message_html = "<ul>"
                            message_html += "<li><p>Found " + Object.keys(getData).length + " of " + checks_to_run.length + " summaries. Please wait...</p></li>";
                            message_html += "<li><p>Tries left:  " + (total_tries - tries) + "</p></li>";
                            message_html += "</ul>";
                            $("#messages").html(message_html);
                            //Not totally clear why we may get more checks than we asked for?
                            if (tries >= total_tries || Object.keys(getData).length  >= checks_to_run.length) {
                                message_html = "<p>Data integrity summaries completed.</p>";
                                if (tries >= total_tries) {
                                    message_html += "<p>Maximum tries exceeded. Some summaries may be missing.</p>";
                                } else {
                                    message_html += "<p>All scheduled summaries completed successfully.</p>";
                                }

                                $("#messages").html(message_html);
                                resolve(getData);
                            } else {
                                renderSummariesTable(getData);
                                tries++;
                                setTimeout(checkForResponse, 5000);
                            }
                        })
                        .catch(error => {
                            console.error("Error checking for response:", error);
                            reject(error);
                        });
                }

                checkForResponse();
            })
            .catch(error => {
                console.error("Error making POST request:", error);
                reject(error);
            });
    });
}

/* global dataIntegritySummaryResults */
export async function runIntegrityChecks() {

    // eslint-disable-next-line no-global-assign
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
            method: "GET",
            credentials: "same-origin",
            redirect: "follow",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(response => response.json())
            .then(initial_data => {
                if (Object.keys(initial_data).length > 0) {
                    resolve(initial_data);
                } else {
                    fetch(baseUrl + path, {
                        method: "POST",
                        credentials: "same-origin",
                        redirect: "follow",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }).then(response => response.json())
                        .then(() => {
                            let tries = 0;
                            function checkForResponse() {
                                fetch(baseUrl + path, {
                                    method: "GET",
                                    credentials: "same-origin",
                                    redirect: "follow",
                                    headers: {
                                        "Content-Type": "application/json",
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
                                        console.error("Error checking for response:", error);
                                        reject(error);
                                    });
                            }
                            checkForResponse();
                        })
                        .catch(error => {
                            console.error("Error making POST request:", error);
                            reject(error);
                        });
                }
            })
            .catch(error => {
                console.error("Error checking for response:", error);
                reject(error);
            });
    });
}
/* global renderDetailsTable */
export function runDetails(code) {
    var path = "dataIntegrity/details?checks=" + code;
    performPostAndGet(baseUrl, path)
        .then(data => {
            const name = Object.keys(data)[0];
            var this_check = data[name];
            //Put this in a global variable so we can access it later
            // eslint-disable-next-line no-unused-vars, no-undef
            currentDetails = this_check;
            var this_html = renderDetailsTable(this_check);
            $("#detailsReport").html(this_html);
            $("#details").DataTable({ "paging": true, "searching": true, order: [[1, "asc"]] });
        })
        .catch(error => {
            console.error("Error in runDetails:", error);
        });
}