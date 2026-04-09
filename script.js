// Au chargement de la page, on récupère les séances sauvegardées
var seances = JSON.parse(localStorage.getItem("seances")) || [];

// On affiche ce qu'on a déjà
afficherListe();

function enregistrer() {
  var date = document.getElementById("champ-date").value;
  var duree = document.getElementById("champ-duree").value;
  var travail = document.getElementById("champ-travail").value;

  if (travail === "") {
    alert("Décris ce que tu as travaillé !");
    return;
  }

  // On crée un objet avec les trois valeurs
  var seance = { date: date, duree: duree, travail: travail };

  // On l'ajoute au tableau
  seances.push(seance);

  // On sauvegarde le tableau dans localStorage (converti en texte)
  localStorage.setItem("seances", JSON.stringify(seances));

  // On rafraîchit l'affichage
  afficherListe();
}

function afficherListe() {
  var liste = document.getElementById("liste");
  liste.innerHTML = "";

  seances.forEach(function(seance) {
    liste.innerHTML += "<p>" + seance.date + " · " + seance.duree + " min · " + seance.travail + "</p>";
  });
}
