

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var Promise = require('promise');
var request = require('request');

var michelinRestaurants = { "restaurants": [] };
var MainPage = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-';


function GetNumberOfRestaurantPages(url) {
    return new Promise(function (resolve, reject) {
        request(url, (err, resp, html) => {
            if (!err) {
                var $ = cheerio.load(html);
                nbrPage = $('ul.pager').children('.last').prev().children().html(); //Retrieve the last page
                resolve(Number(nbrPage));
            }
            else {
                reject(err);
            }
        })
    })
  }

function GetPageURLRestaurant(URL) {
  return new Promise((resolve,reject)=>{
    var PageToLoad = URL;
    var URLS=[]
    request(PageToLoad, (error, response, html) => {
        if (!error) {
            var $ = cheerio.load(html);
            var link=$('.poi-card-link')
            $('.poi-card-link').each(function () {
                var href = $(this).attr('href');
                var restURL = 'https://restaurant.michelin.fr' + href;
                URLS.push(restURL);
            })
            console.log(URLS.length);
            resolve(URLS);
        }
        else{
          reject(error);
        }
    })
  })
}

function RetrieveRestaurantInfos(URL) {
  return new Promise((resolve,reject)=>{
    request(URL, (error, resp, html) => {
        if (!error) {
            var $ = cheerio.load(html);
            var restaurantName = $('h1').first().text();
            var street = $('.thoroughfare').first().text();
            var zipcode = $('.postal-code').first().text();
            var locality = $('.locality').first().text();
            var restaurant= {'name': restaurantName , 'road' : street , 'zipcode' : zipcode , 'locality':locality};
            michelinRestaurants.restaurants.push(restaurant);//Add to JSON
            console.log(michelinRestaurants.restaurants.length)
            resolve()
        }
        else{
          reject()
        }
    })
  })
}


function getRestaurantAndAddToJSON(nbrPage){
    for(var i = 1;i<nbrPage+1;i++){
      GetPageURLRestaurant(MainPage+i)
      .then((URLS)=>{URLS.forEach((url)=>RetrieveRestaurantInfos(url));
      urltot+=URLS.length;
      console.log(urltot)})}
    }



var urltot=0

GetNumberOfRestaurantPages(MainPage)
    .then((nbrPage)=>{getRestaurantAndAddToJSON(nbrPage)})


setTimeout(function(){fs.writeFile('MichelinRestaurants.json',JSON.stringify(michelinRestaurants) , 'utf8', (error)=>{
  if(!error){
    console.log("michelin's restaurant have been added !");
  }
  else{
    console.log(error);
  }
});},15000)
