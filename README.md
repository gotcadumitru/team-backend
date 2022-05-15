# Reportify

Aplicatie in care utilizatorii pot raporta atât diferitele
probleme ce necesită o rezolvare cât mai rapidă, cât și anumite
dorințe/îmbunătățiri pe care, odată puse în practică, le-ar considera utile

O problemă sau o dorință este votată(“upvoted”) de alți utilizatori
doar în cazul în care o consideră de un mare interes general, cererile urmând
să fie ordonate în funcție de prioritatea calculată pe baza voturilor

![Logo](https://lh6.googleusercontent.com/IVuRcihstl3juONAIxw1hpsqMp6lYmV_8lUuD3s5eqHhETOxVIUh3uBXStFfzWWEow4eL1t_o71babzl2GaJ=w1920-h870)

## Tehnologii folosite

- [React documentation ](https://reactjs.org/docs/getting-started.html)
- [React native documentation](https://reactnative.dev/docs/accessibilityinfo)
- [Express js](https://expressjs.com/)

## Deploy

[Reportify front-end](https://team-frontend-c.herokuapp.com/)

## Autori

- [@gotcadumitru](https://github.com/gotcadumitru)
- [@dragoshuniq](https://github.com/dragoshuniq)

## Demo

Link-urile catre prezentarile proiectului

[Video youtube 3 min](https://www.youtube.com/watch?v=cm4zX9sRlzM)

[Video youtube 10 min](https://www.youtube.com/watch?v=s0Nz4tXPAFk)

[Video google drive 3 min](https://drive.google.com/file/d/11lNnwlkRaiId9k_JDBIcdfSkIN5SRBci/view?usp=sharing)

[Video google drive 10 min](https://drive.google.com/file/d/1nhL3DCjZ2mNbZqBSLYbo9RP2GuteXpY-/view?usp=sharing)

## Functionalitati extra

- Live chat pentru support
- Kanbanboard in timp real pentru modificare statusului postarii (Nou/In Progres...)
- Utilizarea google maps pentru selectarea locatiei
- Harta SVG dinamica in functie de numarul de probleme raportate in judete
- Posibilitatea de a incarca si vizualiza PDF-uri
- Posibilitatea de a impartasi o postare pe orice retea de socializare
- Logarea cu google/facebook

## Functionalitati de baza

#### Web:

- Logica de autentificare/înregistrare.
- Secțiune pentru administratorul general al platformei, unde se vor atribui administratorii pentru fiecare comună/localitate/județ
- Secțiune în care se pot vizualiza toate cererile de înregistrare a utilizatorilor pentru o anumită comună, o localitate sau un anumit județ. La fiecare cerere trebuie verificată dovada domicilierii
- Secțiune pentru vizualizarea listei tuturor postărilor utilizatorilor.
- Posibilitatea de a seta statusul unei postări (exemplu: trimis, vizionat, în lucru, efectuat).
- Secțiune separată în care se pot vedea toate cererile în lucru sau terminate. (kanbanboard)

#### Mobile:

- Secțiune de autentificare și înregistrare (în care se va cere o metodă de verificare a domicilierii -la alegerea voastră)
- Secțiune de creare postare în care utilizatorul va adăuga un titlu, o descriere, poze sau videoclipuri.
- Secțiunea postări favorite.
- Logică de sortare în funcție de data postării sau numărul de voturi. Se va integra și o metodă de a afișa postări noi in lista celor populare pentru o anumită perioadă de timp(pentru a îi oferi șansa de a fi vizualizată și atunci când utilizatorul are selectată sortarea în funcție de numărul de voturi)

#### Comun:

- Pagina unei postări ce va conține un carousel cu pozele/videoclipurile adăugate de utilizator, posibilitatea de a vota pro/contra ideea prezentată, dar și de a comenta/răspunde la comentarii (folosind un sistem de gestionare al comentariilor similar celui folosit de Reddit).
- Ambele aplicații trebuie să fie responsive. În cazul în care se va implementa o aplicație mobile, aceasta trebuie să fie responsive atât în mod portret cât și landscape.
- Folosirea unei teme de culori în construirea celor 2 aplicații.
- Identitatea aplicației: nume, logo, intro etc.
