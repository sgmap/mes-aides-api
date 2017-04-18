var individuHelpers = require('../../../lib/simulation/openfisca/mapping/common');
var should = require('should');

describe('isIndividuValid', function() {
  const situation = {
    dateDeValeur: new Date('2015-01'),
  };

  describe('an adult', function() {
    const target = {
      role: 'demandeur',
      specificSituations: [],
      dateDeNaissance: new Date('1940-01'),
    };

    it('should be valid', function() {
      individuHelpers.isIndividuValid(target, situation).should.be.ok;
    });
  });

  describe('a child', function() {
    var target = {
      role: 'enfant',
      specificSituations: [],
    };

    describe('under 25', function() {
      before(function() {
          target['dateDeNaissance'] = new Date('2010-01');
      });

      it('should be valid', function() {
        individuHelpers.isIndividuValid(target, situation).should.be.ok;
      });
    });

    describe('over 25', function() {
      before(function() {
        target['dateDeNaissance'] = new Date('1970-01');
      });

      it('should not be valid', function() {
        should(individuHelpers.isIndividuValid(target, situation)).not.be.ok;
      });

      describe('disabled', function() {
        before(function() {
          target['dateDeNaissance'] = new Date ('1970-01');
          target.specificSituations.push('handicap');
        });

        it('should be valid', function() {
          individuHelpers.isIndividuValid(target, situation).should.be.ok;
        });
      });
    });
  });
});
