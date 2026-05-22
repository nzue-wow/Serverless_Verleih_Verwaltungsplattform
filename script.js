// ==================== FIREBASE CONFIGURATION ====================
// Deine echten Firebase-Zugangsdaten im passenden Compat-Stil:
// ==================== FIREBASE CONFIGURATION ====================
const firebaseConfig = {
    apiKey: "HIER_DEINEN_API_KEY_EINSETZEN",
    authDomain: "DEIN_PROJEKT.firebaseapp.com",
  
};

// Initialisieren
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// Variable für den Live-Zuhörer
let rentalsListener = null;

// ==================== LOGIN LOGIK ====================

// Login-Button Klick
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const passwort = document.getElementById('login-passwort').value;
    const fehlerAnzeige = document.getElementById('login-fehler');

    auth.signInWithEmailAndPassword(email, passwort)
        .then(() => {
            fehlerAnzeige.style.display = 'none';
        })
        .catch((error) => {
            fehlerAnzeige.innerText = "Falsche E-Mail oder Passwort!";
            fehlerAnzeige.style.display = 'block';
        });
});

// Zustand überwachen (Eingeloggt oder nicht?)
auth.onAuthStateChanged((user) => {
    const loginOverlay = document.getElementById('login-overlay');
    if (user) {
        // 1. Maske verstecken
        loginOverlay.style.display = 'none';
        
        // 2. JETZT ERST DIE DATENBANK LIVE STARTEN
        starteDatenbankVerbindung();
    } else {
        // Ausgeloggt -> Maske zeigen & Verbindung trennen
        loginOverlay.style.display = 'flex';
        if (rentalsListener) {
            rentalsListener(); // Stoppt den Live-Zuhörer
            rentalsListener = null;
        }
    }
});

// Funktion, die die Echtzeit-Synchronisation sicher startet
function starteDatenbankVerbindung() {
    // Falls der Zuhörer schon läuft, nicht doppelt starten
    if (rentalsListener) return;

    // Verschiebe deinen bestehenden onSnapshot-Block hier hinein:
    rentalsListener = db.collection("rentals").onSnapshot((snapshot) => {
        let vermietungen = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id; // Wichtig für das spätere Bearbeiten/Löschen!
            vermietungen.push(data);
        });
        
        // HIER MUSS DER NAME DEINER FUNKTION STEHEN, DIE DIE LISTE ZEICHNET
        // Z.B. updateTabelle(vermietungen) oder rendereVermietungen(vermietungen);
        if (typeof rendereTabelle === "function") {
            rendereTabelle(vermietungen);
        }
    }, (error) => {
        console.error("Datenbank-Fehler:", error);
    });
}
// =================================================================
// DOM Elemente Hauptformular
const elVorname = document.getElementById('vorname');
const elNachname = document.getElementById('nachname');
const elTelefon = document.getElementById('telefon');
const elEmail = document.getElementById('email');
const elArtikel = document.getElementById('artikel');
const elPersonen = document.getElementById('personen');
const elExtraSachen = document.getElementById('extraSachen');
const elExtraPreis = document.getElementById('extraPreis');
const elStartzeit = document.getElementById('startzeit');
const elDauer = document.getElementById('dauer');
const elZahlungsart = document.getElementById('zahlungsart');
const elDepot = document.getElementById('depot');
const elBemerkungen = document.getElementById('bemerkungen');
const elPreviewPreis = document.getElementById('previewPreis');
const elPreviewRueckgabe = document.getElementById('previewRueckgabe');
const elHistoryDatum = document.getElementById('historyDatumAuswahl');

// DOM Elemente Edit-Popup (Modal)
const modal = document.getElementById('detailsModal');
const modalEditId = document.getElementById('editId');
const elEditVorname = document.getElementById('editVorname');
const elEditNachname = document.getElementById('editNachname');
const elEditTelefon = document.getElementById('editTelefon');
const elEditEmail = document.getElementById('editEmail');
const elEditArtikel = document.getElementById('editArtikel');
const elEditPersonen = document.getElementById('editPersonen');
const elEditStartzeit = document.getElementById('editStartzeit');
const elEditDauer = document.getElementById('editDauer');
const elEditExtraSachen = document.getElementById('editExtraSachen');
const elEditExtraPreis = document.getElementById('editExtraPreis');
const elEditZahlungsart = document.getElementById('editZahlungsart');
const elEditDepot = document.getElementById('editDepot');
const elEditBemerkungen = document.getElementById('editBemerkungen');
const elDetailPreis = document.getElementById('detailPreis');
const elDetailRueckgabe = document.getElementById('detailRueckgabe');
const elDetailMeldung = document.getElementById('detailMeldung');

