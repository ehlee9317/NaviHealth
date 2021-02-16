// WALKING CALCULATOR:
// https://www.womanandhome.com/us/health-and-wellbeing/calories-burned-walking-206766/
// avg speed = 3 miles/hour (4.8 km/h) (1.4 m / sec)
// slow speed = 2 miles/hour (3.2 km/h)
// fast speed = 4 miles/hour (6.4 km/h)
// Calories burned per minute = (0.035 * body weight in kg) + ((Velocity in m/s ^ 2) / Height in m)) * (0.029) * (body weight in kg)

export const caloriesBurnedPerMinute = (weightLbs, heightCm, velocityMilesPerHour) => {
  const weightKg = weightLbs / 2.205
  const heightMeters = heightCm / 100
  const velocityMetersPerSecond = velocityMilesPerHour / 2.237
  return (weightKg * 0.035) + ((velocityMetersPerSecond ** 2)/heightMeters) * 0.029 * weightKg
}

// BIKING CALCULATOR:
// https://captaincalculator.com/health/calorie/calories-burned-cycling-calculator/
// Calories burned per minute = (MET x body weight in Kg x 3.5) ÷ 200
// MET per activity:
// Leisure / light effort 5.5 mph: 3.5
// Bicycling, < 10 mph, leisure, to work or for pleasure: 4
// Bicycling, leisure, 9.4 mph: 5.8

// Assume MET = 4
export const caloriesBurnedPerMinuteBiking = (weightLbs) => {
  const MET = 4
  const weightKg = weightLbs / 2.205
  return Math.round((MET * weightKg * 3.5) / 200)
}
