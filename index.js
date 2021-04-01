var express = require('express');
const { Transform } = require('stream');
const got = require('got');

var app = express();
const { streamArray } = require('stream-json/streamers/StreamArray');

const Pick = require('stream-json/filters/Pick');

app.get('/item_product', function (req, res) {
    res.json(require("./response.json"));
});


app.get('/stream_single_path', function (req, res) {
    //step 1
    var request = got.stream.get('http://localhost:8080/item_product')
    request.on('error', function (data) {
        console.log('request.error', data)
    }).on('data', function (data) {
        console.log('request.data', data)
    }).on('close', function (data) {
        console.log('request.close')
    }).on('end', function (data) {
        console.log('request.end')
    })

    //step 2
    var filter = Pick.withParser({ filter: 'buy.items' })
    filter.on('error', function (data) {
        console.log('filter.error', data)
    }).on('data', function (data) {
        console.log('filter.data', data)
    }).on('close', function (data) {
        console.log('filter.close')
    }).on('end', function (data) {
        console.log('filter.end')
    })

    //step 3
    var streamArr = streamArray()

    //step 4
    const stringTransform = new Transform({
        writableObjectMode: true,
        transform(chunk, encoding, callback) {

            let data = chunk.value
            data.tag = data.id + "_" + data.item

            let strChunk = JSON.stringify(data)
            console.log('transform', strChunk)

            if (!this.hasWritten) {
                this.push('{"data":[' + strChunk)
                this.hasWritten = true
            } else {
                this.push(',' + strChunk)
            }
            callback();
        },
        flush(callback) {
            console.log('flush')
            this.push(']}')
            callback()
        }
    });

    request.pipe(filter).pipe(streamArr).pipe(stringTransform).pipe(res)
})


app.get('/stream_double_path', function (req, res) {
    //step 1
    var request = got.stream.get('http://localhost:8080/item_product')

    //step 2
    var filter = Pick.withParser({ filter: 'buy.items' })

    //step 3
    var streamArr = streamArray()

    //step 4
    const stringTransform = new Transform({
        writableObjectMode: true,
        transform(chunk, encoding, callback) {

            let data = chunk.value
            data.tag = data.id + "_" + data.item

            let strChunk = JSON.stringify(data)
            console.log('transform', strChunk)

            if (!this.hasWritten) {
                this.push('{"data":[' + strChunk)
                this.hasWritten = true
            } else {
                this.push(',' + strChunk)
            }
            callback();
        },
        flush(callback) {
            console.log('flush')
            callback()
        }
    });

    //step 5
    var filter2 = Pick.withParser({ filter: 'sell.product' })

    //step 6
    var streamArr2 = streamArray()

    //step 7
    const stringTransform2 = new Transform({
        writableObjectMode: true,
        transform(chunk, encoding, callback) {

            let data = chunk.value
            let strChunk = JSON.stringify(data)
            console.log('transform 2', strChunk)

            if (!this.hasWritten) {
                this.push('],"data2":[' + strChunk)
                this.hasWritten = true
            } else {
                this.push(',' + strChunk)
            }
            callback();
        },
        flush(callback) {
            console.log('flush')
            this.push(']}')
            callback()
        }
    });


    request.pipe(filter).pipe(streamArr).pipe(stringTransform).pipe(res)
    request.pipe(filter2).pipe(streamArr2).pipe(stringTransform2).pipe(res)
})

app.listen(8080, '0.0.0.0', function () {
    console.log('Example app listening on port 8080!');
});