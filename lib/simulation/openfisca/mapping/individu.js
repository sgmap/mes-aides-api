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
    statut_marital: {
        src: 'statutMarital',
        fn: function (statutMarital, individu) {
            var values = {
                seul: 'Célibataire', // Enum value 2 in OpenFisca
                mariage: 'Marié',// Enum value 1 in OpenFisca
                pacs: 'Pacsé', // Enum value 5 in OpenFisca
                union_libre: 'Célibataire', // Enum value 2 in OpenFisca
            };
            return values[statutMarital] || (individu.role == 'demandeur' && 'Célibataire') || undefined;
        },
    },
    id: {
        src: 'id',
        copyTo3PreviousMonths: false
    },
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
                demandeur_emploi: 'Chômeur',
                etudiant: 'Étudiant, élève',
                retraite: 'Retraité',
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
    boursier: {
        fn: function(individu) {
            return individu.boursier || individu.echelonBourse >= 0;  // backward compatibility for boursier; cannot write a migration because the exact echelon is not known
        }
    },
    echelon_bourse: 'echelonBourse',
    scolarite: {
        fn: function(individu) {
            var values = {
                'inconnue': 'Inconnue',
                'college': 'Collège',
                'lycee':'Lycée',
            };
            return values[individu.scolarite];
        }
    },
    enfant_a_charge: {
        // variable liée à l'année fiscale : on la définit sur l'année
        fn: function(individu, situation) {
            var year = situation.dateDeValeur.getFullYear();
            var result = {};
            result[year] = individu.aCharge || (! individu.fiscalementIndependant);
            return result;
        },
        copyTo3PreviousMonths: false,
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
        },
        copyTo3PreviousMonths: false,
    },
    epargne_non_remuneree: {
        src: 'epargneSansRevenus',
        fn: function (value) {
            return {
                '2012-01': value || 0
            };
        },
        copyTo3PreviousMonths: false
    },
    valeur_locative_immo_non_loue: {
        src: 'valeurLocativeImmoNonLoue',
        fn: function (value) {
            return {
                '2012-01': value || 0
            };
        },
        copyTo3PreviousMonths: false,
    },
    valeur_locative_terrains_non_loue: {
        src: 'valeurLocativeTerrainNonLoue',
        fn: function (value) {
            return {
                '2012-01': value || 0
            };
        },
        copyTo3PreviousMonths: false,
    },

    /* Activités non-salarié */
    tns_autres_revenus_type_activite: 'tns_autres_revenus_type_activite',
    tns_auto_entrepreneur_type_activite: 'autoEntrepreneurActiviteType',
    tns_micro_entreprise_type_activite: 'microEntrepriseActiviteType',
};
