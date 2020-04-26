# Bike Alert Mobile App

BikeAlert is a mobile app to alert drivers of nearby bicyclists. The app can be used by both bicyclists and drivers. Bicyclists send their location to a database during a ride and drivers see relevant bicyclists on their map. 

<!--<p align="center"><img src="readmeFiles/appIcon.png?raw=true" /></p>-->

## Motiviation

Each year in the US, ~800 cyclists die in automobile accidents. These collisions could be reduced if automobile drivers were more aware of nearby bicyclists. Since most bicyclists carry their phones during rides, a phone app could increase safety.

## Screenshots

<p align="center">
  <img src="readmeFiles/mainPage.png?raw=true" />
  <img src="readmeFiles/bikerInitial.png?raw=true" />
  <img src="readmeFiles/mapInitial.png?raw=true" />
</p>

<p align="center">
  Left to Right: Main page, Bicyclist Page, Driver Page
</p>

## Bicyclist Features

Bicyclists open the app before a ride and press a button to start sending their location to a database.

<!--<p align="center"><img src="readmeFiles/startSend.gif?raw=true" /></p>-->

* ### Updating Locations

<p align="center"><img src="readmeFiles/updatingDatabase.gif?raw=true" /></p>

As a bicyclist moves, their location updates in real time in the Firebase database.

## Driver Features

Drivers use the app like any other map servie. When a bicyclist nears the driver, they can see that bicyclist’s location on their map and receive a notification.

* ### Directions  

<p align="center"><img src="readmeFiles/mapDirectionsCrop.png?raw=true" /></p>

Drivers can search for locations and get directions with Google api.

* ### Dyanimc Filter 

<p align="center"><img src="readmeFiles/workingFilterSmall.gif?raw=true" /></p>

Each driver has a filter to select relevant bicyclists. The filter updates with driver speed and heading.

* ### Directional Notifications

<p align="center"><img src="readmeFiles/workingNotificationsSmall.gif?raw=true" /></p>

When a bicyclist appears within a driver's filter, they recieve a notification. This notification show the location of the bicyclists relative to the driver

## Notes

This project was created as part of Purdue's professional master progam