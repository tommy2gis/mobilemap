/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:32:01 
 * @Last Modified by: 史涛
 * @Last Modified time: 2020-05-07 10:17:41
 */

const DEFAULT_SCREEN_DPI = 96;
const EXTENT_TO_ZOOM_HOOK = 'EXTENT_TO_ZOOM_HOOK';
const RESOLUTIONS_HOOK = 'RESOLUTIONS_HOOK';
const RESOLUTION_HOOK = 'RESOLUTION_HOOK';
const COMPUTE_BBOX_HOOK = 'COMPUTE_BBOX_HOOK';
const GET_PIXEL_FROM_COORDINATES_HOOK = 'GET_PIXEL_FROM_COORDINATES_HOOK';
const GET_COORDINATES_FROM_PIXEL_HOOK = 'GET_COORDINATES_FROM_PIXEL_HOOK';

var hooks = {};


function registerHook(name, hook) {
    hooks[name] = hook;
}

function getHook(name) {
    return hooks[name];
}

function executeHook(hookName, existCallback, dontExistCallback) {
    const hook = getHook(hookName);
    if (hook) {
        return existCallback(hook);
    }
    if (dontExistCallback) {
        return dontExistCallback();
    }
    return null;
}

function isSimpleGeomType(geomType) {
    switch (geomType) {
        case "MultiPoint": case "MultiLineString": case "MultiPolygon": return false;
        case "Point": case "LineString": case "Polygon": case "Circle": default: return true;
    }
}

function getSimpleGeomType(geomType = "Point") {
    switch (geomType) {
        case "Point": case "LineString": case "Polygon": case "Circle": return geomType;
        case "MultiPoint": return "Point";
        case "MultiLineString": return "LineString";
        case "MultiPolygon": return "Polygon";
        default: return geomType;
    }
}

function defaultGetZoomForExtent(extent, mapSize,maxZoom) {
    const wExtent = extent[2] - extent[0];
    const hExtent = extent[3] - extent[1];

    const xResolution = Math.abs(wExtent / mapSize.width);
    const yResolution = Math.abs(hExtent / mapSize.height);
    const extentResolution = Math.max(xResolution, yResolution);

    const resolutions = [];
    for (var i = 0; i < 21; i++) {
        resolutions[i] = 1.40625 / Math.pow(2, i);
    };

    const {zoom, ...other} = resolutions.reduce((previous, resolution, index) => {
        const diff = Math.abs(resolution - extentResolution);
        return diff > previous.diff ? previous : {diff: diff, zoom: index};
    }, {diff: Number.POSITIVE_INFINITY, zoom: 0});

    return Math.max(0, Math.min(zoom, maxZoom));
}


module.exports = {
    EXTENT_TO_ZOOM_HOOK,
    RESOLUTIONS_HOOK,
    RESOLUTION_HOOK,
    COMPUTE_BBOX_HOOK,
    GET_PIXEL_FROM_COORDINATES_HOOK,
    GET_COORDINATES_FROM_PIXEL_HOOK,
    DEFAULT_SCREEN_DPI,
    isSimpleGeomType,
    getSimpleGeomType,
    registerHook,
    defaultGetZoomForExtent,
    getHook,
};
