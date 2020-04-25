import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { Button } from 'native-base';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import RNLocation from 'react-native-location';
import AsyncStorage from '@react-native-community/async-storage';

import Polyline from '@mapbox/polyline'
import firebase from '../database/firebaseDb'
import { GeoFirestore } from 'geofirestore';
import {Notifications} from 'react-native-notifications';

export default class BikerOrDriver extends React.Component {
  state = {
    ready: false,
    lat: 40.4241, //null, 
    lng: -86.9217, //null,
    speed: 0,
    course: -1,
    lastCourseGreaterThanNegOne: null,
    error: null,
    desLat: 37.885874,
    desLng: -122.506447,
    desPlace_Id: null,
    destination: "",
    predictions: [],
    //markers: [],
    directionLine: null,
  }

  componentWillUnmount() {
    /*const saveMapOpen = async () => {
      try {
        await AsyncStorage.setItem('mapOpen', false);
      } catch (error) {
        console.log(error.message);
      }
      console.log('set map open to false document id')
    };*/
    this.mapOpen = false;
    console.log('map open: ' + this.mapOpen)
    if (this.locationSubscription) {
      this.locationSubscription();
    }
  }

  componentDidMount() {  
    /*const saveMapOpen = async () => {
      try {
        await AsyncStorage.setItem('mapOpen', true);
      } catch (error) {
        console.log(error.message);
      }
      console.log('set map open to true')
    };
    saveMapOpen()  */
    this.mapOpen = true
    console.log('map open: ' + this.mapOpen)
    
    RNLocation.configure({
      distanceFilter: 1
    })
    RNLocation.checkPermission({
      ios: 'whenInUse', // or 'always'
      android: {
        detail: 'coarse' // or 'fine'
      }
    }).then(granted => {
      if (granted) {
        this.startLocationSubscription()
      } else {
          RNLocation.requestPermission({
            ios: "whenInUse",
            android: {
              detail: "coarse"
            }
          }).then(granted => {
            if (granted) {
              this.startLocationSubscription() 
            }
          })  
        }
      })
  }

  startLocationSubscription = () => {
    this.locationSubscription = RNLocation.subscribeToLocationUpdates(locations => {
      var currLat = locations[0].latitude
      var currLng = locations[0].longitude
      var courseIfCourseGreaterThanNegOne = null
      console.log('course: ' + locations[0].course )
      console.log('speed: ' + locations[0].speed )
      //console.log('last course > -1: ' + this.state.lastCourseGreaterThanNegOne )
      if (locations[0].course>-1) {
        courseIfCourseGreaterThanNegOne = locations[0].course
      }
      this.getBicyclistsWithinRadius(currLat,currLng)
      this.setState({
        speed: locations[0].speed,
        course: locations[0].course,
        lastCourseGreaterThanNegOne: courseIfCourseGreaterThanNegOne,
        lat: locations[0].latitude,
        lng: locations[0].longitude
      }, )
    })
  }

