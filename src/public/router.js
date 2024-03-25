import Signup from "/src/controller/Signup.js";
import Main from "../controller/main.js";
import Login from "../controller/Login.js";
import File from "../controller/File.js";
import User from "../model/Factory/User.js";
import Notification from "../controller/Notification.js"
import Account from "../controller/Account.js";
import Favoris from "../controller/Favoris.js";
import Don from "../controller/Don.js";
import Item from "../controller/Item.js";
import { DOMAINFRONT } from "./ressource/secret.js";

// On définit la fonction de routage et on crée l'unique instance de l'utilisateur
export class CustomRouter {
    constructor(){
        CustomRouter.user =  User.getUniqueInstance();
        CustomRouter.controller  =  null;
        // Définir les routes de l'application
        CustomRouter.AuthRequiredRoutes = {
            "/file": "/src/template/file.html",
            "/notification": "/src/template/notification.html",
            "/don" : "/src/template/don.html",
        };
        CustomRouter.routes = {
            "/": "/src/template/index.html",
            "/index.html":"/src/template/index.html",
            "/login": "/src/template/login.html",
            "/signup": "/src/template/signup.html",
            "/item" : "/src/template/item.html",
            "/favoris": "/src/template/favoris.html",
            "/account" : "/src/template/account.html", 
            "/file": "/src/template/file.html",
            "/notification": "/src/template/notification.html",
            "/don" : "/src/template/don.html",
            "404": "/src/template/error.html"
        };
        this.route = (event) => {
            event = event || window.event;
            event.preventDefault();
            const target = event.target || event.srcElement;
            const href = target.getAttribute('href'); // Obtenir l'attribut href de l'élément cible
            if (href) {
                window.history.pushState({}, "", href); // Modifier l'URL sans recharger la page
                CustomRouter.handleLocation(); // Appeler la fonction pour gérer la nouvelle URL
            }
        };
        this.onload =  (event)=>{
            const currentUser =  sessionStorage.getItem("currentUser");
            if (currentUser){
                const user  =  User.getUniqueInstance();
                user.setCurrentUser(JSON.parse(currentUser));
                user.isConnected(true);
                CustomRouter.handleLocation();
            }
        };
        this.btnLogout = document.querySelectorAll('button.logout')
    }
    handleLink(event){
        if (event.target.matches('a[href]')) {
            if (event.target.origin !== DOMAINFRONT){
                const url =  new URL(event.target.getAttribute('href'))
                window.open(url,'_self')
            }else{
                this.route(event); // Appeler la fonction de routage lorsqu'un lien est cliqué
            }
        }
    }
    // Fonction pour gérer la localisation actuelle et initialiser les controlleurs correspondants
    static async handleLocation() {
        let path = window.location.pathname;
        // On force la redirection vers la page de connexion si pas connecté
        let routePath;
        let uniqueUser = User.getUniqueInstance();
        if (CustomRouter.routes[path] || CustomRouter.AuthRequiredRoutes[path]){        
            if (!uniqueUser.isAuthenticated() && path in CustomRouter.AuthRequiredRoutes){ 
                routePath = CustomRouter.routes["/login"];
                path = "/login";   
            } else if (!uniqueUser.isAuthenticated()){
                routePath = CustomRouter.routes[path];
            }else if (uniqueUser.isAuthenticated()){
                CustomRouter.updateDisplay()
                routePath = CustomRouter.routes[path];
            }
        } else {
            routePath = CustomRouter.routes["404"];
        }
        // Récupérer le chemin correspondant à l'URL ou la route 404
        const html = await fetch(routePath).then(response => response.text());
        document.getElementById("main-page").innerHTML = html;
        // Les controllers
        switch (path){
            case "/index.html":
            case "/" :
                CustomRouter.controller = new Main();
                break;
            case "/login" :    
            CustomRouter.controller = new Login();
                break;
            case "/signup": 
            CustomRouter.controller =  new Signup();
                break;
            case "/item" : 
            CustomRouter.controller = new Item();
                break;
            case "/file" :
                CustomRouter.controller = new File();
                break;
            case "/don" :
                CustomRouter.controller = new Don();
                break;
            case "/notification" :
                CustomRouter.controller =  new Notification();
                break;
            case  "/accountVerificaiton":
            case "/account" :
                CustomRouter.controller =  new Account();
                break;    
            case "/favoris": 
            CustomRouter.controller =  new Favoris();
                break;
        }
        CustomRouter.controller.initialisePage();
    }
     // Fonction de mise a jour de la page
     static updateDisplay(){
        const authorizeControls =  document.querySelectorAll('[name="authorize"]')
        const unauthorizeControls =  document.querySelectorAll('[name="unauthorize"]')
        let profile = document.querySelector("#profile img")
        let userName =  document.querySelector("p#labelName") 
        // On recupere les données du model
        let data = CustomRouter.user.datas()
        data =  data instanceof Array ? data[0] : data
        if (data.medias){
            // profile.src = data.medias.location;  
        }
        userName.textContent = `${data.firstName}`
        // On active les controls
        for(const control of authorizeControls){
            control.classList.remove('hidden')
            control.classList.add('flex')
        }
        for(const control of unauthorizeControls){
            control.classList.add('hidden')
            control.classList.remove('flex')
        }
    }
    // Fonction qui cache et affiche le menu
    hidden(){
        let btnMenu =  document.querySelector("button[name='menu']");
        let btnSMenu =  document.querySelector("button#sMenu");
        const menu = document.querySelector("#menu")
        const sMenu = document.querySelector("div#sMenu")
        menu.popover = 'auto'
        btnSMenu.popoverTargetElement  =  menu
        btnSMenu.popoverTargetAction  = "toggle"
        btnMenu.addEventListener('click', ()=>{
            sMenu.style.display = sMenu.style.display ==="none" ? 'block' : "none"
        })
    }
    logout(){
        for( const btn of this.btnLogout){
            btn.addEventListener('click', () =>{
                sessionStorage.clear()
                window.location.href = "/"
            })
        }
    }
    run(){
        // Attacher le gestionnaire d'événements aux liens correspondants
        document.onclick = (event) => this.handleLink(event)
        this.logout();
        this.hidden();
        window.onload = this.onload()
        window.onpopstate = CustomRouter.handleLocation()
        window.route = this.route
        //Changement de la page principale
        CustomRouter.handleLocation();
    }
}
// Créer une instance du routeur et démarrer on l'application
const router = new CustomRouter();
router.run();
