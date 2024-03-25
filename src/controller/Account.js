import User from "../model/Factory/User.js";
import ItemManager from "../model/Manager/ItemManager.js";
import Controller from "./Controller.js";
import {CustomRouter} from "../public/router.js"
import {APITOKEN,DOMAINBACK,DOMAINFRONT,EMAILTEST } from "../public/ressource/secret.js";
class Account extends Controller{
    // La page acceuuil a deux entrée un en pour l-utilisateur et l'autre pour les autres
    constructor(){
        super()
        this.uniqueInstance = User.getUniqueInstance()
        this.itemManager = new ItemManager()
        // Les controlles 
        this.imgProlile = document.querySelector("img#profile")
        this.inputChangeProfile =   document.querySelector('input[name="profile"]')
        this.labelNames = document.querySelectorAll('#labelName')
        this.lablePhone =  document.querySelector("p#labelPhone")
        this.emailStatut = document.querySelector("p#emailState")
        this.labelEmail = document.querySelector("p#labelEmail")
        this.memberSince = document.querySelector("span#labelSince")
        this.residence =  document.querySelector('a#residence')
        this.nbAnnonce = document.querySelector("span#nbAnnonces")
        this.nbRecuperation = document.querySelector("span#ndRecuperations")
        this.linkUpdateProfile =  document.querySelector('a#updateProfile')
        this.btnEmailVerification =  document.querySelector('button#emailVerification')
        this.btnDelete =  document.querySelector('button#delete')
        this.btnDeconnexion =  document.querySelector('button#deconnexion')
        this.listAnnonces =  document.querySelector('ul#annonces')
        this.listRecuperations =  document.querySelector('ul#recuperations')
        // La carte des annonces et recuperation
        this.userData  = {}
        this.cardAnnonce  = null
        this.cardRecuperations = null
        this.mesAnnonces = {}
        this.mesRecuperations = {}
        this.myOwn = false
    }
    async fetchDatas(){
        // Datas
        if (this.userData.id){
            let MyOwnAds  = await this.itemManager.fetch('items','GET',this.userData.id)
            let myOwnRecover = await this.itemManager.fetch('files','GET',this.userData.id)
            this.mesAnnonces =  (MyOwnAds instanceof Array) ? MyOwnAds : [MyOwnAds]
            this.mesRecuperations = (myOwnRecover instanceof Array) ?  myOwnRecover.filter(item => item.statut === "Validé") : myOwnRecover ? [myOwnRecover] :  []
            this.userData['nbAnnonces'] =  this.mesAnnonces.length || 0
            this.userData['nbRecuperations'] =  this.mesRecuperations.length  || 0
            //Chargement
            this.fillList('annonce',this.mesAnnonces)
            this.fillList('recuperation',this.mesRecuperations)
        }
    }
    enableUserControls(display){
        //On des/active les controls
        let userControllers = document.querySelectorAll("[name='authorize']")
        for(const control of userControllers){
            control.style.display =    display ? "flex" : "none"
        }
        
        userControllers = this.cardAnnonce.querySelectorAll("[name='authorize']")
        for(const control of userControllers){
            control.style.display =  display ? "flex" : "none"   
        }
        // les Controlles qui ne nécessite pas un authentification de l'utilisateur
        userControllers = document.querySelectorAll("[name='unauthorize']")
        for(const control of userControllers){
            control.style.display =  display ? "none" : "flex"       
        }
        userControllers = this.cardAnnonce.querySelectorAll("[name='unauthorize']")
        for(const control of userControllers){
            control.style.display =  display ? "none" : "flex"  
        }
    }
    async fillUser(){
        // Les controlles  
        const user = this.userData
        if (user.hasOwnProperty('medias')){
            this.imgProlile.src = user.medias.location || "src/public/ressource/image/defaultProfile.jpeg"
        }
        this.labelNames[1].textContent = user.firstName + " " + user.lastName
        this.lablePhone.textContent = user.phone
        if (user.emailVerified){
            this.emailStatut.textContent = "Email verifié"
            this.emailStatut.className =  "rounded-md p-1 bg-green-400"
            this.btnEmailVerification.disabled = true
            this.btnEmailVerification.classList.add('cursor-not-allowed')
        }else{
            this.emailStatut.textContent = "Email Non verifié"
            this.emailStatut.className =  "rounded-md p-1 bg-yellow-400"
        }
        this.emailStatut.textContent = user.emailVerified ? "Email verifié" : "Email Non verifié"
        this.labelEmail.textContent =user.email
        this.memberSince.textContent =user.dateCreation
        this.residence.textContent =user.residence.name
        this.residence.href =  user.residence.url
        this.nbAnnonce.textContent =user.nbAnnonces
        this.nbRecuperation.textContent =user.nbRecuperations
        this.linkUpdateProfile.href = `/signup?id=${user.id}`        
    }
    fillList(which,data){
        // On clone la card
        let card =  ""
        if(which === "annonce"){
            card =  this.cardAnnonce.querySelector("li#item")
            this.listAnnonces.innerHTML = ""
            //  On retire les controlles et ajoute la mise en favoris
        }else if(this.myOwn){
            card =  this.cardRecuperation.querySelector("li#item")
            this.listRecuperations.innerHTML = ""
        }
        let listFavoris= []
        if (localStorage.getItem('favoris')){
            listFavoris = JSON.parse(localStorage.getItem('favoris'))
        }
        for(const item of data){
            if (!card) {
                break
            }
            card  = card.cloneNode(true)
            const image = card.querySelector('img#itemPhoto')
            const linkItem =  card.querySelector('a#itemName')
            const state =  card.querySelector('p#itemState ')
            const worth =  card.querySelector('span#itemWorth')
            const publishedDate =  card.querySelector('span#itemPublisherDate')
            const residenceName =  card.querySelector('#itemLocation')
            const linkAccount =  card.querySelector('a#account')
            const btnStar =  card.querySelector("button#favor")
            const btnDelete =  card.querySelector("button#delete")
            const btnEdit =  card.querySelector("button#edit")
            const labelStatut = card.querySelector("p#statut")
            const iconStatut = card.querySelector('i#statut')
            // On les remplie...
            if (item.hasOwnProperty('medias')){
                image.src =  item.medias.length > 0 ? item.medias[0].location : ""
            }
            linkItem.textContent = item.name
            worth.textContent =  item.worth
            state.textContent = item.state
            publishedDate.textContent =  item.publishedDate
            residenceName.textContent =  item.residence.name
            residenceName.href =  item.residence.url
            linkAccount.textContent = item.publisher.name
            linkAccount.href =  `/account?idAccount=${item.publisher.id}`
            linkItem.href =  `/item?idItem=${item.id}`
            labelStatut.textContent =  item.statut
            if (item.statut !== 'normal'){
                labelStatut.textContent =  item.statut
                iconStatut.classList.remove('hidden')
                if(item.statut === "En attente de validation"){
                    iconStatut.style = "background-color: orange"
                }else if(item.statut === "Validé"){
                    iconStatut.style = "background-color: green"
                }else if(item.statut === "En attente de récupéraion"){
                    iconStatut.style = "background-color: yellow"
                }else{ iconStatut.classList.add('hidden')}
            }
            // 
            let found = listFavoris.some( ad => JSON.stringify(ad) === JSON.stringify(item))
            if (found){btnStar.classList.add("bg-yellow-400")}
            // On remplie les events
            btnEdit.addEventListener('click', ()=> {
                window.history.pushState({},"",`/don?idItem=${item.id}`)
                CustomRouter.handleLocation()
            })
            // On uilise le localStorage pour la gestion des favoris
            btnStar.addEventListener('click',() => {
                let found = listFavoris.some( ad => JSON.stringify(ad) === JSON.stringify(item))
                if (!found){
                    alert(`L'annonce du/de la ${item.name} de ${item.publisher.name} a été ajouteé dans vos favoris✨✔`)
                    listFavoris.push(item)
                    btnStar.classList.add("bg-yellow-400")
                }else{
                    if (confirm('Cette annonce existe deja dans vos favoris.Voulez-vous le supprimer??')){
                        listFavoris.pop(item)
                        btnStar.classList.remove("bg-yellow-400")
                    }
                }
            })
            btnDelete.addEventListener('click',async (event) => {
                if (confirm("Est-ce que t'es sûr sûr de vouloir supprimer cette annonce le S??")){
                    const result = await this.itemManager.fetch('item','DELETE',item.id)
                    if (result.statut ===1){
                        const liToRemove =  event.target.closest('li')
                        this.listAnnonces.removeChild(liToRemove)
                    }else{
                        alert("Un problème est survenu gros😩! Réessayes plus tard.La comnunauté te pris de l'excuser😔")
                    }
                }
            })
            // On ajoute la card à la liste d'items
            if (which  === "annonce"){
                this.listAnnonces.appendChild(card)
            }else{
                this.listRecuperations.appendChild(card)
            }
        }
    }
    setControls(){
        // Upload profile 
        this.inputChangeProfile.addEventListener('change',async () =>{
            const form =  document.querySelector('form[name="authorize"]')
            const formData = new FormData(form)
            let result = ""
            if ((this.imgProlile.src ===`${DOMAINFRONT}/src/public/ressource/image/defaultProfile.jpeg`) || !this.userData.medias ){
                formData.append('idUser', this.userData.id)
                formData.append('name','profile')
                result = await this.uniqueInstance.uploadProfile(formData)
            }else{
                formData.append('id', this.userData.medias.id)
                formData.append('name','profile')
                result = await this.uniqueInstance.uploadProfile(formData,"mediaUpdate")
            }
            if (result.statut === 1){
                this.imgProlile.src = result.data.newUrl
                if (this.userData.medias){
                    this.userData.medias.location = result.data.newUrl
                }else{
                    this.userData.medias = { loaciton : result.data.newUrl}
                }
                sessionStorage.removeItem('currentUser')
                sessionStorage.setItem('currentUser',JSON.stringify(this.userData))

            }else{
                alert(JSON.stringify(result.message))
            }
        })
        // Deconnexion
        this.btnDeconnexion.addEventListener('click', () => {
            if(confirm("Etes-vous sûr de vouloir nous quitter???")){
                alert("Vous allez être rediriger vers la page d'acceuil")
                sessionStorage.removeItem('currentUser');
                window.location.href = "/"          
            }
        } )
        // Suppression du compte
        this.btnDelete.addEventListener('click', async () => {
            if (confirm("Etes-vous sur ne plus vouloir faire partir de la commnunauté des etudiants d'EduCyle??")){
                alert("Nous sommes navrés de vous voir nous quitter 😩.Mais sachez que vous étes et serait toujours le/la bienvenu(e)!")
                const result = await this.itemManager.fetch('user','DELETE',this.uniqueInstance.getId())
                if (result.statut == 1){
                    alert("Votre compte a été supprimer avec succés!Vous allez être redirigé vers la page d'accueil!")
                    sessionStorage.removeItem('currentUser');
                    window.location.href = '/'
                }else{
                    alert(result.message)
                }
            }
        })
        // 
        this.linkUpdateProfile.href = `/signup?idUser=${this.userData.id}`
        // 
        this.btnEmailVerification.addEventListener('click',async () => {
            // On fetch et remplie le body du mail
            const StringEmail = await fetch('src/template/Component/email.html').then( resp => resp.text()).catch( e => console.log(e))
            const parser= new DOMParser()
            const DOMEmail =  parser.parseFromString(StringEmail,'text/html')
            DOMEmail.querySelector('a#verify').href = `${DOMAINBACK}/accountVerification/${this.userData.id}`
            // EmailJS...
            var templateParams = {
                name: this.userData.firstName,
                to_email : this.userData.email,
                link :  `${DOMAINBACK}/accountVerification/${this.userData.id}`
              };
              emailjs.send('service_v4093qe', 'template_obp98c8', templateParams)
                     .then(
                         (response) => {
                             alert('Un mail de verification a été envoyé sur votre mail 📧')
                        },
                        (error) => {
                            alert(JSON.stringify(error))
                        },
              );
        })
        
    }
   async initialisePage(){        
        this.urlParameters =  new URLSearchParams(window.location.search)
        // Cette page a trois entrées 2 pour les comptes et 1 pour la verification
        // Exceptionnellemnt les cards se chargent ici
        const card =   await fetch("src/template/Component/card.html").then(response => response.text()).catch(e =>console.log())
        const parser = new DOMParser()
        this.cardAnnonce = parser.parseFromString(card,"text/html")
        this.cardRecuperation =  parser.parseFromString(card,"text/html")
        // 
        if ((this.urlParameters.has('idAccount') && this.urlParameters.get('idAccount')>0 ) || this.uniqueInstance.isAuthenticated()){
            if ((this.uniqueInstance.isAuthenticated() && this.urlParameters.get('idAccount')==this.uniqueInstance.getId()) || (this.uniqueInstance.isAuthenticated() && !this.urlParameters.has('idAccount')) ){
                this.userData = this.uniqueInstance.datas()
                window.history.pushState({},"","/account")
                this.enableUserControls(true)
                this.myOwn = true
            }else{
                this.userData  = await this.uniqueInstance.getUser(this.urlParameters.get('idAccount'))
                this.enableUserControls(false)
                if ((!this.userData) || (this.userData.length === 0)){
                    alert("Aucune compte n'est lié à cette reference!! Vous allez être redirigé")
                    window.location.href =  "/"
                    CustomRouter.handleLocation()
                }
            }
        }else {
            alert("Aucune reference à un compte n'a été trouvée!")
            window.location.href =  "/"
            CustomRouter.handleLocation()
        }
        await this.fetchDatas()
        await this.fillUser()
        this.setControls(this.userData.id)
    }
}
export default Account;
