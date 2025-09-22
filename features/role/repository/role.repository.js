const Role = require('../model/Role.model');
const Redis = require('../../../config/redis');



class RoleRepository{

    static async create(data){
        
        return await Role.create(data);
     

    }
    static async update(data) {


    }   
    // static async get()
    static async getById(data){


    }

    static async getByName(data){
       return await Role.findOne({name : data}).exec();
    }
    static async delete(data){

    }

}

module.exports = RoleRepository;