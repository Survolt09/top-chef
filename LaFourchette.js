
// API used for getting ID  : 
// 'https://m.lafourchette.com/api/restaurant-prediction?name=l%27Olivier&origin_code_list%5B%5D=THEFORKMANAGER'


//API used for getting promotions
// 'https://m.lafourchette.com/api/restaurant/idRestaurant/sale-type'

// The poor number of restaurants with promotions is due to the lack of restaurant in the API
// and issues with undefined object from the promotion API. A little bit disappointed.

var michelin = require('./Michelin')
const API = 'https://m.lafourchette.com/api/restaurant/';
const request = require('request');
var nbrRestThatExistInTheAPI = 0

var AvailableRestaurantsLaFourchette = [];

//This function get the available restaurant on the LaFourchette API by comparing  the zipcode.
function getAvailableRestaurantsLaFourchette(singleRestaurant) {

  var configuration = {
    'uri': `https://m.lafourchette.com/api/restaurant-prediction?name=${singleRestaurant.name}&origin_code_list%5B%5D=THEFORKMANAGER`
  }
  console.log(configuration)
  return new Promise((resolve, reject) => {
    request(configuration, (err, response, body) => {
      if (err) {
        return reject()
      }
      else {
        if (body.length == 2) { // If the result from API is : [] , it means that the restaurant doesn't exist on the API
          console.log(`Le restaurant ${singleRestaurant.name} n'existe pas dans l'API`)
          return resolve()
        }
        else {
          try {
            // Browse the Api result and search for the same zipcode. 
            //If it is the case , we push the actual restaurant into the list of available restaurant in LaFrouchette
            var apiRes = JSON.parse(body)
            apiRes.forEach((element) => { 
              if (element.address.postal_code == singleRestaurant.zipcode) {
                nbrRestThatExistInTheAPI++
                singleRestaurant.idFromAPI = element.id;
                AvailableRestaurantsLaFourchette.push(singleRestaurant)
                console.log(`Le restaurant ${singleRestaurant.name} existe dans l'API`)
                console.log(nbrRestThatExistInTheAPI)
                return resolve()
              }
            })
            return resolve()
          } catch (err) { // Catch error , sometimes it fails to parse the body... 
            console.log(`Erreur pour le restaurant ${singleRestaurant.name}`)
            return resolve()
          }
        }
      }
    })
  })
}

//Get promotion with the API followed by /sale-type and parse the body. 
function getSaleOnLaFourchette(singleRestaurant) {
  var configuration = {
    uri: API + singleRestaurant.idFromAPI + '/sale-type'
  }
  console.log(configuration)
  return new Promise((resolve, reject) => {
    request(configuration, (err, response, body) => {
      if (!err) {
        var content = JSON.parse(body)
        singleRestaurant.Sale = content;
        return resolve()
      }
      return resolve()
    })
  })
}

// This function print the available restaurant with special offer. 
function printRestaurantInConsole(){

  AvailableRestaurantsLaFourchette.forEach((restaurant) => {
    if (typeof (restaurant.Sale) != "undefined" && restaurant.Sale[0].is_special_offer == true) {

      console.log("----Restaurant----\n\n" + restaurant.name + "\n\n------------------\n\n")
      console.log("              ----Promotion----\n\n" + 
      "                 " +restaurant.Sale[0].title + "\n\n" )
      console.log("                             ----Restaurant Infos----\n\n")
      console.log("                                 ----Address----\n\n" + 
      "                                      " +restaurant.road + "\n\n")
      console.log("                                 ----Locality----\n\n" + 
      "                                      " +restaurant.locality + "\n\n" )
      console.log("                                 ----Zipcode----\n\n" + 
      "                                      " +restaurant.zipcode + "\n\n")
    }
  })
}


async function getPromotion() {

  var michelinJSONRestaurants = michelin.get();//Retrieve JSON document of Michelin Starred restaurants
  
  var michelinRestaurantsArray = michelinJSONRestaurants.restaurants //Get the array of michelin restaurant for mapping

  //Get available restaurants on LaFourchette 
  const idPromises = michelinRestaurantsArray.map((restaurant) => getAvailableRestaurantsLaFourchette(restaurant)) 

  //Wait for all the promises to get resolve and print available restaurant list.
  await Promise.all(idPromises) 
    .then(() => {
      console.log(AvailableRestaurantsLaFourchette)
    })
    .catch((err) => console.log(err))

  //Get sales for each restaurants in the available restaurants
  const salePromises = AvailableRestaurantsLaFourchette.map((restaurant) => getSaleOnLaFourchette(restaurant))

  //Wait for all the promises to get resolve and print available restaurant list with sales.
  await Promise.all(salePromises)
    .then(() => {
      console.log(AvailableRestaurantsLaFourchette)
    })
    .catch((err) => console.log(err))

  printRestaurantInConsole()
}


getPromotion()

