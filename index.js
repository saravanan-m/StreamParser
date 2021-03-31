var express = require('express');
var app = express();
const request = require('request')
const { streamArray } = require('stream-json/streamers/StreamArray');
const Pick = require('stream-json/filters/Pick');

app.get('/item_product', function (req, res) {
    res.json(require("./response.json"));
});

app.get('/stream_parser', function (req, res) {

    var pipeline = request('http://localhost:8080/item_product')
        .pipe(Pick.withParser({ filter: 'buy.items' }))
        .pipe(streamArray()).pipe(res).on('error', function (data) {
            console.log(data)
        })

   /* pipeline.on('data', function (data) {
        console.log(data)
    })
    pipeline.on('end', function () {
        res.status(200).send()
    })

    pipeline.on('error',function(e){
        console.log(e)
    })*/
    //request('http://localhost:8080/item_product').pipe(Pick.withParser({filter: 'buy.items'})).pipe(res)
});

app.listen(8080, '0.0.0.0', function () {
    console.log('Example app listening on port 8080!');
});