  getBicyclistsWithinRadius = (currLat,currLng) => {
    var filterRadius = .036
    var forwardLat = currLat
    var forwardLng = currLng
    if (this.state.speed >-1 && this.state.course > -1) {
      filterRadius *= 1 + (this.state.speed/10.0)
      forwardLat += this.state.speed * .00004 * Math.cos(this.state.course * 3.14/180.0)
      forwardLng += this.state.speed * .00004 * Math.sin(this.state.course * 3.14/180.0)
    }

    var firebaseRef = firebase.firestore();
    const geofirestore = new GeoFirestore(firebaseRef);
    const geocollection = geofirestore.collection('Locations');
    const query = geocollection.near({ 
      center: new firebase.firestore.GeoPoint(forwardLat,forwardLng), 
      radius: filterRadius//.2230258222650538385556373555118625517
    });
    
    query.onSnapshot((value) => {
      var pulledMarkers = [];
      var pulledMarkersLatLng = [];
      var pulledMarkerIds = [];
      console.log(value.size)
      value.forEach((e,i) => {
        //console.log('marker data: ' + e.id)
        const lat = e.data().coordinates.U;
        const lng = e.data().coordinates.k;
        pulledMarkersLatLng.push([lat,lng])
        pulledMarkerIds.push(e.id)
        pulledMarkers.push(
          <Marker
            key={e.id}
            coordinate = {{
              latitude: lat, 
              longitude: lng
            }}
            pinColor = {"green"}
          />
        )
      })
      
      if (this.state.markers && pulledMarkers.length > this.state.markers.length && this.mapOpen) {
        var stateMarkerIdsSet = new Set()
        this.state.markerIds.forEach((e,i) => {
          stateMarkerIdsSet.add(e)
        })

        for (var i=0;i<pulledMarkers.length;i++){
          if (!stateMarkerIdsSet.has(pulledMarkerIds[i])) {
            console.log('!--- notification ---!')
            newBikerLat = pulledMarkersLatLng[i][0]
            newBikerLng = pulledMarkersLatLng[i][1]

            if (this.state.lastCourseGreaterThanNegOne==null) {
              Notifications.postLocalNotification({
                body: "A Biker has appeared nearby",
                title: "Biker nearby",
                sound: "chime.aiff",
                  silent: false,
                category: "SOME_CATEGORY",
                userInfo: { }
              });
            } else {
              var angleOfNewBiker = this.findAngle(forwardLng,forwardLat,currLng,currLat,newBikerLng,newBikerLat)

              var newBikerDirectionText
              if (angleOfNewBiker<45 || angleOfNewBiker>=315) {
                newBikerDirectionText = 'in front of you'
              } else if (angleOfNewBiker>=45 && angleOfNewBiker<135) {
                newBikerDirectionText = 'to your left'
              } else if (angleOfNewBiker>=135 && angleOfNewBiker<225) {
                newBikerDirectionText = 'behind you'
              } else {
                newBikerDirectionText = 'to your right'
              }
              
              //console.log('angle of new biker:' + angleOfNewBiker)
              //console.log('new biker lat, lng:' + newBikerLat + ' , '+ newBikerLng)
              //console.log('curr lat, lng:' + currLat + ' , ' + currLng)
              //console.log('foward point lat, lng:' + forwardLat + ' , ' + forwardLng)
              Notifications.postLocalNotification({
                body: "A biker has appeared " + newBikerDirectionText,
                title: "Biker " + newBikerDirectionText,
                sound: "chime.aiff",
                  silent: false,
                category: "SOME_CATEGORY",
                userInfo: { }
              });
            }
          }
        }
      } 
      this.setState({
        markers: pulledMarkers,
        markerIds: pulledMarkerIds,
      })
    });
  }
  
  findAngle = (Ax,Ay,Bx,By,Cx,Cy) =>{
    var AB = Math.sqrt(Math.pow(Bx-Ax,2)+ Math.pow(By-Ay,2));    
    var BC = Math.sqrt(Math.pow(Bx-Cx,2)+ Math.pow(By-Cy,2)); 
    var AC = Math.sqrt(Math.pow(Cx-Ax,2)+ Math.pow(Cy-Ay,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB)) * 180 / Math.PI;
}

  handlePerm(perms) {
    Alert.alert("Permissions", JSON.stringify(perms));
  }

