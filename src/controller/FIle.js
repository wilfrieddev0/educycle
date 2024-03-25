import ItemManager from "../model/Manager/ItemManager.js";
import Controller from "./Controller.js";
import User from '../model/Factory/User.js'
import { CustomRouter } from "../public/router.js";

class File extends Controller{
    constructor(){
        super()
        this.itemManager =  new ItemManager()
        this.user  = User.getUniqueInstance()
        this.datas =  []
        this.card = ""    
        this.listDatas =  document.querySelector('ul#file')
        this.divComment =  document.querySelector('.comment')
        this.btnClear = document.querySelector('button.clear')
        this.note = 1
    }
    async fetchDatas(){
        const stringCard = await fetch('src/template/Component/card.html').then(resp => resp.text()).catch(e => console.log(e))
        const parser  =  new DOMParser()
        this.card =  parser.parseFromString(stringCard,'text/html')
        const controls = this.card.querySelector('#file')
        controls.classList.add('flex')
        controls.classList.remove('hidden')
        let userControllers = this.card.querySelectorAll("[name='authorize']")
        for(const control of userControllers){
            control.classList.add('hidden')
            control.classList.remove('flex')
        }
        userControllers = this.card.querySelectorAll("[name='unauthorize']")
        for(const control of userControllers){
            control.classList.add('hidden')
            control.classList.remove('flex')
        }
        // Le formulaire de commentarre
        this.divComment.innerHTML = await fetch('src/template/Component/formComment.html').then(resp => resp.text()).catch(e => console.log(e)) 
        // Les results sont soit false/un objet litteral ou un tableau d'objet litteraux
        const datas = await this.itemManager.fetch('files','GET',this.user.getId())
        this.datas =( datas instanceof Array) ? datas : datas ? [datas] : []
        this.datas = this.datas.filter( item => {return item.statut === "En attente de récupération"})

    }
   async setControls(){
        this.btnClear.addEventListener('click', async () => {
            if (confirm("Est-ce que t'es sûr sûr de vouloir  entierement vider ta file" )){
                for (const item of this.datas){
                    const body =  {id : item.id, statut :  'normal'} 
                    const result = await this.itemManager.fetch('item',"PATCH","",JSON.stringify(body))
                    if (result.statut !== 1 ){
                        alert("Un problème est survenu!😤Ressayer plutard!")
                        break;
                    }
                }
                // Et on vide la file
                this.listDatas.innerHTML = ""
            }
        })
    }
    setControlsForms(idItem,idTarget){
        // On defini le controlle des etoiles pour l'evaluation
        const stars =  document.querySelectorAll("#stars svg")
        stars.forEach( (star,index1) => {
            star.addEventListener('click', ()=>{
                stars.forEach( (star,index2) => {
                    this.note =  index1+1
                    star.style = index1 >= index2 ? "color: #FFD43B;" : "color: #E6E9EF;"
                })
            })
        })   
        // Les controlles du forms   
        const btnSubmit = document.querySelector('button#submit') 
        const btnCancel = document.querySelector('button#cancel') 
        btnSubmit.addEventListener('click',async (event)=> {
            event.preventDefault()
            const form =  document.querySelector('.formComment')
            debugger
            const formDatas =  new FormData(form)
            formDatas.append('note', this.note )
            formDatas.append('idItem', idItem)
            formDatas.append('idTarget',idTarget)
            formDatas.append('idHunter',this.user.getId())
            const result = await this.itemManager.fetch("comment",'POST','',formDatas)
            if (result.statut === 1){
                alert("La communauté te souhaite de profiter de la deuxieme u truc que t'a recuperé!Et n'oublie pas 😌 chaque action compte✨😉")
                CustomRouter.handleLocation()
            }else{ alert(JSON.stringify(result))}
        })

        btnCancel.addEventListener('click', (event)=> {
            this.divComment.classList.toggle('invisible')
            CustomRouter.handleLocation()
        })
    }
    fillList(){
        this.listDatas.innerHTML = ""
        for (const item of this.datas){
            const card  = this.card.querySelector('li#item').cloneNode(true)
            const image = card.querySelector('img#itemPhoto')
            const linkItem =  card.querySelector('a#itemName')
            const state =  card.querySelector('p#itemState ')
            const worth =  card.querySelector('span#itemWorth')
            const publishedDate =  card.querySelector('span#itemPublisherDate')
            const residenceName =  card.querySelector('#itemLocation')
            const linkAccount =  card.querySelector('a#account')
            const labelStatut = card.querySelector("p#statut")
            const iconStatut = card.querySelector('i#statut')
            const btnAccept =  card.querySelector("button#accept")
            const btnDeny =  card.querySelector("button#deny")
            const btnDelete =  card.querySelector("button#delete_file")
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
            if(item.statut === "En attente de validation"){
                iconStatut.classList.add("bg-orange-400")
            }else if(item.statut === "Validé"){
                iconStatut.classList.add("bg-green-400")
                iconStatut.classList.remove("bg-yellow-400")
            }else{
                iconStatut.classList.add("bg-yellow-400")
            }
            // On defini les events 
            btnAccept.addEventListener('click',async (event) =>{
                const body =  {id : item.id, statut :  'Validé'}
                const result =await this.itemManager.fetch('item',"PATCH","",JSON.stringify(body))
                if (result.statut === 1 ){
                    this.setControlsForms(item.id, item.publisher.id)
                    this.divComment.classList.add("flex")
                    this.divComment.classList.remove("hidden")
                }
            })
            // Pour chaque annulation je change le statut de l'annonce et je supprime la donation
            btnDeny.addEventListener('click',async (event) =>{
                const body =  {id : item.id, statut :  'normal'} 
                let result =await this.itemManager.fetch('item',"PATCH","",JSON.stringify(body))
                if (result.statut === 1 ){
                    alert("Pas de souci mec.✨😉")
                    result = await this.itemManager.fetch('donation','DELETE',item.idDonation) 
                    if (result.statut !== 1){ alert( result.message)}
                    let favoris = JSON.parse(localStorage.getItem('favoris')) || []
                    favoris.push(item)
                    localStorage.setItem('favoris',JSON.stringify(item))
                    CustomRouter.handleLocation()
                }
            })
            btnDelete.addEventListener('click', async (event) =>{
                const body =  {id : item.id, statut :  'normal'} 
                const result =await this.itemManager.fetch('item',"PATCH","",JSON.stringify(body))
                if (result.statut === 1 ){
                    result = await this.itemManager.fetch('donation','DELETE',item.idDonation) 
                    if (result.statut !== 1){ alert( result.message)}
                    alert("Pas de souci mec✨😉")
                    const liToRemove = event.target.closest('li')
                    this.listDatas.removeChild(liToRemove)
                }
            })
            this.listDatas.appendChild(card)
        }
    }
    async initialisePage(){
         await this.fetchDatas()
        this.fillList()
        this.setControls()
    }
}
export default File;