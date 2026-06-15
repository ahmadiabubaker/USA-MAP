/**
 * USA Data Map — Main Application
 * Interactive multi-layered data visualization map of the United States.
 *
 * Stack: MapLibre GL JS + D3.js + Vanilla JS
 */

// ============================================================
// STATE DATA — Realistic sample data for all 50 states + DC
// ============================================================

const STATE_DATA = {
    "01": { name: "Alabama", abbr: "AL", population: 5024279, density: 99.2, growth: -0.3, medianIncome: 53913, unemployment: 3.1, crimeRate: 453, violentCrime: 453, propertyCrime: 2387, gradRate: 89.3, perPupil: 10249, avgTemp: 63.4, precip: 56.2, aqi: 42, disasters: 38, broadband: 78.2, uninsured: 10.1, costOfLiving: 88.1 },
    "02": { name: "Alaska", abbr: "AK", population: 733391, density: 1.3, growth: -0.5, medianIncome: 77790, unemployment: 4.8, crimeRate: 838, violentCrime: 838, propertyCrime: 2826, gradRate: 80.1, perPupil: 18394, avgTemp: 28.1, precip: 22.5, aqi: 28, disasters: 15, broadband: 82.5, uninsured: 12.8, costOfLiving: 127.2 },
    "04": { name: "Arizona", abbr: "AZ", population: 7151502, density: 63.5, growth: 1.4, medianIncome: 62055, unemployment: 3.7, crimeRate: 474, violentCrime: 474, propertyCrime: 2573, gradRate: 79.5, perPupil: 9319, avgTemp: 67.3, precip: 13.6, aqi: 58, disasters: 22, broadband: 84.7, uninsured: 10.8, costOfLiving: 103.2 },
    "05": { name: "Arkansas", abbr: "AR", population: 3011524, density: 58.3, growth: 0.1, medianIncome: 48952, unemployment: 3.5, crimeRate: 641, violentCrime: 641, propertyCrime: 2929, gradRate: 88.2, perPupil: 10653, avgTemp: 60.4, precip: 50.6, aqi: 40, disasters: 42, broadband: 73.1, uninsured: 9.1, costOfLiving: 86.9 },
    "06": { name: "California", abbr: "CA", population: 39538223, density: 256.4, growth: -0.3, medianIncome: 78672, unemployment: 4.8, crimeRate: 442, violentCrime: 442, propertyCrime: 2286, gradRate: 84.5, perPupil: 14174, avgTemp: 59.4, precip: 22.2, aqi: 62, disasters: 65, broadband: 89.4, uninsured: 7.2, costOfLiving: 142.2 },
    "08": { name: "Colorado", abbr: "CO", population: 5773714, density: 56.5, growth: 1.0, medianIncome: 77127, unemployment: 3.1, crimeRate: 423, violentCrime: 423, propertyCrime: 2874, gradRate: 81.7, perPupil: 12390, avgTemp: 45.1, precip: 15.9, aqi: 48, disasters: 28, broadband: 89.1, uninsured: 7.1, costOfLiving: 105.1 },
    "09": { name: "Connecticut", abbr: "CT", population: 3605944, density: 745.6, growth: 0.1, medianIncome: 78444, unemployment: 4.1, crimeRate: 181, violentCrime: 181, propertyCrime: 1451, gradRate: 89.0, perPupil: 21252, avgTemp: 49.0, precip: 50.3, aqi: 38, disasters: 12, broadband: 91.3, uninsured: 5.7, costOfLiving: 112.8 },
    "10": { name: "Delaware", abbr: "DE", population: 989948, density: 508.0, growth: 0.6, medianIncome: 69110, unemployment: 4.4, crimeRate: 424, violentCrime: 424, propertyCrime: 2276, gradRate: 87.6, perPupil: 16394, avgTemp: 55.3, precip: 45.7, aqi: 42, disasters: 8, broadband: 87.4, uninsured: 6.4, costOfLiving: 102.4 },
    "11": { name: "District of Columbia", abbr: "DC", population: 689545, density: 11515.0, growth: -2.3, medianIncome: 90842, unemployment: 5.2, crimeRate: 812, violentCrime: 812, propertyCrime: 3738, gradRate: 69.2, perPupil: 24120, avgTemp: 56.6, precip: 40.8, aqi: 44, disasters: 3, broadband: 92.8, uninsured: 3.8, costOfLiving: 148.7 },
    "12": { name: "Florida", abbr: "FL", population: 21538187, density: 410.5, growth: 1.6, medianIncome: 57703, unemployment: 3.1, crimeRate: 384, violentCrime: 384, propertyCrime: 1928, gradRate: 86.9, perPupil: 10543, avgTemp: 71.7, precip: 54.5, aqi: 38, disasters: 72, broadband: 85.0, uninsured: 13.2, costOfLiving: 102.8 },
    "13": { name: "Georgia", abbr: "GA", population: 10711908, density: 187.4, growth: 0.7, medianIncome: 61980, unemployment: 3.2, crimeRate: 380, violentCrime: 380, propertyCrime: 2348, gradRate: 83.7, perPupil: 11642, avgTemp: 63.5, precip: 50.7, aqi: 44, disasters: 35, broadband: 83.9, uninsured: 13.4, costOfLiving: 93.4 },
    "15": { name: "Hawaii", abbr: "HI", population: 1455271, density: 226.6, growth: -0.3, medianIncome: 83102, unemployment: 3.4, crimeRate: 254, violentCrime: 254, propertyCrime: 2885, gradRate: 85.8, perPupil: 15242, avgTemp: 75.0, precip: 63.7, aqi: 22, disasters: 14, broadband: 89.8, uninsured: 4.2, costOfLiving: 193.3 },
    "16": { name: "Idaho", abbr: "ID", population: 1839106, density: 22.5, growth: 2.1, medianIncome: 60999, unemployment: 2.9, crimeRate: 227, violentCrime: 227, propertyCrime: 1426, gradRate: 82.1, perPupil: 8508, avgTemp: 44.4, precip: 18.9, aqi: 42, disasters: 18, broadband: 81.2, uninsured: 10.1, costOfLiving: 96.8 },
    "17": { name: "Illinois", abbr: "IL", population: 12812508, density: 232.0, growth: -0.8, medianIncome: 68428, unemployment: 4.5, crimeRate: 410, violentCrime: 410, propertyCrime: 1666, gradRate: 87.2, perPupil: 16227, avgTemp: 51.8, precip: 39.2, aqi: 46, disasters: 40, broadband: 86.8, uninsured: 6.8, costOfLiving: 93.4 },
    "18": { name: "Indiana", abbr: "IN", population: 6785528, density: 189.4, growth: 0.1, medianIncome: 58235, unemployment: 3.2, crimeRate: 382, violentCrime: 382, propertyCrime: 1901, gradRate: 86.3, perPupil: 10989, avgTemp: 52.0, precip: 42.4, aqi: 44, disasters: 25, broadband: 83.7, uninsured: 8.4, costOfLiving: 90.4 },
    "19": { name: "Iowa", abbr: "IA", population: 3190369, density: 57.1, growth: -0.1, medianIncome: 61836, unemployment: 2.7, crimeRate: 287, violentCrime: 287, propertyCrime: 1668, gradRate: 91.8, perPupil: 12375, avgTemp: 47.8, precip: 35.9, aqi: 38, disasters: 32, broadband: 84.6, uninsured: 5.0, costOfLiving: 89.0 },
    "20": { name: "Kansas", abbr: "KS", population: 2937880, density: 36.2, growth: 0.0, medianIncome: 62087, unemployment: 2.8, crimeRate: 405, violentCrime: 405, propertyCrime: 2403, gradRate: 88.4, perPupil: 11925, avgTemp: 54.3, precip: 29.8, aqi: 36, disasters: 34, broadband: 83.0, uninsured: 8.9, costOfLiving: 88.8 },
    "21": { name: "Kentucky", abbr: "KY", population: 4505836, density: 114.4, growth: 0.1, medianIncome: 52238, unemployment: 4.1, crimeRate: 234, violentCrime: 234, propertyCrime: 1614, gradRate: 90.6, perPupil: 11826, avgTemp: 55.6, precip: 49.9, aqi: 46, disasters: 38, broadband: 78.8, uninsured: 5.6, costOfLiving: 90.9 },
    "22": { name: "Louisiana", abbr: "LA", population: 4657757, density: 108.8, growth: -0.7, medianIncome: 49469, unemployment: 4.1, crimeRate: 639, violentCrime: 639, propertyCrime: 2706, gradRate: 81.4, perPupil: 12231, avgTemp: 66.4, precip: 60.1, aqi: 44, disasters: 55, broadband: 77.6, uninsured: 8.1, costOfLiving: 91.1 },
    "23": { name: "Maine", abbr: "ME", population: 1362359, density: 44.2, growth: 0.2, medianIncome: 57918, unemployment: 3.9, crimeRate: 109, violentCrime: 109, propertyCrime: 1286, gradRate: 87.7, perPupil: 15086, avgTemp: 41.0, precip: 47.3, aqi: 26, disasters: 12, broadband: 82.2, uninsured: 8.0, costOfLiving: 113.8 },
    "24": { name: "Maryland", abbr: "MD", population: 6177224, density: 636.1, growth: 0.0, medianIncome: 87063, unemployment: 3.9, crimeRate: 454, violentCrime: 454, propertyCrime: 1876, gradRate: 87.1, perPupil: 16184, avgTemp: 54.7, precip: 42.2, aqi: 44, disasters: 15, broadband: 90.2, uninsured: 6.0, costOfLiving: 115.4 },
    "25": { name: "Massachusetts", abbr: "MA", population: 7029917, density: 907.8, growth: 0.4, medianIncome: 84385, unemployment: 3.9, crimeRate: 309, violentCrime: 309, propertyCrime: 1131, gradRate: 89.1, perPupil: 19351, avgTemp: 47.9, precip: 47.7, aqi: 34, disasters: 14, broadband: 92.1, uninsured: 3.0, costOfLiving: 131.6 },
    "26": { name: "Michigan", abbr: "MI", population: 10077331, density: 178.9, growth: -0.1, medianIncome: 59234, unemployment: 4.4, crimeRate: 477, violentCrime: 477, propertyCrime: 1522, gradRate: 82.4, perPupil: 12949, avgTemp: 44.4, precip: 33.5, aqi: 40, disasters: 22, broadband: 84.5, uninsured: 5.8, costOfLiving: 89.4 },
    "27": { name: "Minnesota", abbr: "MN", population: 5706494, density: 72.0, growth: 0.3, medianIncome: 74593, unemployment: 2.9, crimeRate: 282, violentCrime: 282, propertyCrime: 2088, gradRate: 83.8, perPupil: 14028, avgTemp: 41.2, precip: 28.9, aqi: 34, disasters: 22, broadband: 87.8, uninsured: 4.5, costOfLiving: 97.3 },
    "28": { name: "Mississippi", abbr: "MS", population: 2961279, density: 63.5, growth: -0.5, medianIncome: 45081, unemployment: 3.9, crimeRate: 291, violentCrime: 291, propertyCrime: 1924, gradRate: 85.3, perPupil: 9567, avgTemp: 63.4, precip: 57.4, aqi: 38, disasters: 40, broadband: 72.0, uninsured: 12.3, costOfLiving: 84.8 },
    "29": { name: "Missouri", abbr: "MO", population: 6154913, density: 90.0, growth: 0.0, medianIncome: 57409, unemployment: 3.2, crimeRate: 543, violentCrime: 543, propertyCrime: 2646, gradRate: 89.2, perPupil: 12322, avgTemp: 54.5, precip: 42.2, aqi: 42, disasters: 38, broadband: 82.3, uninsured: 9.5, costOfLiving: 89.5 },
    "30": { name: "Montana", abbr: "MT", population: 1084225, density: 7.5, growth: 0.8, medianIncome: 57153, unemployment: 2.9, crimeRate: 430, violentCrime: 430, propertyCrime: 2312, gradRate: 86.7, perPupil: 12482, avgTemp: 42.7, precip: 15.3, aqi: 38, disasters: 18, broadband: 77.3, uninsured: 8.7, costOfLiving: 95.7 },
    "31": { name: "Nebraska", abbr: "NE", population: 1961504, density: 25.5, growth: 0.3, medianIncome: 63229, unemployment: 2.1, crimeRate: 318, violentCrime: 318, propertyCrime: 2078, gradRate: 89.1, perPupil: 13437, avgTemp: 48.8, precip: 26.4, aqi: 32, disasters: 30, broadband: 83.4, uninsured: 7.8, costOfLiving: 91.8 },
    "32": { name: "Nevada", abbr: "NV", population: 3104614, density: 28.3, growth: 1.5, medianIncome: 60365, unemployment: 5.5, crimeRate: 460, violentCrime: 460, propertyCrime: 2167, gradRate: 82.6, perPupil: 10466, avgTemp: 53.1, precip: 10.0, aqi: 52, disasters: 12, broadband: 85.6, uninsured: 11.4, costOfLiving: 104.2 },
    "33": { name: "New Hampshire", abbr: "NH", population: 1377529, density: 153.8, growth: 0.4, medianIncome: 77933, unemployment: 2.5, crimeRate: 147, violentCrime: 147, propertyCrime: 1024, gradRate: 88.8, perPupil: 18370, avgTemp: 43.8, precip: 47.0, aqi: 28, disasters: 8, broadband: 88.1, uninsured: 5.9, costOfLiving: 112.5 },
    "34": { name: "New Jersey", abbr: "NJ", population: 9288994, density: 1263.0, growth: 0.2, medianIncome: 85751, unemployment: 4.4, crimeRate: 195, violentCrime: 195, propertyCrime: 1149, gradRate: 91.0, perPupil: 21866, avgTemp: 52.7, precip: 47.1, aqi: 40, disasters: 16, broadband: 90.7, uninsured: 7.9, costOfLiving: 115.2 },
    "35": { name: "New Mexico", abbr: "NM", population: 2117522, density: 17.5, growth: 0.2, medianIncome: 51243, unemployment: 4.9, crimeRate: 832, violentCrime: 832, propertyCrime: 3425, gradRate: 74.9, perPupil: 12090, avgTemp: 53.4, precip: 14.6, aqi: 40, disasters: 18, broadband: 78.5, uninsured: 11.3, costOfLiving: 94.1 },
    "36": { name: "New York", abbr: "NY", population: 20201249, density: 428.7, growth: -1.6, medianIncome: 71117, unemployment: 4.5, crimeRate: 364, violentCrime: 364, propertyCrime: 1392, gradRate: 84.1, perPupil: 26571, avgTemp: 45.4, precip: 46.2, aqi: 40, disasters: 28, broadband: 88.5, uninsured: 5.7, costOfLiving: 139.1 },
    "37": { name: "North Carolina", abbr: "NC", population: 10439388, density: 218.1, growth: 0.9, medianIncome: 56642, unemployment: 3.5, crimeRate: 377, violentCrime: 377, propertyCrime: 2225, gradRate: 86.5, perPupil: 10525, avgTemp: 59.0, precip: 49.7, aqi: 40, disasters: 30, broadband: 83.4, uninsured: 11.1, costOfLiving: 95.8 },
    "38": { name: "North Dakota", abbr: "ND", population: 779094, density: 11.3, growth: -0.1, medianIncome: 65315, unemployment: 2.1, crimeRate: 315, violentCrime: 315, propertyCrime: 2128, gradRate: 87.5, perPupil: 14252, avgTemp: 40.4, precip: 18.6, aqi: 26, disasters: 22, broadband: 82.7, uninsured: 7.5, costOfLiving: 93.1 },
    "39": { name: "Ohio", abbr: "OH", population: 11799448, density: 290.5, growth: -0.2, medianIncome: 56602, unemployment: 4.0, crimeRate: 308, violentCrime: 308, propertyCrime: 2074, gradRate: 85.2, perPupil: 13750, avgTemp: 50.7, precip: 39.1, aqi: 42, disasters: 25, broadband: 85.2, uninsured: 6.5, costOfLiving: 90.8 },
    "40": { name: "Oklahoma", abbr: "OK", population: 3959353, density: 58.0, growth: 0.0, medianIncome: 52919, unemployment: 3.0, crimeRate: 458, violentCrime: 458, propertyCrime: 2807, gradRate: 85.9, perPupil: 9301, avgTemp: 59.6, precip: 36.5, aqi: 42, disasters: 42, broadband: 77.1, uninsured: 14.3, costOfLiving: 86.6 },
    "41": { name: "Oregon", abbr: "OR", population: 4237256, density: 44.1, growth: 0.4, medianIncome: 65667, unemployment: 3.9, crimeRate: 292, violentCrime: 292, propertyCrime: 2895, gradRate: 80.6, perPupil: 13231, avgTemp: 48.4, precip: 27.4, aqi: 48, disasters: 20, broadband: 87.5, uninsured: 6.2, costOfLiving: 110.7 },
    "42": { name: "Pennsylvania", abbr: "PA", population: 13002700, density: 291.9, growth: -0.2, medianIncome: 63627, unemployment: 4.5, crimeRate: 306, violentCrime: 306, propertyCrime: 1325, gradRate: 87.8, perPupil: 17745, avgTemp: 48.8, precip: 42.7, aqi: 42, disasters: 22, broadband: 86.3, uninsured: 5.5, costOfLiving: 101.7 },
    "44": { name: "Rhode Island", abbr: "RI", population: 1097379, density: 1061.4, growth: 0.1, medianIncome: 67167, unemployment: 4.2, crimeRate: 205, violentCrime: 205, propertyCrime: 1324, gradRate: 84.0, perPupil: 17429, avgTemp: 50.1, precip: 49.0, aqi: 32, disasters: 8, broadband: 89.6, uninsured: 4.1, costOfLiving: 105.4 },
    "45": { name: "South Carolina", abbr: "SC", population: 5118425, density: 172.2, growth: 1.1, medianIncome: 54864, unemployment: 3.4, crimeRate: 530, violentCrime: 530, propertyCrime: 2656, gradRate: 81.8, perPupil: 12009, avgTemp: 62.4, precip: 49.8, aqi: 38, disasters: 25, broadband: 80.8, uninsured: 10.7, costOfLiving: 95.5 },
    "46": { name: "South Dakota", abbr: "SD", population: 886667, density: 11.7, growth: 0.4, medianIncome: 59533, unemployment: 2.4, crimeRate: 501, violentCrime: 501, propertyCrime: 1692, gradRate: 84.1, perPupil: 11440, avgTemp: 45.2, precip: 21.4, aqi: 30, disasters: 24, broadband: 80.6, uninsured: 9.8, costOfLiving: 92.5 },
    "47": { name: "Tennessee", abbr: "TN", population: 6910840, density: 168.2, growth: 0.5, medianIncome: 54833, unemployment: 3.4, crimeRate: 673, violentCrime: 673, propertyCrime: 2541, gradRate: 89.8, perPupil: 10649, avgTemp: 57.6, precip: 53.5, aqi: 44, disasters: 38, broadband: 81.7, uninsured: 10.3, costOfLiving: 89.9 },
    "48": { name: "Texas", abbr: "TX", population: 29145505, density: 111.6, growth: 1.3, medianIncome: 63826, unemployment: 3.9, crimeRate: 422, violentCrime: 422, propertyCrime: 2423, gradRate: 89.7, perPupil: 11186, avgTemp: 65.8, precip: 28.9, aqi: 50, disasters: 78, broadband: 83.8, uninsured: 17.3, costOfLiving: 91.5 },
    "49": { name: "Utah", abbr: "UT", population: 3271616, density: 39.9, growth: 1.6, medianIncome: 74197, unemployment: 2.3, crimeRate: 233, violentCrime: 233, propertyCrime: 2640, gradRate: 87.6, perPupil: 8754, avgTemp: 48.6, precip: 16.5, aqi: 52, disasters: 12, broadband: 89.3, uninsured: 9.6, costOfLiving: 99.7 },
    "50": { name: "Vermont", abbr: "VT", population: 643077, density: 69.8, growth: -0.3, medianIncome: 61973, unemployment: 2.5, crimeRate: 173, violentCrime: 173, propertyCrime: 1211, gradRate: 89.6, perPupil: 21478, avgTemp: 42.9, precip: 42.7, aqi: 24, disasters: 10, broadband: 83.8, uninsured: 4.5, costOfLiving: 113.5 },
    "51": { name: "Virginia", abbr: "VA", population: 8631393, density: 218.6, growth: 0.3, medianIncome: 76398, unemployment: 2.9, crimeRate: 208, violentCrime: 208, propertyCrime: 1468, gradRate: 88.9, perPupil: 14024, avgTemp: 55.1, precip: 43.3, aqi: 38, disasters: 22, broadband: 88.2, uninsured: 7.7, costOfLiving: 103.7 },
    "53": { name: "Washington", abbr: "WA", population: 7614893, density: 115.9, growth: 1.0, medianIncome: 77006, unemployment: 3.8, crimeRate: 321, violentCrime: 321, propertyCrime: 2992, gradRate: 82.9, perPupil: 14189, avgTemp: 48.3, precip: 38.4, aqi: 44, disasters: 22, broadband: 90.0, uninsured: 6.1, costOfLiving: 110.7 },
    "54": { name: "West Virginia", abbr: "WV", population: 1793716, density: 74.6, growth: -0.6, medianIncome: 46711, unemployment: 4.0, crimeRate: 316, violentCrime: 316, propertyCrime: 1321, gradRate: 90.5, perPupil: 13038, avgTemp: 52.3, precip: 44.2, aqi: 38, disasters: 22, broadband: 73.5, uninsured: 6.1, costOfLiving: 86.5 },
    "55": { name: "Wisconsin", abbr: "WI", population: 5893718, density: 109.2, growth: 0.1, medianIncome: 63293, unemployment: 2.8, crimeRate: 314, violentCrime: 314, propertyCrime: 1375, gradRate: 90.0, perPupil: 13242, avgTemp: 43.1, precip: 33.2, aqi: 34, disasters: 18, broadband: 86.1, uninsured: 5.3, costOfLiving: 95.2 },
    "56": { name: "Wyoming", abbr: "WY", population: 576851, density: 5.9, growth: -0.3, medianIncome: 65003, unemployment: 3.8, crimeRate: 212, violentCrime: 212, propertyCrime: 1603, gradRate: 81.6, perPupil: 17228, avgTemp: 42.0, precip: 13.1, aqi: 28, disasters: 12, broadband: 78.4, uninsured: 11.9, costOfLiving: 95.0 },
};


