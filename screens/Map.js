import React, { Component } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  Keyboard,
  TouchableHighlight,
  SafeAreaView,
  Button
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { GOOGLE_API_KEY } from "../config/keys";
import _ from "lodash";
import PolyLine from "@mapbox/polyline";
import Icon from "react-native-vector-icons/Ionicons";
import {stopNaviFirebaseHandler} from '../api/firebaseMethods'

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      latitude: 0,
      longitude: 0,
      destination: "",
      destinationPlaceId: "",
      predictions: [],
      pointCoords: [],
      routingMode: false,
      displayMainSearchBar: true,
      yourLocation: "",
      yourLocationPredictions: [],
      totalDistance: 0,
      totalDuration: 0,
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
    this.onChangeYourLocationDebounced = _.debounce(
      this.onChangeYourLocation,
      1000
    );
  }

  componentDidMount() {
    //Get current location and set initial region to this
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
  }

  async getRouteDirections(yourStartingPlaceId, destinationPlaceId, startingName, destinationName) {
    try {
      let apiUrl
      if (yourStartingPlaceId) {
        apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourStartingPlaceId}&destination=place_id:${destinationPlaceId}&mode=walking&key=${GOOGLE_API_KEY}`
      } else {
        apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=walking&key=${GOOGLE_API_KEY}`
      }
      console.log('apiUrl----->', apiUrl)
      const response = await fetch(apiUrl);
      const json = await response.json();

      console.log(json.routes[0].legs[0].distance.value)
      console.log(json.routes[0].legs[0].duration.value)
      const totalDistance = (json.routes[0].legs[0].distance.value)/1000
      const totalDuration = (json.routes[0].legs[0].duration.value)/60
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        predictions: [],
        destination: destinationName,
        yourLocation: startingName, 
        yourLocationPredictions: [],
        totalDistance: totalDistance,
        totalDuration: totalDuration,
      });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords);
     } catch (error) {
      console.error(error);
    }
  }

  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}
    &input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async onChangeYourLocation(yourLocation) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}
    &input=${yourLocation}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        yourLocationPredictions: json.predictions,
      });
    } catch (err) {
      console.error(err);
    }
  }

  gotToMyLocation() {
    console.log("gotToMyLocation is called");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (this.map) {
          this.map.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          });
        }
      },
      (error) => alert("Error: Are location services on?"),
      { enableHighAccuracy: true }
    );
  }
  stopNaviHelper(){
    console.log("stopNaviHelper is called");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (this.map) {
          this.map.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          });
        }
      },
      (error) => alert("Error: Are location services on?"),
      { enableHighAccuracy: true }
    );
    stopNaviFirebaseHandler(this.state.totalDistance, this.state.totalDuration)
  }
  startNaviHandler(){
    this.setState({
      routingMode : true,
    })
  }
  stopNaviHandler(){
    this.setState({
      routingMode : false,
    })
    this.stopNaviHelper()
  }
  render() {
    let marker = null;

    if (this.state.pointCoords.length > 1) {
      marker = (
        <Marker
          coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
        />
      );
    }

    const predictions = this.state.predictions.map((prediction) => (
      <TouchableHighlight
        key={prediction.place_id}
        onPress={() => {
          this.getRouteDirections(
            null,
            prediction.place_id,
            null,
            prediction.structured_formatting.main_text,
          );

            this.setState({
              displayMainSearchBar: false,
              destinationPlaceId: prediction.place_id,
              // destination:  prediction.structured_formatting.main_text,
            });
        }}
      >
        <View>
          <Text style={styles.suggestions}>{prediction.description}</Text>
        </View>
      </TouchableHighlight>
    ));

    const yourLocationPredictions = this.state.yourLocationPredictions.map((prediction) => (
      <TouchableHighlight
        key={prediction.place_id}
        onPress={() => {
          this.getRouteDirections(
            prediction.place_id,
            this.state.destinationPlaceId,
            prediction.structured_formatting.main_text,
            this.state.destinationName,
          );
            this.setState({
              displayMainSearchBar: false,
              // yourLocation: prediction.structured_formatting.main_text,
            });

        }}
      >
        <View>
          <Text style={styles.suggestions}>{prediction.description}</Text>
        </View>
      </TouchableHighlight>
    ));

    return (
      <View style={styles.container}>
        <MapView
          ref={(map) => {
            this.map = map;
          }}
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}
          followsUserLocation={this.state.routingMode}
        >
          <Polyline
            coordinates={this.state.pointCoords}
            strokeWidth={4}
            strokeColor="#49BEAA"
          />
          {marker}
        </MapView>

        {/* Main Search Bar */}
        {this.state.displayMainSearchBar ? (
          <TextInput
            placeholder="Enter destination..."
            style={styles.destinationInput}
            value={this.state.destination}
            clearButtonMode="always"
            onChangeText={(destination) => {
              this.setState({ destination });
              this.onChangeDestinationDebounced(destination);
            }}
          />
        ) : (
          <View style={styles.searchContainer}>
            <SafeAreaView style={styles.inputContainer}>
              <View style={{ flex: 1 }}>
                <Icon
                  name="ios-radio-button-on-outline"
                  size={22}
                  style={styles.icon}
                  color={"#2452F9"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Your location"
                  style={styles.yourLocationInput}
                  value={this.state.yourLocation}
                  clearButtonMode="always"
                  onChangeText={(yourLocation) => {
                    this.setState({ yourLocation });
                    this.onChangeYourLocationDebounced(yourLocation);
                  }}
                />
              </View>
            </SafeAreaView>

            <SafeAreaView style={styles.inputContainer}>
              <View style={{ flex: 1 }}>
                <Icon
                  name="ios-location"
                  size={22}
                  style={styles.icon}
                  color={"#EA484E"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Enter destination..."
                  style={styles.destinationChangeInput}
                  value={this.state.destination}
                  clearButtonMode="always"
                  onChangeText={(destination) => {
                    // console.log(destination);
                    this.setState({ destination });
                    this.onChangeDestinationDebounced(destination);
                  }}
                />
              </View>
            </SafeAreaView>
          </View>
        )}
        {predictions}
        {yourLocationPredictions}
        <Button
          title="Relocate User"
          onPress={() =>
            this.gotToMyLocation(
              <Button
                title="End Navigation"
                onPress={() => {
                  this.stopNaviHandler();
                }}
              />
            )
          }
        />

        {this.state.totalDistance > 0 ? this.state.routingMode === true ? (
          <Button
            title="End Navigation"
            onPress={() => {
              this.stopNaviHandler();
            }}
          />
        ) : (
          <Button
            title="Start Navigation"
            onPress={() => {
              this.startNaviHandler();
            }}
          />
        ): (<Button title="input a destination"/>)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5,
  },
  destinationInput: {
    height: 40,
    borderWidth: 0.5,
    marginTop: 50,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white",
  },
  yourLocationInput: {
    height: 40,
    borderWidth: 0.5,
    marginLeft: "-76%",
    padding: 5,
    backgroundColor: "white",
    width: 330,
    justifyContent: "flex-end",
  },
  destinationChangeInput: {
    height: 40,
    borderWidth: 0.5,
    marginLeft: "-76%",
    padding: 5,
    backgroundColor: "white",
    width: 330,
  },
  searchContainer: {
    backgroundColor: "white",
    paddingBottom: "10%",
  },
  icon: {
    justifyContent: "flex-start",
    marginLeft: "8%",
    marginTop: "4%",
  },

  inputContainer: {
    flexDirection: "row",
    marginTop: "2%",
  },
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