let allRentalsCloud = []; 

document.addEventListener('DOMContentLoaded', () => {
    const jetzt = new Date();
    elStartzeit.value = `${String(jetzt.getHours()).padStart(2, '0')}:${String(jetzt.getMinutes()).padStart(2, '0')}`;
    elHistoryDatum.value = jetzt.toISOString().split('T')[0];

    // Event Listener für Berechnungen im Hauptformular
    [elArtikel, elPersonen, elExtraPreis, elStartzeit, elDauer].forEach(el => {
        el.addEventListener('change', updateLivePreview);
        el.addEventListener('input', updateLivePreview);
    });

    // Event Listener für Echtzeit-Kalkulation im Bearbeitungsfenster (Popup)
    [elEditArtikel, elEditPersonen, elEditExtraPreis, elEditStartzeit, elEditDauer].forEach(el => {
        el.addEventListener('change', updateModalLivePreview);
        el.addEventListener('input', updateModalLivePreview);
    });

    document.getElementById('btnSpeichern').addEventListener('click', neuenEintragSpeichern);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    elHistoryDatum.addEventListener('change', renderHistoryTab);

    document.getElementById('btnBeenden').addEventListener('click', aktionBeenden);
    document.getElementById('btnAnpassen').addEventListener('click', aktionAnpassen);
    document.getElementById('btnDelete').addEventListener('click', aktionLoeschen);

    updateLivePreview();
    
    // Cloud Synchronisation
    db.collection("rentals").onSnapshot((snapshot) => {
        allRentalsCloud = [];
        snapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            allRentalsCloud.push(data);
        });
        renderLiveTab();
        renderHistoryTab();
    });

    setInterval(renderLiveTab, 60000);
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-content'));
    
    if (tabName === 'live') {
        document.getElementById('tabLiveBtn').classList.add('active');
        document.getElementById('tabLive').classList.add('active-content');
    } else {
        document.getElementById('tabHistoryBtn').classList.add('active');
        document.getElementById('tabHistory').classList.add('active-content');
        renderHistoryTab();
    }
}

// Zentrale Preisliste & Zeitberechnung
function berechnePreisUndRueckgabe(artikel, personen, dauer, extraPreis, startzeitString) {
    let basisPreisProGerät = 0;
    personen = parseInt(personen) || 1;
    dauer = parseInt(dauer) || 1;
    extraPreis = parseFloat(extraPreis) || 0;

    if (artikel === 'SUP') {
        basisPreisProGerät = 20 + (dauer > 1 ? (dauer - 1) * 15 : 0);
    } else if (artikel === 'SUP_XXL') {
        basisPreisProGerät = 95 * dauer;
    } else if (artikel === 'ABO') {
        basisPreisProGerät = 170;
    } else if (artikel === 'KAJAK_1') {
        basisPreisProGerät = 25 + (dauer > 1 ? (dauer - 1) * 20 : 0);
    } else if (artikel === 'KAJAK_2') {
        basisPreisProGerät = 30 + (dauer > 1 ? (dauer - 1) * 25 : 0);
    }

    let totalBasisPreis = (artikel === 'SUP_XXL') ? basisPreisProGerät : (basisPreisProGerät * personen);
    let gesamtPreis = totalBasisPreis + extraPreis;

    let rueckgabeZeitString = "--:--";
    if (startzeitString) {
        const [stunden, minuten] = startzeitString.split(':').map(Number);
        let dummyDate = new Date();
        dummyDate.setHours(stunden, minuten, 0, 0);
        dummyDate.setTime(dummyDate.getTime() + (dauer * 60 * 60 * 1000));
        rueckgabeZeitString = `${String(dummyDate.getHours()).padStart(2, '0')}:${String(dummyDate.getMinutes()).padStart(2, '0')}`;
    }

    return { preis: gesamtPreis, rueckgabe: rueckgabeZeitString };
}

