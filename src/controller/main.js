import Controller from "./Controller.js";
import ItemManager from "../model/Manager/ItemManager.js";

class Main extends Controller{
    constructor(){
        super()
        this.ItemsManager = new ItemManager()
        this.datas = {}
        this.filtedDatas ={}
        // Les controlles
        this.btnSearch =  document.querySelector('input[name="search"]')
        this.inputSort = document.querySelector('select[name="sort"]')
        this.filtertSerie = document.querySelector('select[name="serie"]')
        this.filterWorth = document.querySelector('select[name="worth"]')
        this.filterResidence = document.querySelector('select[name="residence"]')
        this.listItems =   document.querySelector("ul#listItems");
        this.btnDeleteFilters =  document.querySelector('button#deleteFilters')
        this.inputSearch =  document.querySelector('input[name="search"]')
        this.card =  ""
    }
    async fetchDatas(){
        this.datas = await this.ItemsManager.getMainDatas()
        if (!(this.datas instanceof Array)){
            // alert(JSON.stringify(this.datas))
            this.datas =  []
        }
        this.filtedDatas = this.datas.slice() 
        // Card
        const cardString = await fetch("src/template/Component/card.html").then(response  => response.text()).catch( e => console.log(e))
        const parser  =  new DOMParser()
        this.card =  parser.parseFromString(cardString,"text/html")
        // On active les controlles
        const controls =  this.card.querySelector("#main")
        controls.classList.remove("hidden")
        controls.classList.add("flex")
    }
    // La methode qui remplie les items
    async fillItems(datas){
        // ON vide la liste en premier
        this.listItems.innerHTML = ""
        let listFavoris= []
        if (localStorage.getItem('favoris')){
            listFavoris = JSON.parse(localStorage.getItem('favoris'))
        }
        for(const item of datas){
            // On recupere les controlles de la cards  et on clone l'original
            const card =  this.card.querySelector("li#item").cloneNode(true)
            const image = card.querySelector('img#itemPhoto')
            const linkItem =  card.querySelector('a#itemName')
            const state =  card.querySelector('p#itemState ')
            const worth =  card.querySelector('span#itemWorth')
            const publishedDate =  card.querySelector('span#itemPublisherDate')
            const residenceName =  card.querySelector('#itemLocation')
            const linkAccount =  card.querySelector('a#account')
            const btnStar =  card.querySelector("button#favor_main")
            const labelStatut = card.querySelector("p#statut")
            const iconStatut = card.querySelector('i#statut')
            labelStatut.textContent = ''
            iconStatut.classList.add('hidden')
            // On verifie si l'annonce a ete mis en favoris
            let found = listFavoris.some( ad => JSON.stringify(ad) === JSON.stringify(item))
            if (found){btnStar.classList.add("bg-yellow-400")}
            // On les remplie...
            if (item.hasOwnProperty('medias')){
                image.src = item.medias.length>0 ? item.medias[0].location : ""
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
            if (item.statut !== 'normal'){
                labelStatut.textContent =  item.statut
                iconStatut.classList.remove('hidden')
                if(item.statut === "En attente de validation"){
                    iconStatut.classList.add("bg-orange-400")
                }else if(item.statut === "Validé"){
                    iconStatut.classList.add("bg-green-400")
                }else if(item.statut === "En attente de récupéraion"){
                    iconStatut.classList.add("bg-yellow-400")
                }
            }
            // // On remplie les events
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
                localStorage.setItem('favoris',JSON.stringify(listFavoris))
            })
            // On ajoute la card à la liste d'items
            this.listItems.appendChild(card)
        }
    }
    setControls(){
        this.inputSort.addEventListener("input",() =>{
            let sortedDatas =  this.datas.slice()
            // On range
            sortedDatas = sortedDatas.sort( (a,b) => {
                switch (this.inputSort.value){
                    case "de A à Z" :
                        return a.name.localeCompare(b.name)
                    case "de Z à A" :  
                        return b.name.localeCompare(a.name)
                    case "Croissant" :
                        return a.worth - b.worth
                    case "Deccroissant" :
                        return b.worth - a.worth  
                }
            })
            // On met a jour l'affichage avec le tableau rangé
            this.fillItems(sortedDatas)
        }) 
        const listFilters =  document.querySelectorAll("div#filter select")
        for( const filter of listFilters){
            // Le select #sort est géré differement
            if (filter !== this.inputSort){
                filter.addEventListener("input",()=>{
                    switch (filter){
                        case this.filtertSerie : 
                            this.filtedDatas =  this.filtedDatas.filter(item => {
                                let category = item.category.split(",")
                                return category.includes(filter.value)
                            });
                            break
                        case this.filterWorth : 
                            this.filtedDatas =  this.filtedDatas.filter(item => {
                                return item.worth <= filter.value
                                    });
                            break
                    }
                    this.fillItems(this.filtedDatas)
                })
            }
        }
        // La recherche
        this.inputSearch.addEventListener('input',()=> {
            const datas = this.datas.slice()
            let searchResults =  datas.filter( item => {
                const subjet =  item.name+" "+item.description+" "+item.category
                return subjet.includes(this.inputSearch.value)
            })
            this.fillItems(searchResults);
        })
        this.inputSearch.addEventListener('submit', async() => {
            let datas = await this.ItemsManager.fetch('fullSearch','GET',this.inputSearch.value)
            datas =  (datas instanceof Array) ? datas : [datas];
            this.fillItems(datas)
        })
        // Supprimer les filtres
        this.btnDeleteFilters.addEventListener("click", () => {
            this.filtertSerie.selectedIndex =  0
            this.filterWorth.selectedIndex =  0
            this.inputSort.selectedIndex =  0
            this.fillItems(this.datas)
        })
    }
    async initialisePage(){
        // On checks le sessionStorage
        await this.fetchDatas()
        this.fillItems(this.datas)
        this.setControls()
    }
}
export default Main;