'use strict';
const routes = (app) => {
    app.use('/role', require('../features/role/controller/RoleController'));
    
    





};

module.exports = {
    routes
};
