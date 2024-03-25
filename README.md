# eduCycle Front-End
Description du projet ...

EduCycle est une application web centrée sur une communauté d'etudiants de Nice vivant en residence Universitaire. Que vous ayez besoin de cahiers, de stylos, de livres ou de matériel informatique, vous pouvez trouver ce qu'il vous faut sur EduCycle. Vous pouvez aussi faire un geste solidaire en offrant les fournitures dont vous n'avez plus l'usage à d'autres étudiants qui en ont besoin. EduCycle est une plateforme simple, rapide et sécurisée qui vous met en relation avec les membres de votre communauté éducative. Rejoignez EduCycle et participez à une économie circulaire et responsable !

Fonctionnalité du projet

Le projet est sujet à evolution et pour l'instant les fonctionnalités qui sont stables et fonctionnelles sont :
 -Authentification : Les etudiants peuvent s'inscrire à la plateforme grauitement et s'y conncter regulierement.
 -Gestion de comptes :  Les etudiants peuvent facilement gérer leur compte
 -Verification d'email : Afin de fiabiliser les comptes auprès de la communauté les etudiants peuvent verifier leur adresse mail.
 -Consultation et annonces : Educycle laissr ouvert la consultation d'annonce à tous les utilisateurs même anonyme.
 -Creer d'annonce :  Educycle donne la possiblité aux etudiants membres de publier de nouvelles annonces
 -Recuperation d'annonce : Les etudiants membre ont la possiblité de recuperer des annonces disponibles à travers une mecanique 
   qui consiste en 5 petites etapes :  
   1 - Un etudiant est interesse par une annonce et manifeste son souhait de vouloir le recuperer par un message.
   2 - L'auteur de l'annonce est notifié par mail qu'il a une nouvelle notification
   3 - L'auteur se connecte à son espace et consulte ses notifications et pour chacune d'entre elles il peut soit accepter ou    
       refuser la recupération.
   4 - Dans le cas ou recuperation est approuvé l'auteur s'engage a deposé le bien a l'accueil de sa residence le jour preciser           sur l'annonce et l'annonce passe dans la file d'attente au statut "en attente de récupération"de l'interessé
   5 - L'interessé consulte sa file d'attente, à cette étape encore il peut soit finaliser la récupération en allant réellement à 
       l'acceuil de la residence cible recupérer le bien et validé sa récuperation sur la plateforme et laisser un avis, soit 
       l'interessé peut annuler la recupération et dès lors elle est gardée dans ses favoris, soit totalement la supprimer.
-Gestion des ses annonces leurs etudiants peuvent facilement gerer les annnoces qu'ils ont faites dans leur espace(Supprimer, modifier)

Technologies, Approche et Architecure de l'application

 -Technologies
  educycle est codé en Vanila Javascript et en php Natif
  La base de donnée est gérée avec Mysql
  Les Services ajoutés : 
    * EmailJS :  Ce service est utlisé pour envoyer des mails automatiques sur educycle
    * Cloud Storage  de Google: Ce service est utlisé pour stocker l'ensemble des images qui sont uploader sur la plateforme
    * Place API de google : Cette api est utilisé pour l'auto-completion des champs adresses dans les formulaires de la plateforme
 -Approche de developpement
 
   L'approche mis en avant dans le developpement de d'educycle est le Client Side Rendering avant :  
    *  Front-End  :  SPA (Single Page Application) en Vanilla Javascript
       url  :  https://github.com/KFLandry/eduCycle.git
    *  Back-end :  API REST en php natif 
       url  :  https://github.com/KFLandry/ProjetWeb.git
    Leux deux parties communniquent grâce à l'API Fetch
 
 -Architecture
  Educycle est code full Object-Oriented en suivant une architecture MVC(Model-View-Controller) pour le Front-end et MV (Model-    
  Controller) pour le Back-end.
  
 
