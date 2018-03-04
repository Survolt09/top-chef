
//Scrap Michelin Restaurant


var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('promise');


var michelinRestaurants = { "restaurants": [] };

var MainPage = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-';

//Get the Number of restaurant starred page
function GetNumberOfRestaurantPages() {
    var url = MainPage + 1
    return new Promise(function (resolve, reject) {
        request(url, (err, resp, html) => {
            if (!err) {
                var $ = cheerio.load(html);
                nbrPage = $('ul.pager').children('.last').prev().children().html(); //Retrieve the last page
                return resolve(Number(nbrPage));
            }
            else {
                return reject(err);
            }
        })
    })
  }

// Get all the restaurant URL of a single page.
function GetPageURLRestaurant(numPage) {

  var PageToLoad = MainPage + numPage;
  var URLS=[]

  return new Promise((resolve,reject)=>{
    request(PageToLoad, (error, response, html) => {
        if (!error) {
            var $ = cheerio.load(html);
            var link=$('.poi-card-link')
            $('.poi-card-link').each(function () {
                var href = $(this).attr('href');
                var restURL = 'https://restaurant.michelin.fr' + href;
                URLS.push(restURL);
            })
            return resolve(URLS);
        }
        else{
          return reject(error);
        }
    })
  })
}

//Foreach restaurant , it retrieves the name , street , locality and zicpode
function RetrieveRestaurantInfos(URL) {
  return new Promise((resolve,reject)=>{
    request(URL, (error, resp, html) => {
        if (!error) {
            var $ = cheerio.load(html);
            var restaurantName = $('h1').first().text();
            var street = $('.thoroughfare').first().text();
            var zipcode = $('.postal-code').first().text();
            var locality = $('.locality').first().text();
            var restaurant= {'name' : restaurantName , 'road' : street , 'zipcode' : zipcode , 'locality' : locality};
            michelinRestaurants.restaurants.push(restaurant);//Add to JSON
            console.log("restaurant added")
            console.log(michelinRestaurants.restaurants.length)
            return resolve(true)
        }
        else{
          return reject(false)
        }
    })
  })
}


function WriteFile(){
  fs.writeFile('MichelinRestaurants.json',JSON.stringify(michelinRestaurants) , 'utf8', (error)=>{
    if(!error){
      console.log("Michelin's restaurant have been written !");
    }
    else{
      console.log(error);
    }
  })
}


 async function ScrapMichelinRestaurants(){
   var tabPage = []
   await GetNumberOfRestaurantPages()
    .then((nbrPage)=>{for(let i = 1 ; i < nbrPage + 1 ; i++){
      tabPage.push(i);
      }
    })
    .catch ((err)=>console.log(err));

   var allURLS = [];
   var urlArray = tabPage.map((page)=> GetPageURLRestaurant(page))

    await Promise.all(urlArray)
      .then((result)=>{
        result.forEach((URLArray)=>{
          URLArray.forEach((singleURL)=>{
            allURLS.push(singleURL)
          })
        })
      })
      .catch((err) => console.log(err))

    console.log(allURLS.length)
    var urlRequests = allURLS.map((url)=>RetrieveRestaurantInfos(url))

    await Promise.all(urlRequests)
      .then(()=>{
        console.log(michelinRestaurants.restaurants.length)
        console.log("All restaurants have been added")
        WriteFile()
      })
      .catch((err) => console.log(err))
}

exports.get = function() {
    var scrappingResult = fs.readFileSync('./MichelinRestaurants.JSON','utf-8')
    return (JSON.parse(scrappingResult))
}

//ScrapMichelinRestaurants();
