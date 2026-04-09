var seances = JSON.parse(localStorage.getItem("seances")) || [];

afficherListe();

function enregistrer() {
  var date = document.getElementById("champ-date").value;
  var duree = document.getElementById("champ-duree").value;
  var travail = document.getElementById("champ-travail").value;

  if (travail === "") {
    alert("Décris ce que tu as travaillé !");
    return;
  }

  var seance = { date: date, duree: duree, travail: travail };
  seances.push(seance);
  localStorage.setItem("seances", JSON.stringify(seances));
  afficherListe();
}

function supprimer(index) {
  seances.splice(index, 1);
  localStorage.setItem("seances", JSON.stringify(seances));
  afficherListe();
}

function afficherListe() {
  var liste = document.getElementById("liste");
  liste.innerHTML = "";

  seances.forEach(function(seance, index) {
    liste.innerHTML += "<p>" + seance.date + " · " + seance.duree + " min · " + seance.travail +
      " <button onclick='supprimer(" + index + ")'>×</button></p>";
  });
}