  geoSuccess = (position) => {
    this.setState({
      ready: true,
      where: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed,
        heading: position.coords.heading}
    })
  }

  geoFailure = (err) => {
    this.setState({error: err.message})
  }

  async getDirections() {

    console.log('get directions')
    if (this.state.desPlace_Id==null || this.state.destination=='') {
      this.setState({ directionLine: null })
      return
    }
    try {
      const resp = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.state.desPlace_Id}&fields=geometry&key=AIzaSyAQ6JZnM-5sMY9Za63OUKE2fNvRQy_h9CY`)
      const json = await resp.json()
      this.getDirectionsTwo(`${this.state.lat}, ${this.state.lng}`,`${json.result.geometry.location.lat}, ${json.result.geometry.location.lng}`)
      this.setState({
        desLat: json.result.geometry.location.lat,
        desLng: json.result.geometry.location.lng,
      })
    } catch (err) {
      console.error(err);
    }
  }

  async getDirectionsTwo(startLoc, desLoc) {
    const apiKey = "AIzaSyAQ6JZnM-5sMY9Za63OUKE2fNvRQy_h9CY";
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${desLoc}&key=${apiKey}`;
    
    try {
      const resp = await fetch(apiUrl)
      const respJson = await resp.json()
      const points = Polyline.decode(respJson.routes[0].overview_polyline.points)
      const coords = points.map(point => {
        return {
          latitude : point[0],
          longitude : point[1]
        }
      })
      
      this.setState({ directionLine:           
        <MapView.Polyline 
          strokeWidth = {2}
          strokeColor = {'red'}
          coordinates = {coords}
        /> })
    } catch(error) {
      console.log('error: ' + error)
    }
  }

  async onChangeDestination(destination) {
    this.setState({ destination });
    const apiKey = "AIzaSyAQ6JZnM-5sMY9Za63OUKE2fNvRQy_h9CY";
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${destination}&location=${this.state.lat}, ${this.state.lng}&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions
      })
    } catch (err) {
      console.error(err);
    }
  }

  onSetDestination = prediction => {
    this.setState({ 
      destination: prediction.description,
      desPlace_Id: prediction.place_id,
      predictions: [],
    });
  }

  render() {
    //speed maxes at 30
    //course is between 1-360, 0 is straight up
    var forwardLat = this.state.lat //37.33180957
    var forwardLng = this.state.lng //-122.03053391
    var filterCircleRadius = 35
    var filterCircleCenter = {latitude: this.state.lat, longitude: this.state.lng}
    if (this.state.speed > 0 && this.state.course > -1) {
      filterCircleRadius *= 1 + (this.state.speed/10.0)

      forwardLat = this.state.lat + this.state.speed * .00004 * Math.cos(this.state.course * 3.14/180.0)
      forwardLng = this.state.lng + this.state.speed * .00004 * Math.sin(this.state.course * 3.14/180.0)
      filterCircleCenter = {latitude: forwardLat, longitude: forwardLng}
    }

    const predictions = this.state.predictions.map(prediction => {
      if (this.state.destination != prediction.description) {
        return (
        <Text 
          style={styles.suggestions}
          onPress={()=>this.onSetDestination(prediction)} 
          key={prediction.id}
        >
          {prediction.description}
        </Text>
        )}
    });
    return(
      <View style={styles.screen}>
        <MapView
          showsUserLocation
          provider={PROVIDER_GOOGLE}
          style={styles.screen}
          region={{
            latitude: this.state.lat,//40.4237,
            longitude: this.state.lng,//-86.9212,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          }}
        >
          { this.state.markers }
          { this.state.directionLine }
          <MapView.Polyline 
            strokeWidth = {2}
            strokeColor = {'black'}
            coordinates = {[
              {"latitude":this.state.lat, "longitude":this.state.lng},
              {"latitude": forwardLat, "longitude": forwardLng}
            ]}
          /> 
          <MapView.Circle
                key = { (this.state.lat + this.state.lng).toString() }
                center = { filterCircleCenter }//{{latitude: this.state.lat, longitude: this.state.lng}}
                radius = { filterCircleRadius }
                strokeWidth = { 2 }
                strokeColor = { 'black' }
                fillColor = { 'rgba(230,238,255,0.5)' }
        />
        </MapView>
        <View style={styles.mapInput}>
          <TextInput style={styles.destinationInput}placeholder="Enter destination..." value={this.state.destination} onChangeText={destination => this.onChangeDestination(destination)} />
          <Button 
            full
            success={true}
            style={styles.directionsButton} 
            onPress={() => this.getDirections()}>
            <Text style={{color: 'white'}}>-></Text>
          </Button> 
        </View>
        {predictions}

      </View>
    );
  }
};

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject
    //backgroundColor: 'blue'
  },
  destinationInput: {
    marginTop: 10,
    marginLeft: 10,
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    padding:6,
  },
  suggestions: {
    backgroundColor: "white",
    padding: 6,
    fontSize: 18,
    marginHorizontal: 10,
    marginRight: 60,
  },
  directionsButton: {
    height: 40,
    width: 50,
    marginRight: 10,
    padding: 6,
    marginTop: 10,
  },
  mapInput: {
    flexDirection: "row",
  }
});