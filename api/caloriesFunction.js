// 1 stride = 2.1 ft - 2.5 ft
// 0.04 - 0.06 kcal per stride
// avg speed = 3 miles/hour (4.8 km/h) (1.4 m / sec)
// slow speed = 2 miles/hour (3.2 km/h)
// fast speed = 4 miles/hour (6.4 km/h)
// https://www.womanandhome.com/us/health-and-wellbeing/calories-burned-walking-206766/
// Calories burned per minute = (0.035 * body weight in kg) + ((Velocity in m/s ^ 2) / Height in m)) * (0.029) * (body weight in kg)
// calories = weightInKg
// const weightLbs = 150
// const heightCm = 180
// const weightKg = weightLbs / 2.205
// const heightMeters = height / 100
// const velocityMilesPerHour = 3
// const velocityMetersPerSecond = velocityMilesPerHour / 2.237

export const caloriesBurnedPerMinute = (weightLbs, heightCm, velocityMilesPerHour) => {
  const weightKg = weightLbs / 2.205
  const heightMeters = heightCm / 100
  const velocityMetersPerSecond = velocityMilesPerHour / 2.237
  return (weightKg * 0.035) + ((velocityMetersPerSecond ** 2)/heightMeters) * 0.029 * weightKg
}
