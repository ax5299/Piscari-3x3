## Jeu de Piscari WEB (3 x 3)

### Cahier des charges

Ce document décrit l’architecture, la conception et les informations requises à la réalisation d’un jeu de plateau numérique en version
WEB, c’est-à-dire qu’il se joue à un ou deux joueurs, directement dans un navigateur web, et qu’il ne nécessite aucune installation
locale. Pour jouer à deux, on peut utiliser un écran commun, comme un téléviseur, ou encore, partager une session WEB à distanceà
l’aide d’un système de vidéoconférence comme Zoom ou MS Teams. Aucune forme d’authentification n’est requise et aucune
statistique ou état du jeu ne sont conservés.
Le jeu de Piscari (ou jeu de la pêche) se joue sur un damier (3 x 3), et ressemble au jeu de tic-tac-toe. Il combine hasard et stratégie.
Une version matérielle de ce jeu a été développée et commercialisée en 1989.
Le document contient sept parties:

1. Une requête (ou prompt) destinée à une intelligence artificielle (IA) ou humaine (programmeur), qui formule les tâches à
    exécuter, c’est-à-dire la programmation des différents modules du jeu comme tel ainsi que les autres composantes requises à
    l’implantation de l’application;
2. La mise en page détaillée des écrans à afficher, incluant les titres, boutons, damier, images, règles du jeu, etc.
3. La nomenclature et la notation;
4. Les instructions détaillées requises à la programmation du jeu, incluant l’interface utilisateur, les interactions entre le jeu et
l’utilisateur, les sons (mp3), les images (png et gif), la police de caractère, la chronologie, la synchronisation, etc.
5. Liste des messages à afficher;
6. La stratégie de jeu pour les magiciens;
7. La liste des fichiers audiovisuels (mp3, png et gif) à utiliser.

### 1 - Jeu de Piscari WEB (requête ou prompt)

Vous êtes le programmeur et l'analyste. Développer une application WEB (frontend seulement) du jeu Piscari selon
les spécifications et instructions décrites dans le document joint (cahier des charges); identifier et détailler toutes les
composantes requises à l’implantation de cette application: commandes à exécuter, structure des répertoires,
instructions pour l’implantation... Préciser dans quel répertoire il faut placer les fichiers multimédias. Ne pas me
demander de compléter ou traduire des listes, le faire.

J'envisage le frameworkreact (html, JS, TS...) avec tailwind CSS. Me suggérer d'autre options si requis ainsi qu'un
plan détaillé, les librairies requises tc. Me signaler les incohérences détectées, me poser des questions et me
suggérer les modifications ou précisions à apporter aux spécifications de façon à s’assurer du fonctionnement
cohérent, harmonieux et efficace de l’application.

### 2 - Jeu de Piscari WEB (écrans d’affichage):

#### ➢ Page d'accueil;

#### ➢ Planche du jeu;

#### ➢ Règles du jeu.

##### Jeu de Piscari : Règles du jeu

➢ Ce jeu se joue à deux, mais vous pouvez jouer seul, contre un magicien numérique (Merlin ou Gandalf).
➢ Chaque joueur choisit une couleur (bleu à gauche ou rouge à droite); décidez qui jouera en premier.
➢ Le but est d’aligner sur le damier trois icônes identiques (pêcheurs, poissons ou mouches) de la même couleur.
L’alignement peut être horizontal, vertical ou diagonal, comme pour le jeu de tic-tac-toe. Le premier joueur qui
réussit à aligner trois icônes identiques gagne la partie.
➢ À tour de rôle, les joueurs roulent le dé en cliquant sur le symbole “**?** ” de la couleur choisie. Le dé clignote
alors en affichant successivement les icônes d’un pêcheur, d’un poisson et d’une mouche. Le résultat, choisi au
hasard, apparaîtra automatiquement après quelques secondes.
➢ Pour placer le pion sur le damier, le joueur clique sur la case choisie.
➢ Le pion peut être placé dans une case libre, ou il peut remplacer un pion existant, peu importe la couleur.
Toutefois, il faut respecter la boucle alimentaire :
o Le pêcheur attrape le poisson
o Le poisson mange la mouche
o La mouche pique le pêcheur
➢ Si le joueur peut placer son pion sur le damier, il doit le faire, même si le résultat semble le désavantager. S’il
n’existe aucune possibilité, il perd son tour.
➢ Les magiciens Merlin (bleu) et Gandalf (rouge) sont vos coéquipiers. Si vous cliquez d’abord sur l’icône du
magicien, il jouera à votre place; si vous roulez d’abord le dé vous-même, vous pourrez ensuite lui demander
conseil sur la case à jouer. Pour jouer seul, cliquez simplement sur le magicien adverse à chaque coup.

