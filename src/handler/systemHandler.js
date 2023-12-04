const _ = require('lodash');

export const omitValuesFromObject = (object, values) => {
    return _.omit(object, values);
}