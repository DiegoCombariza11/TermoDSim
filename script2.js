// script.js

// Material properties and default values
let material = {
    temp: Array(10).fill(20), // Temperature in each segment
    conductivity: 0.5, // Thermal conductivity in W/(m·K)
    thickness: 0.1, // Thickness in meters (default to 10 cm)
    area: 0.02, // Area in m² (default to 200 cm²)
    energy: 0, // Total energy transferred
    maxEnergy: 0 // Maximum energy transferred
};

let heatSourceTemp = 100; // Temperature of the heat source in °C
let interval;
let heatSinkTemp = 20; // Initial temperature of the heat sink

// Function to initialize the material segments
function initializeSegments() {
    const segmentContainer = document.getElementById("material-segments");
    segmentContainer.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const segment = document.createElement('div');
        segment.className = 'segment';
        segmentContainer.appendChild(segment);
    }
}

initializeSegments();

function setHeatSourceTemp() {
    const input = document.getElementById('heat-source-temp').value;
    heatSourceTemp = parseFloat(input) || 100;
    document.getElementById("heat-source").style.backgroundColor = tempToColor(heatSourceTemp);
}

function startSimulation() {
    clearInterval(interval);
    interval = setInterval(() => {
        updateTemperatures();
        updateVisuals();
        updateInfoTable();
    }, 50); // Use a shorter interval for smoother updates
}

function stopSimulation() {
    clearInterval(interval);
}

function updateTemperatures() {
    const timeStep = 0.1; // Time step in seconds

    for (let i = 0; i < material.temp.length; i++) {
        const previousTemp = i === 0 ? heatSourceTemp : material.temp[i - 1];
        const tempDifference = previousTemp - material.temp[i];
        const heatFlow = (material.conductivity * material.area * tempDifference) / material.thickness;
        const tempChange = heatFlow * timeStep / (material.area * material.thickness * 1000); // Adjust for specific heat capacity

        // Update the temperature and accumulate energy
        material.temp[i] += tempChange;
        material.energy += Math.abs(heatFlow * timeStep);
        material.maxEnergy = Math.max(material.maxEnergy, material.energy);
    }

    // Update heat sink temperature to reflect the last segment's temperature
    heatSinkTemp = material.temp[material.temp.length - 1];
}

function updateVisuals() {
    const segments = document.querySelectorAll("#material-segments .segment");
    let totalTemp = 0;

    material.temp.forEach((temp, index) => {
        segments[index].style.backgroundColor = tempToColor(temp);
        totalTemp += temp;
    });

    const avgTemp = (totalTemp / material.temp.length).toFixed(1);
    document.getElementById("material-temp-display").textContent = `${avgTemp}°C`;
    document.getElementById("heat-sink").style.backgroundColor = tempToColor(heatSinkTemp);
}

function updateInfoTable() {
    document.getElementById("info-area").textContent = `${(material.area * 10000).toFixed(1)} cm²`; // Convert m² to cm²
    document.getElementById("info-thickness").textContent = `${(material.thickness * 100).toFixed(1)} cm`; // Convert m to cm
    document.getElementById("info-conductivity").textContent = `${material.conductivity.toFixed(2)} W/(m·K)`;
    document.getElementById("info-temp").textContent = `${heatSinkTemp.toFixed(1)}°C`;
    document.getElementById("info-energy").textContent = `${material.energy.toFixed(2)} J`;
    document.getElementById("info-max-energy").textContent = `${material.maxEnergy.toFixed(2)} J`;
}

// Convert temperature to color for visualization
function tempToColor(temp) {
    let r, g, b;
    if (temp < 50) {
        r = 0;
        g = 0;
        b = 255 - temp * 2;
    } else if (temp < 100) {
        r = (temp - 50) * 5;
        g = 0;
        b = 255 - (temp - 50) * 5;
    } else {
        r = 255;
        g = (temp - 100) * 2;
        b = 0;
    }
    return `rgb(${r}, ${g}, ${b})`;
}

function updateArea() {
    const areaInput = parseFloat(document.getElementById("area-input").value);
    material.area = (areaInput || 200) / 10000; // Convert cm² to m²
    document.documentElement.style.setProperty('--material-height', `${areaInput || 200}px`);
}

function updateThickness() {
    const thicknessInput = parseFloat(document.getElementById("thickness-input").value);
    material.thickness = (thicknessInput || 10) / 100; // Convert cm to m
    document.documentElement.style.setProperty('--material-width', `${(thicknessInput || 10) * 20}px`);
}

function updateConductivity() {
    material.conductivity = parseFloat(document.getElementById("conductivity-input").value) || 0.5;
}

function resetSimulation() {
    clearInterval(interval);
    material.temp.fill(20);
    material.energy = 0;
    material.maxEnergy = 0;
    heatSinkTemp = 20;
    heatSourceTemp = 100;
    document.getElementById('heat-source-temp').value = '';
    document.getElementById("heat-source").style.backgroundColor = tempToColor(heatSourceTemp);
    updateVisuals();
    updateInfoTable();
}

// Initialize the simulation with default values
updateVisuals();
updateInfoTable();
