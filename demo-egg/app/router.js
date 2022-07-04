'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/login', controller.home.login);
  router.put('/register', controller.home.register)
  router.post('/modification', controller.home.modification)
  router.get('/ThirdParty', controller.home.ThirdParty)
  router.post('/upload', controller.home.upload)
};
