import User from "./User.js";
import Admin from "./Admin.js";

class UserFactory{
    constructor(role){
        if (role === "USER"){
            return new User()
        }else{
            return new Admin()    
        }
    }
}
export default UserFactory;