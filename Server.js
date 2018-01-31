

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
    console.log("ok");

   
    console.log("ok");
    url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';

    request(url , function(error,response,html){
        if(!error){
            console.log("ok");
            var $ = cheerio.load(html);
            var title,url;
            var restaurant = {title : "" , url :"" , additional_informations : [{city:"" , street : "" , zipcode=""}]};
            var json_restaurant = {restaurant_list : []};
            
            console.log($);
            console.log( $('.poi_card-display-title').text());
            $('.poi_card-display-title').each(function(){
                json.
                console.log($(this).text);
            })
        }
    })
})

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;


//Poi card display title

//query selector