'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },
  // cors: {
  //   enable: true,
  //   package: 'egg-cors',
  // }
  oss: {
    enable: true,
    package: 'ali-oss',
  },
};
