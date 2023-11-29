"use strict";

export function getContextPath() {
    var ctx = window.location.pathname.substring(0, window.location.pathname.indexOf("/", 2));
    if (ctx === "/api") {
        return "";
    }
    return ctx;
}

export var baseUrl = getContextPath() + "/api/";
