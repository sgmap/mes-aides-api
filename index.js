var express = require('express');
var mongoose = require('mongoose');
var config = require('./lib/config/config');
var ludwigApi = require('ludwig-api');
var reverseMap = require('./lib/simulation/openfisca/mapping/reverse');

// Setup mongoose
require('./lib/config/mongoose')(mongoose, config);

// Setup Express
var app = express();

// Mount Ludwig API
var Situation = mongoose.model('Situation');

app.use(ludwigApi({

    mongoose: mongoose,

    possibleValues: require('./lib/config/ludwig'),

    simulate: function (acceptanceTest, done) {
        Situation.findById(acceptanceTest.scenario.situationId).exec(function (err, situation) {
            if (err) return done(err);
            if (!situation) return done(new Error('Situation not found'));
            situation.simulate(function(err, result) {
                if (! err) {
                    return done(err, result && reverseMap(result, situation).calculatedPrestations);
                }
                console.error(err);
                var bogusResult = {};
                acceptanceTest.expectedResults.forEach(function(expectedResult) {
                    bogusResult[expectedResult.code] = 'ERROR!' + expectedResult.expectedValue;
                });
                return done(null, bogusResult);
            });
        });
    },

    onCreate: function (acceptanceTest, done) {
        var situationId = acceptanceTest.scenario.situationId;

        Situation.findById(situationId).exec(function (err, situation) {
            if (err) return done(err);
            if (!situation) return done(new Error('Situation not found'));
            situation.set('status', 'test');
            situation.save(done);
        });
    }

}));

// Setup api
require('./lib/config/api')(app);

module.exports = app;
