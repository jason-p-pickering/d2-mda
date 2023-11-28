export function summariesToCSV(summary_results) {
    var csv_data = [];
    console.log("summary_results", summary_results);
    csv_data.push('"Section","Name","Severity","Description","Count","Percentage","Details"');
    var issue_keys = Object.keys(summary_results);
    console.log("issue_keys", issue_keys);
    for (var i = 0; i < issue_keys.length; i++) {
        var csv_row = [];
        var result = summary_results[issue_keys[i]];
        if (i == 1) {
            console.log("result", result);
        }
        csv_row.push('"' + (result?.section ?? "-") + '"');
        csv_row.push('"' + (result?.displayName ?? "-") + '"');
        csv_row.push('"' + (result?.severity ?? "-") + '"');
        csv_row.push('"' + (result?.description ?? "-") + '"');
        csv_row.push('"' + (result?.count ?? "-") + '"');
        csv_row.push('"' + (result?.percentage ?? "-") + '"');
        csv_data.push(csv_row.join(','));
    }
    csv_data = csv_data.join('\n');
    downloadCSVFile(csv_data, "metdata_integrity_summary");
}
/* global currentDetails */
export function detailsToCSV() {
    var csv_data = [];
    console.log("currentDetails", currentDetails);
    csv_data.push('"ID","Name","Comment"');
    currentDetails.issues.forEach((issue) => {
        var csv_row = [];
        csv_row.push('"' + (issue?.id ?? "-") + '"');
        csv_row.push('"' + (issue?.name ?? "-") + '"');
        csv_row.push('"' + (issue?.comment ?? "-") + '"');
        csv_data.push(csv_row.join(','));
    });
    csv_data = csv_data.join('\n');
    downloadCSVFile(csv_data, currentDetails.name);
}

function downloadCSVFile(csv_data, filename) {
    var CSVFile = new Blob([csv_data], {
        type: "text/csv"
    });
    var temp_link = document.createElement('a');
    temp_link.download = filename + ".csv";
    var url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);
    temp_link.click();
    document.body.removeChild(temp_link);
}