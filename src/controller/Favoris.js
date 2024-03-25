import Controller from "./Controller.js";

class Favoris extends Controller{
    constructor(){
        super()
        this.datas = []
        // Les controlles
        this.cardAds = null;
        this.section= document.querySelector("section#main")
        this.listeFavoris =  document.querySelector("ul#ads")
        this.btnViderListe =  document.querySelector("button#deleteAll")
    }
    async loadDatas(){
        // Data
        if (localStorage.getItem('favoris')){
            this.datas =  JSON.parse(localStorage.getItem('favoris'))
        }
        const card =  await fetch("src/template/Component/card.html").then(response => response.text() ).catch(e => console.log(e))
        const parser =  new DOMParser()
        this.cardAds =  parser.parseFromString(card,"text/html")
        // On active les controlles
        const controls =  this.cardAds.querySelector("#favoris")
        controls.classList.add("flex")
        controls.classList.remove("hidden")
    }
    //
    setControls(){
        this.btnViderListe.addEventListener('click', () =>{
            if (localStorage.getItem('favoris')){
                localStorage.removeItem('favoris')
                this.listeFavoris.innerHTML = ""
            }
        })
    }
    fillAds(){
        this.listeFavoris.innerHTML = ""
        for (const ad of this.datas){
               // On recupere les controlles de la cards  et on clone l'original
               const card =  this.cardAds.querySelector("li#item").cloneNode(true)
               const image = card.querySelector('img#itemPhoto')
               const linkItem =  card.querySelector('a#itemName')
               const state =  card.querySelector('p#itemState ')
               const worth =  card.querySelector('span#itemWorth')
               const publishedDate =  card.querySelector('span#itemPublisherDate')
               const residenceName =  card.querySelector('#itemLocation')
               const linkAccount =  card.querySelector('a#account')
               const linkRecover = card.querySelector("a#recover")
               const btnDelete = card.querySelector("button#delete_favor")
               card.querySelector("[title='statut']").style.display =  'none'
               // On les remplie...
               if (ad.hasOwnProperty('medias')){
                   image.src = ad.medias.length>0 ? ad.medias[0].location : ""
               }
               linkItem.textContent = ad.name
               worth.textContent =  ad.worth
               state.textContent = ad.state
               publishedDate.textContent =  ad.publishedDate
               residenceName.textContent =  ad.residence.name
               residenceName.href =  ad.residence.url
               linkAccount.textContent = ad.publisher.name
               linkAccount.href =  `/account?idAccount=${ad.publisher.id}`
               linkItem.href =  `/item?idItem=${ad.id}`
               linkRecover.href = `/item?idItem=${ad.id}`
               // // On remplie les events
               btnDelete.addEventListener('click', (event) =>{
                const liToRemove = event.target.closest("li")
                this.listeFavoris.removeChild(liToRemove)
                this.datas.pop(ad)
                localStorage.setItem("favoris", this.datas)
               })
               // On ajoute la card à la liste d'items
               this.listeFavoris.appendChild(card)
        }
    }
    async initialisePage() {
        this.loading.classList.remove("hidden")
        this.loading.classList.add("flex")
        await this.loadDatas()
        this.fillAds()
        this.setControls()
        this.loading.classList.remove("flex")
        this.loading.classList.add("hidden")
    }
}
export default Favoris;