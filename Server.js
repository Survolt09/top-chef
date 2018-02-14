

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

var restaurant_list = [];
var URLPage = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-';

function RetrieveMichelinRestaurant(url, callback) {

    //if (error) console.log(error);
    var nbrRestaurant = 0;
    var nbrPage = 35;
   

        for (var i = 1; i < nbrPage + 1; i++) {
            var PageToLoad = url + i;
            request(PageToLoad, (error, response, html) => {
                if (!error) {
                    var $ = cheerio.load(html);
                    $('.poi_card-display-title').each(function () {
                        var data = $(this).text().trim();
                        var restaurant = { title: data, url: "", additionnal_informations: { city: "", street: "", zipcode: "" } };
                        restaurant_list.push(restaurant);
                        nbrRestaurant++;
                        console.log(nbrRestaurant);
                    })

                }
            })
            console.log("recuperation en cours ...");
        }
    

}


function PrintRestaurantList() {
    console.log(JSON.stringify(restaurant_list));
    console.log(restaurant_list.length);
}

app.get('/scrape', function (req, res) {

    RetrieveMichelinRestaurant(URLPage,PrintRestaurantList);

})


app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;


    //var json_restaurant = {title :"" , url :"" , additionnal_informations : {city:"" , street : "" , zipcode=""}};

    //console.log($);
    //console.log( $('.poi_card-display-title').text());


    /*
                $('li.mr-pager-item').each(function (){
                    //console.log($(this));
                    //var data = $(this).children().text();
                    var data = $(this).attr('href').text();
                    console.log(data);
                    //:nchild(2)
                })
    
    
    
                $('.poi_card-display-title').each(function(){
                    var data = $(this).text().trim();
                    var restaurant = {title : data , url :"" , additionnal_informations : {city:"" , street : "" , zipcode : ""}}
                    restaurant_list.push(restaurant);
                    //console.log(data);
                })
    
               .each(function(){ console.log($(this).attr('href')).text(); });
     $('.mr-page-item ').each(function(){

        

     // })
    


     }
//Poi card display title

//query selector

//Essayer d'utiliser les promesses ES6
//otacos.command(client1)
//    .then(prepare)
//    .then(notify)
//    .then(pay)
//    .catch(come)*/