"use strict";

//JS
import $ from "jquery";
window.$ = $;
window.jQuery = $;
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


//CSS
import "./css/style.css";
import "./css/jquery.dataTables.min.css";

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
window.baseUrl = baseUrl;
window.dataIntegritySummaryResults = dataIntegritySummaryResults;
window.jobSummary = jobSummary;
window.currentDetails = currentDetails;
window.fetchUpdatedCachedResults = fetchUpdatedCachedResults;
window.renderSummariesTable = renderSummariesTable;
window.runIntegrityChecks = runIntegrityChecks;
window.runDetails = runDetails;
window.renderDetailsTable = renderDetailsTable;
window.summariesToCSV = summariesToCSV;
window.detailsToCSV = detailsToCSV;