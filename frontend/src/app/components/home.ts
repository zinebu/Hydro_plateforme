import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero">

      <!-- Vagues animées -->
      <div class="waves">
        <div class="wave wave1"></div>
        <div class="wave wave2"></div>
        <div class="wave wave3"></div>
      </div>

      <div class="content">
        <h1 class="title">
          Plateforme de Cartographie <span class="accent">Hydrologique</span>
        </h1>

        <p class="subtitle">
          Analyse des données hydrologiques en temps réel avec une interface fluide,
          moderne et centrée sur le mouvement naturel de l’eau.
        </p>

        <a routerLink="/carte" class="cta">Accéder à la carte</a>
      </div>

    </section>
  `,
  styles: [`
    /* ----- BASE ----- */
    .hero {
      position: relative;
      min-height: 100vh;
      background: #e0f7ff;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      overflow: hidden;
      padding: 0 2rem;
    }

    /* ----- WAVES ----- */
    .waves {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 40%;
      overflow: hidden;
      pointer-events: none;
      opacity: 0.8;
    }

    .wave {
      position: absolute;
      bottom: 0;
      width: 200%;
      height: 100%;
      background-repeat: repeat-x;
      transform: translate3d(0, 0, 0);
    }

    /* Vague 1 */
    .wave1 {
      background-image: url('data:image/svg+xml;utf8,\
      <svg width="1440" height="190" xmlns="http://www.w3.org/2000/svg">\
        <path fill="%230ea5e9" fill-opacity="0.25" d="M0 67c82 14 105 52 202 45s126-62 240-57 152 54 254 57 146-35 240-45V190H0V67z"/>\
      </svg>');
      animation: moveWave1 9s linear infinite;
    }

    /* Vague 2 */
    .wave2 {
      background-image: url('data:image/svg+xml;utf8,\
      <svg width="1440" height="190" xmlns="http://www.w3.org/2000/svg">\
        <path fill="%230ea5e9" fill-opacity="0.35" d="M0 90c120 20 140 40 240 38s150-50 260-55 170 40 260 50 130-20 220-35V190H0V90z"/>\
      </svg>');
      animation: moveWave2 13s linear infinite;
      opacity: 0.6;
    }

    /* Vague 3 */
    .wave3 {
      background-image: url('data:image/svg+xml;utf8,\
      <svg width="1440" height="190" xmlns="http://www.w3.org/2000/svg">\
        <path fill="%230ea5e9" fill-opacity="0.45" d="M0 100c80 25 160 55 260 50s140-40 250-45 150 30 240 40 160-20 230-25V190H0V100z"/>\
      </svg>');
      animation: moveWave3 16s linear infinite;
      opacity: 0.8;
    }

    @keyframes moveWave1 {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @keyframes moveWave2 {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-40%); }
    }

    @keyframes moveWave3 {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-30%); }
    }

    /* ----- CONTENT ----- */
    .content {
      position: relative;
      z-index: 10;
      max-width: 760px;
      margin-top: -30px; /* CTA visible sans scroll */
      animation: fadeInUp .9s ease-out;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(15px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .title {
      font-size: clamp(2.4rem, 5vw, 3.4rem);
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1.1rem;
    }

    .accent {
      background: linear-gradient(90deg, #0284c7, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      font-size: 1.15rem;
      color: #475569;
      line-height: 1.55;
      margin-bottom: 2.4rem;
    }

    /* ----- CTA ----- */
    .cta {
      padding: 1rem 2.3rem;
      background: #0284c7;
      color: white;
      border-radius: 12px;
      font-size: 1.15rem;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 8px 20px rgba(2,132,199,0.25);
      transition: 0.25s ease;
    }

    .cta:hover {
      background: #0369a1;
      transform: translateY(-4px);
      box-shadow: 0 12px 25px rgba(2,132,199,0.35);
    }
  `]
})
export class HomeComponent {}
