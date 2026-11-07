// List of countries + helpers for Origin/Destination custom selects
// Usage: include this file before country-origin-destination.js

const COUNTRIES = [
  "Afghanistan",
  "Afrique du Sud",
  "Albanie",
  "Algérie",
  "Allemagne",
  "Andorre",
  "Angola",
  "Antigua-et-Barbuda",
  "Arabie saoudite",
  "Argentine",
  "Arménie",
  "Australie",
  "Autriche",
  "Azerbaïdjan",

  "Bahamas",
  "Bahreïn",
  "Bangladesh",
  "Barbade",
  "Belgique",
  "Belize",
  "Bénin",
  "Bhoutan",
  "Biélorussie",
  "Bolivie",
  "Bosnie-Herzégovine",
  "Botswana",
  "Brésil",
  "Brunei",
  "Bulgarie",
  "Burkina Faso",
  "Burundi",

  "Cabo Verde",
  "Cambodge",
  "Cameroun",
  "Canada",
  "République centrafricaine",
  "Chili",
  "Chine",
  "Chypre",
  "Colombie",
  "Comores",
  "République démocratique du Congo",
  "Congo",
  "Corée du Nord",
  "Corée du Sud",
  "Costa Rica",
  "Côte d’Ivoire",
  "Croatie",
  "Cuba",

  "Danemark",
  "Djibouti",
  "Dominique",
  "Égypte",
  "Émirats arabes unis",
  "Équateur",
  "Érythrée",
  "Espagne",
  "Estonie",
  "Eswatini",
  "États-Unis",
  "Éthiopie",

  "Fidji",
  "Finlande",
  "France",

  "Gabon",
  "Gambie",
  "Géorgie",
  "Ghana",
  "Grèce",
  "Grenade",
  "Guatemala",
  "Guinée",
  "Guinée-Bissau",
  "Guinée équatoriale",
  "Guyana",

  "Haïti",
  "Honduras",
  "Hongrie",

  "Inde",
  "Indonésie",
  "Irak",
  "Iran",
  "Irlande",
  "Islande",
  "Israël",
  "Italie",

  "Jamaïque",
  "Japon",
  "Jordanie",

  "Kazakhstan",
  "Kenya",
  "Kirghizistan",
  "Kiribati",
  "Koweït",

  "Laos",
  "Lesotho",
  "Lettonie",
  "Liban",
  "Libéria",
  "Libye",
  "Liechtenstein",
  "Lituanie",
  "Luxembourg",

  "Macédoine du Nord",
  "Madagascar",
  "Malaisie",
  "Malawi",
  "Maldives",
  "Mali",
  "Malte",
  "Maroc",
  "Îles Marshall",
  "Maurice",
  "Mauritanie",
  "Mexique",
  "Micronésie",
  "Moldavie",
  "Mongolie",
  "Monténégro",
  "Mozambique",
  "Myanmar",

  "Namibie",
  "Nauru",
  "Népal",
  "Nicaragua",
  "Niger",
  "Nigéria",
  "Norvège",
  "Nouvelle-Zélande",

  "Oman",

  "Ouganda",

  "Pakistan",
  "Palaos",
  "Panama",
  "Papouasie-Nouvelle-Guinée",
  "Paraguay",
  "Pérou",
  "Philippines",
  "Pologne",
  "Portugal",

  "Qatar",

  "République dominicaine",

  "Roumanie",
  "Royaume-Uni",
  "Russie",
  "Rwanda",

  "Saint-Kitts-et-Nevis",
  "Sainte-Lucie",
  "Saint-Vincent-et-les-Grenadines",
  "Samoa",
  "Sao Tomé-et-Principe",
  "Sénégal",
  "Serbie",
  "Seychelles",
  "Sierra Leone",
  "Singapour",
  "Slovaquie",
  "Slovénie",
  "Somalie",
  "Soudan",
  "Soudan du Sud",
  "Sri Lanka",
  "Suède",
  "Suisse",
  "Suriname",
  "Syrie",

  "Tadjikistan",
  "Tanzanie",
  "Tchad",
  "Thaïlande",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinité-et-Tobago",
  "Tunisie",
  "Turkménistan",
  "Turquie",
  "Tuvalu",

  "Ukraine",
  "Uruguay",
  "Ouzbékistan",

  "Vanuatu",
  "Vatican",
  "Venezuela",
  "Viêt Nam",

  "Yémen",
  "Zambie",
  "Zimbabwe",

  // Quelques territoires et variantes courantes (si besoin)
  // "Palestine",
  // "Kosovo",
  // "Taïwan"
];

function renderCountriesOptions(selectEl, { includePlaceholder = true } = {}) {
  if (!selectEl) return;
  const placeholder = selectEl.dataset.placeholder || "Choisir...";

  // Reset
  selectEl.innerHTML = "";

  if (includePlaceholder) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder;
    selectEl.appendChild(opt);
  }

  for (const c of COUNTRIES) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    selectEl.appendChild(opt);
  }
}

