var should = require('should');
var mapping = require('../../lib/simulation/openfisca/mapping');

describe('Ressources', function () {

    describe('# Interruption / Prolongation', function () {

        var situation = {
            dateDeValeur: new Date('2015-03-01'),
            individus: [
                {
                    role: 'conjoint',
                    ressources: [
                        {
                            periode: '2015-02',
                            type: 'stage', // => indemnites_stage
                            montant: 200
                        },
                        {
                            periode: '2015-02',
                            type: 'revenusStageFormationPro', // => revenus_stage_formation_pro
                            montant: 300
                        }
                    ],
                    interruptedRessources: ['stage']
                }
            ]
        };

        var individu = mapping.mapIndividus(situation)[0];

        it('devrait copier les ressources encore perçues sur le mois courant', function () {
            individu.revenus_stage_formation_pro.should.have.ownProperty('2015-03');
            individu.revenus_stage_formation_pro['2015-03'].should.equal(300);
        });

        it('ne devrait pas copier les ressources dont la perception est interrompue sur le mois courant', function () {
            individu.indemnites_stage.should.not.have.ownProperty('2015-03');
        });

    });

    describe('# Mapping foyer fiscal', function() {
        it('devrait mapper les pensions alimentaires versées du demandeur et du conjoint', function() {
            var situation = {
                dateDeValeur: new Date('2015-03-01'),
                individus: [
                    {
                        role: 'demandeur',
                        ressources: [
                            {
                                periode: '2013',
                                type: 'rncPensionsAlimentairesVersees',
                                montant: 3000
                            }
                        ]
                    },
                    {
                        role: 'conjoint',
                        ressources: [
                            {
                                periode: '2013',
                                type: 'rncPensionsAlimentairesVersees',
                                montant: 3000
                            }
                        ]
                    }
                ]
            };

            var foyerFiscal = mapping.mapFoyerFiscal(situation);

            foyerFiscal.pensions_alimentaires_versees.should.have.ownProperty('2013');
            foyerFiscal.pensions_alimentaires_versees['2013'].should.equal(6000);
        });
    });

});