function updateLivePreview() {
    const res = berechnePreisUndRueckgabe(elArtikel.value, elPersonen.value, elDauer.value, elExtraPreis.value, elStartzeit.value);
    elPreviewPreis.innerText = `CHF ${res.preis.toFixed(2)}`;
    elPreviewRueckgabe.innerText = res.rueckgabe;
}

// Aktualisiert Berechnungen Live, falls du Daten direkt im geöffneten Fenster anpasst (z.B. Zeit verlängern)
function updateModalLivePreview() {
    const res = berechnePreisUndRueckgabe(elEditArtikel.value, elEditPersonen.value, elEditDauer.value, elEditExtraPreis.value, elEditStartzeit.value);
    elDetailRueckgabe.innerText = res.rueckgabe;
    
    let finalerPreis = res.preis;
    let statusText = "Unterwegs (Alles im Zeitrahmen)";
    elDetailMeldung.className = "badge badge-orange";

    const jetzt = new Date();
    const [sollH, sollM] = res.rueckgabe.split(':').map(Number);
    const diff = (jetzt.getHours() * 60 + jetzt.getMinutes()) - (sollH * 60 + sollM);

    // Kulanzzeit abgelaufen? Falls ja, automatischen Aufpreis kalkulieren
    if (diff > 10) {
        const extraStunden = Math.ceil(diff / 60);
        let aufpreisProGerät = 0;
        if (elEditArtikel.value === 'SUP') aufpreisProGerät = 15;
        else if (elEditArtikel.value === 'SUP_XXL') aufpreisProGerät = 95;
        else if (elEditArtikel.value === 'KAJAK_1') aufpreisProGerät = 20;
        else if (elEditArtikel.value === 'KAJAK_2') aufpreisProGerät = 25;

        let totalerAufpreis = (elEditArtikel.value === 'SUP_XXL') ? (aufpreisProGerät * extraStunden) : (aufpreisProGerät * extraStunden * parseInt(elEditPersonen.value));
        finalerPreis += totalerAufpreis;

        statusText = `🚨 ZEIT ÜBERSCHRITTEN! +${diff} Min. Bitte +${extraStunden}h verrechnen (+ CHF ${totalerAufpreis.toFixed(2)})`;
        elDetailMeldung.className = "badge badge-red";
    }

    elDetailPreis.innerText = `CHF ${finalerPreis.toFixed(2)}`;
    elDetailPreis.setAttribute('data-calculated', finalerPreis);
    elDetailMeldung.innerText = statusText;
}

function neuenEintragSpeichern() {
    if (!elNachname.value && !elVorname.value) {
        alert("Bitte Namen eingeben!");
        return;
    }

    const res = berechnePreisUndRueckgabe(elArtikel.value, elPersonen.value, elDauer.value, elExtraPreis.value, elStartzeit.value);
    const heuteString = new Date().toISOString().split('T')[0];

    const neueVermietung = {
        vorname: elVorname.value,
        nachname: elNachname.value,
        telefon: elTelefon.value,
        email: elEmail.value,
        artikel: elArtikel.value,
        personen: parseInt(elPersonen.value),
        extraSachen: elExtraSachen.value,
        extraPreis: parseFloat(elExtraPreis.value) || 0,
        startzeit: elStartzeit.value,
        dauer: parseInt(elDauer.value),
        zahlungsart: elZahlungsart.value,
        depot: elDepot.value,
        bemerkungen: elBemerkungen.value,
        sollRueckgabe: res.rueckgabe,
        basisPreis: res.preis,
        status: 'aktiv',
        datumErstellt: heuteString,
        datumBeendet: ""
    };

    db.collection("rentals").add(neueVermietung)
        .then(() => {
            elVorname.value = ''; elNachname.value = ''; elTelefon.value = ''; elEmail.value = '';
            elExtraSachen.value = ''; elExtraPreis.value = '0'; elDepot.value = ''; elBemerkungen.value = '';
            updateLivePreview();
        })
        .catch(err => alert("Fehler: " + err));
}

