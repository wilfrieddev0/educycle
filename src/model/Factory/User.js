import { DOMAINBACK } from "../../public/ressource/secret.js";
class User {
  // On implemente le singleton pattern
  constructor() {
    if (User.exists){
      return User.uniqueInstance
    }
    // A l'ouverture ou au rechargment de la page on verifie le sessionStoarage
    if (sessionStorage.getItem('token') && sessionStorage.getItem('userData')){
      this.connected = true;
      this.data =sessionStorage.getItem('userData')
      this.token = sessionStorage.getItem('token')
      this.headers ={
        'Authorization' : `Bearer ${this.token}`,
      }
    }
    this.data ={}
    this.media = {}
    this.connected = false;
    this.headers = {}
    User.exists =  true;
    User.uniqueInstance = this;
  }
  async login(data){
    try {
      const req  =  await fetch(`${DOMAINBACK}/login`,{
        method :'POST',
        body : JSON.stringify(data),
      })
      const response =  await req.json()
      if(response.statut === 1){
        this.connected = true;
        this.data =  response.data
        this.headers ={
          'Authorization' : `Bearer ${this.data.token}`,
        }
        return {statut : 1 }
      }else{
        return response
      }
    }catch(e){
      return {statut : 3, message :e}
    }
  }
  async signup(data){
    try{
      let result  = await fetch(`${DOMAINBACK}/signup`,{
        method :'POST',
        body : JSON.stringify(data)
      })
      const response =  await result.json()
      //Si la connexion reussi on set l'utilisateur à "connected" avec ses données et on recupere son token d'autorisation qu'on stocke dans le SessionStorage
      if(response.statut === 1){
        this.connected = true;
        this.data =  response.data
        this.headers ={
          'Authorization' : `Bearer ${this.data.token}`,
        }
      }
      this.data = response
      }
    catch(e){
      this.data =  {statut : 3, message :e}
    }finally{
    return this.data
  }
  }
  async getUser(id){
    try{
      const promsie =   await fetch(`${DOMAINBACK}/user/${id}`,{
      })
      if (!promsie.ok){
        this.data = {statut :  3, message : "Requete échouée"}
      }
      this.result = await promsie.json()
    }catch(e){
      this.data = {statut :  3, message : e}
    }finally{
      return this.result
    } 
  }
 async uploadProfile(formData,ressource="media"){
    try{
      const promise = await fetch(`${DOMAINBACK}/${ressource}`, {
        method :'POST',
        body :  formData
      })
      if (!promise.ok){
        this.data = {statut :  3, message : "Requete échouée"}
      }
      this.data = await promise.json()
    }catch(e){
       this.data = {statut :  3, message : e}
    }finally{
        return this.data
    }
}
async fetch (ressource, method, param="", body={}){
  try{
      const promise = method ==='GET' ? await fetch(`${DOMAINBACK}/${ressource}/${param}`) : await fetch(`${DOMAINBACK}/${ressource}/${param }`,{
          method : `${method}`,
          body :  body
      })
      if (!promise.ok){
          throw new TypeError("Requête échoué")
      }
      this.datas = await promise.json()
  }
  catch(e){
      throw new TypeError(e)
  }
  finally{
      return this.datas
  }
}
  logout(){
      sessionStorage.clear()
      uniqueInstance = null
  }
  getId(){
    return this.data.id
  }
  isConnected(b){
    this.connected =  b
  }
  isAuthenticated(){
    return this.connected
  }
  static getUniqueInstance (){
    return User.uniqueInstance
  }
  getHeaders(){
    return this.headers
  }
  medias(){
    return this.media;
  }
  setCurrentUser(datasCurrentUser){
    this.data = datasCurrentUser
  }
  datas(){
    return this.data;
  }
}
new User
export default User;