// ============================================================
// LAYER / METRIC DEFINITIONS
// ============================================================

const LAYERS = {
    demographics: {
        label: "Demographics",
        icon: "👥",
        metrics: {
            population: { label: "Population", format: "number", colorScale: ["#1a1a4e", "#1e3a5f", "#1e5f8a", "#2589b5", "#60a5fa", "#93c5fd"] },
            density: { label: "Population Density", suffix: "/mi²", format: "decimal", colorScale: ["#1a1a4e", "#1e3a5f", "#2563eb", "#60a5fa", "#93c5fd", "#dbeafe"] },
            growth: { label: "Growth Rate", suffix: "%", format: "percent", colorScale: ["#7f1d1d", "#991b1b", "#6b7280", "#166534", "#22c55e", "#86efac"] },
        }
    },
    crime: {
        label: "Crime",
        icon: "🔫",
        metrics: {
            crimeRate: { label: "Violent Crime Rate", suffix: "/100K", format: "decimal", colorScale: ["#fef3c7", "#fde68a", "#fbbf24", "#f59e0b", "#d97706", "#92400e"] },
            propertyCrime: { label: "Property Crime Rate", suffix: "/100K", format: "decimal", colorScale: ["#fff7ed", "#fed7aa", "#fdba74", "#fb923c", "#ea580c", "#9a3412"] },
        }
    },
    economics: {
        label: "Economics",
        icon: "💰",
        metrics: {
            medianIncome: { label: "Median Income", prefix: "$", format: "number", colorScale: ["#14532d", "#166534", "#15803d", "#22c55e", "#4ade80", "#86efac"] },
            unemployment: { label: "Unemployment Rate", suffix: "%", format: "percent", colorScale: ["#86efac", "#4ade80", "#f59e0b", "#ef4444", "#991b1b", "#7f1d1d"] },
            costOfLiving: { label: "Cost of Living Index", format: "decimal", colorScale: ["#dbeafe", "#93c5fd", "#60a5fa", "#f59e0b", "#ef4444", "#991b1b"] },
        }
    },
    weather: {
        label: "Weather",
        icon: "🌦️",
        metrics: {
            avgTemp: { label: "Avg Temperature", suffix: "°F", format: "decimal", colorScale: ["#1e3a8a", "#2563eb", "#60a5fa", "#fbbf24", "#f97316", "#dc2626"] },
            precip: { label: "Annual Precipitation", suffix: '"', format: "decimal", colorScale: ["#fef3c7", "#bae6fd", "#7dd3fc", "#38bdf8", "#0284c7", "#075985"] },
        }
    },
    education: {
        label: "Education",
        icon: "🏫",
        metrics: {
            gradRate: { label: "Graduation Rate", suffix: "%", format: "percent", colorScale: ["#581c87", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#e9d5ff"] },
            perPupil: { label: "Per-Pupil Spending", prefix: "$", format: "number", colorScale: ["#4a1d6e", "#5b21b6", "#7c3aed", "#a78bfa", "#c4b5fd", "#ede9fe"] },
        }
    },
    healthcare: {
        label: "Healthcare",
        icon: "🏥",
        metrics: {
            uninsured: { label: "Uninsured Rate", suffix: "%", format: "percent", colorScale: ["#d1fae5", "#6ee7b7", "#f59e0b", "#ef4444", "#991b1b", "#7f1d1d"] },
        }
    },
    environment: {
        label: "Air Quality",
        icon: "🌿",
        metrics: {
            aqi: { label: "Avg AQI", format: "decimal", colorScale: ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#991b1b"] },
        }
    },
    disasters: {
        label: "Disasters",
        icon: "🌪️",
        metrics: {
            disasters: { label: "Disaster Declarations", suffix: " (5yr)", format: "number", colorScale: ["#fefce8", "#fde68a", "#fbbf24", "#f59e0b", "#d97706", "#92400e"] },
        }
    },
    infrastructure: {
        label: "Infrastructure",
        icon: "🌐",
        metrics: {
            broadband: { label: "Broadband Coverage", suffix: "%", format: "percent", colorScale: ["#0c4a6e", "#0369a1", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc"] },
        }
    },
};


// ============================================================
// APP STATE
// ============================================================

const appState = {
    map: null,
    geojson: null,
    activeLayer: "demographics",
    activeMetric: "population",
    selectedState: null,
    hoveredState: null,
    isLayerPanelCollapsed: false,
    tooltip: null,
    compareMode: false,
    compareStates: [],       // array of FIPS codes for compare mode
    trendCache: {},          // cache trend data so it's stable per state/metric
};


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    initEventListeners();
});


// ============================================================
// MAP INITIALIZATION
// ============================================================

function initMap() {
    appState.map = new maplibregl.Map({
        container: "map",
        style: {
            version: 8,
            name: "Dark Basemap",
            sources: {
                "carto-dark": {
                    type: "raster",
                    tiles: [
                        "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
                        "https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
                        "https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
                    ],
                    tileSize: 256,
                    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
                },
            },
            layers: [
                {
                    id: "carto-dark-layer",
                    type: "raster",
                    source: "carto-dark",
                    minzoom: 0,
                    maxzoom: 19,
                    paint: {
                        "raster-opacity": 0.6,
                        "raster-saturation": -0.3,
                    },
                },
            ],
        },
        center: [-98.5, 39.5],
        zoom: 3.8,
        minZoom: 2,
        maxZoom: 12,
        maxBounds: [[-180, 10], [-50, 75]],
        attributionControl: true,
    });

    // Add zoom controls
    appState.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    // Create tooltip element
    appState.tooltip = document.createElement("div");
    appState.tooltip.className = "map-tooltip";
    appState.tooltip.innerHTML = `
        <div class="map-tooltip-name"></div>
        <div class="map-tooltip-value"></div>
    `;
    document.querySelector(".map-wrapper").appendChild(appState.tooltip);

    // On map load
    appState.map.on("load", async () => {
        await loadGeoJSON();
        addMapLayers();
        updateChoropleth();
        setupMapInteractions();
        hideLoadingScreen();
    });

    // Update zoom display
    appState.map.on("zoom", () => {
        const zoom = appState.map.getZoom().toFixed(1);
        document.getElementById("zoom-display").textContent = `${zoom}x`;
    });
}


// ============================================================
// GEOJSON LOADING
// ============================================================

async function loadGeoJSON() {
    try {
        const response = await fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json");
        const topology = await response.json();
        appState.geojson = topojson.feature(topology, topology.objects.states);

        // Merge our data into the GeoJSON features
        appState.geojson.features.forEach((feature) => {
            const fips = feature.id;
            const data = STATE_DATA[fips];
            if (data) {
                feature.properties = { ...feature.properties, ...data, fips };
            }
        });

        // Filter out territories (keep only states + DC we have data for)
        appState.geojson.features = appState.geojson.features.filter(
            (f) => STATE_DATA[f.id]
        );
    } catch (err) {
        console.error("Failed to load GeoJSON:", err);
        // Show error on loading screen
        const subtitle = document.querySelector(".loading-subtitle");
        if (subtitle) {
            subtitle.textContent = "Failed to load map data. Please refresh.";
            subtitle.style.color = "#f43f5e";
        }
    }
}


// ============================================================
// MAP LAYERS
// ============================================================

function addMapLayers() {
    appState.map.addSource("states", {
        type: "geojson",
        data: appState.geojson,
        generateId: true,
    });

    // Choropleth fill layer
    appState.map.addLayer({
        id: "states-fill",
        type: "fill",
        source: "states",
        paint: {
            "fill-color": "#1e3a5f",
            "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.9,
                0.75,
            ],
        },
    });

    // State borders
    appState.map.addLayer({
        id: "states-border",
        type: "line",
        source: "states",
        paint: {
            "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#6366f1",
                ["boolean", ["feature-state", "hover"], false],
                "rgba(255, 255, 255, 0.5)",
                "rgba(255, 255, 255, 0.12)",
            ],
            "line-width": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                2.5,
                ["boolean", ["feature-state", "hover"], false],
                1.5,
                0.5,
            ],
        },
    });

    // Labels layer (using CartoDB labels)
    appState.map.addSource("carto-labels", {
        type: "raster",
        tiles: [
            "https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png",
            "https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png",
        ],
        tileSize: 256,
    });

    appState.map.addLayer({
        id: "carto-labels-layer",
        type: "raster",
        source: "carto-labels",
        paint: {
            "raster-opacity": 0.7,
        },
    });
}


