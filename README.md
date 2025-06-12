# Organ

**Organ** är en webbaserad applikation utvecklad som en del av kursen 1DV613. Syftet med applikationen är att hjälpa användare att fokusera och förbättra sin produktivitet genom en kombination av tre verktyg: en timer (med Pomodoro-läge), en musikspelare med ambient-ljud och en todo-lista för uppgiftshantering. Applikationen är byggd med Node.js, EJS, Express och modern JavaScript.

## Funktionalitet

### Timer
- Normalt läge (start/paus/återställ)
- Pomodoro-läge (25 minuter)
- Paus- läge (5 minuter)
- Visuella notifikationer och ljudsignaler vid tidens slut

### Musikspelare
- Spela upp ambient-ljud som regn, hav, lofi m.m.
- Volymkontroll och visuell återkoppling

### Todo-lista
- Lägg till, redigera, ta bort och markera uppgifter som klara
- Uppgifter sparas lokalt i mongoDB databas
- Flytta todo i lista för att indikera prioritet

### UI-komponenter
- Draggable och fokuserbara fönster för verktyg
- Stängningsknapp för moduler
- Responsiv layout och enkel navigering

## Installation

1. Klona repo:
   ```bash
   git clone git@gitlab.lnu.se:1dv613/student/sh224wg/projects/organ.git
   cd organ
   ````

2. Installera beroenden:

   ```bash
   npm install
   ```

3. Starta utvecklingsserver:

   ```bash
   npm start
   ```

## Teknisk Översikt

* **Backend:** Node.js, Express
* **Frontend:** HTML, CSS, Vanilla JS, EJS
* **Databas:** MongoDB
* **Testing:** Manuell testning + automatiserade tester med Jest och Postman
* **CI/CD:** GitLab CI/CD med Postman-testning i pipeline
* **Deployment:** Docker och Docker Compose

## Struktur

```
organ/
├── public/             # Statisk CSS/JS och bilder
├── src/
|   |__ config/
│   ├── views/          # EJS-mallar
│   ├── controllers/    # Route-hantering
│   ├── routes/         # API- och UI-logik för todo-komponenten
|   |__ models/
|   |__ middlware/
│   └── server.js       # Applikationens entry-point
├── Dockerfile
├── docker-compose.production.yml
|__ test
└── README.md
```

## Testning

Applikationen har testats manuellt och automatiskt enligt en detaljerad testplan som inkluderar:

* Inloggning/utloggning/registrering
* Timer- och musikspelarfunktionalitet
* Todo-funktioner
* Användargränssnittets beteende (drag, fokus, stängning)

De automatiska testerna finns inom test mappen i root.
För att testa applikationen kör:
   ```bash
   npx test
   ```
För att köra postman testerna installera först newman:
   ```bash
   npm install -g newman
   ```
Följt av:
    ```bash
    newman run test/postman/postman_collection.json
    ```

## Författare

Projektet är utvecklat av Eva Saskia Heinemann

## Licens

MIT-licens
