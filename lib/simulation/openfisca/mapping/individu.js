var moment = require('moment');
var _ = require('lodash');

module.exports = {
    date_naissance: {
        src: 'dateDeNaissance',
        fn: function(dateDeNaissance) {
            return moment(dateDeNaissance).format('YYYY-MM-DD');
        }
    },
    age: {
        src: 'dateDeNaissance',
        fn: function(dateDeNaissance, individu, situation) {
            return moment(situation.dateDeValeur).diff(moment(dateDeNaissance), 'years');
        }
    },
    age_en_mois: {
        src: 'dateDeNaissance',
        fn: function(dateDeNaissance, individu, situation) {
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
    activite: {
        src: 'specificSituations',
        fn: function(value) {
            var returnValue;
            _.forEach({
                demandeur_emploi: 1,
                etudiant: 2,
                retraite: 3
            }, function(v, k) {
                if (_.find(value, { situation: k })) returnValue = v;
            });
            return returnValue;
        }
    },
    handicap: {
        src: 'specificSituations',
        fn: function(specificSituations) {
            return !!_.find(specificSituations, { situation: 'handicap' }) ? 1 : 0;
        }
    },
    taux_incapacite: {
        fn: function(individu) {
            var handicap = _.find(individu.specificSituations, { situation: 'handicap' }),
                tauxMap = {
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
            return _.find(specificSituations, { situation: 'inapte_travail' }) ? 1 : 0;
        }
    },
    perte_autonomie: 'perteAutonomie',
    etudiant: {
        src: 'specificSituations',
        fn: function(specificSituations) {
            return _.find(specificSituations, { situation: 'etudiant' }) ? 1 : 0;
        }
    },
    boursier: 'boursier',
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
    coloc: {
        fn: function(individu, situation) {
            var test = individu.role === 'demandeur' && 'locataire' === situation.logement.type && situation.logement.colocation;
            return test ? 1 : null;
        }
    },
    logement_chambre: {
        fn: function(individu, situation) {
            var test = individu.role === 'demandeur' && 'locataire' === situation.logement.type && situation.logement.isChambre;
            return test ? 1 : null;
        }
    },
    enfant_a_charge: 'aCharge',
    enfant_place: 'place',
    garde_alternee: 'gardeAlternee',

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
    ressortissant_eee : {
        fn: function(individu) {
            return individu.nationalite == 'ue';
        }
    },
    duree_possession_titre_sejour: {
        fn: function(individu) {
            return individu.titreSejour10ans ? 10 : individu.titreSejour5ans ? 5 : 0;
        }
    },

    /* Activités non-salarié */
    tns_avec_employe: 'autresRevenusTnsEmployes',
    tns_autres_revenus_type_activite: 'autresRevenusTnsActiviteType',
    tns_auto_entrepreneur_type_activite: 'autoEntrepreneurActiviteType',
    tns_micro_entreprise_type_activite: 'microEntrepriseActiviteType',
};