// ============================================================
// CHOROPLETH COLORING
// ============================================================

function updateChoropleth() {
    if (!appState.map.getSource("states")) return;

    const layerDef = LAYERS[appState.activeLayer];
    const metricDef = layerDef.metrics[appState.activeMetric];
    const colors = metricDef.colorScale;

    // Get min/max values for the active metric
    const values = Object.values(STATE_DATA).map((d) => d[appState.activeMetric]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Build a match expression to color each state
    const matchExpr = ["match", ["get", "fips"]];

    Object.entries(STATE_DATA).forEach(([fips, data]) => {
        const value = data[appState.activeMetric];
        const normalized = (value - minVal) / (maxVal - minVal || 1);
        const colorIndex = Math.min(
            Math.floor(normalized * colors.length),
            colors.length - 1
        );
        matchExpr.push(fips, colors[colorIndex]);
    });

    matchExpr.push("#1e293b"); // default/fallback color

    appState.map.setPaintProperty("states-fill", "fill-color", matchExpr);

    // Update legend
    updateLegend(metricDef, minVal, maxVal);

    // Update metric selector options
    updateMetricSelector();
}

function updateLegend(metricDef, minVal, maxVal) {
    const gradient = document.getElementById("legend-gradient");
    const minLabel = document.getElementById("legend-min");
    const maxLabel = document.getElementById("legend-max");

    const colors = metricDef.colorScale;
    gradient.style.background = `linear-gradient(90deg, ${colors.join(", ")})`;

    minLabel.textContent = formatValue(minVal, metricDef);
    maxLabel.textContent = formatValue(maxVal, metricDef);
}

function updateMetricSelector() {
    const select = document.getElementById("metric-select");
    const layerDef = LAYERS[appState.activeLayer];

    select.innerHTML = "";
    Object.entries(layerDef.metrics).forEach(([key, def]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = def.label;
        if (key === appState.activeMetric) option.selected = true;
        select.appendChild(option);
    });
}


// ============================================================
// MAP INTERACTIONS
// ============================================================

function setupMapInteractions() {
    const map = appState.map;
    let hoveredId = null;

    // Hover — highlight + tooltip
    map.on("mousemove", "states-fill", (e) => {
        if (e.features.length === 0) return;

        map.getCanvas().style.cursor = "pointer";

        const feature = e.features[0];
        const featureId = feature.id;

        // Update hover state
        if (hoveredId !== null && hoveredId !== featureId) {
            map.setFeatureState({ source: "states", id: hoveredId }, { hover: false });
        }
        hoveredId = featureId;
        map.setFeatureState({ source: "states", id: hoveredId }, { hover: true });

        // Update tooltip
        const data = STATE_DATA[feature.properties.fips];
        if (data) {
            const metricDef = LAYERS[appState.activeLayer].metrics[appState.activeMetric];
            const value = data[appState.activeMetric];

            appState.tooltip.querySelector(".map-tooltip-name").textContent = data.name;
            appState.tooltip.querySelector(".map-tooltip-value").textContent =
                `${metricDef.label}: ${formatValue(value, metricDef)}`;

            appState.tooltip.style.left = `${e.point.x}px`;
            appState.tooltip.style.top = `${e.point.y}px`;
            appState.tooltip.classList.add("visible");

            // Update bottom bar hover info
            document.getElementById("hover-info").textContent =
                `${data.name} (${data.abbr})`;
        }
    });

    // Mouse leave — remove hover
    map.on("mouseleave", "states-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredId !== null) {
            map.setFeatureState({ source: "states", id: hoveredId }, { hover: false });
            hoveredId = null;
        }
        appState.tooltip.classList.remove("visible");
        document.getElementById("hover-info").textContent = "";
    });

    // Click — select state + show detail panel
    map.on("click", "states-fill", (e) => {
        if (e.features.length === 0) return;

        const feature = e.features[0];
        const fips = feature.properties.fips;

        if (appState.compareMode) {
            toggleCompareState(fips, feature);
        } else {
            selectState(fips, feature);
        }
    });

    // Click outside states — deselect
    map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ["states-fill"],
        });
        if (features.length === 0 && !appState.compareMode) {
            deselectState();
        }
    });
}

