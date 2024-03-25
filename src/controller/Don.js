import Controller from "./Controller.js";
import ItemManager from "../model/Manager/ItemManager.js";
import User from "../model/Factory/User.js";
import { CustomRouter } from "../public/router.js";
import { LATITTUDE, LONGITUDE, RAYON } from "../public/ressource/secret.js";

export class Don extends Controller {
    constructor() {
        super();
        // Cette page a deux entrées l'isnertion et la mise à jour
        this.urlParameters =  new URLSearchParams(window.location.search)
        if (this.urlParameters.has('idItem')){
            if (this.urlParameters.get('idItem') < 0 || !this.urlParameters.get('idItem')){
                alert("Les paramètres de l'url ne font reference a aucune annonce!")
                window.history.pushState({},"","/")
                CustomRouter.handleLocation()
            }else{
                document.querySelector('h1#title').textContent = "Mise à jour"
                document.querySelector('p#info').textContent = "Les champs vides concerveront les valeurs"
                document.querySelector('#update').classList.remove('hidden')
                document.querySelector('#update').classList.add('flex')
                document.querySelector('div#insert').classList.add("hidden")
                document.querySelector('div#insert').classList.remove("flex")
            }
        }
        this.result ={}
        this.uniqueUser = User.getUniqueInstance();
        this.itemManager = new ItemManager();
        this.inputPhotos = document.querySelector('input[name="photos"]');
        this.listPhotos = document.querySelector('ul#listPhotos');
        this.form = document.querySelector('form#formAds');
        this.btnPublished = document.querySelector('button[name="submit"]');
        this.card = {}
        this.residence ={}
    }
    async addPhoto() {
        // On verifie la taille des fichiers
        this.listPhotos.innerHTML = "";
        const cardString = await fetch("src/template/Component/cardImage.html").then(response => response.text()).catch(e => console.log(e));
        const parser = new DOMParser();
        this.card = parser.parseFromString(cardString, "text/html");
        this.inputPhotos.addEventListener("change", () => {            
            let sizes = 0
            for (const image of this.inputPhotos.files){
                sizes += image.size
            }
            if (sizes > (16*1024*1024)){
                alert('La taille des images uploadées est au dessus de 16mo')
                this.inputPhotos.value = null
            }
            for (const image of this.inputPhotos.files) {
                const cardImage = this.card.querySelector("li").cloneNode(true);
                cardImage.id = image.name;
                const imageNode = cardImage.querySelector('img#photo');
                //On recupere,lie et affiche l'image dan une liste
                const reader = new FileReader()
                reader.onload = (event)=>{
                    imageNode.src = event.target.result
                }
                reader.readAsDataURL(image)
                //On ajoute l'event supprimer 
                const btnRemoveImage = cardImage.querySelector("#delete");
                btnRemoveImage.addEventListener('click', (event) => {
                    const liToRemove =  event.target.closest('li')
                    this.listPhotos.removeChild(liToRemove);
                    const filteredFiles = Array.from(this.inputPhotos.files).filter(img => img.name !== image.name);
                    // Créer une nouvelle FileList à partir des fichiers filtrés
                    const newFileList = new DataTransfer();
                    filteredFiles.forEach(file => newFileList.items.add(file));
                    // Assigner la nouvelle FileList à inputPhotos.files
                    this.inputPhotos.files = newFileList.files;
                });
                this.listPhotos.appendChild(cardImage);
            }
        });
    }
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
    async publishedAd() {
        // On récupere ,trie et  sécurisé les datas avant l'insertion sur le serveur
        const formData = new FormData(this.form);
        const category = [];
        const checkBoxValues = document.querySelectorAll('input[type="checkbox"]');
        checkBoxValues.forEach(input => {
            if (input.checked) {
                category.push(input.value);
            }
        });
        formData.append('category',category)
        for( const file of this.inputPhotos.files){
            formData.append('files[]', file)
        }
        try{
            formData.append('residence', JSON.stringify(this.residence))
            formData.append('idUser', this.uniqueUser.getId())
            await this.itemManager.saveAd(formData);
            // Redirection Vers la page d'acceuil
            if (this.itemManager.getData().statut === 1 ){
                alert('La commnunauté te remercie pour ta contribution!')
                window.history.pushState({},"","/")
                CustomRouter.handleLocation()
            }else{alert(this.itemManager.getData().message)}
        }catch(e){
            window.history.pushState({},"","/505")
            CustomRouter.handleLocation()
            throw new TypeError(e)
        }
    }
    setControls(){
        this.btnPublished.addEventListener('click',async (event) =>{
            let icon = document.querySelector('#icon')
            let iconContent =  icon.innerHTML
            icon.textContent ="..."
            event.preventDefault()
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
            await this.publishedAd()
            icon.innerHTML=iconContent
        });
    }
    initialisePage() {
        this.addPhoto();
        this.setControls()
        this.initMap()
    }  
}
export default Don