var setSituationVisibility = require('./migrations').setSituationVisibility;

var situationId = process.argv[2];

// Make the situation non visible only if a "false" additional argument has been passed
var visibility = process.argv[3] != "false";

setSituationVisibility(situationId, visibility, process.exit);
