"use strict";

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
  }

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

/* global renderSummariesTable */
export async function fetchUpdatedCachedResults() {
    console.log("Fetching updated cached results");
    const endpoint = "dataIntegrity/summary";
    var cached_data = await d2Fetch(endpoint);
    Promise.all([cached_data])
        .then(() => {
            console.log("Executed summary results")}).
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

                var data_integrity_issues = [];
                data.forEach(issue => {
                    var this_issue = new DataIntegrityIssue(
                        issue.name,
                        issue.displayName,
                        issue.section,
                        issue.severity,
                        issue.description,
                        issue.recommendation,
                        issue.issuesIdType
                    );
                    data_integrity_issues.push(this_issue);
                })
                console.log(data_integrity_issues);
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
    //Exclude all Java based checks
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

    const checks_to_run = check_names.filter(check => !excluded_checks.includes(check));
    console.log("Planning to run checks", checks_to_run);
    const path = "dataIntegrity/summary";
    const summaries_to_run = path + "?checks=" + checks_to_run.join(",");
    document.getElementById("run_checks").disabled = true;

    return new Promise((resolve, reject) => {
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

                            //Merge the new data with the existing data
                            const got_keys = Object.keys(getData);
                            if (got_keys.length > 0) {
                                //Merge the new data with the existing data
                                for(var i = 0; i < got_keys.length; i++) {
                                    var this_check = getData[got_keys[i]];
                                    var existing_check = dataIntegritySummaryResults[got_keys[i]];
                                    if (existing_check) {
                                        dataIntegritySummaryResults[existing_check] = this_check;
                                    } else {
                                        dataIntegritySummaryResults.push(this_check);
                                    }
                                }
                            }

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
                                document.getElementById("run_checks").disabled = false;
                                resolve(getData);
                            } else {
                                renderSummariesTable(getData);
                                tries++;
                                setTimeout(checkForResponse, 5_000);
                            }
                        })
                        .catch(error => {
                            document.getElementById("run_checks").disabled = false;
                            console.error("Error checking for response:", error);
                            reject(error);
                        });
                }

                checkForResponse();
            })
            .catch(error => {
                console.error("Error making POST request:", error);
                reject(error);
            })
    });
}

/* global dataIntegritySummaryResults */
export async function runIntegrityChecks() {
    console.log("Running integrity checks");
    $("run_checks").disabled = true;
    // eslint-disable-next-line no-global-assign
    dataIntegritySummaryResults = await fetchAllSummaries();
    Promise.all([dataIntegritySummaryResults])
        .then(console.log("Executed summary results")).
        catch((err) => {
            console.log(err);
            return false;
        });

    renderSummariesTable(dataIntegritySummaryResults);
    $("run_checks").disabled = false;
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
            $("#detailsReport").show();
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