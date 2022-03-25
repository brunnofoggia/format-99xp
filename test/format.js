import assert from 'assert';
import _ from 'lodash';
import CryptoJS from "crypto-js";

import { format, formatMoment } from '../src/format.js';


describe('Format', function () {
    var _format = {
        title: 'lowercase',
        subtitle: 'capitalize',
        classification: 'uppercase',
        pass: 'send-sha256',
        token: 'send-md5',
        duration: 'int',
        someData: 'json',
        someData2: (value, moment) => {
            if (moment) {
                value += '-sent';
            } else {
                value = value.replace(/-sent$/, '');
            }
            return value;
        },
        someDate: { type: 'regex', search: [/(\d{4})-(\d{2})-(\d{2})/, /(\d{2})\/(\d{2})\/(\d{4})/], replace: ['$3/$2/$1', '$3-$2-$1'] },
        release: 'date',
        budget: 'float',
        imdb: 'float',
        producers: { type: 'objectArray', index: 'position' },
        active: 'bool'
    }

    var attrs = {
        title: 'Pacific Rim',
        subtitle: 'NONE',
        classification: 'Science Fiction',
        pass: 'string123',
        token: 'String123',
        duration: '131',
        someData: { n: 5 },
        someData2: 'data',
        someDate: '09/08/2013',
        release: '09/08/2013',
        budget: '180.000.000,00',
        imdb: '6,90',
        producers: {
            'director': { name: 'Guillermo del Toro', position: 'director' },
            'writer': { name: 'Travis Beacham', position: 'writer' },
        },
        active: '1'
    };

    var dataSent = {};

    it('format options when sending to remote source', function () {
        for (var field in _format) {
            dataSent[field] = format(attrs[field], _format[field], formatMoment.TOREMOTE);
        }

        assert.equal(dataSent.title, attrs.title.toLowerCase());
        assert.equal(dataSent.subtitle, 'None');
        assert.equal(dataSent.classification, attrs.classification.toUpperCase());
        assert.ok(dataSent.pass.length > 50);
        assert.equal(dataSent.token, CryptoJS.MD5(attrs.token).toString());
        assert.equal(dataSent.duration, 131);
        assert.equal(dataSent.someData, '{"n":5}');
        assert.equal(dataSent.someData2, 'data-sent');
        assert.equal(dataSent.someDate, '2013-08-09');
        assert.equal(dataSent.release, '2013-08-09');
        assert.equal(dataSent.budget, 180000000);
        assert.equal(dataSent.imdb, 6.9);
        assert.deepEqual(dataSent.producers, _.toArray(attrs.producers));
        assert.equal(dataSent.active, true);
    });

    it('format options when receiving to remote source', function () {
        var dataReceived = {};
        for (var field in _format) {
            dataReceived[field] = format(dataSent[field], _format[field], formatMoment.FROMREMOTE);
        }

        assert.deepEqual(
            _.omit(dataReceived, 'title', 'subtitle', 'classification', 'pass', 'token', 'duration'),
            _.omit(attrs, 'title', 'subtitle', 'classification', 'pass', 'token', 'duration'));
        // formats that wont change when received
        assert.deepEqual(
            _.pick(dataReceived, 'title', 'subtitle', 'classification', 'pass', 'token', 'duration'),
            _.pick(dataSent, 'title', 'subtitle', 'classification', 'pass', 'token', 'duration'));
    });


});
