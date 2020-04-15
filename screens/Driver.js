import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { Button } from 'native-base';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import RNLocation from 'react-native-location';

import Polyline from '@mapbox/polyline'
import firebase from '../database/firebaseDb'
import { GeoFirestore } from 'geofirestore';

export default class BikerOrDriver extends React.Component {
  state = {
    ready: false,
    lat: 40.4241, //null, 
    lng: -86.9217, //null,
    speed: 0,
    heading: 0,
    error: null,
    desLat: 37.885874,
    desLng: -122.506447,
    desPlace_Id: null,
    destination: "",
    predictions: [],
    markers: [],
  }

  componentWillUnmount() {
    if (this.locationSubscription) {
      this.locationSubscription();
    }
  }

  componentDidMount() {
    let geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maxAge: 60*60
    }
    var currLat
    var currLng
    this.setState({ready: false, error: null})
    
    RNLocation.configure({
      distanceFilter: 0
    })
    RNLocation.checkPermission({
      ios: 'whenInUse', // or 'always'
      android: {
        detail: 'coarse' // or 'fine'
      }
    }).then(granted => {
      if (granted) {
        console.log('granted')
        this.locationSubscription = RNLocation.subscribeToLocationUpdates(locations => {
          console.log('location sub: ' + locations[0].latitude + ' ' + locations[0].longitude)
          currLat = locations[0].latitude
          currLng = locations[0].longitude
          this.getBicyclistsWithinRadius(currLat,currLng)
          this.setState({
            //speed: locations[0].speed,
            //course: locations[0].course,
            lat: locations[0].latitude,
            lng: locations[0].longitude
          }, )//this.mergeCoords)
        })
        //console.log('currLat: ' + currLat)
        
      } else {
          RNLocation.requestPermission({
            ios: "whenInUse",
            android: {
              detail: "coarse"
            }
          }).then(granted => {
              if (granted) {
                this.locationSubscription = RNLocation.subscribeToLocationUpdates(locations => {
                  console.log('location')
                  console.log(locations)
                  currLat = locations[0].latitude
                  currLng = locations[0].longitude
                  console.log('new lat: ' + locations[0].latitude)
                  console.log('new lng: ' + locations[0].longitude)
                  this.setState({
                    //speed: locations[0].speed,
                    //course: locations[0].course,
                    lat: locations[0].latitude,
                    lng: locations[0].longitude
                  }, )//this.mergeCoords)
              })
            }
          })  
        }
      })


    //dbRef = firebase.firestore().collection('Locations');
  }

  getBicyclistsWithinRadius = (currLat,currLng) => {
    var firebaseRef = firebase.firestore();
    const geofirestore = new GeoFirestore(firebaseRef);
    const geocollection = geofirestore.collection('Locations');
    console.log('showing markers around ' + currLat + ' , ' + currLng)
    const query = geocollection.near({ 
      center: new firebase.firestore.GeoPoint(currLat,currLng), 
      radius: .038//.2230258222650538385556373555118625517
    });
    var pulledMarkers = [];
    query.get().then((value) => {
      // All GeoDocument returned by GeoQuery, like the GeoDocument added above
      value.forEach(e => {
        const lat = e.data().coordinates.U;
        const lng = e.data().coordinates.k;
        pulledMarkers.push(
          <Marker
            key={(lat + lng).toString()}
            coordinate = {{
              latitude: lat, 
              longitude: lng
            }}
            pinColor = {"orange"}
          />
        )
      })
      console.log(pulledMarkers)
      this.setState({markers: pulledMarkers})
      value.docChanges(e => {
        console.log("change: " + e);
      })
    });
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

  mergeCoords = () => {
    lat = this.state.lat
    lng = this.state.lng
    desLat = this.state.desLat
    desLng = this.state.desLng

    const hasStartAndEnd = lat != null && desLat != null
    if (hasStartAndEnd) {
      const concatStart = `${lat},${lng}`
      const concatEnd = `${desLat},${desLng}`
      this.getDirections(concatStart, concatEnd)
    }
  }

  async getDirections() {
    console.log('get directions')
    if (this.state.desPlace_Id==null) {
      console.log('enter a dest')
      return
    }
    try {
      const resp = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.state.desPlace_Id}&fields=geometry&key=AIzaSyAQ6JZnM-5sMY9Za63OUKE2fNvRQy_h9CY`)
      const json = await resp.json()
      console.log('current coords');
      console.log(this.state.lat);
      console.log(this.state.lng);
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
    console.log('getting directions')
    const apiKey = "AIzaSyAQ6JZnM-5sMY9Za63OUKE2fNvRQy_h9CY";
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${desLoc}&key=${apiKey}`;
    
    try {
      const resp = await fetch(apiUrl)
      console.log('resp')
      const respJson = await resp.json()
      const points = Polyline.decode(respJson.routes[0].overview_polyline.points)
      const coords = points.map(point => {
        return {
          latitude : point[0],
          longitude : point[1]
        }
      })
      
      this.setState({ coords })
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
      //console.log(json);
      this.setState({
        predictions: json.predictions
      })
    } catch (err) {
      console.error(err);
    }
  }

  onSetDestination = prediction => {
    console.log(prediction.place_id)
    this.setState({ 
      destination: prediction.description,
      desPlace_Id: prediction.place_id,
      predictions: [],
    });
  }

  render() {
    //console.log(this.state.lat)
    //console.log(this.state.lng)
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
          <MapView.Polyline 
            strokeWidth = {2}
            strokeColor = {'red'}
            coordinates = {this.state.coords}
          />
          <MapView.Circle
                key = { (this.state.lat + this.state.lng).toString() }
                center = {{latitude: this.state.lat, longitude: this.state.lng}}
                radius = { 35 }
                strokeWidth = { 2 }
                strokeColor = { 'black' }
                fillColor = { 'rgba(230,238,255,0.5)' }
                //onRegionChangeComplete = { this.onRegionChangeComplete.bind(this) }
        />
        </MapView>
        <View style={styles.mapInput}>
          <TextInput style={styles.destinationInput}placeholder="Enter destination..." value={this.state.destination} onChangeText={destination => this.onChangeDestination(destination)} />
          <Button 
            full
            style={styles.directionsButton} 
            onPress={() => this.getDirections()}>
            <Text>-></Text>
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