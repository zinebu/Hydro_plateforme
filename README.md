 eOnsight Hydrometry – Full Stack Hydrological Platform

Plateforme full-stack permettant la visualisation en temps réel des stations hydrométriques, des ponts, et des données hydrologiques (H, Q) sur une carte interactive moderne, avec :

interface Angular entièrement refondue

animations avancées (page d'accueil + graphes)

intégration SSR (Server-Side Rendering)

widgets dynamiques (graphe, sidebar, légende, toggle stations)

backend Django + PostgreSQL + PostGIS pour la gestion des ponts

📦 1. Prérequis
Backend (Django)

Python 3.10+

PostgreSQL 15+

Extension PostGIS

pip / venv

Frontend (Angular)

Node.js v20.19+

npm ou pnpm

Angular CLI :

npm install -g @angular/cli

🗂️ 2. Installation du Backend (Django + PostgreSQL + PostGIS)
2.1. Cloner le projet
git clone <url-du-dépôt>
cd eOnsight-hydro-test/backend

2.2. Créer l'environnement virtuel
python -m venv .venv
source .venv/bin/activate        # Mac/Linux
.\.venv\Scripts\activate         # Windows

2.3. Installer les dépendances Python
pip install -r requirements.txt

2.4. Configurer PostgreSQL/PostGIS

Créer la base :

CREATE DATABASE bridge_db;


Activer PostGIS :

CREATE EXTENSION IF NOT EXISTS postgis;


Importer les données :

python import_csv_to_db.py

2.5. Lancer les migrations
python manage.py migrate

2.6. Démarrer le backend Django
python manage.py runserver


API ponts disponible ici :
👉 http://127.0.0.1:8000/api/bridges/

🎨 3. Installation du Frontend Angular (Carte + Graphes + SSR)
3.1. Aller dans le dossier frontend
cd ../frontend

3.2. Installer les dépendances
npm install

3.3. Lancer l'application Angular (mode dev)
npm start


Application accessible sur :
👉 http://localhost:4200

🌐 4. Fonctionnalités Frontend
🏠 Accueil dynamique

Page d'accueil moderne avec animation de vagues

CTA “Accéder à la carte”

Design responsive et professionnel

🗺️ Carte interactive (Leaflet)

Affichage des stations hydrométriques (Hubeau API)

Affichage des ponts (Backend Django)

Légende modernisée (centrée, flottante)

Filtrage : Masquer stations non opérationnelles

Sélection d'une station → mise en surbrillance

📊 Graphique hydrométrique

Ligne fluide (gradient + ombre)

Crosshair interactif

Données : Hauteur (H) ou Débit (Q)

Tooltip modernisé (nuances dark/slate)

Chargement optimisé (finalize(), skeleton UI)

📥 Sidebar dynamique

Affichage de toutes les informations de la station sélectionnée

Sélection connectée au graphe en temps réel

⚡ SSR (Angular Server-Side Rendering)

Configuration complète :

server.ts

app.config.server.ts

app.routes.server.ts

Support SEO / pré-rendu

🧱 5. Tester

Backend :

http://127.0.0.1:8000/api/bridges/


Frontend :

http://localhost:4200


Carte + graphes + sidebar fonctionnent ensemble.

🚀 6. Build de production
Build Angular :
npm run build

Lancer SSR :
npm run serve:ssr
