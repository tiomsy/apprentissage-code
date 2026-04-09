var seances = JSON.parse(localStorage.getItem("seances")) || [];
var objectifs = JSON.parse(localStorage.getItem("objectifs")) || {
  tactique: 300,
  online:   300,
  reste:    300
};

var categories = {
  tactique:  "Tactique",
  strategie: "Stratégie",
  finale:    "Finale",
  ouverture: "Ouverture",
  online:    "Jeu online"
};

function getNumeroSemaine(dateStr) {
  var d = new Date(dateStr);
  var debut = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - debut) / 86400000 + debut.getDay() + 1) / 7);
}

function getMois(dateStr) {
  var d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function getMoisActuel() {
  return getMois(new Date().toISOString().slice(0, 10));
}

function calculerTiers(seancesFiltrees) {
  var t = { tactique: 0, online: 0, reste: 0 };
  seancesFiltrees.forEach(function(s) {
    if (s.categorie === "tactique") t.tactique += s.duree;
    else if (s.categorie === "online") t.online += s.duree;
    else t.reste += s.duree;
  });
  return t;
}

function sauvegarderObjectifs() {
  objectifs.tactique = parseInt(document.getElementById("obj-tactique").value) || 300;
  objectifs.online   = parseInt(document.getElementById("obj-online").value)   || 300;
  objectifs.reste    = parseInt(document.getElementById("obj-reste").value)    || 300;
  localStorage.setItem("objectifs", JSON.stringify(objectifs));
  afficherJauges();
}

function jauge(label, fait, objectif) {
  var pct     = Math.min(Math.round(fait / objectif * 100), 100);
  var couleur = pct >= 100 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return "<div style='margin-bottom:18px'>" +
    "<div style='display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px'>" +
      "<span>" + label + "</span>" +
      "<span>" + fait + " / " + objectif + " min (" + pct + "%)</span>" +
    "</div>" +
    "<div style='background:#e5e7eb;border-radius:6px;height:14px'>" +
      "<div style='width:" + pct + "%;background:" + couleur + ";height:14px;border-radius:6px;transition:width 0.4s'></div>" +
    "</div>" +
  "</div>";
}

function afficherJauges() {
  document.getElementById("obj-tactique").value = objectifs.tactique;
  document.getElementById("obj-online").value   = objectifs.online;
  document.getElementById("obj-reste").value    = objectifs.reste;

  var moisActuel = getMoisActuel();
  var seancesMois = seances.filter(function(s) {
    return getMois(s.date) === moisActuel;
  });

  var tiers = calculerTiers(seancesMois);
  var el    = document.getElementById("jauges");

  el.innerHTML =
    jauge("Tactique",       tiers.tactique, objectifs.tactique) +
    jauge("Jeu online",     tiers.online,   objectifs.online) +
    jauge("Tout le reste",  tiers.reste,    objectifs.reste);
}

function afficherBilan() {
  var el = document.getElementById("bilan-complet");
  if (!seances.length) {
    el.innerHTML = "<p>Aucune séance enregistrée.</p>";
    return;
  }
  var parMois = {};
  seances.forEach(function(s) {
    var mois    = getMois(s.date);
    var semaine = getNumeroSemaine(s.date);
    if (!parMois[mois]) parMois[mois] = {};
    if (!parMois[mois][semaine]) parMois[mois][semaine] = {
      tactique: 0, strategie: 0, finale: 0, ouverture: 0, online: 0
    };
    parMois[mois][semaine][s.categorie] += s.duree;
  });

  var moisActuel = getMoisActuel();
  var html = "";

  Object.keys(parMois).forEach(function(mois) {
    var totalMois    = 0;
    var semaines     = parMois[mois];
    var blocSemaines = "";

    Object.keys(semaines).forEach(function(semaine) {
      var totaux       = semaines[semaine];
      var totalSemaine = 0;
      var lignes       = "";
      Object.keys(totaux).forEach(function(cat) {
        if (totaux[cat] > 0) {
          lignes += "<tr><td>" + categories[cat] + "</td><td>" + totaux[cat] + " min</td></tr>";
          totalSemaine += totaux[cat];
        }
      });
      totalMois += totalSemaine;
      blocSemaines +=
        "<h3>Semaine " + semaine + " · " + totalSemaine + " min</h3>" +
        "<table>" +
          "<tr><th>Catégorie</th><th>Temps</th></tr>" +
          lignes +
        "</table>";
    });

    // Bilan des tiers pour les mois passés
    var bilanTiers = "";
    if (mois !== moisActuel) {
      var seancesMois = seances.filter(function(s) { return getMois(s.date) === mois; });
      var tiers = calculerTiers(seancesMois);
      var check = function(fait, obj) { return fait >= obj ? "✓" : "✗"; };
      bilanTiers =
        "<p style='font-size:13px;color:#666'>" +
        check(tiers.tactique, objectifs.tactique) + " Tactique : " + tiers.tactique + "/" + objectifs.tactique + " min · " +
        check(tiers.online,   objectifs.online)   + " Jeu online : " + tiers.online   + "/" + objectifs.online   + " min · " +
        check(tiers.reste,    objectifs.reste)     + " Reste : "      + tiers.reste    + "/" + objectifs.reste    + " min" +
        "</p>";
    }

    html +=
      "<div class='bloc-mois'>" +
        "<h2>" + mois + " · Total : " + totalMois + " min (" + Math.round(totalMois / 60 * 10) / 10 + "h)</h2>" +
        bilanTiers +
        blocSemaines +
      "</div>";
  });

  el.innerHTML = html;
}

function afficherCamembert() {
  var totaux = { tactique: 0, strategie: 0, finale: 0, ouverture: 0, online: 0 };
  seances.forEach(function(s) {
    totaux[s.categorie] += s.duree;
  });
  var labels  = [];
  var valeurs = [];
  Object.keys(totaux).forEach(function(cat) {
    if (totaux[cat] > 0) {
      labels.push(categories[cat]);
      valeurs.push(totaux[cat]);
    }
  });
  new Chart(document.getElementById("camembert"), {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: valeurs,
        backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + " : " + context.raw + " min";
            }
          }
        }
      }
    }
  });
}

afficherJauges();
afficherBilan();
afficherCamembert();
