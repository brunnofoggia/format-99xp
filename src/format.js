import _ from "lodash";
import CryptoJS from "crypto-js";


// Format moment
var formatMoment = {
    "FROMREMOTE": 0,
    "TOREMOTE": 1
};

var format = function (value, format, moment, options = {}) {
    var formattedValue,
        defaults = { style: "currency", currency: "BRL", lang: "pt-BR" },
        type = typeof format;
    switch (type) {
        case "function":
            formattedValue = format(value, moment);
            break;
        default:
            if (typeof value !== "undefined" && value !== null) {
                value = !_.isObject(value) && !_.isBoolean(value) ? value + "" : value;

                var formatConfig = typeof format === 'object' ? format : { type: format },
                    formatOption = formatConfig.type;
                switch (formatOption) {
                    case "regex":
                        // search replace
                        value && (formattedValue = value.replace(format.search[moment], format.replace[moment]));
                        break;
                    case "json":
                        try {
                            formattedValue = moment === formatMoment.FROMREMOTE ? JSON.parse(value) : JSON.stringify(value);
                        } catch (e) {
                            formattedValue = moment === formatMoment.FROMREMOTE ? JSON.parse("null") : JSON.stringify(null);
                        }
                        break;
                    case "objectArray": // used to convert a json indexed object to server as an array and the opp
                        formattedValue = value;
                        if (moment === formatMoment.FROMREMOTE) {
                            if (!_.isArray(value)) formattedValue = value;
                            else if (!formatConfig.index) formattedValue = _.toObject(value);
                            else {
                                formattedValue = _.mapKeys(value, formatConfig.index);
                            }
                        } else {
                            formattedValue = !_.isPlainObject(value) ? value : _.toArray(value);
                        }

                        break;
                    case "date":
                        formattedValue = moment === formatMoment.FROMREMOTE
                            ? value.replace(/(\d{4})\-(\d{2})\-(\d{2})/, "$3/$2/$1")
                            : value.replace(
                                /(\d{2})\/(\d{2})\/(\d{4})/,
                                "$3-$2-$1"
                            );
                        break;
                    case "decimal":
                    case "float":
                        options = _.defaults(options, defaults);
                        formattedValue = moment === formatMoment.FROMREMOTE
                            ? new Intl.NumberFormat(options.lang, options)
                                .format(value)
                                .replace(/[^0-9\.\,]/g, "")
                            : parseFloat(
                                value
                                    .replace(/\./g, "")
                                    .replace(/\,/g, ".")
                                    .replace(/[^0-9\.\,]/g, "")
                            );
                        break;
                    case "integer":
                    case "int":
                        formattedValue = parseInt(
                            value
                                .replace(/\./g, "")
                                .replace(/\,/g, "")
                                .replace(/\D/g, ""),
                            10
                        );
                        break;
                    case "boolean":
                    case "bool":
                        formattedValue = moment === formatMoment.FROMREMOTE ? (value === true ? '1' : '0') : (value === '1' ? true : false);
                        break;
                    case "lowercase":
                        formattedValue = value.toLowerCase();
                        break;
                    case "uppercase":
                        formattedValue = value.toUpperCase();
                        break;
                    case "capitalize":
                        formattedValue = (value && value[0].toUpperCase() + value.slice(1).toLowerCase()) || ""
                        break;
                    case "send-md5":
                        formattedValue = moment === formatMoment.FROMREMOTE ? value : CryptoJS.MD5(value).toString();
                        break;
                    case "send-sha256":
                        formattedValue = moment === formatMoment.FROMREMOTE ? value : CryptoJS.SHA256(value).toString();
                        break;
                    // legacy options
                    case "int-str":
                        formattedValue = value
                            .replace(/\./g, "")
                            .replace(/\,/g, "")
                            .replace(/\D/g, "");
                        break;
                    case "decimal-str":
                        formattedValue = moment === formatMoment.FROMREMOTE
                            ? value.replace(/\,/g, "").replace(/\./g, ",")
                            : value.replace(/\./g, "").replace(/\,/g, ".");
                        break;
                    case "float-str":
                        options = _.defaults(options, defaults);
                        formattedValue = moment === formatMoment.FROMREMOTE
                            ? new Intl.NumberFormat(options.lang, options)
                                .format(value)
                                .replace(/[^0-9\.\,]/g, "")
                            : value
                                .replace(/\./g, "")
                                .replace(/\,/g, ".")
                                .replace(/[^0-9\.\,]/g, "");
                        break;
                    case "array":
                        formattedValue = _.isArray(value) ? value : _.isPlainObject(value) ? _.toArray(value) : value;
                        break;
                    case "sendAsArray": // used to convert a json indexed object to server as an array
                        if (moment === formatMoment.FROMREMOTE) {
                            formattedValue = value;
                        } else {
                            formattedValue = !_.isPlainObject(value) ? value : _.toArray(value);
                        }
                        break;
                    case "receiveAsObject": // used to convert a server array to object
                        if (moment === formatMoment.FROMREMOTE) {
                            formattedValue = !_.isArray(value) ? value : _.toObject(value);
                        } else {
                            formattedValue = value;
                        }
                        break;
                }
            }
            break;
    }

    return formattedValue;
};

export { format, formatMoment }
