var _ = require('lodash');
var moment = require('moment');
var common = require('./common');

module.exports = {
    declarants: {
        fn: function(situation) {
            return _.map(_.filter(situation.individus, function(individu) {
                return _.includes(['demandeur', 'conjoint'], individu.role);
            }), 'id');
        },
        copyTo3PreviousMonths: false,
    },
    // Today, in mes-aides, all children and only them are transmitted to Openfisca as personnes à charge
    personnes_a_charge: {
        fn: common.getEnfants,
        copyTo3PreviousMonths: false,
    },
    rfr: {
        fn: function (situation) {
            if (typeof situation.rfr == 'number') {
                var anneeFiscaleN2 = moment(situation.dateDeValeur).subtract(2, 'years').year();
                var result = {};
                result[anneeFiscaleN2] = situation.rfr;
                return result;
            }
        },
        copyTo3PreviousMonths: false,
    }
};