function selectState(fips, feature) {
    const map = appState.map;
    const data = STATE_DATA[fips];
    if (!data) return;

    // Clear previous selection
    if (appState.selectedState !== null) {
        const features = appState.geojson.features;
        features.forEach((f, i) => {
            map.setFeatureState({ source: "states", id: i }, { selected: false });
        });
    }

    // Set new selection
    if (feature) {
        map.setFeatureState(
            { source: "states", id: feature.id },
            { selected: true }
        );
    }

    appState.selectedState = fips;

    // Fly to state
    if (feature) {
        const bounds = getBoundsForFeature(feature);
        map.fitBounds(bounds, {
            padding: {
                top: 60,
                bottom: 60,
                left: appState.isLayerPanelCollapsed ? 60 : 260,
                right: 400,
            },
            maxZoom: 7,
            duration: 1200,
        });
    }

    // Update breadcrumb
    document.getElementById("breadcrumb-content").textContent =
        `United States › ${data.name}`;

    // Show detail panel
    showDetailPanel(data);
}

function deselectState() {
    const map = appState.map;

    if (appState.selectedState !== null) {
        appState.geojson.features.forEach((f, i) => {
            map.setFeatureState({ source: "states", id: i }, { selected: false });
        });
    }

    appState.selectedState = null;

    // Reset view
    map.flyTo({
        center: [-98.5, 39.5],
        zoom: 3.8,
        duration: 1000,
    });

    document.getElementById("breadcrumb-content").textContent = "United States";

    // Hide detail panel
    document.getElementById("detail-panel").classList.add("hidden");
}

