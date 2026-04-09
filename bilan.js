var seances = JSON.parse(localStorage.getItem("seances")) || [];

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
    html +=
      "<div class='bloc-mois'>" +
        "<h2>" + mois + " · Total : " + totalMois + " min (" + Math.round(totalMois / 60 * 10) / 10 + "h)</h2>" +
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

afficherBilan();
afficherCamembert();
