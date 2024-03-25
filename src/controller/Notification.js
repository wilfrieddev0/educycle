import User from "../model/Factory/User.js";
import ItemManager from "../model/Manager/ItemManager.js";
import Controller from "./Controller.js";

class Notification extends Controller{
    constructor(){
        super()
        this.itemManager =  new ItemManager()
        this.user  = User.getUniqueInstance()
        this.listNotifs = document.querySelector('ul#notifs')
        this.Datas =  []
    }
    async fetchDatas(){
        const stringCard = await fetch('src/template/Component/notif.html').then(resp => resp.text()).catch(e => console.log(e))
        const parser  =  new DOMParser()
        this.notifs =  parser.parseFromString(stringCard,'text/html')
        this.Datas = await this.itemManager.fetch('donation','GET',this.user.getId())
    }
    async fillList(){
        this.listNotifs.innerHTML = ""
        for (const notif of this.Datas){
            const cardNotif =  this.notifs.querySelector('li').cloneNode(true)
            const linkSender = cardNotif.querySelector('#senderName')
            linkSender.textContent =  notif.sender.name
            linkSender.href = `/account?idAccount${notif.sender.id}`
            cardNotif.querySelector('p#message').textContent =  notif.message
            const valuePublishedDate = cardNotif.querySelector('#publishedDate')
            const date =  Date.parse(notif.date)
            let timePerMls  = Date.now() - date
            let sincePerDays  =  timePerMls/(1000*60*60*24) //On converti en jour
            if (0 <= sincePerDays &&  1 >= sincePerDays){
                valuePublishedDate.textContent = "il y'a moins d'une heure"
            }else if (1 < sincePerDays &&  2 > sincePerDays) {
                valuePublishedDate.textContent = "publié il y'a 1 jour et "+ (Math.round(timePerMls/(1000*60*60))-24) +" heures"
            }else if(2 < sincePerDays &&  8 > sincePerDays){
                valuePublishedDate.textContent =  "publié il y'a " +Math.round(timePerMls/(1000*60*60*24))+" jours"
            }else if  (7 < sincePerDays &&  14 > sincePerDays){
                valuePublishedDate.textContent =  "publié il y'a 1(une) semaine et " +Math.round(timePerMls/(1000*60*60*24) - 7)+" jours"
            }else if (sincePerDays > 31){
                valuePublishedDate.textContent = notif.date
            }
            cardNotif.querySelector('#senderProfile').src = notif.sender.medias.location
            const btnAccept =  cardNotif.querySelector("button#accept")
            const btnDeny =  cardNotif.querySelector("button#deny")
            const btnDelete =  cardNotif.querySelector("button#delete")
            // On initialise les controlles
            const item = await this.itemManager.fetch('item',"GET",notif.idItem)
            if (item.statut !=="En attente de validation"){
                btnAccept.classList.add("bg-green-600")
                btnAccept.classList.add("cursor-not-allowed")
                btnDeny.classList.add("bg-red-600")
                btnDeny.classList.add("cursor-not-allowed")
                btnAccept.disabled = true
                btnDeny.disabled =  true
            }
            cardNotif.querySelector('a#itemName').textContent =item.name
            cardNotif.querySelector('a#itemName').href = `/item?idItem=${item.id}`
            
            // Les events
            btnAccept.addEventListener('click',async () =>{
                const body =  {id : notif.idItem, statut :  'En attente de récupération'}
                const result =await this.itemManager.fetch('item',"PATCH","",JSON.stringify(body))
                if (result.statut === 1 ){
                    alert("Hé mec,tu dechires! Merci d'avoir donner ton truc.La communauté te fait un high-five virtuel pour ta generosité.\n Toute action avance vers sun monde plus cool✨😉")
                    btnAccept.classList.add("bg-green-600")
                    btnDeny.disabled =  true
                }
            })
            // refuser et supprimer se font tous deux en deux étapes :  changer le statut de l'annonce et supprimer la notif
            btnDeny.addEventListener('click', async () =>{
                const body =  {id : notif.idItem, statut :'normal'}
                let result =await this.itemManager.fetch('item',"PATCH","",JSON.stringify(body))
                if (result.statut === 1 ){
                    result = await this.itemManager.fetch('donation','DELETE',notif.id) 
                    if (result.statut !== 1){ alert( result.message)}
                    alert("Pas de souci mec.Merci quand même d'avoir envisager de partager\n Toute action nous avancé ver sun monde plus cool✨😉")
                    btnDeny.classList.add("bg-red-600")
                    btnAccept.disabled = true
                }
            })
            btnDelete.addEventListener('click',async (event) =>{
                if (confirm("Es-tu sûr de vouloir supprimer cette notifs???")){
                    let result =  await this.itemManager.fetch('donation',"DELETE",notif.id)
                    if (result.statut === 1 ){
                        const body =  {id : notif.idItem, statut :'normal'}
                        let result =await this.itemManager.fetch('item',"PATCH","",JSON.stringify(body))
                        if (result.statut  ===1){
                            const liToRemove = event.target.closest('li')
                            this.listNotifs.removeChild(liToRemove)
                        }else{alert(result.message)}
                    }else{
                        alert(result.message)
                    }
                }
            })
            this.listNotifs.appendChild(cardNotif)

        }
    }
    async initialisePage(){
        await this.fetchDatas()
        this.fillList()
    }
}
export default Notification;