function getBoundsForFeature(feature) {
    const coordinates = [];

    function extractCoords(geometry) {
        if (geometry.type === "Polygon") {
            geometry.coordinates.forEach((ring) =>
                ring.forEach((coord) => coordinates.push(coord))
            );
        } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((polygon) =>
                polygon.forEach((ring) =>
                    ring.forEach((coord) => coordinates.push(coord))
                )
            );
        }
    }

    extractCoords(feature.geometry);

    const lngs = coordinates.map((c) => c[0]);
    const lats = coordinates.map((c) => c[1]);

    return [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
    ];
}


// ============================================================
// DETAIL PANEL
// ============================================================

function showDetailPanel(data) {
    const panel = document.getElementById("detail-panel");
    panel.classList.remove("hidden");

    // Title
    document.getElementById("detail-title").textContent = data.name;
    const fipsCode = Object.keys(STATE_DATA).find((k) => STATE_DATA[k] === data);
    document.getElementById("detail-subtitle").textContent =
        `${data.abbr} · FIPS: ${fipsCode}`;

    // Stats grid
    const statsContainer = document.getElementById("detail-stats");
    const layerDef = LAYERS[appState.activeLayer];

    // Reset stagger animation
    statsContainer.classList.remove("stagger-in");

    let statsHTML = "";

    // Always show population first
    statsHTML += buildStatCard("Population", formatNumber(data.population), `${data.growth > 0 ? "+" : ""}${data.growth}%`, data.growth >= 0);

    // Show metrics for the active layer
    Object.entries(layerDef.metrics).forEach(([key, def]) => {
        const value = data[key];
        statsHTML += buildStatCard(def.label, formatValue(value, def));
    });

    // Add a few cross-layer highlights
    if (appState.activeLayer !== "economics") {
        statsHTML += buildStatCard("Median Income", `$${formatNumber(data.medianIncome)}`);
    }
    if (appState.activeLayer !== "demographics") {
        statsHTML += buildStatCard("Density", `${data.density.toLocaleString()}/mi²`);
    }

    statsContainer.innerHTML = statsHTML;

    // Re-trigger stagger animation
    requestAnimationFrame(() => {
        statsContainer.classList.add("stagger-in");
    });

    // Chart
    renderDetailChart(data);

    // Breakdown
    renderDetailBreakdown(data);
}

