import { Client } from "@googlemaps/google-maps-services-js";
import config from "../../config/config";

const client = new Client({});
const key = config.mapsApi;

function autocomplete(req, res, next) {
    client
        .placeAutocomplete({
            params: {
                ...req.query,
                key,
            },
        })
        .then(({ data }) => res.json(data.predictions))
        .catch((err) => next(err));
}

function geocode(req, res, next) {
    console.log(req);
    client
        .reverseGeocode({
            params: {
                ...req.query,
                key,
            },
        })
        .then(({ data }) => {
            const {
                formatted_address,
                place_id,
                address_components,
            } = data.results[0];
            const pincode =
                address_components[address_components.length - 1].long_name;
            res.json({
                pincode,
                formatted_address,
                place_id,
                result: data.results[0],
            });
        })
        .catch((err) => next(err));
}

export default {
    autocomplete,
    geocode,
};
