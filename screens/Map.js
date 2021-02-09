import React, { Component } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  Keyboard,
  Image,
  TouchableHighlight,
  SafeAreaView,
  Button,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { GOOGLE_API_KEY } from "../config/keys";
import _ from "lodash";
import PolyLine from "@mapbox/polyline";
import Icon from "react-native-vector-icons/Ionicons";
import { stopNaviFirebaseHandler } from "../api/firebaseMethods";
import haversine from "haversine";

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      latitude: 0,
      longitude: 0,
      recordedLatitude: null,
      recordedLongitude: null,
      //recorded speed in kilometers per hour... initial recorded speed at meter per second
      recordedSpeed: null,
      recordedDistance: 0,
      //first element in the array will be void due to initial state for latitude and longitude being null
      recordedCoordinates: [],
      prevLatLng: {},
      //timer
      timer: null,
      hours: "00",
      minutes: "00",
      seconds: "00",
      miliseconds: "00",
      recordedDuration: null,
      startDisabled: true,
      stopDisabled: false,
      //------
      destination: "",
      destinationPlaceId: "",
      predictions: [],
      pointCoords: [],
      routingMode: false,
      displayMainSearchBar: true,
      yourLocation: "",
      yourLocationPredictions: [],
      //estimated Distance
      estimatedDistance: 0,
      estimatedDuration: 0,
      selectedDestinationName: "",
      selectedYourLocationName: "",
      directions: [],
      subwayMode: false,
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
        this.setState(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            recordedLatitude: position.coords.latitude,
            recordedLongitude: position.coords.longitude,
          },
          console.log("getCurrentPosition is Running")
        );
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        // console.log("position.coords--->", position.coords);
        const newRecordedCoordinates = {
          latitude: this.state.recordedLatitude,
          longitude: this.state.recordedLongitude,
        };
        if (this.state.routingMode) {
          this.setState(
            {
              recordedLatitude: position.coords.latitude,
              recordedLongitude: position.coords.longitude,
              //speed converted to kilometers per hour
              recordedSpeed: position.coords.speed * 3.6,
              recordedCoordinates: this.state.recordedCoordinates.concat([
                newRecordedCoordinates,
              ]),
              recordedDistance:
                this.state.recordedDistance +
                this.calcDistance(newRecordedCoordinates),
              prevLatLng: newRecordedCoordinates,
            }
            // console.log("watchPosition is Running"),
            // console.log("recordedLatitude--->", this.state.recordedLatitude),
            // console.log("recordedLongitude--->", this.state.recordedLongitude),
            // console.log("recordedDistance--->", this.state.recordedDistance)
          );
          // console.log(
          //   "recordedCoordinates--->",
          //   this.state.recordedCoordinates
          // );
        }
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    this.gotToMyLocation();
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
    clearInterval(this.state.timer);
  }

  // API DIRECTION CALLS
  async getRouteDirections(
    yourStartingPlaceId,
    destinationPlaceId,
    startingName,
    destinationName
  ) {
    //to refractor...
    if (!this.state.subwayMode) {
      try {
        let apiUrl;
        if (yourStartingPlaceId) {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourStartingPlaceId}&destination=place_id:${destinationPlaceId}&mode=walking&key=${GOOGLE_API_KEY}`;
        } else {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=walking&key=${GOOGLE_API_KEY}`;
        }
        // console.log("apiUrl----->", apiUrl);
        const response = await fetch(apiUrl);
        const json = await response.json();
        // console.log('startingName in getRouteDirection---->', startingName)
        // console.log("destinationName in getRouteDirection---->", destinationName);
        console.log(json.routes[0].legs[0].distance.value);
        console.log(json.routes[0].legs[0].duration.value);
        console.log(json.routes[0].legs[0].steps);
        const directionsArr = json.routes[0].legs[0].steps;
        const estimatedDistance = json.routes[0].legs[0].distance.value / 1000;
        const estimatedDuration = json.routes[0].legs[0].duration.value / 60;
        const points = PolyLine.decode(json.routes[0].overview_polyline.points);
        const pointCoords = points.map((point) => {
          return { latitude: point[0], longitude: point[1] };
        });
        this.setState({
          pointCoords,
          predictions: [],
          yourLocationPredictions: [],
          estimatedDistance: estimatedDistance,
          estimatedDuration: estimatedDuration,
          directions: directionsArr,
        });
        destinationName
          ? this.setState({
              destination: destinationName,
            })
          : this.setState({
              yourLocation: startingName,
            });
        //  console.log('destination in getRoute ---->', this.state.destination)
        //  console.log('yourLocation in getRoute ---->', this.state.yourLocation)
        Keyboard.dismiss();
        this.map.fitToCoordinates(pointCoords);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        let apiUrl;
        if (yourStartingPlaceId) {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourStartingPlaceId}&destination=place_id:${destinationPlaceId}&mode=transit&transit_mode=subway&key=${GOOGLE_API_KEY}`;
        } else {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=transit&transit_mode=subway&key=${GOOGLE_API_KEY}`;
        }
        console.log("apiUrl----->", apiUrl);
        const response = await fetch(apiUrl);
        const json = await response.json();
        // console.log('startingName in getRouteDirection---->', startingName)
        // console.log("destinationName in getRouteDirection---->", destinationName);
        console.log(json.routes[0].legs[0].distance.value);
        console.log(json.routes[0].legs[0].duration.value);
        console.log(json.routes[0].legs[0].steps);
        const directionsArr = json.routes[0].legs[0].steps;
        const estimatedDistance = json.routes[0].legs[0].distance.value / 1000;
        const estimatedDuration = json.routes[0].legs[0].duration.value / 60;
        const points = PolyLine.decode(json.routes[0].overview_polyline.points);
        const pointCoords = points.map((point) => {
          return { latitude: point[0], longitude: point[1] };
        });
        this.setState({
          pointCoords,
          predictions: [],
          yourLocationPredictions: [],
          estimatedDistance: estimatedDistance,
          estimatedDuration: estimatedDuration,
          directions: directionsArr,
        });
        destinationName
          ? this.setState({
              destination: destinationName,
            })
          : this.setState({
              yourLocation: startingName,
            });
        //  console.log('destination in getRoute ---->', this.state.destination)
        //  console.log('yourLocation in getRoute ---->', this.state.yourLocation)
        Keyboard.dismiss();
        this.map.fitToCoordinates(pointCoords);
      } catch (error) {
        console.error(error);
      }
    }
  }

  //GOOGLE PLACES PREDICTION CALLS
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

  //MOVE CAMERA BACK TO CURRENT LOCATION
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

  //NAVI BUTTON HELPERS
  stopNaviHelper() {
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
    console.log('seconds---->', this.state.seconds)
    console.log('recordedDuration---->', this.state.recordedDuration)
    //to rearrange later...
    if (!this.state.subwayMode) {
      stopNaviFirebaseHandler(
        this.state.recordedDistance,
        this.state.recordedDuration,
        this.state.estimatedDistance,
        this.state.estimatedDuration
      );
    }
  }
  startNaviHandler() {
    this.setState({
      routingMode: true,
    });
    this.timerStart();
  }
  stopNaviHandler() {
    this.setState({
      routingMode: false,
    });
    this.stopNaviHelper();
    this.timerStop();
    this.timerClear();
  }
  // getMapRegion = () => {
  //   return {
  //     latitude: this.state.latitude,
  //     longitude: this.state.longitude,
  //   };
  // };
  // changedRegion = (region) => {
  //   this.setState({
  //     latitude: region.latitude,
  //     longitude: region.longitude,
  //   });
  // };

  //DISTANCE + TIMER HELPERS
  calcDistance(newLatLng) {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  }

  //TIMER HELPERS
  timerStart() {
    var self = this;
    let timer = setInterval(() => {
      var miliseconds = (Number(this.state.miliseconds) + 1).toString(),
        second = this.state.seconds;
        minute = this.state.minutes;
        hour = this.state.hours;

      if (Number(this.state.miliseconds) == 99) {
        second = (Number(this.state.seconds) + 1).toString();
        miliseconds = "00";
      }
      if (Number(this.state.seconds) == 60) {
        minute = (Number(this.state.minutes) + 1).toString();
        second = "00";
      }
      if (Number(this.state.minutes) == 60) {
        hour = (Number(this.state.hours) + 1).toString();
        minute = "00";
      }
      self.setState({
        miliseconds: miliseconds.length == 1 ? "0" + miliseconds : miliseconds,
        seconds: second.length == 1 ? "0" + second : second,
        minutes: minute.length == 1 ? "0" + minute : minute,
        hours: hour.length == 1 ? "0" + hour : hour,
        recordedDuration: `${hour} : ${minute} : ${second}`
      });
    }, 0);
    this.setState({ 
      timer,
     });
  }

  timerStop() {
    clearInterval(this.state.timer);
    this.setState({ startDisabled: false, stopDisabled: true });
  }

  timerClear() {
    this.setState({
      timer: null,
      minutes: "00",
      seconds: "00",
      hours: "00",
    });
  }

  render() {
    // console.log("hours--->", this.state.hours);
    // console.log("minutes--->", this.state.minutes);
    // console.log("seconds--->", this.state.seconds);
    // console.log("miliseconds--->", this.state.miliseconds);
    let marker = null;
    let locationMarker = null;
    if (this.state.pointCoords.length > 1) {
      marker = (
        <Marker
          coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
        />
      );
      locationMarker = (
        <Marker coordinate={this.state.pointCoords[0]}>
          <Image
            source={require("../assets/bluemarker.png")}
            style={styles.markerImage}
          />
        </Marker>
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
            prediction.structured_formatting.main_text
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

    const yourLocationPredictions = this.state.yourLocationPredictions.map(
      (prediction) => (
        <TouchableHighlight
          key={prediction.place_id}
          onPress={() => {
            this.getRouteDirections(
              prediction.place_id,
              this.state.destinationPlaceId,
              prediction.structured_formatting.main_text,
              this.state.destinationName
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
      )
    );

    return (
      <View style={styles.container}>
        <MapView
          ref={(map) => {
            this.map = map;
          }}
          style={styles.map}
          // region={{
          //   latitude: this.state.latitude,
          //   longitude: this.state.longitude,
          //   latitudeDelta: 0.01,
          //   longitudeDelta: 0.0121,
          // }}
          showsUserLocation={true}
          followsUserLocation={this.state.routingMode}
        >
          {!this.state.subwayMode ? (
            <Polyline
              coordinates={this.state.pointCoords}
              strokeWidth={4}
              strokeColor="#49BEAA"
            />
          ) : (
            <Polyline
              coordinates={this.state.pointCoords}
              strokeWidth={4}
              strokeColor="#0039A6"
            />
          )}

          {marker}
          {locationMarker}
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
                    this.setState({
                      destination,
                    });
                    this.onChangeDestinationDebounced(destination);
                  }}
                />
              </View>
            </SafeAreaView>
          </View>
        )}
        {predictions}
        {yourLocationPredictions}
        {/* <Button
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
        /> */}

        {this.state.estimatedDistance > 0 ? (
          this.state.routingMode === true ? (
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
          )
        ) : (
          <Button title="input a destination" />
        )}

        <Icon
          style={styles.locateIcon}
          name="ios-locate"
          size={50}
          color={"#49BEAA"}
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
        <Button
          title="Directions"
          onPress={() => {
            console.log("Button pressed");
            this.props.navigation.navigate("Directions", {
              directions: this.state.directions,
            });
          }}
        />
        {!this.state.subwayMode ? (
          <Button
            title="Subway On"
            onPress={() => {
              this.setState({ subwayMode: !this.state.subwayMode });
              console.log(this.state.subwayMode);
            }}
          />
        ) : (
          <Button
            title="Subway Off"
            onPress={() => {
              this.setState({ subwayMode: !this.state.subwayMode });
              console.log(this.state.subwayMode);
            }}
          />
        )}
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
  markerImage: {
    width: 19,
    height: 30,
    marginBottom: "8%",
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