function buildStatCard(label, value, change, isPositive) {
    let changeHTML = "";
    if (change !== undefined) {
        const cls = isPositive ? "positive" : "negative";
        const arrow = isPositive ? "↑" : "↓";
        changeHTML = `<div class="stat-change ${cls}">${arrow} ${change}</div>`;
    }
    return `
        <div class="stat-card">
            <div class="stat-label">${label}</div>
            <div class="stat-value">${value}</div>
            ${changeHTML}
        </div>
    `;
}


// ============================================================
// D3 CHARTS
// ============================================================

function renderDetailChart(data) {
    const container = document.getElementById("detail-chart");
    container.innerHTML = `
        <div class="chart-title">5-Year Trend — ${LAYERS[appState.activeLayer].metrics[appState.activeMetric].label}</div>
        <div class="chart-container" id="trend-chart"></div>
    `;

    const chartEl = document.getElementById("trend-chart");
    const width = chartEl.clientWidth || 300;
    const height = 160;
    const margin = { top: 10, right: 16, bottom: 28, left: 48 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Generate synthetic trend data (cached per state+metric)
    const currentValue = data[appState.activeMetric];
    const cacheKey = `${data.abbr}_${appState.activeMetric}`;
    if (!appState.trendCache[cacheKey]) {
        appState.trendCache[cacheKey] = generateTrendData(currentValue, 5);
    }
    const trendData = appState.trendCache[cacheKey];

    const svg = d3
        .select("#trend-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear().domain([0, trendData.length - 1]).range([0, innerW]);
    const yExtent = d3.extent(trendData, (d) => d.value);
    const yPad = (yExtent[1] - yExtent[0]) * 0.15 || 1;
    const y = d3
        .scaleLinear()
        .domain([yExtent[0] - yPad, yExtent[1] + yPad])
        .range([innerH, 0]);

    // Grid lines
    g.append("g")
        .attr("class", "grid")
        .selectAll("line")
        .data(y.ticks(4))
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", (d) => y(d))
        .attr("y2", (d) => y(d))
        .attr("stroke", "rgba(255,255,255,0.05)")
        .attr("stroke-dasharray", "3,3");

    // Gradient for area
    const gradientId = "chart-gradient-" + Date.now();
    const defs = svg.append("defs");
    const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0")
        .attr("y1", "0")
        .attr("x2", "0")
        .attr("y2", "1");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.3);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.02);

    // Area
    const area = d3
        .area()
        .x((d, i) => x(i))
        .y0(innerH)
        .y1((d) => y(d.value))
        .curve(d3.curveMonotoneX);

    g.append("path")
        .datum(trendData)
        .attr("d", area)
        .attr("fill", `url(#${gradientId})`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);

    // Line
    const line = d3
        .line()
        .x((d, i) => x(i))
        .y((d) => y(d.value))
        .curve(d3.curveMonotoneX);

    const path = g
        .append("path")
        .datum(trendData)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round");

    // Animate line drawing
    const totalLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

    // Dots
    g.selectAll(".dot")
        .data(trendData)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => x(i))
        .attr("cy", (d) => y(d.value))
        .attr("r", 0)
        .attr("fill", "#6366f1")
        .attr("stroke", "#0a0e1a")
        .attr("stroke-width", 2)
        .transition()
        .delay((d, i) => 300 + i * 120)
        .duration(400)
        .attr("r", 4);

    // X-axis labels (years)
    const currentYear = new Date().getFullYear();
    g.selectAll(".x-label")
        .data(trendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => x(i))
        .attr("y", innerH + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(148, 163, 184, 0.6)")
        .attr("font-size", "10px")
        .attr("font-family", "Inter, sans-serif")
        .text((d, i) => currentYear - (trendData.length - 1 - i));

    // Y-axis labels
    g.selectAll(".y-label")
        .data(y.ticks(4))
        .enter()
        .append("text")
        .attr("x", -8)
        .attr("y", (d) => y(d))
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("fill", "rgba(148, 163, 184, 0.5)")
        .attr("font-size", "9px")
        .attr("font-family", "'JetBrains Mono', monospace")
        .text((d) => abbreviateNumber(d));
}

function generateTrendData(currentValue, years) {
    const data = [];
    // Generate realistic-looking trend working backwards from current value
    let val = currentValue;
    const points = [val];
    for (let i = 1; i < years; i++) {
        const change = (Math.random() - 0.45) * currentValue * 0.06;
        val = val - change;
        points.unshift(val);
    }
    points.forEach((v, i) => {
        data.push({ year: new Date().getFullYear() - (years - 1 - i), value: v });
    });
    return data;
}


// ============================================================
// DETAIL BREAKDOWN
// ============================================================

function renderDetailBreakdown(data) {
    const container = document.getElementById("detail-breakdown");

    // Show top-level breakdown bars for the current layer
    const breakdownItems = [
        { label: "Broadband Coverage", value: data.broadband, max: 100, color: "#06b6d4" },
        { label: "Graduation Rate", value: data.gradRate, max: 100, color: "#a855f7" },
        { label: "Cost of Living", value: data.costOfLiving, max: 200, color: "#f59e0b" },
        { label: "Air Quality (AQI)", value: data.aqi, max: 100, color: data.aqi < 40 ? "#22c55e" : data.aqi < 55 ? "#eab308" : "#ef4444" },
    ];

    let html = `<div class="breakdown-title">Quick Overview</div>`;
    breakdownItems.forEach((item) => {
        const pct = Math.min((item.value / item.max) * 100, 100);
        html += `
            <div class="breakdown-row">
                <span class="breakdown-label">${item.label}</span>
                <div class="breakdown-bar-track">
                    <div class="breakdown-bar-fill" style="width: ${pct}%; background: ${item.color};"></div>
                </div>
                <span class="breakdown-value">${item.value}${item.label.includes("Rate") || item.label.includes("Coverage") ? "%" : ""}</span>
            </div>
        `;
    });

    container.innerHTML = html;

    // Trigger bar animations
    requestAnimationFrame(() => {
        container.querySelectorAll(".breakdown-bar-fill").forEach((bar) => {
            const w = bar.style.width;
            bar.style.width = "0%";
            requestAnimationFrame(() => {
                bar.style.width = w;
            });
        });
    });
}


