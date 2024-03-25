import User from "../model/Factory/User.js";
import Controller from "./Controller.js";
import { CustomRouter } from "../public/router.js";
import { LATITTUDE, LONGITUDE, RAYON } from "../public/ressource/secret.js";

class Signup extends Controller{
    constructor(){
        super();
        // La Page a deux entrées une pour la creation et l'autre pour la mise à jour
        this.urlParameters =  new URLSearchParams(window.location.search)
        if (this.urlParameters.has('idUser')){
            if (this.urlParameters.get('idUser') < 0 || !this.urlParameters.get('idUser')){
                alert("Les paramètres de l'url ne font reference a aucun compte!")
                window.history.pushState({},"","/")
                CustomRouter.handleLocation
            }else{
                document.querySelector('h1#title').textContent = "Mise à jour de vos informations"
                document.querySelector('#update').classList.remove('hidden')
                document.querySelector('#update').classList.add('flex')
                document.querySelector('div#signup').classList.add("hidden")
                document.querySelector('div#signup').classList.remove("flex")
            }
        }
        this.User  =  new User()
        this.residence = {}
        this.inputPasswordVerified= document.querySelector('input#verified')
        this.inputPassword= document.querySelector('input[name="password"]')
    }
    //substitut du callback de Place api de Google pour l'autoCompletion des addresses
    initMap(){
        // On defini l'aire de prediction à Nice
        const center = { lat: LATITTUDE, lng: LONGITUDE };
        // Create a bounding box with sides ~30km away from the center point
        const defaultBounds = {
        north: center.lat + RAYON,
        south: center.lat - RAYON,
        east: center.lng + RAYON,
        west: center.lng - RAYON,
        };
        const options = {
          componentRestrictions: { country: "fr" },
          bounds :  defaultBounds,
          fields: ["name","url","website"],
          types: ["establishment"],
          strictBounds: false,
        };
        const autocomplete = new google.maps.places.Autocomplete(document.querySelector('input#residence'), options);
        autocomplete.addListener("place_changed", () => {
            const result =  autocomplete.getPlace()
            this.residence ={name  : result.name, url :  result.url , website :  result.website}
        });    
      }
    setControls(){
        const btnSignUp  =  document.querySelector("#submit")
        btnSignUp.addEventListener('click',async (event) =>{
            event.preventDefault()
            btnSignUp.textContent =  'Sign up...'
            // Valider les champs requis
            const requiredInputs = document.querySelectorAll('input[required]');
            let allFieldsValid = true;

            requiredInputs.forEach(input => {
                if (input.value.trim() === '') {
                    allFieldsValid = false;
                }
            });

            if (!allFieldsValid) {
                alert("Veuillez remplir tous les champs obligatoires.");
                return;
            }
            await this.signup()
            btnSignUp.textContent =  'Sign up...'
        })
        // La mise à jour 
        document.querySelector("button#update").addEventListener('click', async (event)=> {
            event.preventDefault()
            document.querySelector("button#update").value = "Update..."
            // Valider les champs requis

            const requiredInputs = document.querySelectorAll('input[required]');
            let allFieldsValid = true;

            requiredInputs.forEach(input => {
                if (input.value.trim() === '') {
                    allFieldsValid = false;
                }
            });

            if (!allFieldsValid) {
                alert("Veuillez remplir tous les champs obligatoires.");
                return;
            }
            // Pour la mise à jour aucun champ n'est obligatoire et les champrs vides conceveront leur valeur
            const inputs = document.querySelectorAll('form input')
            const formData =  new FormData(document.querySelector("#SignupForm"))
            for (const input of inputs){
                if (!formData.get(input.getAttribute('name'))){
                    formData.delete(input.getAttribute('name'))
                }
            }
            formData.append('id',this.urlParameters.get('idUser'))
            formData.append('residence', JSON.stringify(this.residence))
            const result = await this.User.fetch("userUpdate","POST","",formData)
            if (result.statut === 1){
                alert('Mise à jour reussie!')
                sessionStorage.removeItem('currentUser')
                window.history.pushState({},"","/account")
                CustomRouter.handleLocation()
            }
            document.querySelector("button#update").value = "Update..."
        })
        // Verification la confirmation de mot de passe 
        this.inputPasswordVerified.addEventListener('input', () => {
            this.inputPasswordVerified.style = this.inputPasswordVerified.value !== this.inputPassword.value  ? "border-color: red" :  "border-color: green"
        })
        this.inputPassword.addEventListener('input', ()=> {
            if (this.inputPassword.value.length < 10){
                this.inputPassword.setAttribute('title', 'Votre mot de passe doit faire au moins 8 caractères')}
        })
    }
    async signup(){
        // Methode d'inscription du controller de la classe Signup
        const form = document.querySelector("#SignupForm")
        this.formData = new FormData(form) 
        if (document.querySelector("#terms").checked){
            //On échappe les données utilisateurs avant l'envoi au serveur pour éviter les errreurs XSS(Cross-Site Scripting)
            let secureData = {}
            secureData["role"] =  "USER";
            this.formData.forEach((value,key) => { 
                secureData[key] = value;
            });
            secureData['residence'] =  this.residence
            let response =  await  this.User.signup(secureData)
            if (response.statut === 1){
                // Si connexion reussie,On maj l'affichage et on stocke l'utilisateur dans le sessionStorage
                alert("La communauté d'educycle te souhaite  :  Bienvenu(e) ✨🥳🎉")
                sessionStorage.setItem('currentUser', JSON.stringify(response.data))
                window.location.href = "/account";
            }else{
                let txtErreur =  document.querySelector('#erreur')
                txtErreur.innerHTML = response.message;
            }
        }else{alert("Vous devez accepter les conditions d'utilisation de l'application!")}
    } 
    initialisePage(){
        this.setControls()
        this.initMap()
    }
}
export default Signup;