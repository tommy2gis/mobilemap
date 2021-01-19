/*
 * @Author: 史涛 
 * @Date: 2019-01-05 19:33:37 
 * @Last Modified by: 史涛
 * @Last Modified time: 2021-01-18 17:05:37
 */


const Layers = require('../../utils/map/LayersUtils');
const L = require('leaflet');
import { dynamicMapLayer, featureLayer,tiledMapLayer } from 'esri-leaflet';

const { GeoWMTS,
    GeoTDTWMTS } = require('../../utils/map/WMTS.TDT');




const createDynamicMapLayer = options => {
    return dynamicMapLayer(options);
};
Layers.registerType('ersidylayer', { create: createDynamicMapLayer});

const createTiledMapLayer= options => {
    return tiledMapLayer(options);
};
Layers.registerType('ersitiledlayer', { create: createTiledMapLayer});

const createFeatureLayer = options => {
    return featureLayer(options);
};
Layers.registerType('ersifealayer', { create: createFeatureLayer});


const createWmsLayer = options =>{
    return L.tileLayer.wms(options.url, {
        layers: options.layername,
        styles: 'default',
        format: 'image/png',
        transparent: true
    });
}

Layers.registerType('ersiwmslayer',{create:createWmsLayer});