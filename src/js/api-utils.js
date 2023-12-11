"use strict";

import { blinkingDots, renderSummariesTable } from "./html-utils.js";

/*
class DataIntegrityIssue {
    constructor(name, displayName, section, severity, description, recommendation, issuesIdType) {
      this.name = name;
      this.displayName = displayName;
      this.section = section;
      this.severity = severity;
      this.description = description;
      this.recommendation = recommendation;
      this.issuesIdType = issuesIdType;
    }

    emitTableRow() {
        var this_row = "<tr>";
        this_row += "<td>" + this.displayName + "</td>";
        this_row += "<td>" + this.section + "</td>";
        this_row += "<td>" + this.severity + "</td>";
        this_row += "<td>" + this.description + "</td>";
        this_row += "<td>" + this.recommendation + "</td>";
        this_row += "</tr>";
        return this_row;
    }
  } */

/* class DataIntegritySummary extends DataIntegrityIssue {
    constructor (name, displayName, section, severity, description, recommendation, issuesIdType,finishedTime,count,percentage) {
        super();
        this.finishedTime = finishedTime;
        this.count = count;
        this.percentage = percentage;

    }
}
 */

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

/* global dataIntegritySummaryResults */
export async function fetchUpdatedCachedResults() {
    try {
        console.log("Fetching updated cached results");
        const endpoint = "dataIntegrity/summary";
        const checks_to_run = await getChecksToRun();
        const summaries_to_run = endpoint + "?checks=" + checks_to_run.join(",");
        var cached_data = await d2Fetch(summaries_to_run);
        // eslint-disable-next-line no-global-assign
        dataIntegritySummaryResults = cached_data;
        console.log("Executed summary results");
        renderSummariesTable(cached_data);
    } catch (err) {
        console.log(err);
        return false;
    }
}

export async function refreshSingleSummary(name) {
    console.log("Fetching updated cached results");
    const endpoint = "dataIntegrity/summary?checks=" + name;
    try {
        fetch(baseUrl + endpoint, {
            method: "POST",
            credentials: "same-origin",
            redirect: "follow",
            //body: JSON.stringify(check_names),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(() => {
                const total_tries = 20;
                let tries = 0;

                function checkForResponse() {
                    fetch(baseUrl + endpoint, {
                        method: "GET",
                        credentials: "same-origin",
                        redirect: "follow",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                        .then(response => response.json())
                        .then(getData => {
                            var message_html = "<ul>"
                            message_html += "<li><p>Found " + Object.keys(getData).length + " summarry. Please wait." + blinkingDots() + "</p></li>";
                            message_html += "<li><p>Tries left:  " + (total_tries - tries) + "</p></li>";
                            message_html += "</ul>";
                            $("#messages").html(message_html);

                            //Not totally clear why we may get more checks than we asked for?
                            if (tries >= total_tries || Object.keys(getData).length >= 1) {
                                //eslint-disable-next-line no-global-assign
                                dataIntegritySummaryResults[Object.keys(getData)[0]] = getData[Object.keys(getData)[0]];
                                message_html = "<p>Data integrity summary refresh completed.</p>";
                                if (tries >= total_tries) {
                                    message_html += "<p>Maximum tries exceeded. Some summaries may be missing.</p>";
                                } else {
                                    message_html += "<p>The scheduled summary completed successfully.</p>";
                                }

                                $("#messages").html(message_html);
                                renderSummariesTable(dataIntegritySummaryResults);
                            } else {
                                tries++;
                                setTimeout(checkForResponse, 5_000);
                            }
                        })
                        .catch(error => {
                            console.error("Error checking for response:", error);
                        });
                }

                checkForResponse();
            })
            .catch(error => {
                console.error("Error making POST request:", error);
            });
    } catch (err) { console.log(err); }
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
                console.log(Object.keys(data).length + " checks found");
                resolve(data);
            }).catch(error => {
                console.error("Error fetching summary metadata:", error);
                reject(error);
            })
    });

}

