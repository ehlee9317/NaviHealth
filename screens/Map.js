import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Dimensions,
  Text,
  SafeAreaView,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import {GOOGLE_API_KEY} from '../config/keys'

let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 0;
const LONGITUDE = 0;
const LATITUDE_DELTA = 0.007;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class Map extends React.Component {
  constructor() {
    super();
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
        // DIRECTIONS STATE:
        coords: [],
        x: 'false',
        cordLatitude: '-6.23',
        cordLongitude: '106.75',
      },
    };
    this.mergeLot = this.mergeLot.bind(this);
  }
  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
            coords: [],
            x: 'false',
            cordLatitude: '-6.23',
            cordLongitude: '106.75',
          },
        });
      },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    this.watchID = navigator.geolocation.watchPosition((position) => {
      this.setState({
        region: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
      });
    });
  }
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }
  // DIRECTIONS:
  // convert lat and long to google directions api format:
  mergeLot() {
    if (this.state.latitude != null && this.state.longitude != null) {
      let concatLot = this.state.latitude + ',' + this.state.longitude;
      this.setState(
        {
          concat: concatLot,
        },
        () => {
          this.getDirections(concatLot, '-6.270565,106.759550');
        }
      );
    }
  }

  async getDirections(startLoc, destinationLoc) {
    try {
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_API_KEY}`
      );
      let respJson = await resp.json();
      let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1],
        };
      });
      this.setState({ coords: coords });
      return coords;
    } catch (error) {
      alert(error);
      return error;
    }
  }

  render() {
    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.container}
        showsUserLocation={true}
        region={this.state.region}
        onRegionChange={(region) => this.setState({ region })}
        followUserLocation={true}
        // onRegionChangeComplete={(region) => this.setState({ region })}
      >
        {!!this.state.latitude && !!this.state.longitude && (
          <MapView.Marker
            coordinate={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
            }}
            title={'Your Location'}
          />
        )}

        {!!this.state.cordLatitude && !!this.state.cordLongitude && (
          <MapView.Marker
            coordinate={{
              latitude: this.state.cordLatitude,
              longitude: this.state.cordLongitude,
            }}
            title={'Your Destination'}
          />
        )}

        {!!this.state.latitude &&
          !!this.state.longitude &&
          this.state.x == 'true' && (
            <MapView.Polyline
              coordinates={this.state.coords}
              strokeWidth={2}
              strokeColor='red'
            />
          )}

        {!!this.state.latitude &&
          !!this.state.longitude &&
          this.state.x == 'error' && (
            <MapView.Polyline
              coordinates={[
                {
                  latitude: this.state.latitude,
                  longitude: this.state.longitude,
                },
                {
                  latitude: this.state.cordLatitude,
                  longitude: this.state.cordLongitude,
                },
              ]}
              strokeWidth={2}
              strokeColor='red'
            />
          )}
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
});
