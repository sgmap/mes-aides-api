/*
** Module dependencies
*/
var request = require('superagent');
var _ = require('lodash');
var util = require('util');
var config = require('../../config/config');
var mapSituation = require('./mapping').mapSituation;
var reverseMap = require('./mapping/reverse');
var periods = require('./mapping/periods');
var PRESTATIONS = require('./prestations');


function buildRequest(situation, debug) {
    return {
        intermediate_variables: debug,
        labels: true,
        scenarios: [{
            test_case: mapSituation(situation),
            period: 'month:' + periods.map(situation.dateDeValeur)
        }],
        variables: _.keys(PRESTATIONS)
    };
}

function calculate(situation, debug, callback) {
    request
        .post(config.openfiscaApi + '/api/1/calculate')
        .send(buildRequest(situation, debug))
        .end(function(err, response) {
            if (err) return callback(err);

            if (response.error) {
                console.log('Response body: ', util.inspect(response.body, { showHidden: true, depth: null }));
                return callback({ apiError: 'Communication error with OpenFisca' });
            }

            callback(null, response.body);
        });
}

function simulate(situation, callback) {
    var injectedRessources = _.unique(_.flatten(_.map(situation.individus, function(individu) {
        return _.uniq(_.map(individu.ressources, function(ressource) {
            return ressource.type;
        }));
    })));
    calculate(situation, false, function(err, response) {
        if (err) return callback(err);

        callback(null, reverseMap(response.value[0].familles[0], situation.dateDeValeur, injectedRessources));
    });
}

/*
** Exports
*/
exports.calculate = calculate;
exports.simulate = simulate;
exports.buildRequest = buildRequest;
