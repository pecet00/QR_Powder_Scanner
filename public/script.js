document.getElementById('clearBtn').addEventListener('click', clearTable);
document.getElementById('sendBtn').addEventListener('click', sendToDatabase);

let qr1Value = "";
let qrCodes = [];
let lastScanned = "";

function updateTable() {
  const qr1 = qr1Value;
  renderTable();
}

function addToTable(code) {
  if (!qr1Value) {
    alert("Najpierw zeskanuj kod QR dla pola QR1 (Printer).");
    return;
  }

  qrCodes.push(code);
  renderTable();
}

function renderTable() {
  const tableBody = document.getElementById('qrTable');
  tableBody.innerHTML = "";

  const qr1Row = `
    <tr>
      <td>${qr1Value || '-'}</td>
      <td>-</td>
      <td></td> <!-- Kolumna na przycisk Usuń -->
    </tr>`;
  tableBody.innerHTML += qr1Row;

  qrCodes.forEach((code, index) => {
    const row = `
      <tr>
        <td>${qr1Value}</td>
        <td>${code}</td>
        <td><button onclick="removeFromTable(${index})">Usuń</button></td>
      </tr>`;
    tableBody.innerHTML += row;
  });
}

function removeFromTable(index) {

  qrCodes.splice(index, 1);
  renderTable();
}

function clearTable() {
  qr1Value = '';
  qrCodes = [];
  renderTable();
}

function sendToDatabase() {
  if (!qr1Value) {
    alert("Kod QR1 jest wymagany przed wysłaniem.");
    return;
  }

  if (qrCodes.length === 0) {
    alert("Dodaj przynajmniej jeden dodatkowy kod QR przed wysłaniem.");
    return;
  }

  const dataToSend = qrCodes.map(code => ({
    printer: code,
    powder: qr1Value
  }));

  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataToSend)
  })
    .then(response => response.text())
    .then(data => {
      alert(data);
      clearTable();
    })
    .catch(err => alert('Error: ' + err));
}

const scannedSound = new Audio('success.mp3');
const html5QrCode = new Html5Qrcode("qr-reader");

let lastScanTime = 0;
html5QrCode.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: { width: 200, height: 200 } }, 
  qrCodeMessage => {
    const currentTime = Date.now();
    if (currentTime - lastScanTime < 5000) {
      console.log("Oczekiwanie na 5 sekund między skanami...");
      return;
    }
    if (qrCodeMessage === lastScanned) {
      console.log("Kod zostal zeskanowany");
      return;
    }
    lastScanTime = currentTime;
    lastScanned = qrCodeMessage;

    if (!qr1Value) {
      qr1Value = qrCodeMessage;
      updateTable();

      scannedSound.play();
    } else {
      addToTable(qrCodeMessage);
      scannedSound.play();
    }
  },
  errorMessage => {
    console.warn("Błąd odczytu:", errorMessage);
  }
).catch(err => {
  console.error("Nie można uruchomić kamery. Sprawdź uprawnienia:", err);
  alert("Udziel dostępu do kamery, aby skaner działał poprawnie.");
});