// ============================================================
// COMPARE MODE
// ============================================================

function toggleCompareMode() {
    appState.compareMode = !appState.compareMode;
    const btn = document.getElementById("btn-compare");

    if (appState.compareMode) {
        btn.classList.add("active");
        btn.title = "Compare Mode (ON) — Click states to compare";
        appState.compareStates = [];

        // If a state is already selected, add it to compare
        if (appState.selectedState) {
            appState.compareStates.push(appState.selectedState);
        }

        // Update breadcrumb
        document.getElementById("breadcrumb-content").textContent =
            "Compare Mode — Click states to add";

        // Show compare panel hint
        showComparePanel();
    } else {
        btn.classList.remove("active");
        btn.title = "Compare Mode";
        appState.compareStates = [];

        // Clear all selections
        if (appState.geojson) {
            appState.geojson.features.forEach((f, i) => {
                appState.map.setFeatureState({ source: "states", id: i }, { selected: false });
            });
        }

        document.getElementById("breadcrumb-content").textContent = "United States";
        document.getElementById("detail-panel").classList.add("hidden");
    }
}

function toggleCompareState(fips, feature) {
    const idx = appState.compareStates.indexOf(fips);

    if (idx > -1) {
        // Remove from compare
        appState.compareStates.splice(idx, 1);
        if (feature) {
            appState.map.setFeatureState({ source: "states", id: feature.id }, { selected: false });
        }
    } else {
        // Add to compare (max 4)
        if (appState.compareStates.length >= 4) {
            // Remove the oldest
            const oldFips = appState.compareStates.shift();
            const oldFeature = appState.geojson.features.find(f => f.properties.fips === oldFips);
            if (oldFeature) {
                const oldIdx = appState.geojson.features.indexOf(oldFeature);
                appState.map.setFeatureState({ source: "states", id: oldIdx }, { selected: false });
            }
        }
        appState.compareStates.push(fips);
        if (feature) {
            appState.map.setFeatureState({ source: "states", id: feature.id }, { selected: true });
        }
    }

    // Update breadcrumb
    const names = appState.compareStates.map(f => STATE_DATA[f]?.abbr || f).join(" vs ");
    document.getElementById("breadcrumb-content").textContent =
        appState.compareStates.length > 0
            ? `Comparing: ${names}`
            : "Compare Mode — Click states to add";

    showComparePanel();
}

function showComparePanel() {
    const panel = document.getElementById("detail-panel");

    if (appState.compareStates.length === 0) {
        panel.classList.remove("hidden");
        document.getElementById("detail-title").textContent = "Compare Mode";
        document.getElementById("detail-subtitle").textContent = "Click up to 4 states to compare";
        document.getElementById("detail-stats").innerHTML = `
            <div class="compare-hint">
                <div style="text-align:center; padding: 2rem 1rem; color: var(--text-tertiary);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; opacity: 0.5;">
                        <rect x="2" y="3" width="8" height="18" rx="2"/><rect x="14" y="3" width="8" height="18" rx="2"/>
                    </svg>
                    <p style="font-size: 0.8125rem;">Click on states to add them<br>to the comparison</p>
                </div>
            </div>
        `;
        document.getElementById("detail-chart").innerHTML = "";
        document.getElementById("detail-breakdown").innerHTML = "";
        return;
    }

    panel.classList.remove("hidden");

    const stateNames = appState.compareStates.map(f => STATE_DATA[f]?.name).filter(Boolean);
    document.getElementById("detail-title").textContent = "State Comparison";
    document.getElementById("detail-subtitle").textContent = stateNames.join(" · ");

    // Build comparison table
    const layerDef = LAYERS[appState.activeLayer];
    const allMetrics = [
        { key: "population", label: "Population", format: "number" },
        ...Object.entries(layerDef.metrics).map(([key, def]) => ({ key, label: def.label, ...def })),
    ];

    // Add cross-layer metrics
    if (appState.activeLayer !== "economics") {
        allMetrics.push({ key: "medianIncome", label: "Median Income", prefix: "$", format: "number" });
    }
    if (appState.activeLayer !== "demographics") {
        allMetrics.push({ key: "density", label: "Density", suffix: "/mi²", format: "decimal" });
    }

    let tableHTML = `<div class="compare-table">`;
    tableHTML += `<div class="compare-header-row">`;
    tableHTML += `<div class="compare-metric-cell">Metric</div>`;
    appState.compareStates.forEach(fips => {
        const d = STATE_DATA[fips];
        tableHTML += `<div class="compare-state-cell">${d?.abbr || fips}</div>`;
    });
    tableHTML += `</div>`;

    allMetrics.forEach(metric => {
        // Find best value (highest for most, lowest for crime/unemployment/aqi/uninsured/costOfLiving)
        const invertMetrics = ["crimeRate", "propertyCrime", "violentCrime", "unemployment", "aqi", "uninsured", "costOfLiving", "disasters"];
        const shouldInvert = invertMetrics.includes(metric.key);
        const values = appState.compareStates.map(f => STATE_DATA[f]?.[metric.key] ?? 0);
        const bestVal = shouldInvert ? Math.min(...values) : Math.max(...values);

        tableHTML += `<div class="compare-data-row">`;
        tableHTML += `<div class="compare-metric-cell">${metric.label}</div>`;
        appState.compareStates.forEach(fips => {
            const d = STATE_DATA[fips];
            const val = d?.[metric.key] ?? 0;
            const isBest = val === bestVal && appState.compareStates.length > 1;
            const formattedVal = formatValue(val, metric);
            tableHTML += `<div class="compare-state-cell ${isBest ? 'best' : ''}">${formattedVal}</div>`;
        });
        tableHTML += `</div>`;
    });

    tableHTML += `</div>`;

    document.getElementById("detail-stats").innerHTML = tableHTML;
    document.getElementById("detail-chart").innerHTML = "";
    document.getElementById("detail-breakdown").innerHTML = "";

    // Render comparison bar chart
    renderCompareChart();
}

