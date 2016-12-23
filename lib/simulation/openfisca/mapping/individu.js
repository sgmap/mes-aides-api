var moment = require('moment');
var _ = require('lodash');


function formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
}

module.exports = {
    date_naissance: {
        src: 'dateDeNaissance',
        fn: formatDate
    },
    age: {
        src: 'dateDeNaissance',
        fn: function (dateDeNaissance, individu, situation) {
            return moment(situation.dateDeValeur).diff(moment(dateDeNaissance), 'years');
        }
    },
    age_en_mois: {
        src: 'dateDeNaissance',
        fn: function (dateDeNaissance, individu, situation) {
            return moment(situation.dateDeValeur).diff(moment(dateDeNaissance), 'months');
        }
    },
    statut_marital: {
        src: 'statutMarital',
        values: {
            seul: 2,
            mariage: 1,
            pacs: 5,
            union_libre: 2
        }
    },
    id: '_id',
    enceinte: 'enceinte',
    ass_precondition_remplie: 'assPreconditionRemplie',
    date_arret_de_travail: {
        src: 'dateArretDeTravail',
        fn: formatDate
    },
    activite: {
        src: 'specificSituations',
        fn: function(value) {
            var returnValue;
            _.forEach({
                demandeur_emploi: 1,
                etudiant: 2,
                retraite: 3
            }, function(situationIndex, situation) {
                if (value.indexOf(situation) >= 0) {
                    returnValue = situationIndex;
                }
            });
            return returnValue;
        }
    },
    handicap: {
        src: 'specificSituations',
        fn: function(specificSituations) {
            return specificSituations.indexOf('handicap') >= 0;
        }
    },
    taux_incapacite: {
        fn: function(individu) {
            var handicap = individu.specificSituations.indexOf('handicap') >= 0;
            var tauxMap = {
                    moins50: 0.3,
                    moins80: 0.7,
                    plus80: 0.9
            };
            return handicap && tauxMap[individu.tauxIncapacite];
        }
    },
    inapte_travail: {
        src: 'specificSituations',
        fn: function(specificSituations) {
            return specificSituations.indexOf('inapte_travail') >= 0;
        }
    },
    perte_autonomie: 'perteAutonomie',
    etudiant: {
        src: 'specificSituations',
        fn: function(specificSituations) {
            return specificSituations.indexOf('etudiant') >= 0;
        }
    },
    boursier: {
        fn: function(individu) {
            return individu.echelonBourse >= 0;
        }
    },
    echelon_bourse: 'echelonBourse',
    scolarite: {
        fn: function(individu) {
            var values = {
                'inconnue': 0,
                'college': 1,
                'lycee': 2
            };
            return values[individu.scolarite];
        }
    },
    enfant_a_charge: {
        fn: function(individu) {
            return individu.aCharge || (! individu.fiscalementIndependant);
        }
    },
    enfant_place: 'place',
    garde_alternee: 'gardeAlternee',
    habite_chez_parents: 'habiteChezParents',

    /* Revenus du patrimoine */
    interets_epargne_sur_livrets: {
        src: 'epargneSurLivret',
        fn: function(value) {
            return {
                '2012-01': 0.01 * value || 0
            };
        }
    },
    epargne_non_remuneree: {
        src: 'epargneSansRevenus',
        fn: function (value) {
            return {
                '2012-01': value || 0
            };
        }
    },
    valeur_locative_immo_non_loue: {
        src: 'valeurLocativeImmoNonLoue',
        fn: function (value) {
            return {
                '2012-01': value || 0
            };
        }
    },
    valeur_locative_terrains_non_loue: {
        src: 'valeurLocativeTerrainNonLoue',
        fn: function (value) {
            return {
                '2012-01': value || 0
            };
        }
    },

    /* Activités non-salarié */
    tns_avec_employe: 'autresRevenusTnsEmployes',
    tns_autres_revenus_type_activite: 'autresRevenusTnsActiviteType',
    tns_auto_entrepreneur_type_activite: 'autoEntrepreneurActiviteType',
    tns_micro_entreprise_type_activite: 'microEntrepriseActiviteType',
};