async function getChecksToRun() {

    const excluded_checks = [
        "DATA_ELEMENTS_WITHOUT_DATA_SETS",
        "DATA_ELEMENTS_WITHOUT_GROUPS",
        "DATA_ELEMENTS_ASSIGNED_TO_DATA_SETS_WITH_DIFFERENT_PERIOD_TYPES",
        "DATA_ELEMENTS_VIOLATING_EXCLUSIVE_GROUP_SETS",
        "DATA_ELEMENTS_IN_DATA_SET_NOT_IN_FORM",
        "CATEGORY_COMBOS_BEING_INVALID",
        "DATA_SETS_NOT_ASSIGNED_TO_ORG_UNITS",
        "INDICATORS_WITH_IDENTICAL_FORMULAS",
        "INDICATORS_WITHOUT_GROUPS",
        "INDICATORS_WITH_INVALID_NUMERATOR",
        "INDICATORS_WITH_INVALID_DENOMINATOR",
        "INDICATORS_VIOLATING_EXCLUSIVE_GROUP_SETS",
        "PERIODS_DUPLICATES",
        "ORG_UNITS_WITH_CYCLIC_REFERENCES",
        "ORG_UNITS_BEING_ORPHANED",
        "ORG_UNITS_WITHOUT_GROUPS",
        "ORG_UNITS_VIOLATING_EXCLUSIVE_GROUP_SETS",
        "ORG_UNIT_GROUPS_WITHOUT_GROUP_SETS",
        "VALIDATION_RULES_WITHOUT_GROUPS",
        "VALIDATION_RULES_WITH_INVALID_LEFT_SIDE_EXPRESSION",
        "VALIDATION_RULES_WITH_INVALID_RIGHT_SIDE_EXPRESSION",
        "PROGRAM_INDICATORS_WITH_INVALID_EXPRESSIONS",
        "PROGRAM_INDICATORS_WITH_INVALID_FILTERS",
        "PROGRAM_INDICATORS_WITHOUT_EXPRESSION",
        "PROGRAM_RULES_WITHOUT_CONDITION",
        "PROGRAM_RULES_WITHOUT_PRIORITY",
        "PROGRAM_RULES_WITHOUT_ACTION",
        "PROGRAM_RULE_VARIABLES_WITHOUT_DATA_ELEMENT",
        "PROGRAM_RULE_VARIABLES_WITHOUT_ATTRIBUTE",
        "PROGRAM_RULE_ACTIONS_WITHOUT_DATA_OBJECT",
        "PROGRAM_RULE_ACTIONS_WITHOUT_NOTIFICATION",
        "PROGRAM_RULE_ACTIONS_WITHOUT_SECTION",
        "PROGRAM_RULE_ACTIONS_WITHOUT_STAGE_ID",
        //Fix this. Filter out slow checks
        "data_elements_aggregate_abandoned",
        "data_elements_aggregate_no_data"
    ].map(check => check.toLowerCase());

    const checks_array = [fetchSummaryMetadata(),
    fetchDataStoreKey("data-integrity", "excluded-checks"),
    fetchDataStoreKey("data-integrity", "included-checks")];

    //If there are any exclude checks in the datastore, use those instead
    const user_checks = await Promise.allSettled(checks_array);
    var all_checks = user_checks[0].value.map(check => check.name.toLowerCase());
    //If the user has specified any checks to exclude, remove them from the list
    var excluded_user_checks = user_checks[1].value;
    if (excluded_user_checks.length > 0) {
        excluded_user_checks = excluded_user_checks.map(check => check.toLowerCase());
        all_checks = all_checks.filter(check => !excluded_user_checks.includes(check));
    } else {
        all_checks = all_checks.filter(check => !excluded_checks.includes(check));
    }

    //If the user has specified any checks to include, add them to the list
    let included_user_checks = user_checks[2].value;
    if (included_user_checks) {
        included_user_checks = included_user_checks.map(check => check.toLowerCase());
        all_checks = all_checks.concat(included_user_checks);
    }
    const final_checks = Array.from(new Set(all_checks));
    return final_checks;

}

export async function fetchAllSummaries() {
    const checks_to_run = await getChecksToRun();
    await fetchNamedSummaries(checks_to_run);
}

function extractFinishedTimes(input) {
    const result = {};

    for (const key in input) {
        result[key] = input[key].finishedTime;
    }
    return result;
  }

