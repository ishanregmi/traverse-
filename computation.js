document.getElementById('createFormBtn').addEventListener('click', function() {
  const numStations = parseInt(document.getElementById('numStations').value);
  const tbody = document.querySelector('#traverseTable tbody');
  tbody.innerHTML = '';

  // Adding header with known bearing input
  const knownBearingRow = document.createElement('tr');
  knownBearingRow.innerHTML = `
      <td>Known Bearing</td>
      <td colspan="2"><input type="number" step="any" id="knownBearing" value="27.2089" /></td>
  `;
  tbody.appendChild(knownBearingRow);

  const defaultObservedAngles = [247.8969, 147.8118, 218.7133, 177.4716, 279.2766, 115.0015, 345.7240, 298.1122, 158.9200, 242.5076, 190.9420, 202.0837, 176.9608, 283.8771];
  const defaultLengths = [422.3950, 230.5250, 189.22, 178.066, 261.798, 205.1420, 169.56, 387.72, 103.6130, 251.2890, 228.6170, 68.5010, 127.5380, 255.2410];
  const defaultHIs = [1.488, 1.50, 1.512, 1.456, 1.535, 1.523, 1.39, 1.285, 1.446, 1.432, 1.635, 1.674, 1.435, 1.601];
  const defaultHTs = [0.6, 0.4, 0.5, 0.6, 0.7, 0.7, 0.8, 0.3, 0.5, 0.4, 0.8, 0.7, 0.4, 0.5];
  const defaultZs = [97.33, 100.17, 101.9, 98.56, 87.36, 72.06, 86.41, 95.46, 101.47, 85.25, 99.25, 85.26, 76.85, 95.62];

  for (let i = 1; i <= numStations; i++) {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>Station ${i}</td>
          <td><input type="number" step="any" class="observedAngle" id="observedAngle${i}" value="${defaultObservedAngles[i-1] || 0}" /></td>
          <td><input type="number" step="any" class="bearing" id="bearing${i}" readonly /></td>
          <td><input type="number" step="any" class="length" id="length${i}" value="${defaultLengths[i-1] || 0}" /></td>
          <td><input type="number" step="any" class="HI" id="HI${i}" value="${defaultHIs[i-1] || 0}" /></td>
          <td><input type="number" step="any" class="HT" id="HT${i}" value="${defaultHTs[i-1] || 0}" /></td>
          <td><input type="number" step="any" class="deltaECalc" id="deltaECalc${i}" readonly /></td>
          <td><input type="number" step="any" class="deltaECorr" id="deltaECorr${i}" readonly /></td>
          <td><input type="number" step="any" class="deltaNCalc" id="deltaNCalc${i}" readonly /></td>
          <td><input type="number" step="any" class="deltaNCorr" id="deltaNCorr${i}" readonly /></td>
          <td><input type="number" step="any" class="deltahCalc" id="deltahCalc${i}" readonly /></td>
          <td><input type="number" step="any" class="deltahCorr" id="deltahCorr${i}" readonly /></td>
          <td><input type="number" step="any" class="E" id="E${i}" readonly /></td>
          <td><input type="number" step="any" class="N" id="N${i}" readonly /></td>
          <td><input type="number" step="any" class="Z" id="Z${i}" value="${defaultZs[i-1] || 0}" /></td>
      `;
      tbody.appendChild(row);
  }

  document.getElementById('traverseForm').style.display = 'block';
});

document.querySelector('#traverseForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const X1 = parseFloat(document.getElementById('X1').value);
  const Y1 = parseFloat(document.getElementById('Y1').value);
  const numStations = parseInt(document.getElementById('numStations').value);

  let sumE = 0, sumN = 0, perimeter = 0, totalDeltaH = 0;
  let previousE = X1, previousN = Y1;
  let previousBearing = parseFloat(document.getElementById('knownBearing').value); 

  for (let i = 1; i <= numStations; i++) {
      const observedAngle = parseFloat(document.getElementById(`observedAngle${i}`).value);
      const length = parseFloat(document.getElementById(`length${i}`).value);
      perimeter += length; 
      const HI = parseFloat(document.getElementById(`HI${i}`).value);
      const HT = parseFloat(document.getElementById(`HT${i}`).value);
      const Z = parseFloat(document.getElementById(`Z${i}`).value);

  //Bearing
      let bearing;
      if (i === 1) {
          bearing = previousBearing + observedAngle;
      } else {
          bearing = previousBearing + observedAngle;
      }

      // bearing corrections
      if (bearing >= 200) {
          bearing -= 200;
      } else {
          bearing += 200;
      }

      document.getElementById(`bearing${i}`).value = bearing.toFixed(3);

      // ΔE and ΔN Calculations
      const deltaECalc = length * Math.sin(bearing * (Math.PI / 200)); 
      const deltaNCalc = length * Math.cos(bearing * (Math.PI / 200));
      sumE += deltaECalc; 
      sumN += deltaNCalc; 
      document.getElementById(`deltaECalc${i}`).value = deltaECalc.toFixed(3);
      document.getElementById(`deltaNCalc${i}`).value = deltaNCalc.toFixed(3);

      // Δh Calculation
      const deltahCalc = (length * (1 / Math.tan(Z * (Math.PI / 180)))) + HI - HT;
      totalDeltaH += deltahCalc;
      document.getElementById(`deltahCalc${i}`).value = deltahCalc.toFixed(3);

      // Updating previous bearing
      previousBearing = bearing;
  }

  // Calculating corrections
  const deltaECorrection = sumE / numStations;
  const deltaNCorrection = sumN / numStations;
  const deltahCorrection = totalDeltaH / numStations;

  for (let i = 1; i <= numStations; i++) {
      const deltaECalc = parseFloat(document.getElementById(`deltaECalc${i}`).value);
      const deltaNCalc = parseFloat(document.getElementById(`deltaNCalc${i}`).value);
      const deltahCalc = parseFloat(document.getElementById(`deltahCalc${i}`).value);

      document.getElementById(`deltaECorr${i}`).value = deltaECorrection.toFixed(3);
      document.getElementById(`deltaNCorr${i}`).value = deltaNCorrection.toFixed(3);
      document.getElementById(`deltahCorr${i}`).value = deltahCorrection.toFixed(3);

      // E and N calculation
      const E = previousE + deltaECalc + deltaECorrection;
      const N = previousN + deltaNCalc + deltaNCorrection;

      document.getElementById(`E${i}`).value = E.toFixed(3);
      document.getElementById(`N${i}`).value = N.toFixed(3);

      previousE = E;
      previousN = N;
  }

  // Calculate Closing Error and Linear Accuracy 
  const closingError = Math.sqrt(sumE ** 2 + sumN ** 2).toFixed(3);
  const linearAccuracy = (perimeter / closingError).toFixed(3);

  document.getElementById('sum-e').textContent = sumE.toFixed(3);
  document.getElementById('sum-n').textContent = sumN.toFixed(3);
  document.getElementById('closing-error').textContent = closingError;
  document.getElementById('linear-accuracy').textContent = `1:${Math.round(linearAccuracy)}`;
});