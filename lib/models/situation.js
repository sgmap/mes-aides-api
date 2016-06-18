/*
** Module dependencies
*/
var mongoose = require('mongoose');
var utils = require('../utils');
var openfisca = require('../simulation/openfisca');

var Schema = mongoose.Schema;

var ressourceTypes = [
    'revenusSalarie',
    'stage',
    'revenusStageFormationPro',
    'allocationsChomage',
    'allocationSecurisationPro',
    'primeRepriseActivite',
    'aide_logement',
    'af',
    'cf',
    'asf',
    'rsa',
    'aspa',
    'asi',
    'ass',
    'aah',
    'aeeh',
    'pch',
    'paje_base',
    'clca',
    'prepare',
    'indJourMaternite',
    'indJourMaladie',
    'indJourMaladieProf',
    'indJourAccidentDuTravail',
    'indChomagePartiel',
    'indVolontariat',
    'dedommagementAmiante',
    'pensionsAlimentaires',
    'pensionsAlimentairesVersees',
    'prestationCompensatoire',
    'pensionsRetraitesRentes',
    'retraiteCombattant',
    'pensionsInvalidite',
    'bourseEnseignementSup',
    'bourseRecherche',
    'gainsExceptionnels',
    'revenusLocatifs',
    'revenusDuCapital',
    'caAutoEntrepreneur',
    'caMicroEntreprise',
    'autresRevenusTns',
    'caAutresRevenusTns',
    'revenusAgricolesTns',

    // rnc
    'rncRevenusActivite',
    'rncAutresRevenus',
    'rncPensionsRetraitesRentes',
    'fraisReelsDeductibles',
    'rncPensionsAlimentaires',
    'rncPensionsAlimentairesVersees'
];

var RessourceSchema = new Schema({
    periode: { type: String },
    type: { type: String, enum: ressourceTypes },
    montant: { type: Number, required: true }
});

var specificSituations = [
    'sans_activite',
    'salarie',
    'auto_entrepreneur',
    'apprenti',
    'travailleur_saisonnier',
    'stagiaire',
    'independant',
    'gerant_salarie',
    'demandeur_emploi',
    'etudiant',
    'retraite',
    'handicap',
    'boursier',
    'inapte_travail',
    'autre'
];

var SpecificSituation = new Schema({
    situation: { type: String, enum: specificSituations },
    since: String,
    volontairementSansActivite: Boolean,
    contractType: { type: String, enum: ['cdi', 'cdd', 'interim'] },
    isRemunere: Boolean,
    gerantSalarieAffiliation: String,
    isIndemnise: Boolean,
    indemniseSince: String
});

var statutsMaritaux = [
    'mariage',
    'pacs',
    'union_libre',
    'celibataire',
    'separe',
    'divorce',
    'veuf',
    'pacs_rompu',
    'concubinage_rompu'
];

var situationsEnfants = [
    'scolarise',
    'apprenti',
    'salarie',
    'formation_pro',
    'demandeur_emploi',
    'chomage_indemnise',
    'sans_activite',
    'autre'
];

var IndividuDef = {
    civilite: { type: String, enum: ['f', 'h'] },
    firstName: String,
    lastName: String,
    nomUsage: String,
    nir: String,
    enceinte: Boolean,
    boursier: Boolean,
    statutMarital: { type: String, enum: statutsMaritaux },
    dateSituationFamiliale: Date,
    isolementRecent: Boolean,
    dateDeNaissance: Date,
    villeNaissance: String,
    departementNaissance: String,
    paysNaissance: String,
    titreSejour10ans: Boolean,
    titreSejour5ans: Boolean,
    situation: { type: String, enum: situationsEnfants },
    specificSituations: [SpecificSituation],
    scolarite: { type: String, enum: ['inconnue', 'college', 'lycee'] },
    nationalite: { type: String, enum: ['ue', 'autre'] },
    dateArriveeFoyer: Date,
    inscritCaf: Boolean,
    gardeAlternee: Boolean,
    aCharge: Boolean,
    place: Boolean,
    perteAutonomie: Boolean,
    assPreconditionRemplie: Boolean,
    numeroAllocataire: String,
    lienParente: { type: String, enum: ['fils', 'neveu', 'aucun', 'autre'] },
    role: { type: String, enum: ['demandeur', 'conjoint', 'enfant'] },
    ressources: [RessourceSchema],
    ressourcesYearlyApproximation: Object,
    interruptedRessources: [{ type: String, enum: ressourceTypes }],
    autresRevenusTnsActiviteType: { type: String, enum: ['achat_revente', 'bic', 'bnc'] },
    autresRevenusTnsEmployes: Boolean,
    tauxIncapacite: { type: String, enum: ['nul', 'moins50', 'moins80', 'plus80'] },
    microEntrepriseActiviteType: { type: String, enum: ['achat_revente', 'bic', 'bnc'] },
    autoEntrepreneurActiviteType: { type: String, enum: ['achat_revente', 'bic', 'bnc'] }
};

var IndividuSchema = new Schema(IndividuDef);

var AdresseDef = {
    adresse: String,
    codePostal: String,
    codeInsee: String,
    ville: String,
    pays: String
};

var LogementDef = {
    primoAccedant: Boolean,
    membreFamilleProprietaire: Boolean,
    conjointMemeAdresse: Boolean,
    loyer: Number,
    charges: Number,
    adresse: AdresseDef,
    type: { type: String, enum: ['locataire', 'proprietaire', 'heberge', 'sansDomicile'] },
    inhabitantForThreeYearsOutOfLastFive: Boolean,
    colocation: Boolean,
    participationFrais: Boolean,
    locationType: { type: String, enum: ['foyer', 'nonmeuble', 'meublehotel', 'hlm'] },
    isChambre: Boolean,
    dateArrivee: Date,
    adresseConjoint: AdresseDef
};

var SituationSchema = new Schema({
    _updated: Date,
    status: { type: String, default: 'new' },
    dateDeValeur: { type: Date, default: Date.now },
    logement: LogementDef,
    individus: [IndividuSchema],
    patrimoine: {
        captured: Boolean,
        revenusLocatifs: [RessourceSchema],
        valeurLocativeImmoNonLoue: Number,
        valeurLocativeTerrainNonLoue: Number,
        revenusDuCapital: [RessourceSchema],
        epargneSurLivret: Number,
        epargneSansRevenus: Number
    },
    ressourcesYearMoins2Captured: { type: Boolean, default: false },
    rfr: Schema.Types.Mixed,
    phoneNumber: String,
    email: String,
    token: String
});

SituationSchema.methods = {

    submit: function(done) {
        if (this.status !== 'new') done(new Error('Not a new situation. Cannot be submitted.'));
        this.set('status', 'pending').save(done);
    },

    simulate: function(done) {
        openfisca.simulate(this, done);
    }

};

SituationSchema.pre('save', function(next) {
    if (!this.isNew) next();
    var situation = this;
    utils.generateToken(function(err, generatedToken) {
        if (err) return next(err);
        situation.token = generatedToken;
        next();
    });
});

mongoose.model('Situation', SituationSchema);
