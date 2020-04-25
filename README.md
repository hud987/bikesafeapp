# Bike Alert Mobile App

<p align="center"><img src="readmeFiles/appIcon.png?raw=true" /></p>

Each year in the US, ~800 cyclists die in automobile accidents. BikeAlert is a phone application to reduce this number by alerting drivers of nearby bicyclists. 

BikeAlert is used by bicyclists and drivers. Bicyclists open the app before a ride and press a button to start sending their location to a database. Drivers use the app like any other map servie. When a bicyclist nears the driver, they can see that bicyclist’s location on their map and receive a notification.

<p align="center">
  <img src="readmeFiles/mainPage.png?raw=true" />
  <img src="readmeFiles/mapInitial.png?raw=true" />
  <img src="readmeFiles/bikerInitial.png?raw=true" />
</p>

<p align="center">
  Left to Right: Main page, Driver Page, Bicyclist Page
</p>

## Features

The app consists of separate driver and bicyclist portions

### Dyanimc Filter 

<p align="center"><img style={{width: 100}} src="readmeFiles/workingFilterSmall.gif?raw=true" /></p>

Each driver has a filter to select relevant bicyclists

### Dyanimc Notifications

<p align="center"><img src="readmeFiles/workingNotificationsSmall.gif?raw=true" /></p>

When a bicyclist appears within a driver's filter, they recieve a notification. THis notification show the location of the bicyclists relative to the driver

* __Move Nodes:__ Nodes can be moved around by clicking and dragging. Nodes can overlap but can't be dragged offscreen.
