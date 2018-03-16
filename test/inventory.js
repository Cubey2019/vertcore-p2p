'use strict';

/*jshint immed: false */

var should = require('chai').should();

var bitcore = require('bitcore-lib');
var P2P = require('../');
var Inventory = P2P.Inventory;
var BufferUtils = bitcore.util.buffer;
var BufferWriter = bitcore.encoding.BufferWriter;
var BufferReader = bitcore.encoding.BufferReader;

describe('Inventory', function() {

  var hash = new Buffer('eb951630aba498b9a0d10f72b5ea9e39d5ff04b03dc2231e662f52057f948aa1', 'hex');
  var hashedStr = BufferUtils.reverse(new Buffer(hash, 'hex')).toString('hex');
  var inventoryBuffer = new Buffer(
    '01000040eb951630aba498b9a0d10f72b5ea9e39d5ff04b03dc2231e662f52057f948aa1',
    'hex'
  );

  describe('@constructor', function() {
    it('create inventory', function() {
      var inventory = new Inventory({type: Inventory.TYPE.TX, hash: hash});
      should.exist(inventory);
    });

    it('error with string hash', function() {
      (function() {
        var inventory = new Inventory({type: Inventory.TYPE.TX, hash: hashedStr});
        should.not.exist(inventory);
      }).should.throw('Unexpected hash');
    });

  });

  describe('#forItem', function() {
    it('handle a string hash (reversed)', function() {
      var inventory = Inventory.forItem(Inventory.TYPE.TX, hashedStr);
      should.exist(inventory);
      inventory.hash.should.deep.equal(new Buffer(hash, 'hex'));
    });

  });

  describe('#forBlock', function() {
    it('use correct block type', function() {
      var inventory = Inventory.forBlock(hash);
      should.exist(inventory);
      inventory.type.should.equal(Inventory.TYPE.BLOCK);
    });
    it('use correct witness block type', function() {
      var inventory = Inventory.forBlock(hash, true);
      should.exist(inventory);
      inventory.type.should.equal(Inventory.TYPE.WITNESS_BLOCK);
    });
  });

  describe('#forFilteredBlock', function() {
    it('use correct filtered block type', function() {
      var inventory = Inventory.forFilteredBlock(hash);
      should.exist(inventory);
      inventory.type.should.equal(Inventory.TYPE.FILTERED_BLOCK);
    });
    it('use correct filtered witness block type', function() {
      var inventory = Inventory.forFilteredBlock(hash, true);
      should.exist(inventory);
      inventory.type.should.equal(Inventory.TYPE.FILTERED_WITNESS_BLOCK);
    });
  });

  describe('#forTransaction', function() {
    it('use correct tx type', function() {
      var inventory = Inventory.forTransaction(hash);
      should.exist(inventory);
      inventory.type.should.equal(Inventory.TYPE.TX);
    });
    it('use correct witness tx type', function() {
      var inventory = Inventory.forTransaction(hash, true);
      should.exist(inventory);
      inventory.type.should.equal(Inventory.TYPE.WITNESS_TX);
    });
  });

  describe('#toBuffer', function() {
    it('serialize correctly', function() {
      var inventory = Inventory.forTransaction(hash, true);
      var buffer = inventory.toBuffer();
      buffer.should.deep.equal(inventoryBuffer);
    });
  });

  describe('#toBufferWriter', function() {
    it('write to a buffer writer', function() {
      var bw = new BufferWriter();
      var inventory = Inventory.forTransaction(hash, true);
      inventory.toBufferWriter(bw);
      bw.concat().should.deep.equal(inventoryBuffer);
    });
  });

  describe('#fromBuffer', function() {
    it('deserialize a buffer', function() {
      var inventory = Inventory.fromBuffer(inventoryBuffer);
      should.exist(inventory);
      inventory.type.should.equal(Inventory.TYPE.WITNESS_TX);
      inventory.hash.should.deep.equal(hash);
    });
  });

  describe('#fromBufferWriter', function() {
    it('deserialize from a buffer reader', function() {
      var bw = new BufferReader(inventoryBuffer);
      var inventory = Inventory.fromBufferReader(bw);
      should.exist(inventory);
      inventory.type.should.equal(Inventory.TYPE.WITNESS_TX);
      inventory.hash.should.deep.equal(hash);
    });
  });

});