export async function fetchNamedSummaries(checks_to_run) {

    const path = "dataIntegrity/summary";
    const summaries_to_run = path + "?checks=" + checks_to_run.join(",");
    const total_checks = checks_to_run.length;
    document.getElementById("run_checks").disabled = true;
    //Create a key value pair of all current checks and their timestamps
    // if nothing exists, use a long time ago
    var previous_cache_timestamps = {};
    const long_time_ago = "1970-01-01T00:00:00.000+0000";
    try {
        console.log("Fetching updated cached results");
        var cached_data = await d2Fetch(summaries_to_run);
        for (const check of checks_to_run) {
            if (cached_data[check]) {
                previous_cache_timestamps[check] = cached_data[check].finishedTime;
            } else
            previous_cache_timestamps[check] = long_time_ago;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

    var message_html = "Starting data integrity summary run...";
    $("#detailsReport").hide();
    $("#detailsButton").hide();
    $("#messages").html(message_html);

    fetch(baseUrl + summaries_to_run, {
        method: "POST",
        credentials: "same-origin",
        redirect: "follow",
        //body: JSON.stringify(check_names),
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(() => {
            const total_tries = 200;
            let tries = 0;
            var remaining_checks = checks_to_run;
            var completed_checks = [];

            function checkForResponse() {
                fetch(baseUrl + summaries_to_run, {
                    method: "GET",
                    credentials: "same-origin",
                    redirect: "follow",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then(response => response.json())
                    .then(getData => {
                        //There may be cached results already. Determine if they need to be replaced and how many are completed.
                        var is_final = false;
                        if (Object.keys(getData)) {
                            for (const [key, value] of Object.entries(getData)) {
                                if (value.finishedTime > previous_cache_timestamps[key]) {
                                    //Remove this check from the list of checks left to run
                                    const idx = remaining_checks.indexOf(key);
                                    if (idx !== -1) {remaining_checks.splice(idx, 1);}
                                    completed_checks.push(key);
                                    completed_checks = Array.from(new Set(remaining_checks));
                                }
                                dataIntegritySummaryResults[key] = value;
                        }
                        const updated_cache_timestamps = extractFinishedTimes(dataIntegritySummaryResults);
                        const final_keys = Object.keys(previous_cache_timestamps);
                        const timestamps_updated = final_keys.every(key =>  (updated_cache_timestamps[key] > previous_cache_timestamps[key]));
                        const all_checks_completed = final_keys.every(key => Object.keys(updated_cache_timestamps).includes(key));
                        is_final = timestamps_updated && all_checks_completed;

                        //Determine how many checks are left to run
                        //Update the messages in the UI
                        message_html = "<ul>"
                        message_html += "<li><p>Updated " + (total_checks - checks_to_run.length) + " of " + total_checks + " summaries. Please wait." + blinkingDots() + "</p></li>";
                        message_html += "<li><p>Tries left:  " + (total_tries - tries) + "</p></li>";
                        message_html += "<li><p>Time remaining:  " + Math.floor((total_tries - tries) * 5 / 60) + ":" + ((total_tries - tries) * 5 % 60).toString().padStart(2, "0") + "</p></li>";
                        message_html += "</ul>";
                        $("#messages").html(message_html);
                        }


                        //Not totally clear why we may get more checks than we asked for?
                        if (tries >= total_tries || is_final) {
                            //eslint-disable-next-line no-global-assign
                            dataIntegritySummaryResults = getData;
                            message_html = "<p>Data integrity summaries completed.</p>";
                            if (tries >= total_tries) {
                                message_html += "<p>Maximum tries exceeded. Some summaries may be missing.</p>";
                            } else {
                                message_html += "<p>All scheduled summaries completed successfully.</p>";
                            }
                            $("#messages").html(message_html);
                            document.getElementById("run_checks").disabled = false;
                            renderSummariesTable(dataIntegritySummaryResults);

                        } else {
                            renderSummariesTable(getData);
                            tries++;
                            setTimeout(checkForResponse, 5_000);
                        }
                    })
                    .catch(error => {
                        document.getElementById("run_checks").disabled = false;
                        console.error("Error checking for response:", error);
                    });
            }

            checkForResponse();
        })
        .catch(error => {
            message_html = "<p>Could not trigger a new data integrity run.</p>";
            $("#messages").html(message_html);
            console.error("Error making POST request:", error);
        })
}


export async function runIntegrityChecks() {
    console.log("Running integrity checks");
    $("run_checks").disabled = true;
    try {
        // eslint-disable-next-line no-global-assign
        await fetchAllSummaries();
    } catch (error) {
        console.error("Error running integrity checks:", error);
        return false;
    } finally {
        $("run_checks").disabled = false;
    }


}

export async function fetchDataStoreKey(namespace, key) {
    console.log("Fetching updated cached results");
    const endpoint = "dataStore/" + namespace + "/" + key;

    try {
        const response = await d2Fetch(endpoint);
        return response ? response : [];
    } catch (err) {
        console.log("Key not found");
        return [];
    }
}

function performPostAndGet(baseUrl, path) {
    return new Promise((resolve) => {

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
                        });
                }
                checkForResponse();
            })
            .catch(error => {
                console.error("Error making POST request:", error);
            });
    });
}
/* global renderDetailsTable */
export async function runDetails(code) {
    var path = "dataIntegrity/details?checks=" + code;
    $("#detailsReport").html("Please wait...");
    $("#detailsReport").show();
    await performPostAndGet(baseUrl, path)
        .then(data => {
            const name = Object.keys(data)[0];
            var this_check = data[name];
            //Put this in a global variable so we can access it later
            // eslint-disable-next-line no-unused-vars, no-undef
            currentDetails = this_check;
            var this_html = renderDetailsTable(this_check);
            $("#detailsButton").show();
            $("#detailsReport").html(this_html);
            $("#details").DataTable({ "paging": true, "searching": true, order: [[1, "asc"]] });
            const details_button = "<button onclick='detailsToCSV()'>Download as CSV</button>";
            $("#detailsReport").append(details_button);
        })
        .catch(error => {
            console.error("Error in runDetails:", error);
        });
}