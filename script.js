function enregistrer() {
  // On récupère ce que l'utilisateur a tapé
  var date = document.getElementById("champ-date").value;
  var duree = document.getElementById("champ-duree").value;
  var travail = document.getElementById("champ-travail").value;

  // On vérifie qu'il n'a pas laissé le champ vide
  if (travail === "") {
    alert("Décris ce que tu as travaillé !");
    return;
  }

  // On crée une ligne et on l'ajoute dans la liste
  var liste = document.getElementById("liste");
  liste.innerHTML += "<p>" + date + " · " + duree + " min · " + travail + "</p>";
}