Retour

### 3 - Nomenclature et notation

La nomenclature et la notation ressemblent à celles des échecs :
➢On assume que l'équipe des bleus est à gauche, et l'équipe des rouges, à droite;
➢Les colonnes sont identifiées par des lettres de "a" à "c", de gauche à droite;
➢Les rangées sont identifiées par des chiffres de "1" à "3", de bas en haut;
➢Les cases sont identifiées par leur adresse: la case "a1" est en bas à gauche et la case "c3", en haut à droite;
➢Le terme "ligne" est le terme générique pour désigner l'alignement de 3 cases (horizontal, vertical ou diagonal);
➢Il y a donc 9 cases et 8 lignes: trois colonnes (a, b, c), trois rangées (1, 2, 3) et deux diagonales (a1-c3 et a3-c1);
➢Pour noter les coups, on identifie clairement l'icône et la couleur de chaque pion impliqué. Voici quelques exemples :
o Tour 1 (bleu) -Merlin roule poisson bleu: placé en b2; (la case était libre)
o Tour 3 (rouge) -Paul roule pêcheur rouge: prend poisson bleu en b2;
o Tour 7 (bleu) -Merlin roule pêcheur bleu: perd son tour; (toutes les cases sont occupées par des mouches et
des pêcheurs)
o Tour 9 (rouge) -Paul roule mouche rouge: prend pêcheur rouge en b2 et gagne sur a3-c1.

### 4 - Jeu de Piscari WEB (Instructions pour la programmation du jeu)

#### ➢ 4a -Instructions générales

#### ➢ 4b -Instructions pour la Page d'accueil

#### ➢ 4c -Instructions pour la planche du jeu

#### ➢ 4d -Planche du jeu –Initialisation

#### ➢ 4e -Planche du jeu -Interactions

### 4a - Instructions générales

