var _ = require('lodash');

var periods = require('./periods');
var PRESTATIONS = require('../prestations');


module.exports = function reverseMap(openFiscaFamille, date, injectedAids) {
    var period = periods.map(date);

    _.forEach(injectedAids, function(aid){
        delete PRESTATIONS[aid];
    });

    return _.mapValues(PRESTATIONS, function(format, prestationName) {
        var type = format.type,
            computedPrestation = openFiscaFamille[prestationName],
            result = computedPrestation[period];

        var uncomputabilityReason = openFiscaFamille[prestationName + '_non_calculable'] && openFiscaFamille[prestationName + '_non_calculable'][period];

        if (uncomputabilityReason) {
            return uncomputabilityReason;
        }

        if (format.montantAnnuel) {
            result *= 12;
        }

        if (type == Number) {
            result = Number(result.toFixed(2));
        }

        return result;
    });
};
