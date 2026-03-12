# Mon Mega Hub — Extension Chrome

> Extension de navigateur (Manifest V3) qui prolonge l'expérience **Mon Mega Hub** directement sur le Web.

---

## ✨ Fonctionnalités

- 🔍 **Injection Google Search** — Ajoute un bouton Mon Mega Hub sur les résultats Google pour accéder rapidement à la watchlist, aux comparaisons et aux contenus similaires.
- 🔔 **Notifications iOS-style** — Notifications visuelles inspirées du design Apple iOS.
- 🔐 **Synchronisation de session** — Maintient la connexion utilisateur en synchronisant le token d'authentification avec le site.
- 🎨 **Design cohérent** — Interface qui mêle l'esthétique de Mon Mega Hub avec le langage visuel d'Apple iOS.

---

## 📁 Structure du projet

```
Extension/
├── assets/              # Icônes de l'extension (16, 48, 128px)
├── popup/
│   ├── popup.html       # Interface de la popup
│   ├── popup.css        # Styles de la popup
│   └── popup.js         # Logique de la popup
├── background.js        # Service worker (gestion auth, notifications, alarms)
├── content.js           # Script injecté sur Google Search
├── content.css          # Styles injectés sur Google Search
├── manifest.json        # Configuration de l'extension (Manifest V3)
└── .gitignore
```

---

## 🚀 Installation (mode développeur)

1. Clone le dépôt :
   ```bash
   git clone https://github.com/erc-developpeur/mon-hub-extensions.git
   ```
2. Ouvre **Chrome** → `chrome://extensions/`
3. Active le **Mode développeur** (en haut à droite)
4. Clique sur **« Charger l'extension non empaquetée »**
5. Sélectionne le dossier `Extension/`

---

## 🔗 Permissions requises

| Permission | Utilisation |
|---|---|
| `storage` | Sauvegarde des préférences utilisateur |
| `notifications` | Notifications système |
| `identity` | Authentification |
| `cookies` | Lecture du token de session |
| `alarms` | Tâches périodiques (refresh token) |
| `tabs` | Navigation entre onglets |

---

## 🌐 Hôtes autorisés

- `google.com` / `google.fr` — Injection du bouton dans les résultats
- `mon-mega-hub.vercel.app` — API principale
- `localhost:3000` — Serveur de développement local
- `supabase.co` — Base de données / Auth
- `api.themoviedb.org` — Données films & séries (TMDB)

---

## 🛠️ Technologies

- **Manifest V3** (Chrome Extensions API)
- **Vanilla JS / CSS**
- **Supabase** (Auth & DB)
- **TMDB API**

---

## 📄 Licence

Projet privé — © Mon Mega Hub