function renderCompareChart() {
    if (appState.compareStates.length < 2) return;

    const container = document.getElementById("detail-chart");
    const metricDef = LAYERS[appState.activeLayer].metrics[appState.activeMetric];

    container.innerHTML = `
        <div class="chart-title">Comparison — ${metricDef.label}</div>
        <div class="chart-container" id="compare-chart"></div>
    `;

    const chartEl = document.getElementById("compare-chart");
    const width = chartEl.clientWidth || 300;
    const height = 160;
    const margin = { top: 10, right: 16, bottom: 28, left: 8 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const barData = appState.compareStates.map(fips => ({
        abbr: STATE_DATA[fips]?.abbr || fips,
        value: STATE_DATA[fips]?.[appState.activeMetric] ?? 0,
    }));

    const svg = d3
        .select("#compare-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(barData.map(d => d.abbr))
        .range([0, innerW])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.value) * 1.1])
        .range([innerH, 0]);

    // Bars
    const barColors = ["#6366f1", "#06b6d4", "#f59e0b", "#a855f7"];
    g.selectAll(".bar")
        .data(barData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.abbr))
        .attr("y", innerH)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("rx", 4)
        .attr("fill", (d, i) => barColors[i % barColors.length])
        .attr("opacity", 0.85)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .ease(d3.easeCubicOut)
        .attr("y", d => y(d.value))
        .attr("height", d => innerH - y(d.value));

    // Value labels on bars
    g.selectAll(".bar-label")
        .data(barData)
        .enter()
        .append("text")
        .attr("x", d => x(d.abbr) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(241, 245, 249, 0.8)")
        .attr("font-size", "9px")
        .attr("font-family", "'JetBrains Mono', monospace")
        .attr("opacity", 0)
        .text(d => abbreviateNumber(d.value))
        .transition()
        .delay((d, i) => 400 + i * 100)
        .duration(400)
        .attr("opacity", 1);

    // X-axis labels
    g.selectAll(".x-label")
        .data(barData)
        .enter()
        .append("text")
        .attr("x", d => x(d.abbr) + x.bandwidth() / 2)
        .attr("y", innerH + 18)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(148, 163, 184, 0.7)")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("font-family", "Inter, sans-serif")
        .text(d => d.abbr);
}


// ============================================================
// EVENT LISTENERS
// ============================================================

function initEventListeners() {
    // Layer buttons
    document.querySelectorAll(".layer-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const layer = btn.dataset.layer;
            switchLayer(layer);
        });
    });

    // Metric selector
    document.getElementById("metric-select").addEventListener("change", (e) => {
        appState.activeMetric = e.target.value;
        updateChoropleth();
        if (appState.compareMode && appState.compareStates.length > 0) {
            showComparePanel();
        } else if (appState.selectedState) {
            showDetailPanel(STATE_DATA[appState.selectedState]);
        }
    });

    // Collapse/expand layer panel
    document.getElementById("btn-collapse-layers").addEventListener("click", () => {
        toggleLayerPanel(true);
    });

    document.getElementById("btn-expand-layers").addEventListener("click", () => {
        toggleLayerPanel(false);
    });

    // Close detail panel
    document.getElementById("btn-close-detail").addEventListener("click", () => {
        if (appState.compareMode) {
            toggleCompareMode(); // exit compare mode
        } else {
            deselectState();
        }
    });

    // Reset view
    document.getElementById("btn-reset").addEventListener("click", () => {
        if (appState.compareMode) {
            toggleCompareMode();
        }
        deselectState();
    });

    // Compare mode button
    document.getElementById("btn-compare").addEventListener("click", () => {
        toggleCompareMode();
    });

    // Search
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.classList.add("hidden");
            return;
        }

        const matches = Object.entries(STATE_DATA)
            .filter(
                ([, data]) =>
                    data.name.toLowerCase().includes(query) ||
                    data.abbr.toLowerCase().includes(query)
            )
            .slice(0, 8);

        if (matches.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result-item" style="cursor: default; opacity: 0.5;">
                    <div>
                        <div class="search-result-name">No results found</div>
                        <div class="search-result-type">Try a different search</div>
                    </div>
                </div>
            `;
            searchResults.classList.remove("hidden");
            return;
        }

        searchResults.innerHTML = matches
            .map(
                ([fips, data]) => `
                <div class="search-result-item" data-fips="${fips}">
                    <div>
                        <div class="search-result-name">${highlightMatch(data.name, query)}</div>
                        <div class="search-result-type">${data.abbr} · State · Pop: ${abbreviateNumber(data.population)}</div>
                    </div>
                </div>
            `
            )
            .join("");

        searchResults.classList.remove("hidden");

        // Click on search result
        searchResults.querySelectorAll(".search-result-item[data-fips]").forEach((item) => {
            item.addEventListener("click", () => {
                const fips = item.dataset.fips;
                const feature = appState.geojson.features.find((f) => f.properties.fips === fips);
                if (appState.compareMode) {
                    toggleCompareState(fips, feature);
                } else {
                    selectState(fips, feature);
                }
                searchInput.value = "";
                searchResults.classList.add("hidden");
            });
        });
    });

    // Close search on blur
    searchInput.addEventListener("blur", () => {
        setTimeout(() => searchResults.classList.add("hidden"), 200);
    });

    // Focus search on click into container
    document.querySelector(".search-container").addEventListener("click", () => {
        searchInput.focus();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        // Escape to deselect / close
        if (e.key === "Escape") {
            if (appState.compareMode) {
                toggleCompareMode();
            }
            deselectState();
            searchInput.blur();
            searchResults.classList.add("hidden");
        }

        // / to focus search
        if (e.key === "/" && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }

        // C to toggle compare mode
        if (e.key === "c" && document.activeElement !== searchInput) {
            toggleCompareMode();
        }
    });
}

/**
 * Highlight matching substring in search results.
 */
function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return `${before}<span class="search-highlight">${match}</span>${after}`;
}


// ============================================================
// LAYER SWITCHING
// ============================================================

function switchLayer(layerKey) {
    if (!LAYERS[layerKey]) return;

    appState.activeLayer = layerKey;

    // Set the first metric of this layer as active
    const metrics = Object.keys(LAYERS[layerKey].metrics);
    appState.activeMetric = metrics[0];

    // Update active button
    document.querySelectorAll(".layer-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.layer === layerKey);
    });

    // Update choropleth
    updateChoropleth();

    // Update detail panel if a state is selected or in compare mode
    if (appState.compareMode && appState.compareStates.length > 0) {
        showComparePanel();
    } else if (appState.selectedState) {
        showDetailPanel(STATE_DATA[appState.selectedState]);
    }
}


// ============================================================
// PANEL TOGGLING
// ============================================================

function toggleLayerPanel(collapse) {
    appState.isLayerPanelCollapsed = collapse;
    const panel = document.getElementById("layer-panel");
    const expandBtn = document.getElementById("btn-expand-layers");

    if (collapse) {
        panel.classList.add("collapsed");
        expandBtn.classList.remove("hidden");
    } else {
        panel.classList.remove("collapsed");
        expandBtn.classList.add("hidden");
    }
}


// ============================================================
// LOADING SCREEN
// ============================================================

function hideLoadingScreen() {
    const loading = document.getElementById("loading-screen");
    const app = document.getElementById("app");

    setTimeout(() => {
        loading.classList.add("hidden");
        app.classList.add("visible");
    }, 800);
}


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatValue(value, metricDef) {
    if (value == null) return "N/A";

    if (metricDef.format === "number") {
        let str = formatNumber(Math.round(value));
        if (metricDef.prefix) str = metricDef.prefix + str;
        if (metricDef.suffix) str += metricDef.suffix;
        return str;
    }
    if (metricDef.format === "percent") {
        let str = value.toFixed(1);
        if (metricDef.prefix) str = metricDef.prefix + str;
        if (metricDef.suffix) str += metricDef.suffix;
        return str;
    }
    // decimal
    let str = value.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (metricDef.prefix) str = metricDef.prefix + str;
    if (metricDef.suffix) str += metricDef.suffix;
    return str;
}

function formatNumber(num) {
    return num.toLocaleString();
}

function abbreviateNumber(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
    if (num >= 100) return Math.round(num).toString();
    return num.toFixed(1);
}
