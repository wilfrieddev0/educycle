import ItemManager from "../model/Manager/ItemManager.js";
import Controller from "./Controller.js";
import User from "../model/Factory/User.js";
import { CustomRouter } from "../public/router.js";
import { DOMAINFRONT,APITOKEN,EMAILTEST } from "../public/ressource/secret.js";
class Item extends Controller{
    constructor(){
        super()
        this.user  = User.getUniqueInstance();
        this.itemManager  = new ItemManager()
        this.item = null
        // Les  controlles
        this.formDOM = null
        this.listFavoris = []
        if (localStorage.getItem('favoris')){
            this.listFavoris =  JSON.parse(localStorage.getItem('favoris'))
        }
        this.btnRecover =  document.querySelector('button#toggle')
        this.btnFavoris =  document.querySelector('button#favoris')
        this.recoverForm =  document.querySelector('#recoverForm') 
        this.listImages = document.querySelector('ul#itemImages')
        this.cardImage = null
    }
   async fillPage(){
        document.querySelectorAll('#itemName').forEach(elem => elem.textContent =  this.ItemDatas.name)
        document.querySelector('span#itemCategories').textContent = this.ItemDatas.category
        document.querySelector("span#itemState").textContent = this.ItemDatas.state
        document.querySelector("span#itemWorth").textContent =  this.ItemDatas.worth
        document.querySelectorAll('span#itemPublishedDate').forEach( elem => {elem.textContent =this.ItemDatas.publishedDate} )
        document.querySelectorAll('span#itemSince').forEach(  elem => {elem.textContent = this.ItemDatas.available +" "+ this.ItemDatas.period})
        document.querySelector('p#description').textContent =  this.ItemDatas.description
        this.listImages.innerHTML = ""
        for (const image of this.ItemDatas.medias){
            const card  =  this.cardImage.querySelector('li').cloneNode(true)
            const img  =  card.querySelector('img')
            img.src = image.location
            this.listImages.appendChild(card)
        }
        document.querySelectorAll('a#publisher').forEach( link => {
            link.textContent =  this.ItemDatas.publisher.name
            link.href =  `/account?idAccount=${this.ItemDatas.publisher.id}`
        })
        document.querySelector('#publisherSince').textContent = this.ItemDatas.publisher.dateCreation
        document.querySelector('#publisherProfil').src =  this.ItemDatas.publisher.medias.location || "src/public/ressource/image/defaultProfile.jpeg"
        document.querySelectorAll('a#itemResidence').forEach( a => {
            a.href =  this.ItemDatas.residence.url
            a.textContent =  this.ItemDatas.residence.name
        })
        // On verifie si l'annonce est deja dans les favoris
        let found = this.listFavoris.some( ad => JSON.stringify(ad) === JSON.stringify(this.ItemDatas))
        if (found){
            this.btnFavoris.classList.add("bg-yellow-400")
        }
    }
    async notifyTarget(){
        // On fetch et remplie le body du mail
        const StringEmail = await fetch('src/template/Component/emailDemand.html').then( resp => resp.text()).catch( e => console.log(e))
        const parser= new DOMParser()
        const DOMEmail =  parser.parseFromString(StringEmail,'text/html')
        DOMEmail.querySelector('a#go').href = `${DOMAINFRONT}/login`
        // EmailJS
        var templateParams = {
            to_email : this.user.datas().email,
            link :  `${DOMAINFRONT}/login`
          };
          emailjs.send('service_v4093qe', 'template_01kdgjc', templateParams)
                 .then(
                    (response) => {
                        alert(`${this.ItemDatas.publisher.name} a été notifié par mail📧`)
                    },
                    (error) => {
                        alert(JSON.stringify(error))
                    },
          );
    }
    async fetchDatas(){
        // On resoud l'url
        this.urlParameters =  new URLSearchParams(window.location.search)
        if(this.urlParameters.has('idItem') && this.urlParameters.get('idItem')){
            this.ItemDatas  = await this.itemManager.fetch('item','GET',this.urlParameters.get('idItem'))
            // Un utilisateur ne peut pas récupérer sa propre annonce et une annonce de ne peut etre récupérer par deux utilisateurs
            if (this.ItemDatas.publisher.id === this.user.getId() || this.ItemDatas.idDonation){
                this.btnRecover.disabled =  true
                this.btnFavoris.disabled = true
                this.btnFavoris.classList.add('cursor-not-allowed')
                this.btnRecover.classList.add('cursor-not-allowed')
                document.querySelector("#recoverLabel").textContent =  "Vous étes l'auteur de cette annonce ou elle a déjà été recuperée"
            }
        }else{
            window.history.pushState({}, "", "/");
            CustomRouter.handleLocation()
        }
        const form = await fetch("src/template/Component/dialog.html").then(response => response.text() ).catch(e => console.log(e))
        const card = await fetch("src/template/Component/cardImage.html").then(response => response.text() ).catch(e => console.log(e))
        this.recoverForm.innerHTML = form
        const parser = new DOMParser()
        this.formDOM =  parser.parseFromString(form,"text/html")
        this.cardImage =  parser.parseFromString(card,'text/html')
        const classList =  this.cardImage.querySelector("li").classList
        this.cardImage.querySelector("li").classList.remove(...classList)
        this.cardImage.querySelector("li").classList.add("rounded-md")
        this.cardImage.querySelector("li").classList.add("flex-none")
        this.cardImage.querySelector("#delete").style.display="none"        
    }
    setFormControls(){    
        const btnSubmit = document.querySelector('button[type="submit"]')
        if (btnSubmit){
            btnSubmit.addEventListener('click', async (event) => {
                event.preventDefault()
                const form =  document.querySelector("form#recover")
                const formData =  new FormData(form)
                formData.append("idTarget",  this.ItemDatas.publisher.id)
                formData.append("idHunter",  this.user.getId())
                formData.append("idItem",  this.ItemDatas.id)
                const result = await this.itemManager.fetch("recover",'POST',"",formData)
                if (result.statut === 1){
                    alert("Yeehaw ! 🎉 Tu l'as fait ! Ta demande de récup', c'est dans la boîte ! 🚀 Checke vite ta file pour voir ce qui se passe ! 🎆 Big up à toi pour ce moment funky ! ✨")
                    // On notifie la cible par mail
                    await this.notifyTarget()
                    this.recoverForm.classList.remove("flex")
                    this.recoverForm.classList.add("hidden")
                    this.btnRecover.classList.add("bg-green-300")
                    this.btnFavoris.classList.add("cursor-not-allowed")
                    this.btnRecover.disabled =  true
                }else{
                    alert("Oups ! Désolé ! 😔 Quelque chose a foiré, mais t'inquiète pas, ça va s'arranger ! On te conseille d'essayer plus tard. 😊")
                    console.log(result.message)
                    // window.location.href =  "/"
                }
            })
        }
    }
    setControls(){
        this.recoverForm.popover =  "auto"
        this.btnRecover.popoverTargetElement  =  this.recoverForm
        this.btnRecover.popoverTargetAction  = "toggle"
        // Pour toute récupéraion l'utilisateur doit être authentifié
        this.btnRecover.addEventListener('click',() => {
            if (this.user.isAuthenticated()){
                if (document.querySelector('#recoverLabel').textContent !== "Cacher le bloc de récupération"){
                    document.querySelector('#recoverLabel').textContent = "Cacher le bloc de récupération"
                    this.btnRecover.classList.remove("hover:scale-110")
                    this.btnRecover.classList.remove('hover:-translate-y-1')
                }else if ("Cacher le bloc de récupération"){
                    document.querySelector('#recoverLabel').textContent = "Afficher le bloc de récupération"
                    this.btnRecover.classList.add("hover:scale-110")
                    this.btnRecover.classList.add('hover:-translate-y-1')
                }
            }else{
                if (confirm("Whoa là-bas, cowboy ! Pour mettre la main sur cette pépite, tu dois d'abord faire le grand saut et te connecter ! \n 🤠 Si tu n'as pas encore de compte, t'inquiète pas, c'est l'occasion parfaite pour t'inscrire et rejoindre la fête ! 🎉")){
                    window.location.href = "/login"
                }
            }
        })
        this.btnFavoris.addEventListener('click', () => {
            let found = this.listFavoris.some( ad => JSON.stringify(ad) === JSON.stringify(this.ItemDatas))
            if (!found){
                alert(`L'annonce du/de la ${this.ItemDatas.name} de ${this.ItemDatas.publisher.name} a été ajouteé dans vos favoris✨✔`)
                this.listFavoris.push(this.ItemDatas)
                this.btnFavoris.classList.add("bg-yellow-400")
            }else{
                if (confirm('Cette annonce existe deja dans vos favoris.Voulez-vous le supprimer??')){
                    this.listFavoris.pop(this.ItemDatas)
                    this.btnFavoris.classList.remove("bg-yellow-400")
                }
            }
            localStorage.setItem('favoris',JSON.stringify(this.listFavoris))
        })
        // Form Controls
        this.setFormControls()
    }
     async initialisePage(){
        await this.fetchDatas()
        this.setControls()
        this.fillPage()
    }
}
export default Item;