document.getElementById('clearBtn').addEventListener('click', clearTable);
document.getElementById('sendBtn').addEventListener('click', sendToDatabase);

let powderQR = "";
let printerQR = [];
let lastScanned = "";

function updateTable() {
  const qr1 = powderQR;
  renderTable();
}

function addToTable(code) {
  if (!powderQR) {
    alert("Najpierw zeskanuj kod QR dla drukarki");
    return;
  }

  printerQR.unshift(code);
  renderTable();
}

function renderTable() {
  const tableBody = document.getElementById('qrTable');
  tableBody.innerHTML = "";



  printerQR.forEach((code, index) => {
    const row = `
      <tr>
        <td>${powderQR}</td>
        <td>${code}</td>
        <td><button class="btn" id="delBtn" onclick="removeFromTable(${index})">Usuń</button></td>
      </tr>`;
    tableBody.innerHTML += row;
  });
}

function removeFromTable(index) {

  printerQR.splice(index, 1);
  renderTable();
}

function clearTable() {
  powderQR = '';
  printerQR = [];
  renderTable();
}

function sendToDatabase() {
  if (!powderQR) {
    alert("Need powder ID");
    return;
  }

  if (printerQR.length === 0) {
    alert("Add some printer bef. you send to DB");
    return;
  }

  const dataToSend = printerQR.map(code => ({
    printer: code,
    powder: powderQR
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
    if (currentTime - lastScanTime < 1000) {
      console.log("Oczekiwanie na 1 sekund między skanami...");
      return;
    }
    if (qrCodeMessage === lastScanned) {
      console.log("Kod zostal zeskanowany");
      return;
    }
    lastScanTime = currentTime;
    lastScanned = qrCodeMessage;

    if (!powderQR) {
      powderQR = qrCodeMessage;
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
