var es = require('event-stream');
var mongoose = require('mongoose');
var config = require('../lib/config/config');
require('../lib/config/mongoose')(mongoose, config);
var Situation = mongoose.model('Situation');

function migrateAllSituations(migrationFunction) {
    Situation.find({ status: 'test' }).stream()
        .pipe(es.map(function (situation, done) {
            var isSituationUpdated = migrationFunction(situation);
            situation.save(function (err) {
                if (err) {
                    console.log('Cannot save migrated situation %s', situation.id);
                    console.trace(err);
                }
                else if (isSituationUpdated)
                    console.log('Situation ' + situation['_id'] + ' migrated');
                done();
            });

        }))
        .on('end', function() {
            console.log('Terminé');
            process.exit();
        })
        .on('error', function(err) {
            console.trace(err);
            process.exit();
        })
        .resume();
}

function setSituationVisibility(situationId, visibility, callback) {
    Situation.findById(situationId).update({}, { status: visibility ? 'test' : 'new' }).exec(callback);
}

module.exports = {
    migrateAllSituations: migrateAllSituations,
    setSituationVisibility: setSituationVisibility
}
