import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { Button} from 'native-base';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import RNLocation from 'react-native-location';
//import Geolocation from 'react-native-geolocation-service';
import Polyline from '@mapbox/polyline'
//import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default class BikerOrDriver extends React.Component {
  state = {
    ready: false,
    lat: 40.4237, //null, 37.78825
    lng: -86.9212, //null, -122.4324
    speed: 0,
    heading: 0,
    error: null,
    desLat: 37.885874,
    desLng: -122.506447,
    desPlace_Id: null,
    destination: "",
    predictions: [],
  }

  componentWillUnmount() {
    this.locationSubscription();
  }

  componentDidMount() {
    let geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maxAge: 60*60
    }
    this.setState({ready: false, error: null})
    
    RNLocation.configure({
      distanceFilter: 0
    })
    console.log('did mount')
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
            this.setState({
              lat: locations[0].latitude,
              lng: locations[0].longitude
            }, )//this.mergeCoords)
        })
      }
    })  
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
    console.log('merging coords')
    console.log('lat')
    console.log(this.state.lat)
    console.log('lng')
    console.log(this.state.lng)
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
          initialRegion={{
            latitude: 40.4237,
            longitude: -86.9212,
            latitudeDelta: 0.0522,
            longitudeDelta: 0.0221,
          }}
        >
          <MapView.Polyline 
            strokeWidth = {2}
            strokeColor = {'red'}
            coordinates = {this.state.coords}
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