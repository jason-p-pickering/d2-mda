"use strict";

//JS
import $ from "jquery";
window.$ = $;
window.jQuery = $;
//import { d2Get } from "./js/d2api.js";
import DataTable from "datatables.net";
window.DataTable = DataTable;
import {getContextPath} from "./js/utils.js";
import { fetchUpdatedCachedResults } from "./js/api-utils.js";
import { runIntegrityChecks } from "./js/api-utils.js";
import { runDetails } from "./js/api-utils.js";
import "./js/api-utils.js";
import {summariesToCSV} from "./js/csv-utils.js";
import {detailsToCSV} from "./js/csv-utils.js";
import {renderSummariesTable} from "./js/html-utils.js";
import { renderDetailsTable } from "./js/html-utils.js";
import { fetchSummaryMetadata } from "./js/api-utils.js";


//CSS
import "./css/style.css";
import "./css/jquery.dataTables.min.css"

//Test setup by calling API
/* async function testApi() {
    var sysInfo = await d2Get("/api/system/info.json");
    console.log(sysInfo.version);
}
testApi();
 */
//Global variables
var jobSummary = [];
var dataIntegritySummaryResults = [];
var currentDetails = [];
var baseUrl = getContextPath() + "/api/";
console.log("Baseurl is : ", baseUrl);
window.baseUrl = baseUrl;
window.dataIntegritySummaryResults = dataIntegritySummaryResults;
window.jobSummary = jobSummary;
window.currentDetails = currentDetails;
window.fetchUpdatedCachedResults = fetchUpdatedCachedResults;
window.renderSummariesTable = renderSummariesTable;
window.runIntegrityChecks = runIntegrityChecks;
window.DataTable = DataTable;
window.runDetails = runDetails;
window.renderDetailsTable = renderDetailsTable;
window.summariesToCSV = summariesToCSV;
window.detailsToCSV = detailsToCSV;
window.fetchSummaryMetadata = fetchSummaryMetadata;


document.addEventListener('DOMContentLoaded', function () {
    fetchUpdatedCachedResults();
    let foo = fetchSummaryMetadata();
    console.log(foo);
});