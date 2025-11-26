eOnsight Hydrometry – Full Stack Test

Application web permettant la visualisation des données hydrométriques et des infrastructures sur une carte interactive, avec widgets dynamiques.

1. Prérequis

Avant de lancer le projet, installez :

 Backend (Django)

Python 3.10+

PostgreSQL 15+

Extension PostGIS

pip / venv

 Frontend (Angular)

Node.js v20.19+

npm ou pnpm (recommandé)

Angular CLI (npm install -g @angular/cli)

 2. Installation du backend (Django + PostgreSQL + PostGIS)

2.1. Cloner le projet
git clone <url-du-dépôt>
cd eOnsight-hydro-test/backend

2.2. Créer l'environnement virtuel
python -m venv .venv
source .venv/bin/activate   # Mac/Linux
.\.venv\Scripts\activate    # Windows

2.3. Installer les dépendances Python
pip install -r requirements.txt

2.4. Configurer la base de données PostgreSQL/PostGIS

Créer la base :

CREATE DATABASE bridge_db;

Activer PostGIS :

CREATE EXTENSION IF NOT EXISTS postgis;

Importer le CSV via le script fourni :

python import_csv_to_db.py

2.5. Lancer les migrations
python manage.py migrate

2.6. Lancer le serveur backend
python manage.py runserver


L'API sera disponible ici :
 http://127.0.0.1:8000/api/bridges/