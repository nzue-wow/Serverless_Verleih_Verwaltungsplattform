## Serverless Verleih Verwaltungsplattform

Diese Plattform wurde erstellt um mir beim Sommerjob SUB vermieten zu assistieren. Sie ersetzt die Zettelwirtschaft und hilft bei der berechnung der Tagesasuwertung und der verwaltung der vermieteten Subs. DIe Plattform ist gesichert durch ein Login. Die Plattform wird live ugedatet dafür brauche ich eine CLoud (firebase von google) NoSQL? 

# Digital Rental & Cloud Sync System
> **Sichere Serverless Web-App zur Echtzeit-Verwaltung von SUP-Vermietungen, die manuelle Abläufe digitalisiert und Daten mit lokaler Datenresidenz in der Google Cloud-Region Schweiz (Zürich) synchronisiert.**

---

## Projektübersicht & Einsatzzweck
Diese Plattform wurde als praxisnahes System entwickelt, um den täglichen Betrieb und den Verleihprozess an einer Stand-Up-Paddle (SUP) Station während eines Sommerjobs vollständig zu digitalisieren und zu optimieren. 

Die App ersetzt die fehleranfällige, analoge Zettelwirtschaft durch eine moderne, cloudbasierte Oberfläche. Sie unterstützt das Team aktiv bei der Verwaltung der aktiven Vermietungen, berechnet Mietzeiten sowie Tarife automatisiert und liefert am Feierabend eine präzise, sekundenschnelle Tagesauswertung.

---

## Screenshots & Benutzeroberfläche
**Login**
<img width="2874" height="1579" alt="Screenshot 2026-05-22 100013" src="https://github.com/user-attachments/assets/09b3f959-ac22-431e-a05f-40435e13fb21" />

**Echtzeit Dashboard**
<img width="2880" height="1611" alt="Screenshot (337)" src="https://github.com/user-attachments/assets/57a8f007-f641-49bb-ad8d-96f3e05d9c6e" />

<img width="2880" height="1800" alt="Screenshot (338)" src="https://github.com/user-attachments/assets/83482cce-5011-43a2-914e-29ff28de00a1" />



**Abrechnung**
<img width="2880" height="1800" alt="Screenshot (340)" src="<img width="2855" height="1412" alt="image" src="https://github.com/user-attachments/assets/311a97d5-1921-47f3-967d-a07c60838030" />
" />

---

## Kernfunktionen
* **Vollständige Digitalisierung:** Keine Papierformulare mehr, alle Kundendaten und Boards werden digital erfasst.
* **Echtzeit-Synchronisation (Live-Updates):** Änderungen (z. B. ein neues vermietetes Board) werden in unter einer Sekunde auf allen iPads, Laptops und Smartphones des Teams gespiegelt.
* **Automatisierte Abrechnung:** Das System berechnet die exakte Mietdauer und den fälligen Betrag basierend auf den Tarifen.
* **Tagesauswertung auf Knopfdruck:** Automatische Zusammenfassung aller Umsätze und Vermietungen für den Kassenabschluss am Feierabend.
* **Integrierter Zugriffsschutz:** Ein modales Login-Vollbild-Overlay schützt sensible Kundendaten vor unbefugten Blicken.

---

## Technologie-Stack & Architektur
Das Projekt basiert auf einer modernen **Serverless-Architektur**, um maximale Performance bei minimalem Wartungsaufwand zu garantieren:

* **Frontend:** Nativ programmiert mit **HTML5, CSS3 und JavaScript (ES6)** im responsive Design (optimiert für iPads und Smartphones am Steg).
* **Backend & Cloud-Infrastruktur:** **Google Firebase**
  * **Firebase Authentication:** Sicheres Session-Management und Login-System für das Stationspersonal.
  * **Firebase Cloud Firestore (NoSQL):** Eine flexible, dokumentenbasierte NoSQL-Datenbank. Dank WebSockets werden Daten via `onSnapshot`-Listener in Echtzeit gestreamt.
* **Datenhaltung (Data Residency):** Gespeichert in der Google Cloud-Region **`europe-west6` (Zürich, Schweiz)** für minimale Latenzzeiten und höchste Datensicherheit.
* **Hosting:** **Firebase Hosting** für eine verschlüsselte (HTTPS) und globale Verfügbarkeit der Web-App.

---

## Sicherheitskonzept
1. **Client-seitig:** Die Programmlogik verhindert jeglichen Datenabruf aus der Cloud, solange kein Mitarbeiter erfolgreich über Firebase Authentication eingeloggt ist (`auth.onAuthStateChanged`).
2. **Server-seitig (Firestore Security Rules):** Die Datenbank ist im Backend strikt abgeriegelt. Lese- und Schreibrechte werden vom Google-Server nur gewährt, wenn eine verifizierte Mitarbeiter-Sitzung vorliegt:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