function renderLiveTab() {
    const tbody = document.getElementById('rentalsTableBody');
    tbody.innerHTML = '';
    const aktive = allRentalsCloud.filter(r => r.status === 'aktiv');
    const jetzt = new Date();
    const jetztMin = (jetzt.getHours() * 60) + jetzt.getMinutes();

    aktive.forEach(item => {
        const tr = document.createElement('tr');
        tr.addEventListener('click', () => openDetailsModal(item.id));

        let statusBadge = '';
        const [sollH, sollM] = item.sollRueckgabe.split(':').map(Number);
        const sollMin = (sollH * 60) + sollM;
        const diff = jetztMin - sollMin;

        if (diff > 10) {
            const zusatzStunden = Math.ceil(diff / 60);
            statusBadge = `<span class="badge badge-red">🚨 +${diff} Min! (+${zusatzStunden}h)</span>`;
        } else {
            statusBadge = '<span class="badge badge-orange">⏳ Vermietet</span>';
        }

        tr.innerHTML = `
            <td><strong>${item.nachname}</strong>, ${item.vorname}</td>
            <td>${item.artikel} (${item.personen} P.)</td>
            <td>${item.sollRueckgabe} <small style="color:#666">(${item.dauer}h)</small></td>
            <td>${item.depot || '-'}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderHistoryTab() {
    const gewaehltesDatum = elHistoryDatum.value;
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    const tagesEintraege = allRentalsCloud.filter(r => r.status === 'beendet' && r.datumBeendet === gewaehltesDatum);

    let summeBar = 0;
    let summeKarte = 0;
    
    // Umsatz-Auswertung nach exaktem Verdienst initialisieren
    let verdienstNachArtikel = {
        'SUP': 0,
        'SUP_XXL': 0,
        'ABO': 0,
        'KAJAK_1': 0,
        'KAJAK_2': 0
    };

    tagesEintraege.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.nachname}</strong>, ${item.vorname}</td>
            <td>${item.artikel} (${item.personen} P.)</td>
            <td>${item.startzeit} - ${item.sollRueckgabe} Uhr</td>
            <td><span class="badge">${item.zahlungsart}</span></td>
            <td><strong>CHF ${item.basisPreis.toFixed(2)}</strong></td>
        `;
        tbody.appendChild(tr);

        if (item.zahlungsart === 'Bar') summeBar += item.basisPreis;
        if (item.zahlungsart === 'Karte') summeKarte += item.basisPreis;

        // Verdienst aufaddieren
        if (verdienstNachArtikel[item.artikel] !== undefined) {
            verdienstNachArtikel[item.artikel] += item.basisPreis;
        }
    });

    document.getElementById('kpiBar').innerText = `CHF ${summeBar.toFixed(2)}`;
    document.getElementById('kpiKarte').innerText = `CHF ${summeKarte.toFixed(2)}`;
    document.getElementById('kpiTotal').innerText = `CHF ${(summeBar + summeKarte).toFixed(2)}`;

    // Ausgabe wie viel CHF pro Artikel eingenommen wurde
    const statsListe = document.getElementById('statsMengenListe');
    statsListe.innerHTML = '';
    
    const namenMapping = {
        'SUP': 'SUP Standard',
        'SUP_XXL': 'SUP XXL Board',
        'ABO': 'SUP Abonnements',
        'KAJAK_1': 'Kajak (1-Plätzer)',
        'KAJAK_2': 'Kajak (2-Plätzer)'
    };

    for (const [key, value] of Object.entries(verdienstNachArtikel)) {
        statsListe.innerHTML += `<li><strong>${namenMapping[key]}:</strong> CHF ${value.toFixed(2)} verdient</li>`;
    }
}