➢ L’interface de saisie est la même pour les deux joueurs: clavier, souris, manette, stylet, doigt...
➢ Utiliser la police “Comic Sans”pour tous les textes.
➢ Porter une attention particulière à la mise en page et à l’esthétique du jeu. Respecter le format des écrans d'affichage, les
proportions, les couleurs et la disposition des éléments.
➢ Il n’y a pas de match nul à ce jeu. L'obligation de jouer implique que les joueurs pourront et devront généralement changer la
configuration du jeu. Le hasard induit par le roulement des dés évite les boucles infinies.
➢ Pour les instructions et messages qui suivent, remplacer les $Variables suivantes par la valeur appropriée:
o $Couleur_active : ["bleu", "rouge"] (la couleur active, celle de l'équipe qui joue)
o $Couleur_inactive : ["bleu", "rouge"] (la couleur inactive, celle de l'équipe adverse)
o $Magicien_actif : ["Merlin", "Gandalf"] (le magicien actif)
o $Joueur_1 : le nom du joueur de l'équipe des bleus "Joueur 1" ou celui saisi sur la page d'accueil
o $Joueur_2 : le nom du joueur de l'équipe des rouges "Joueur 2" ou celui saisi sur la page d'accueil
o $Joueur_actif : [$Joueur_1, $Joueur_2] (le nom du joueur actif)
o $Icone_active : ["pêcheur", "poisson", "mouche"] (l'icône affichée sur le dé actif)
o $Icone_proie : ["pêcheur", "poisson", "mouche"] (l'icône qui succède à l'icône active dans la boucle alimentaire, par
exemple, si l'icône active est le poisson, l'icône proie est la mouche)
➢ Les images fixes sont au format pnget les images animées (ou clignotantes) au format gif. Les sons sont au format mp3.
➢ Pour les noms de fichiers, ignorer les majuscules, les accents ainsi que le genre féminin associé à la mouche.

### 4b - Instructions pour la page d'accueil

➢ Permettre le choix de la langue en cliquant sur le bouton correspondant. La langue par défaut est le
français. Traduire tous les textes et messagesen anglais. Prévoir l’ajout éventuel d’autres langues.
Internationalisation (i18n) : utiliser des fichiers de traduction (fr.json, en.json). Une fonction utilitaire doit
permettre de récupérer le texte approprié en fonction de la langue sélectionnée.
➢ Permettre la saisie du nom des joueurs. Les valeurs par défaut sont “Joueur 1” (bleu) et “Joueur 2”
(rouge).
➢ Lorsqu’un joueur appuie sur le bouton “Règles du jeu”, afficher la page des règles du jeu. Au retour, la
page d'accueil est dans le même étatqu'avant d'afficher les règles.
➢ À l’aide des trois boutons identifiés, permettre à l’utilisateur de décider qui jouera en premier : les bleus,
les rouges ou au hasard (bouton vert au centre).
➢ Le bouton “Quitter”termine le jeu (ferme l'onglet).

### 4c - Instructions pour la planche du jeu

➢ Le damier est composé de 9 cases (3 x 3), comme au jeu de tic-tac-toe.
➢ La zone de messages du jeu doit toujours être positionnée immédiatement sous le damier et occuper la ligne entière, de façon
à pouvoir afficher les messages longs sur une seule ligne.
➢ Utiliser un format adaptatif: entre 16x9 et 4x3 pour les écrans horizontaux, idéalement sans scroll horizontal ni vertical. Pour
les écrans verticaux, déplacer les deux zones joueurs sousla zone de messages du jeu, sans scroll horizontal.
➢ L'équipe des bleus est composée de $Joueur_1 et du magicien Merlin; ils sont toujours à gauche.
➢ L'équipe des rouges est composée de $Joueur_2 et du magicien Gandalf; ils sont toujours à droite.
➢ Évidemment, il faut s’assurer du respect des règles du jeu.
➢ On ne peut pas cliquer sur l’icône du dé “**?** ” du joueur inactif ni sur celle de son magicien. Ces icônes sont temporairement
désactivées et sous-titrées “Attendez votre tour”.
➢ Le bouton “Règles du jeu” affiche la page des règles du jeu. Au retour, le jeu est dans le même étatqu'avant l'affichage des
règles.
➢ Le bouton “ _Fin de la partie_ ” renvoie à l’affichage de la page d’accueil pour permettre de jouer à nouveau. La langue choisie et
les noms des joueurs conservent leurs valeurs (ne sont pas réinitialisés), mais peuvent toujours être modifiés avant de jouer
une nouvelle partie.

### 4d - Planche du jeu - Initialisation

Au début de la partie, ou lorsque le contrôle est transféré d'un joueur à l'autre:
➢Assigner les bonnes valeurs aux $Variables (actives, inactives, proies...);
➢Afficher le message 1 dans la zone de message du jeu;
➢Afficher le message 7 sous l'icône du dé actif;
➢Afficher le message 8 sous l'icône du magicien actif;
➢Afficher le message 9 sous l'icône du dé inactif et de celle du magicien inactif;
➢Désactiver les icônes du dé et du magicien inactifs (ne pas permettre de cliquer sur ces icônes).

### 4e - Planche du jeu - Interactions

➢ Lorsqu’un joueur clique sur l’icône du dé actif, faire jouer le son : “ _roulement_du_de.mp3”_ et remplacer l’image fixe du
dé “**?** ” (de_$Couleur_active_fixe.png) par l’image animée correspondante (de_$Couleur_active_anime.gif). Effacer le
message 1.
➢ Après 2 secondes, afficher sur le dé, l’image clignotante du résultat choisi au hasard
($Icone_active_$Couleur_active_anime.gif), tout en faisant jouer le son ($Icone_active.mp3) associé à cette icône.
➢ Afficher le message 2 si le joueur peut jouer.
➢ S'il ne peut pas jouer (aucune case n'est libre ou autorisée), afficher le message 3. Après 2 secondes, transférer le
contrôle à l'équipe adverse.
➢ Lorsque le joueur clique sur la case choisie (et permise), faire clignoter le contenu initialde cette case durant 1
seconde. Après ce délai, afficher l’image fixe ($Icone_active_$Couleur_active_fixe.png) du nouveau résultatdans cette
case, attendre 1 seconde et transférer le contrôle à l’autre équipe.
➢ Lorsque le joueur clique sur l’icône active de son magicien ($Magicien_actif_$Couleur_active_fixe.png), cette icône
clignote ($Magicien_actif_$Couleur_active_anime.gif) jusqu’à ce que son tour soit terminé.
o Si le dé est déjà roulé par le joueur, le magicien suggère une case à jouer en la faisant clignoter jusqu’à ce que le
joueur ait cliqué sur cette case ou une autre case permise, à son choix.
o Si le dé n’est pas déjà roulé, celui-ci roule automatiquement, exactement comme si le joueur avait cliqué sur le
dé. Ensuite, lorsque le magicien a choisi la case cible, tout se passe automatiquement, exactement comme si le
joueur avait cliqué sur cette case.

### 5 - Jeu de Piscari – Liste des messages à afficher

Messages à afficher dans la zone de messages du jeu:
1. C’est aux _$Couleur_active,"s"_ de jouer.(afficher avant le roulement du dé)
2. $Joueur_actif_ , veuillez sélectionner une case vide ou un(e) $Icone_proie. (afficher après le roulement du dé)
3. Désolé les $Couleur_active,"s"_ , aucune case ne permet de placer un(e) $Icone_active. Ce sera bientôt aux
    _$Couleur_ _inactive, _"s"_ de jouer.
4. $Joueur_actif_ , c’est _$Magicien_actif_ qui joue à votre place pour ce tour.
5. $Joueur_actif_ , _$Magicien_actifvous fait une suggestion; c’est à vous_ de choisir la case.
6. Bravo les _$Couleur_active,"s"_. (faire clignoter les trois icônes gagnantes, afficher confettis.gif sur le dé gagnant
    et faire jouer victoire.mp3)

Message à afficher sous l'icône du dé actif:
7 - Cliquez? pour rouler le dé

Message à afficher sous l'icône du magicien actif:
8 - $Magicien_actif: votre coéquipier

Message à afficher sous l'icône du dé inactif et de celle du magicien inactif:
9 - Attendez votre tour

### 6 - Stratégie de jeu pour les magiciens
➢ Lorsque le dé est roulé et que l'icône active est identifiée, la première étape consiste à dresser la liste des coups
permis. Pour ce faire, il suffit d'appliquer la fonction de validation à chaque case du damier. Il s'agit de la même
fonction utilisée pour valider le coup d'un joueur. Par exemple, si l'icône active est un poisson, la liste des coups
permis consiste en toutes les cases libres, et toutes celles qui affichent une icône "mouche", peu importe les couleurs.
➢ Ensuite, pour chaque coup (case) permis, on calcule un gain (numérique) potentiel. La case qui affiche le gain le plus
élevé est considérée comme le meilleur choix. Si plusieurs cases ont le même gain maximum, on choisit une de ces
cases au hasard. Parfois, le gain maximum peut être négatif (c'est alors une perte). Cette situation peut se produire
lorsqu'on remplace un pion de sa propre couleur. La logique est toutefois la même, le gain potentiel maximum
correspond alors à la perte minimum.
➢ Pour calculer le gain potentiel d'une case permise, on additionne le gain potentiel associé à chaque lignedont cette
case fait partie. Par exemple, pour calculer le gain potentiel de la case a3, on additionne les gains potentiels des
lignes a, 3 et a3-c1. La case centrale appartient à 4 lignes, les coins à 3 lignes et les autres cases à 2 lignes.
L'addition des gains potentiels de chaque ligne tient donc compte de cette particularité.
➢ Pour calculer le gain (ou perte) potentiel d'une ligne associé à une case précise, on soustrait la valeur actuelle (avant
de jouer) de cette ligne de sa valeur potentielle, c’est-à-dire la valeur qu'aurait cette ligne pour le joueur s'il choisissait
cette case. Le gain potentiel d'une ligne dépend donc de la case considérée.
➢ _La valeur numérique d'une ligne dépend de son état, c’est_ - à-dire du nombre, de la couleur et du type d'icônes
présents sur cette ligne. L'ordre dans lequel ces icônes sont disposées sur la ligne n'a aucune importance.
➢ Cette valeur dépend toutefois de la couleur active. Si la couleur active est "bleue" et que la valeur de la ligne
considérée est de 100 (favorable aux bleus), alors cette ligne aura une valeur de -100 (défavorable) pour les
rouges.
➢ Pour identifier les états, on associe à chacun d'eux un nombre unique qui peut facilement être identifié par un
humain ou calculé par un ordinateur. Pour une ligne donnée, on additionne :
o Le nombre de pêcheurs bleus multiplié par 100 000 ;
o Le nombre de poissons bleus multiplié par 10 000 ;
o Le nombre de mouches bleues multiplié par 1 000 ;
o Le nombre de pêcheurs rouges multiplié par 100 ;
o Le nombre de poissons rouges multiplié par 10 ;
o Le nombre de mouches rouges.
➢ Par exemple le nombre 100 020 est associé à l'état d'une ligne contenant 1 pêcheur bleu et 2 poissons rouges, peu
importe la disposition des pions sur cette ligne.
➢ Il existe 84 états possibles pour une ligne. Les valeurs (ou poids) associées à ces états ont été précalculées et
listées dans une table jointe (etats.json). Il suffit de rechercher (lookup) dans la table, le nombre associé à l'état
d'une ligne pour connaître les valeurs de cette ligne pour les bleus et pour les rouges.

➢ À titre d'information, les valeurs associées aux différents états ont été calculées à partir des nombres minimums de
coups ( _b_ pour les bleus et _r_ pour les rouges) qu'il faudrait à chaque équipe pour gagner sur cette ligne, sans opposition.
➢ Si ces deux nombres sont égaux, alors la valeur de cette ligne est nulle (0) pour les deux équipes. Sinon, une valeur
positive (ex. 100) est assignée à l'équipe dont le nombre minimum de coups est le plus petit, et inversement, une valeur
négative (ex. -100) est assignée à l'équipe adverse.
➢ Voici quelques exemples des nombres minimums de coups pour gagner :
o Ligne vide : _b = 3; r = 3_ (égalité, valeur nulle pour chaque équipe)
o 2 poissons bleus et une mouche rouge : _b = 1; r = 4_ (menace de gain imminent, valeur élevée pour les bleus)
o 2 mouches bleues et un poisson rouge : _b = 2; r = 2_ (égalité! pour gagner, les bleus doivent jouer deux fois sur la
case occupée par le poisson rouge; les rouges doivent manger les 2 mouches.)
o 2 mouches bleues et une mouche rouge : _b = 3; r = 3_ (égalité!!! pour gagner, les bleus doivent jouer trois fois sur
la case occupée par la mouche rouge, ou encore manger les 3 mouches, tout comme les rouges.)
o 3 mouches bleues : _b = 0 ; r = 3_ (ligne gagnante pour les bleus, valeur potentielle très élevée pour forcer ce choix)
➢ Les formules pour calculer les valeurs d'une ligne sont de la forme : ( _valb = x_^6 _- b -x_^6 _- r_ ), et ( _valr = x_^6 _- r -x_^6 _- b_ ).
o _x_ est la base choisie pour la fonction d'évaluation ( _x = 6_ dans la table jointe). Une base inférieure à 5 risque de ne
pas toujours prioriser le nombre minimum de coups à jouer pour une case donnée.
o La constante _6_ est la valeur maximum que peuvent prendre les nombres entiers _b_ et _r_ ; ( _x_^6 _- b_ ) et ( _x_^6 _- r_ ) sont donc
des nombres entiers positifs.

### 7 - Jeu de Piscari – Fichiers audiovisuels à utiliser

Fichiers audio (.mp3) à faire jouer (la durée est d'environ 2 secondes) :
➢roulement_du_de.mp3 (lors du roulement d'un dé)
➢pecheur.mp3 (lorsque l'image d'un pêcheur clignote sur un dé)
➢poisson.mp3 (lorsque l'image d'un poisson clignote sur un dé)
➢mouche.mp3 (lorsque l'image d'une mouche clignote sur un dé)
➢victoire.mp3 (lors du coup gagnant)

Fichiers d'images animées (.gif) à afficher :
➢de_bleu_anime.gif (lors du roulement du dé)
➢de_rouge_anime.gif (lors du roulement du dé)
➢merlin_bleu_anime.gif (lorsqu'il joue)
➢gandalf_rouge_anime.gif (lorsqu'il joue)
➢pecheur_bleu_anime.gif
➢pecheur_rouge_anime.gif
➢poisson_bleu_anime.gif
➢poisson_rouge_anime.gif
➢mouche_bleu_anime.gif
➢mouche_rouge_anime.gif
➢confettis.gif (lors du coup gagnant)

Fichiers d'images fixes (.png) à afficher :
➢de_bleu_fixe.png
➢de_rouge_fixe.png
➢merlin_bleu_fixe.png
➢gandalf_rouge_fixe.png
➢pecheur_bleu_fixe.png
➢pecheur_rouge_fixe.png
➢poisson_bleu_fixe.png
➢poisson_rouge_fixe.png
➢mouche_bleu_fixe.png
➢mouche_rouge_fixe.png
Note: pour les noms de fichiers, n'utiliser que des minuscules sans accent. Ignorer le féminin des attributs de la mouche.