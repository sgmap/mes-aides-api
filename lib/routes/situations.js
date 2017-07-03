var situations = require('../controllers/situations');

module.exports = function(api) {

    /*
    ** Param injection
    */
    api.param('situationId', situations.situation);

    /*
    ** Security
    */
    var allowShow = function(req, res, next) {
        var situation = req.situation;
        if (req.situation.status === 'test' || req.cookies['situation_' + situation.id] === situation.token) return next();
        res.status(403).send({ message: 'You are not allowed to see this situation.' });
    };

    var allowUpdate = function(req, res, next) {
        var situation = req.situation;
        if (req.cookies['situation_' + situation.id] === situation.token || (situation.status === 'test' && req.isAuthenticated())) return next();
        res.status(403).send({ message: 'You are not allowed to update this situation.' });
    };

    /*
    ** Routes
    */
    api.route('/situations/:situationId')
        .get(allowShow, situations.show)
        .put(allowUpdate, situations.update);

    api.route('/situations').post(situations.create);

    // api.route('/situations/:situationId/submit').post(situations.submit);

    api.route('/situations/:situationId/simulation').get(situations.simulation);

    api.route('/situations/:situationId/openfisca-response').get(allowShow, situations.openfiscaResponse);

    api.route('/situations/:situationId/openfisca-request').get(allowShow, situations.openfiscaRequest);

    api.route('/situations/:situationId/openfisca-test').post(situations.openfiscaTest);

};
