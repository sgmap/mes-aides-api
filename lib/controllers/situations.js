var mongoose = require('mongoose');
var _ = require('lodash');

var openfisca = require('../simulation/openfisca');
var mapping = require('../simulation/openfisca/mapping');

var Situation = mongoose.model('Situation');

exports.situation = function(req, res, next, id) {
    Situation.findById(id, function(err, situation) {
        if (err) return next(err);
        if (!situation) return res.sendStatus(404);

        req.situation = situation;
        next();
    });
};

exports.show = function show(req, res) {
    res.send(req.situation);
};

exports.update = function update(req, res, next) {
    req.situation
        .set('_updated', Date.now())
        .set(_.omit(req.body, 'status', 'token'))
        .save(function(err) {
            if (err) return next(err);

            res.send(req.situation);
        });
};

exports.submit = function submit(req, res, next) {
    req.situation.submit(function(err) {
        if (err) return next(err);

        res.send(req.situation);
    });
};

exports.create = function create(req, res, next) {
    Situation.create(_.omit(req.body, 'status', 'token'), function(err, situation) {
        if (err) return next(err);

        var cookieParams = { maxAge: 7 * 24 * 3600 * 1000, httpOnly: true };
        res.cookie('situation_' + situation.id, situation.token, cookieParams);
        res.send(situation);
    });
};

exports.simulation = function simulation(req, res, next) {
    req.situation.simulate(function(err, result) {
        if (err) return next(err);

        res.send(result);
    });
};

exports.openfiscaRequest = function openfiscaRequest(req, res) {
    res.send(mapping.buildOpenFiscaRequest(req.situation, true));
};

exports.openfiscaResponse = function openfiscaResponse(req, res, next) {
    openfisca.calculate(req.situation, true, function(err, result) {
        if (err) return next(err);

        res.send(result);
    });
};

function createOpenFiscaTestSituation(situation) {
    var openfiscatest = mapping.buildOpenFiscaRequest(situation, true);
    var testCase = openfiscatest.scenarios[0].test_case;
    var entities = {
        period: openfiscatest.scenarios[0].period,
        familles: testCase.familles,
        foyers_fiscaux: testCase.foyers_fiscaux,
        individus: testCase.individus,
        menages: testCase.menages,
    };

    return entities;
}

function toStringOf(obj) {
    return obj.toString();
}

var ID_PROPERTIES = {
    familles: ['enfants', 'parents'],
    foyers_fiscaux: ['declarants', 'personnes_a_charge'],
    individus: ['id'],
    menages: ['conjoint', 'enfants', 'personne_de_reference'],
};

function normalizeIDs(test) {
    Object.keys(ID_PROPERTIES).forEach(function(entity) {
        if (test[entity]) {
            test[entity].forEach(function(value, index) {
                ID_PROPERTIES[entity].forEach(function(property) {
                    if (test[entity][index][property] instanceof Array)
                        test[entity][index][property] = test[entity][index][property].map(toStringOf);
                    else if (test[entity][index][property])
                        test[entity][index][property] = test[entity][index][property].toString();
                });
            });
        }
    });
}

function toYAML(test) {
    normalizeIDs(test);
    return require('js-yaml').safeDump(test);
}

var TEST_ATTRIBUTES = [
    'name',
    'description',
    'output_variables',
    'absolute_error_margin',
];

exports.openfiscaTest = function openfiscaTest(req, res) {
    var test = _.assign(_.pick(req.body, TEST_ATTRIBUTES), createOpenFiscaTestSituation(req.situation));
    return res.type('yaml').send(toYAML(test));
};
