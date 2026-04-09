var seances = JSON.parse(localStorage.getItem("seances")) || [];

var categories = {
  tactique:  "Tactique",
  strategie: "Stratégie",
  finale:    "Finale",
  ouverture: "Ouverture",
  online:    "Jeu online"
};

afficherDerniereSeance();
afficherBilanSemaine();

function enregistrer() {
  var date      = document.getElementById("champ-date").value;
  var duree     = parseInt(document.getElementById("champ-duree").value);
  var categorie = document.getElementById("champ-categorie").value;
  var travail   = document.getElementById("champ-travail").value;

  if (!date)    { alert("Choisis une date."); return; }
  if (!travail) { alert("Décris ce que tu as travaillé."); return; }

  var seance = { date: date, duree: duree, categorie: categorie, travail: travail };
  seances.push(seance);
  localStorage.setItem("seances", JSON.stringify(seances));

  afficherDerniereSeance();
  afficherBilanSemaine();
}

function supprimer(index) {
  seances.splice(index, 1);
  localStorage.setItem("seances", JSON.stringify(seances));
  afficherDerniereSeance();
  afficherBilanSemaine();
}

function getNumeroSemaine(dateStr) {
  var d = new Date(dateStr);
  var debut = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - debut) / 86400000 + debut.getDay() + 1) / 7);
}

function getSemaineActuelle() {
  return getNumeroSemaine(new Date().toISOString().slice(0, 10));
}

function afficherDerniereSeance() {
  var el = document.getElementById("derniere-seance");
  if (!seances.length) { el.innerHTML = ""; return; }

  var dernieres = seances.slice(-5).reverse();
  var html = "<h2>Dernières séances</h2>";

  dernieres.forEach(function(s, i) {
    var index = seances.length - 1 - i;
    html +=
      "<div class='seance-card'>" +
        "<div>" +
          "<div class='seance-meta'>" + s.date + " · " + s.duree + " min " +
            "<span class='badge badge-" + s.categorie + "'>" + categories[s.categorie] + "</span>" +
          "</div>" +
          "<div class='seance-title'>" + s.travail + "</div>" +
        "</div>" +
        "<button class='del-btn' onclick='supprimer(" + index + ")'>×</button>" +
      "</div>";
  });

  el.innerHTML = html;
}

function afficherBilanSemaine() {
  var el = document.getElementById("bilan-semaine");
  var semaine = getSemaineActuelle();

  var seancesSemaine = seances.filter(function(s) {
    return getNumeroSemaine(s.date) === semaine;
  });

  if (!seancesSemaine.length) {
    el.innerHTML = "<h2>Semaine " + semaine + "</h2><p>Aucune séance cette semaine.</p>";
    return;
  }

  var totaux = { tactique: 0, strategie: 0, finale: 0, ouverture: 0, online: 0 };
  var totalGeneral = 0;

  seancesSemaine.forEach(function(s) {
    totaux[s.categorie] += s.duree;
    totalGeneral += s.duree;
  });

  var lignes = "";
  Object.keys(totaux).forEach(function(cat) {
    if (totaux[cat] > 0) {
      lignes += "<tr><td>" + categories[cat] + "</td><td>" + totaux[cat] + " min</td></tr>";
    }
  });

  el.innerHTML =
    "<h2>Semaine " + semaine + "</h2>" +
    "<table>" +
      "<tr><th>Catégorie</th><th>Temps</th></tr>" +
      lignes +
      "<tr><td><strong>Total</strong></td><td><strong>" + totalGeneral + " min</strong></td></tr>" +
    "</table>";
}
