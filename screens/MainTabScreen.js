import React from "react";

import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import Icon from "react-native-vector-icons/Ionicons";

import Profile from "./Profile";
import Map from "./Map";
import SettingScreen from "./SettingScreen";
import HealthStatsScreen from "./HealthStatsScreen";
import WeeklyHealthStatsScreen from "./HealthStatsWeeklyScreen";
import HealthStatsSample from "./HealthStatsSample";

const HomeStack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const MainTabScreen = () => (
  <Tab.Navigator initialRouteName="Home" activeColor="#fff">
    <Tab.Screen
      name="Map"
      component={Map}
      options={{
        tabBarLabel: "MAP",
        tabBarColor: "#49BEAA",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-navigate" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={Profile}
      options={{
        tabBarLabel: "PROFILE",
        tabBarColor: "#EF767A",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-person" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="DailyHealthStats"
      component={HealthStatsSample}
      options={{
        tabBarLabel: "HEALTH",
        tabBarColor: "#456990",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-stats-chart" color={color} size={26} />
        ),
      }}
    />
    {/* <Tab.Screen
      name="WeeklyHealthStats"
      component={WeeklyHealthStatsScreen}
      options={{
        tabBarLabel: "HEALTH",
        tabBarColor: "#456990",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-stats-chart" color={color} size={26} />
        ),
      }}
    /> */}
    <Tab.Screen
      name="Setting"
      component={SettingScreen}
      options={{
        tabBarLabel: "SETTINGS",
        tabBarColor: "#EEB868",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-settings" color={color} size={26} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default MainTabScreen;

// const ProfileStackScreen = ({ navigation }) => (
//   <HomeStack.Navigator
//     screenOptions={{
//       headerStyle: {
//         backgroundColor: "#EF767A",
//       },
//       headerTintColor: "#fff",
//       headerTitleStyle: {
//         fontWeight: "bold",
//       },
//     }}
//   >
//     <HomeStack.Screen
//       name="Profile"
//       component={Profile}
//       options={{
//         title: "PROFILE",
//         headerLeft: () => (
//           <Icon.Button
//             name="ios-menu"
//             size={25}
//             backgroundColor="#EF767A"
//             onPress={() => navigation.openDrawer()}
//           ></Icon.Button>
//         ),
//       }}
//     />
//   </HomeStack.Navigator>
// );
