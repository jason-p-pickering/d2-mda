"use strict";

//JS
import $ from "jquery";
window.$ = $;
window.jQuery = $;
import { d2Get } from "./js/d2api.js";
import DataTable from "datatables.net";
window.DataTable = DataTable;
import {getContextPath} from "./js/utils.js";
import { fetchUpdatedCachedResults } from "./js/api-utils.js";
import "./js/api-utils.js";
import "./js/csv-utils.js";
import "./js/html-utils.js";

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