function openDetailsModal(id) {
    const item = allRentalsCloud.find(r => r.id === id);
    if (!item) return;

    modalEditId.value = item.id;
    elEditVorname.value = item.vorname || '';
    elEditNachname.value = item.nachname || '';
    elEditTelefon.value = item.telefon || '';
    elEditEmail.value = item.email || '';
    elEditArtikel.value = item.artikel;
    elEditPersonen.value = item.personen;
    elEditStartzeit.value = item.startzeit;
    elEditDauer.value = item.dauer;
    elEditExtraSachen.value = item.extraSachen || '';
    elEditExtraPreis.value = item.extraPreis || 0;
    elEditZahlungsart.value = item.zahlungsart;
    elEditDepot.value = item.depot || '';
    elEditBemerkungen.value = item.bemerkungen || '';

    updateModalLivePreview(); 
    modal.style.display = "flex";
}

function closeModal() { modal.style.display = "none"; }

// AKTION: BEENDEN & AUTOMATISCH POPUP SCHLIESSEN
function aktionBeenden() {
    const id = modalEditId.value;
    const finalerPreis = parseFloat(elDetailPreis.getAttribute('data-calculated'));
    const heuteString = new Date().toISOString().split('T')[0];

    db.collection("rentals").doc(id).update({
        vorname: elEditVorname.value,
        nachname: elEditNachname.value,
        telefon: elEditTelefon.value,
        email: elEditEmail.value,
        artikel: elEditArtikel.value,
        personen: parseInt(elEditPersonen.value),
        startzeit: elEditStartzeit.value,
        dauer: parseInt(elEditDauer.value),
        extraSachen: elEditExtraSachen.value,
        extraPreis: parseFloat(elEditExtraPreis.value) || 0,
        zahlungsart: elEditZahlungsart.value,
        depot: elEditDepot.value,
        sollRueckgabe: elDetailRueckgabe.innerText,
        status: 'beendet',
        basisPreis: finalerPreis, 
        datumBeendet: heuteString,
        bemerkungen: elEditBemerkungen.value
    })
    .then(() => { closeModal(); }) 
    .catch(err => alert("Fehler beim Beenden: " + err));
}

// AKTION: VOLLSTÄNDIGES BEARBEITEN / VERLÄNGERN & AUTOMATISCH POPUP SCHLIESSEN
function aktionAnpassen() {
    const id = modalEditId.value;
    const res = berechnePreisUndRueckgabe(elEditArtikel.value, elEditPersonen.value, elEditDauer.value, elEditExtraPreis.value, elEditStartzeit.value);

    db.collection("rentals").doc(id).update({
        vorname: elEditVorname.value,
        nachname: elEditNachname.value,
        telefon: elEditTelefon.value,
        email: elEditEmail.value,
        artikel: elEditArtikel.value,
        personen: parseInt(elEditPersonen.value),
        startzeit: elEditStartzeit.value,
        dauer: parseInt(elEditDauer.value),
        extraSachen: elEditExtraSachen.value,
        extraPreis: parseFloat(elEditExtraPreis.value) || 0,
        zahlungsart: elEditZahlungsart.value,
        depot: elEditDepot.value,
        sollRueckgabe: res.rueckgabe,
        basisPreis: res.preis, 
        bemerkungen: elEditBemerkungen.value
    })
    .then(() => { closeModal(); }) 
    .catch(err => alert("Fehler beim Speichern: " + err));
}

// AKTION: LÖSCHEN & AUTOMATISCH POPUP SCHLIESSEN
function aktionLoeschen() {
    const id = modalEditId.value;
    if (confirm("Eintrag wirklich löschen?")) {
        db.collection("rentals").doc(id).delete()
            .then(() => { closeModal(); }) 
            .catch(err => alert("Fehler beim Löschen: " + err));
    }
}

// Logout-Button Event Listener
document.getElementById('btn-logout').addEventListener('click', () => {
    // Firebase sagen, dass der Benutzer sich abmelden will
    auth.signOut()
        .then(() => {
            console.log("Erfolgreich abgemeldet.");
            // Hinweis: Das Login-Overlay blendet sich automatisch wieder ein,
            // weil "auth.onAuthStateChanged" merkt, dass kein User mehr da ist!
        })
        .catch((error) => {
            console.error("Fehler beim Abmelden:", error);
            alert("Abmelden fehlgeschlagen. Bitte versuche es erneut.");
        });
});