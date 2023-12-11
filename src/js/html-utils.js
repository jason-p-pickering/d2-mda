
"use strict";

function parsePercentage(percentage) {
    if (percentage) {
        return Math.round(parseFloat(percentage)) + "%";
    } else {
        return "N/A";
    }
}

function emitDetailsButton(count, name) {
    if (count > 0) {
        return '<button onclick="runDetails(\'' + name + '\')">Details</button>';
    } else {
        return "-";
    }
}

function emitRefreshButton(name) {

    return '<button onclick="refreshSingleSummary(\'' + name + '\')">Refresh</button>';

}

//* global $, DataTable *//
export function renderSummariesTable(summaryObject) {
    console.log("Rendering summary table")
    const checks_name = Object.keys(summaryObject);

    var html = "<div id='summary_table'><h2>Data Integrity Summaries</h2>";
    html += "<table id='summary' class='display' width='100%'>";
    html += "<thead><tr><th>Section</th><th>Integrity check</th><th>Severity</th><th>Count</th><th>Percentage</th><th>Details</th><th>Refresh</th></tr></thead><tbody>";

    for (var i = 0; i < checks_name.length; i++) {
        var this_key = checks_name[i];
        var result = summaryObject[this_key];
        html += "<tr>";
        html += "<td>" + ((result?.section) ?? "-") + "</td>";
        html += "<td>" + ((result?.description) ?? "-") + "</td>";
        html += "<td>" + ((result?.severity) ?? "UNKNOWN") + "</td>";
        html += "<td>" + ((result?.count) ?? "-") + "</td>";
        html += "<td>" + ((parsePercentage(result.percentage)) ?? "N/A") + "</td>";
        html += "<td>" + emitDetailsButton(result.count, result.name) + "</td>";
        html += "<td>" + emitRefreshButton(result.name) + "</td>";
        html += "</tr>";
    }
    html = html + "</tbody></table></div>"

    $("#summaryTable").html(html); // eslint-disable-line no-undef
    $("#summary").DataTable({ "paging": true, "searching": true, order: [[3, 'desc']], stateSave: true }); // eslint-disable-line no-undef

}

export function renderDetailsTable(detailsObject) {

    var html = "<div id='details_table'><h2>Details</h2>";
    html += "<h3>Issue: " + detailsObject.description + "</h3>";
    html += "<h3>Severity: " + detailsObject.severity + "</h3>";
    html += "<h3>Introduction</h3>" + "<p>" + ((detailsObject?.introduction) ?? "-")  + "</p>";
    html += "<h3>Recommendation</h3>" + "<p>" + ((detailsObject?.recommendation) ?? "-") + "</p>";
    html += "<table id='details' class='display' width='100%'>";
    html += "<thead><tr><th>Name</th><th>ID</th><th>Comment</th></thead><tbody>";

    detailsObject.issues.forEach((issue) => {
        html += "<tr>";
        html += "<td>" + issue.name + "</td>";
        html += "<td>" + issue.id + "</td>";
        html += "<td>" + ((issue?.comment) ?? "-") + "</td>";
        html += "</tr>";
    });

    html += "</tbody></table></div>"

    return html;
}

export function blinkingDots() {
  let html = '<svg height="40" width="40" class="loader">';
  html += '<circle class="dot" cx="10" cy="20" r="3" style="fill:grey;" />';
  html += '<circle class="dot" cx="20" cy="20" r="3" style="fill:grey;" />';
  html += '<circle class="dot" cx="30" cy="20" r="3" style="fill:grey;" />';
  html += '</svg>';

    return html;
}