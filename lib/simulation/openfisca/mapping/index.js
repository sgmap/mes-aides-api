var _ = require('lodash');
var moment = require('moment');

var ressourcesMap = require('./ressources');

var ind = require('./individu');
var men = require('./menage');
var fam = require('./famille');
var foy = require('./foyerFiscal');

var isNotValidValue = function(value) {
    return _.isNaN(value) || _.isUndefined(value) || value === null;
};

var applyRessources = function(src, dest, schema, dateDeValeur) {
    var agregats = {
        anneeGlissante: {
            debut: moment(dateDeValeur).subtract(1, 'years').subtract(1, 'months'),
            fin: moment(dateDeValeur),
            key: 'year:' + moment(dateDeValeur).subtract(1, 'years').format('YYYY-MM')
        },
        anneeFiscalReference: {
            debut: moment(dateDeValeur).subtract(1, 'years').subtract(1, 'months'),
            fin: moment(dateDeValeur),
            key: moment(dateDeValeur).subtract(2, 'years').year()
        },
        trimestreGlissant: {
            debut: moment(dateDeValeur).subtract(3, 'months').subtract(1, 'months'),
            fin: moment(dateDeValeur),
            key: moment(dateDeValeur).subtract(3, 'months').format('YYYY-MM') + ':3'
        }
    };

    var moisCourant = moment(dateDeValeur).format('YYYY-MM');
    var moisPrecedent = moment(dateDeValeur).subtract(1, 'months').format('YYYY-MM');

    function periodeCompriseDans(agregatKey, periode) {
        return periode.isAfter(agregats[agregatKey].debut, 'month') && periode.isBefore(agregats[agregatKey].fin, 'month');
    }

    var ressourcesByType = _.groupBy(src.ressources, 'type');
    _.forEach(schema, function(definition, destKey) {
        var srcKeys, fn;
        if (_.isString(definition)) {
            srcKeys = [definition];
        } else if(_.isArray(definition)) {
            srcKeys = definition;
        } else {
            srcKeys = [definition.src];
            fn = definition.fn;
        }
        _.forEach(srcKeys, function(srcKey) {

            if (ressourcesByType[srcKey]) {
                var result = {};
                var agr = {};

                _.forEach(ressourcesByType[srcKey], function(item) {
                    if (item.periode) {
                        // Période d'origine
                        if (!result[item.periode]) result[item.periode] = 0;
                        result[item.periode] += item.montant;

                        // Aggrégats
                        _.keys(agregats).forEach(function (agregatKey) {
                            if (periodeCompriseDans(agregatKey, moment(item.periode, 'YYYY-MM'))) {
                                if (!(agregatKey in agr)) agr[agregatKey] = 0;
                                agr[agregatKey] += fn ? fn(item.montant) : item.montant;
                            }
                        });
                    }
                });

                _.forEach(result, function(montant, periode) {
                    // Applique la transformation
                    if (fn) montant = fn(montant);

                    result[periode] = montant;
                });

                // On prolonge la ressource perçue quand c'est possible
                if (result[moisPrecedent] && !_.contains(src.interruptedRessources, srcKey)) {
                    result[moisCourant] = result[moisPrecedent];
                }

                if (_.size(result) > 0) {
                    if (_.size(dest[destKey]) > 0) {
                        dest[destKey] = _.extend(dest[destKey],result);
                    } else {
                        dest[destKey] = result;
                    }
                } 
                

                _.forEach(agr, function (value, agregatKey) {
                    dest[destKey][agregats[agregatKey].key] = value;
                });
            }
        });
    });
};

var transform = function(src, schema, situation) {
    var result = {};
    _.forEach(schema, function(definition, destKey) {
        var params = _.isString(definition) ? { src: definition } : definition;

        if (params.values) {
            result[destKey] = params.values[src[params.src]];
        } else if (params.fn) {
            result[destKey] = params.src ? params.fn(src[params.src], src, situation) : params.fn(src, situation);
        } else {
            result[destKey] = src[params.src];
        }

        if (params.round && _.isNumber(result[destKey])) {
            result[destKey] = Math.round(result[destKey]);
        }

        // Supprime les null (mal supportés par OpenFisca)
        if (isNotValidValue(result[destKey])) {
            if ('default' in params) result[destKey] = params.default;
            else delete result[destKey];
        }
    });
    return result;
};

var mapIndividus = exports.mapIndividus = function (situation) {
    return _.map(situation.individus, function(individu) {
        if (individu.role === 'demandeur') {
            _.extend(individu, situation.patrimoine);

            var revenusLocatifs = situation.patrimoine.revenusLocatifs.map(function(revenu) {
                revenu.type = 'revenusLocatifs';
                return revenu;
            });

            var revenusDuCapital = situation.patrimoine.revenusDuCapital.map(function(revenu) {
                revenu.type = 'revenusDuCapital';
                return revenu;
            });

            individu.ressources = individu.ressources.concat(revenusLocatifs, revenusDuCapital);
        }
        var target = transform(individu, ind, situation);
        applyRessources(individu, target, ressourcesMap.individu, situation.dateDeValeur);

        return target;
    });
};

var mapFamille = function(situation) {
    var famille = transform(situation, fam, situation);
    var ressources = [];
    _.forEach(situation.individus, function(individu) { ressources = ressources.concat(individu.ressources); });
    applyRessources({ ressources: ressources }, famille, ressourcesMap.famille, situation.dateDeValeur);

    return famille;
};

var mapFoyerFiscal = exports.mapFoyerFiscal = function(situation) {
    var foyerFiscal = transform(situation, foy, situation);
    var ressources = [];
    _.forEach(situation.individus, function(individu) { ressources = ressources.concat(individu.ressources); });
    applyRessources({ ressources: ressources }, foyerFiscal, ressourcesMap.foyerFiscal, situation.dateDeValeur);

    return foyerFiscal;
};

exports.mapSituation = function(situation) {
    return {
        familles: [mapFamille(situation)],
        foyers_fiscaux: [mapFoyerFiscal(situation)],
        individus: mapIndividus(situation),
        menages: [transform(situation.logement, men, situation)]
    };
};
