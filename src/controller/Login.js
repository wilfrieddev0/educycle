
import UserFactory from "../model/Factory/UserFactory.js"
import { CustomRouter } from "../public/router.js";
import Controller from "./Controller.js"

class Login extends Controller{
    constructor(){
        super()
    } 
    initialisePage(){
        this.User = new UserFactory("USER")
        if(this.User.connected){
            // 
        }else{
            this.btnSubmit =  document.querySelector("#submit")
            this.btnSubmit.addEventListener('click',async (event) => {
                this.btnSubmit.textContent ='Sign up...'
                event.preventDefault()
                // Valider les champs requis
                const requiredInputs = document.querySelectorAll('input[required]');
                let allFieldsValid = true;

                requiredInputs.forEach(input => {
                    if (input.value.trim() === '') {
                        allFieldsValid = false;
                        // Vous pouvez personnaliser le message d'erreur ou le style de l'input ici si nécessaire
                    }
                });

                if (!allFieldsValid) {
                    // Si au moins un champ requis est vide, ne poursuivez pas avec la soumission
                    alert("Veuillez remplir tous les champs obligatoires.");
                    return;
                }
                await this.login()
                this.btnSubmit.textContent ='Sign up'
            })
        }
    }
    async login(){
        let txtErreur =  document.querySelector('#erreur')
        txtErreur.textContent = ""
        let login =  document.querySelector("#email")
        let password =  document.querySelector("#password")
        let data = {"login" : login.value, "password" : password.value}
        let response =  await  this.User.login(data)    
        // Si connexion réussie on met à jour l'affichage et redirection vers la page principale
        if (response.statut === 1){           
            // Session Storage
            sessionStorage.setItem('currentUser', JSON.stringify(this.User.datas()))
            // Redirection
            window.history.pushState({}, "", "/"); // Modifier l'URL sans recharger la page
            CustomRouter.handleLocation()
        }else{
           txtErreur.textContent = response.message;
        }
    }
}
export default Login;