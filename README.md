# Bike Alert Mobile App <img src="readmeFiles/appIcon.png?raw=true" />

BikeAlert is a mobile app to alert drivers of nearby bicyclists. The app can be used by both bicyclists and drivers. Bicyclists send their location to a database during a ride and drivers see relevant bicyclists on their map. 

<!--<p align="center"></p>-->

## Motiviation

Each year in the US, ~800 cyclists die in automobile accidents. This number could be reduced if automobile drivers were more aware of nearby bicyclists. Since most bicyclists carry their phones during rides, a phone app could increase safety.

## Screenshots

<p align="center">
  <img src="readmeFiles/mainPage.png?raw=true" />
  <img src="readmeFiles/bikerInitial.png?raw=true" />
  <img src="readmeFiles/mapInitial.png?raw=true" />
</p>

<p align="center">
  Left to Right: Home page, Bicyclist Page, Driver Page
</p>

## Used by Bicyclist

Bicyclists open the app before a ride and press a button to start sending their location to the Firebase database.

<!--<p align="center"><img src="readmeFiles/startSend.gif?raw=true" /></p>-->

* ### Updating Locations

<p align="center"><img src="readmeFiles/updatingDatabase.gif?raw=true" /></p>

As the bicyclist moves, the Firebase database updates their location in real time.

## Used by Driver

Drivers use the app like any other map service, seeing their location and getting directions. BikeAlert's differences appear when a bicyclist nears the driver. Drivers can see that bicyclist’s location on their map and receive a notification of the bicyclist's direction.

* ### Directions  

<p align="center"><img src="readmeFiles/mapDirectionsCrop.png?raw=true" /></p>

Drivers can search for locations and get directions from Google api.

* ### Dyanimc Filter 

<p align="center"><img src="readmeFiles/workingFilterSmall.gif?raw=true" /></p>

Each driver has an individualized filter to select relevant bicyclists, updating with the driver's speed and heading.

* ### Directional Notifications

<p align="center"><img src="readmeFiles/workingNotificationsSmall.gif?raw=true" /></p>

When a bicyclist appears within the driver's filter, they recieve a notification showing the direction of the bicyclists relative to the driver. Depending on a driver's settings, notifications offer an audio warning and appear when the app is closed.

## Notes

This project was created as part of Purdue's professional master progam