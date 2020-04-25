# Bike Alert Mobile App

<p align="center"><img src="readmeFiles/appIcon.png?raw=true" /></p>

Each year in the US, approximately 800 cyclists are killed in automobile accidents. 65% of these fatalities involve bicyclists between the ages of 25 and 65. Bicyclist-automobile collisions could be reduced if automobile drivers were more aware of nearby bicyclists. 

BikeAlert is a phone application to reduce bicycle-automobile collisions by alerting drivers of nearby bicyclists. The app system consists of a single application used by bicyclists and drivers as well as a database to hold bicyclist locations. Bicyclists’ phones send their location to the database and drivers’ phones search the database for relevant entries to show on the map. The BikeAlert app is used by both drivers and bicyclists, with differing functionality depending on the user.

Bicyclists open the app before a ride and press a button to start sending their location. Once this process starts, they put away their phone and begin their ride. As the bicyclist goes on their ride, their location will be sent to relevant drivers. 
Drivers use the app like any other map application. Drivers can search for their location and get directions or just start driving. When a bicyclist nears the driver, they can see that bicyclist’s location on their map and receive a notification.



<p align="center">
  <img src="readmeFiles/mainPage.png?raw=true" />
  <img src="readmeFiles/mapInitial.png?raw=true" />
  <img src="readmeFiles/bikerInitial.png?raw=true" />
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
