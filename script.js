var seances = JSON.parse(localStorage.getItem("seances")) || [];

var categories = {
  tactique:  "Tactique",
  strategie: "Stratégie",
  finale:    "Finale",
  ouverture: "Ouverture",
  online:    "Jeu online"
};

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

function exporterCSV() {
  if (!seances.length) { alert("Aucune séance à exporter."); return; }
  var lignes = ["date,duree,categorie,travail"];
  seances.forEach(function(s) {
    lignes.push(s.date + "," + s.duree + "," + s.categorie + "," + s.travail.replace(/,/g, " "));
  });
  var blob = new Blob([lignes.join("\n")], { type: "text/csv;charset=utf-8;" });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement("a");
  a.href     = url;
  a.download = "journal-echecs.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function importerCSV(event) {
  var fichier = event.target.files[0];
  if (!fichier) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var lignes = e.target.result.split("\n").slice(1);
    var importees = [];
    lignes.forEach(function(ligne) {
      ligne = ligne.trim();
      if (!ligne) return;
      var cols = ligne.split(",");
      if (cols.length < 4) return;
      importees.push({
        id:        Date.now() + Math.random(),
        date:      cols[0].trim(),
        duree:     parseInt(cols[1].trim()),
        categorie: cols[2].trim(),
        travail:   cols[3].trim()
      });
    });
    if (!importees.length) { alert("Aucune donnée valide trouvée."); return; }
    seances = seances.concat(importees);
    localStorage.setItem("seances", JSON.stringify(seances));
    afficherDerniereSeance();
    afficherBilanSemaine();
    alert(importees.length + " séance(s) importée(s).");
  };
  reader.readAsText(fichier);
}

function resetGlobal() {
  if (!confirm("Effacer toutes les séances définitivement ? Cette action est irréversible.")) return;
  seances = [];
  localStorage.removeItem("seances");
  afficherDerniereSeance();
  afficherBilanSemaine();
}
function afficherStreak() {
  var el = document.getElementById("streak");
  if (!seances.length) { el.innerHTML = ""; return; }

  // Récupérer les dates uniques des séances
  var dates = seances.map(function(s) { return s.date; });
  var uniques = dates.filter(function(d, i) { return dates.indexOf(d) === i; });
  uniques.sort();

  // Compter les jours consécutifs en partant d'aujourd'hui
  var streak = 0;
  var aujourdhui = new Date().toISOString().slice(0, 10);
  var cursor = new Date(aujourdhui);

  while (true) {
    var dateStr = cursor.toISOString().slice(0, 10);
    if (uniques.indexOf(dateStr) === -1) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Si pas de séance aujourd'hui, vérifier si la série était active hier
  if (streak === 0) {
    var hier = new Date();
    hier.setDate(hier.getDate() - 1);
    var hierStr = hier.toISOString().slice(0, 10);
    cursor = new Date(hierStr);
    while (true) {
      var dateStr = cursor.toISOString().slice(0, 10);
      if (uniques.indexOf(dateStr) === -1) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

var aujourdhuiDate = new Date(aujourdhui);
var nbJoursMois = new Date(aujourdhuiDate.getFullYear(), aujourdhuiDate.getMonth() + 1, 0).getDate();
var moisComplet = streak >= nbJoursMois;

var emoji   = moisComplet ? "👑" : streak >= 6 ? "🔥" : streak >= 1 ? "⚡" : "▸";
var message = streak === 0   ? "Pas encore de série en cours" :
              moisComplet    ? "Mois complet — respect total !" :
              streak === 1   ? "1 jour de suite" :
              streak + " jours de suite";

  el.innerHTML =
    "<div class='streak-card'>" +
      "<span class='streak-icon'>" + emoji + "</span>" +
      "<span class='streak-count'>" + message + "</span>" +
    "</div>";
}
afficherDerniereSeance();
afficherBilanSemaine();
afficherStreak();
